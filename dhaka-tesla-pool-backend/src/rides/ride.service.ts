import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { fail } from '../common/business-error.js';
import { command } from '../common/command.js';
import { RideRepository, fare } from './ride.repository.js';
import type { Booking, Ride } from './ride.repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Zone } from './entities/zone.entity.js';
import { RouteRule } from './entities/route-rule.entity.js';

@Injectable()
export class RideService {
  constructor(@Inject(DatabaseService) readonly db:DatabaseService,
    @InjectRepository(Zone) private readonly zoneRepository:Repository<Zone>,
    @InjectRepository(RouteRule) private readonly routeRepository:Repository<RouteRule>) {}
  async zones() {
    const zones=await this.db.orm(()=>this.zoneRepository.find({order:{id:'ASC'}}));
    const routes=await this.db.orm(()=>this.routeRepository.find({select:{pickupId:true,destinationId:true},where:{active:true},order:{pickupId:'ASC',destinationId:'ASC'}}));
    return {data:{zones,routes}};
  }
  async quote(owner:string,body:{pickupId:string;destinationId:string;seats:number}) {
    if(!Number.isInteger(body.seats)||body.seats<1||body.seats>3) fail('INVALID_SEAT_QUANTITY',422);
    const rule=(await this.db.query<Booking>('SELECT * FROM route_rules WHERE pickup_id=$1 AND destination_id=$2 AND active',[body.pickupId,body.destinationId])).rows[0];
    if(!rule) fail('ROUTE_UNSUPPORTED',422);
    const b=(await this.db.query<Booking>(`INSERT INTO fare_quotes(owner_id,route_id,pickup_id,destination_id,group_id,group_version,seats,demo_distance_m,base_poysha,rate_poysha,discount_poysha,policy_version,expires_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,clock_timestamp()+interval '5 minutes') RETURNING *`,[owner,rule.id,rule.pickup_id,rule.destination_id,rule.group_id,rule.group_version,body.seats,rule.demo_distance_m,rule.base_poysha,rule.rate_poysha,rule.discount_poysha,rule.policy_version])).rows[0]!;
    return {data:{id:b.id,expiresAt:b.expires_at,route:{pickupId:b.pickup_id,destinationId:b.destination_id,isDemoGeography:true},seats:b.seats,solo:fare(b,1),pooled:fare(b,2)}};
  }
  async create(owner:string,key:string,body:{quoteId:string;paymentMethod:'CASH'}) {
    try {
      const receipt=await this.db.transaction(async client=>{
        const repo=new RideRepository(client);
        await repo.ownQuote(body.quoteId,owner); // durable ownership before any stored receipt
        return command(client,owner,'CREATE_REQUEST',key,'collection:ride_requests',body,async()=>{
          const b=await repo.ownQuote(body.quoteId,owner,true);
          const valid=(await client.query('SELECT $1::timestamptz>clock_timestamp() AS valid',[b.expires_at])).rows[0]!.valid;
          if(!valid) fail('QUOTE_EXPIRED');
          if((await client.query('SELECT id FROM ride_requests WHERE quote_id=$1',[b.id])).rowCount) fail('QUOTE_ALREADY_USED');
          if((await client.query("SELECT id FROM ride_requests WHERE passenger_id=$1 AND ended_at IS NULL",[owner])).rowCount) fail('ACTIVE_RIDE_EXISTS');
          const r=(await client.query<Ride>(`INSERT INTO ride_requests(passenger_id,quote_id,booking_snapshot,pickup_id,destination_id,group_id,group_version,seats,status)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,'REQUESTED') RETURNING *`,[owner,b.id,b,b.pickup_id,b.destination_id,b.group_id,b.group_version,b.seats])).rows[0]!;
          await repo.event(owner,'CREATE_REQUEST',r);
          return {resourceId:r.id,action:'CREATE_REQUEST',appliedVersion:r.version};
        });
      });
      return {data:receipt};
    } catch(error) {
      if((error as {code?:string}).code==='23505') fail('ACTIVE_RIDE_EXISTS');
      throw error;
    }
  }
  async current(owner:string) {
    return this.db.transaction(async client=>{
      const id=(await client.query('SELECT id FROM ride_requests WHERE passenger_id=$1 AND ended_at IS NULL',[owner])).rows[0]?.id;
      return {data:id?await new RideRepository(client).detail(id,owner):null};
    },true);
  }
  async detail(owner:string,id:string) { return this.db.transaction(async client=>({data:await new RideRepository(client).detail(id,owner)}),true); }
  async cancelWaiting(owner:string,id:string,key:string,reason:string) {
    if(!reason||reason.length>200) fail('INVALID_INPUT',400);
    return this.db.transaction(async client=>{
      const repo=new RideRepository(client);
      await repo.ownRide(id,owner);
      return {data:await command(client,owner,'PASSENGER_CANCEL',key,`ride:${id}`,{reason},async()=>{
        const r=await repo.ownRide(id,owner,true);
        if(r.status!=='REQUESTED') fail('INVALID_TRANSITION');
        const changed=(await client.query<Ride>("UPDATE ride_requests SET status='CANCELLED',version=version+1,cancelled_at=clock_timestamp(),cancellation_reason=$2 WHERE id=$1 RETURNING *",[id,reason])).rows[0]!;
        await repo.event(owner,'PASSENGER_CANCEL',changed,null,null,r.status);
        return {resourceId:id,action:'PASSENGER_CANCEL',appliedVersion:changed.version};
      })};
    });
  }
}
