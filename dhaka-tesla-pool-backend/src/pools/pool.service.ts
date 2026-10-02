import {Inject,Injectable} from '@nestjs/common';
import {DatabaseService} from '../database/database.service.js';
import {BusinessError,fail} from '../common/business-error.js';
import {command} from '../common/command.js';
import {RideRepository,fare} from '../rides/ride.repository.js';
import type {Ride} from '../rides/ride.repository.js';
import {PoolRepository} from './pool.repository.js';
import type {TripPool} from './pool.repository.js';
class DiscoveryChanged extends Error {}
@Injectable()
export class PoolService {
  constructor(@Inject(DatabaseService) readonly db:DatabaseService){}
  async availability(driver:string,key:string,online:boolean){return this.db.transaction(async client=>{
    const repo=new PoolRepository(client);
    if(!(await client.query('SELECT user_id FROM driver_profiles WHERE user_id=$1',[driver])).rowCount)fail('NOT_FOUND',404);
    return {data:await command(client,driver,'SET_AVAILABILITY',key,`driver:${driver}`,{online},async()=>{
      const {profile}=await repo.parent(driver);const current=await repo.current(driver);
      if(!online&&current)fail('ACTIVE_POOL_EXISTS');
      if(profile.online!==online)await client.query('UPDATE driver_profiles SET online=$2 WHERE user_id=$1',[driver,online]);
      return {resourceId:driver,action:'SET_AVAILABILITY',appliedVersion:0};
    })};
  });}
  async requests(driver:string){return this.db.transaction(async client=>{
    const repo=new PoolRepository(client);const profile=(await client.query('SELECT online FROM driver_profiles WHERE user_id=$1',[driver])).rows[0];
    const pool=await repo.current(driver);const occupancy=pool?await repo.occupancy(pool.id):{seats:0};
    const remaining=3-occupancy.seats;
    if(!profile?.online||pool&&pool.status!=='ACCEPTED')return {data:{online:profile?.online??false,availableSeats:remaining,requests:[]}};
    const rows=(await client.query<Ride & {display_name:string}>(`SELECT r.*,u.display_name FROM ride_requests r JOIN users u ON u.id=r.passenger_id
      WHERE r.status='REQUESTED' AND r.pickup_id=$1 AND r.group_id=$2 AND r.group_version=$3 ORDER BY r.created_at,r.id LIMIT 50`,[pool?.pickup_id??'banani',pool?.group_id??'BANANI_V1',pool?.group_version??1])).rows;
    return {data:{online:true,availableSeats:remaining,requests:rows.map(r=>({id:r.id,displayName:r.display_name,pickupId:r.pickup_id,destinationId:r.destination_id,seats:r.seats,createdAt:r.created_at,canFit:r.seats<=remaining}))}};
  },true);}
  async accept(driver:string,id:string,key:string){return this.db.transaction(async client=>{
    const pools=new PoolRepository(client);const rides=new RideRepository(client);
    // A past assigned command can replay only for that historical owning driver.
    const permitted=(await client.query('SELECT r.id,p.driver_id FROM ride_requests r LEFT JOIN pool_memberships m ON m.ride_request_id=r.id LEFT JOIN pools p ON p.id=m.pool_id WHERE r.id=$1',[id])).rows[0];
    if(!permitted||permitted.driver_id&&permitted.driver_id!==driver)fail('REQUEST_UNAVAILABLE');
    return {data:await command(client,driver,'ACCEPT',key,`ride:${id}`,{},async()=>{
      const {profile,vehicle}=await pools.parent(driver);
      let pool=await pools.current(driver,true); // fresh statement AFTER parent lock resolves
      const r=(await client.query<Ride>('SELECT * FROM ride_requests WHERE id=$1 FOR UPDATE',[id])).rows[0];
      if(!r||r.status!=='REQUESTED'||(await client.query('SELECT id FROM pool_memberships WHERE ride_request_id=$1',[id])).rowCount)fail('REQUEST_UNAVAILABLE');
      if(!profile.online)fail('DRIVER_OFFLINE');
      if(r.pickup_id!=='banani'||r.group_id!=='BANANI_V1'||r.group_version!==1)fail('ROUTE_UNSUPPORTED',422);
      if(pool&&(pool.status!=='ACCEPTED'||pool.pickup_id!==r.pickup_id||pool.group_id!==r.group_id||pool.group_version!==r.group_version))fail('POOL_CLOSED');
      const occupancy=pool?await pools.occupancy(pool.id):{seats:0};
      const available=(pool?.capacity_snapshot??vehicle.capacity)-occupancy.seats;
      if(r.seats>available)throw new BusinessError('POOL_CAPACITY_EXCEEDED',409,{requestedSeats:r.seats,availableSeats:available});
      if(!pool){pool=(await client.query<TripPool>("INSERT INTO pools(driver_id,vehicle_id,pickup_id,group_id,group_version,capacity_snapshot,status) VALUES($1,$2,$3,$4,$5,$6,'ACCEPTED') RETURNING *",[driver,vehicle.id,r.pickup_id,r.group_id,r.group_version,vehicle.capacity])).rows[0]!;await pools.event(driver,'POOL_CREATED',pool,null);}
      await client.query('INSERT INTO pool_memberships(pool_id,ride_request_id) VALUES($1,$2)',[pool.id,id]);
      const changed=(await client.query<Ride>("UPDATE ride_requests SET status='MATCHED',version=version+1,matched_at=clock_timestamp() WHERE id=$1 RETURNING *",[id])).rows[0]!;
      pool=(await client.query<TripPool>('UPDATE pools SET version=version+1 WHERE id=$1 RETURNING *',[pool.id])).rows[0]!;
      await rides.event(driver,'ACCEPT',changed,pool.id,pool.version,r.status);await pools.event(driver,'MEMBER_JOINED',pool,pool.status);
      return {resourceId:pool.id,action:'ACCEPT',appliedVersion:pool.version};
    })};
  });}
  async current(driver:string){return this.db.transaction(async client=>{const repo=new PoolRepository(client);const p=await repo.current(driver);return {data:p?await repo.detail(p.id,driver):null};},true);}
  async detail(driver:string,id:string){return this.db.transaction(async client=>({data:await new PoolRepository(client).detail(id,driver)}),true);}
  async transition(driver:string,id:string,key:string,action:'ARRIVE'|'START'|'COMPLETE'|'DRIVER_CANCEL',reason?:string){
    if(action==='DRIVER_CANCEL'&&(!reason||reason.length>200))fail('INVALID_INPUT',400);
    return this.db.transaction(async client=>{
      const pools=new PoolRepository(client);const rides=new RideRepository(client);await pools.ownPool(id,driver);
      return {data:await command(client,driver,action,key,`pool:${id}`,reason?{reason}:{},async()=>{
        await pools.parent(driver);const pool=await pools.ownPool(id,driver,true);
        const expected=action==='ARRIVE'?'ACCEPTED':action==='START'?'DRIVER_ARRIVED':action==='COMPLETE'?'STARTED':null;
        if(expected?pool.status!==expected:!['ACCEPTED','DRIVER_ARRIVED'].includes(pool.status))fail('INVALID_TRANSITION');
        const members=await pools.members(id,true);if(!members.length)fail('INVALID_TRANSITION');
        const memberState=pool.status==='ACCEPTED'?'MATCHED':pool.status;
        if(members.some(r=>r.status!==memberState))fail('INVALID_TRANSITION');
        const next=action==='ARRIVE'?'DRIVER_ARRIVED':action==='START'?'STARTED':action==='COMPLETE'?'COMPLETED':'CANCELLED';
        const timeColumn=action==='ARRIVE'?'arrived_at':action==='START'?'started_at':action==='COMPLETE'?'completed_at':'cancelled_at';
        const at=(await client.query('SELECT clock_timestamp()::text AS at')).rows[0]!.at;
        const changedPool=(await client.query<TripPool>(`UPDATE pools SET status=$2,version=version+1,${timeColumn}=$3${action==='DRIVER_CANCEL'?',cancellation_reason=$4':''} WHERE id=$1 RETURNING *`,action==='DRIVER_CANCEL'?[id,next,at,reason]:[id,next,at])).rows[0]!;
        for(const r of members){
          const params:unknown[]=[r.id,next,at];let extra='';
          if(action==='ARRIVE'){params.push(fare(r.booking_snapshot,members.length));extra=',final_fare_snapshot=$4,finalized_at=$3';}
          if(action==='DRIVER_CANCEL'){params.push(reason);extra=',cancellation_reason=$4';}
          const changed=(await client.query<Ride>(`UPDATE ride_requests SET status=$2,version=version+1,${timeColumn}=$3${extra} WHERE id=$1 RETURNING *`,params)).rows[0]!;
          await rides.event(driver,action,changed,id,changedPool.version,r.status);
        }
        await pools.event(driver,action,changedPool,pool.status);
        return {resourceId:id,action,appliedVersion:changedPool.version};
      })};
    });
  }
  async cancelPassenger(owner:string,id:string,key:string,reason:string){
    if(!reason||reason.length>200)fail('INVALID_INPUT',400);
    for(let attempt=0;attempt<3;attempt++){
      try{return await this.db.transaction(async client=>{
        const rides=new RideRepository(client);await rides.ownRide(id,owner);
        const association=(await client.query('SELECT p.id,p.driver_id FROM pool_memberships m JOIN pools p ON p.id=m.pool_id WHERE m.ride_request_id=$1',[id])).rows[0];
        return {data:await command(client,owner,'PASSENGER_CANCEL',key,`ride:${id}`,{reason},async()=>{
          const pools=new PoolRepository(client);let pool:TripPool|null=null;
          if(association){await pools.parent(association.driver_id);pool=await pools.ownPool(association.id,association.driver_id,true);}
          const r=await rides.ownRide(id,owner,true);
          if(!association&&(await client.query('SELECT id FROM pool_memberships WHERE ride_request_id=$1',[id])).rowCount)throw new DiscoveryChanged();
          if(['DRIVER_ARRIVED','STARTED'].includes(r.status))fail('CANCELLATION_CLOSED');
          if(!['REQUESTED','MATCHED'].includes(r.status))fail('INVALID_TRANSITION');
          if(pool&&pool.status!=='ACCEPTED')fail('CANCELLATION_CLOSED');
          const changed=(await client.query<Ride>("UPDATE ride_requests SET status='CANCELLED',version=version+1,cancelled_at=clock_timestamp(),cancellation_reason=$2 WHERE id=$1 RETURNING *",[id,reason])).rows[0]!;
          if(pool){const empty=(await pools.occupancy(pool.id)).seats===0;
            pool=(await client.query<TripPool>(`UPDATE pools SET version=version+1${empty?",status='CANCELLED',cancelled_at=clock_timestamp(),cancellation_reason=$2":''} WHERE id=$1 RETURNING *`,empty?[pool.id,reason]:[pool.id])).rows[0]!;
            await pools.event(owner,empty?'EMPTY_POOL_CLOSED':'MEMBER_CANCELLED',pool,'ACCEPTED');
          }
          await rides.event(owner,'PASSENGER_CANCEL',changed,pool?.id??null,pool?.version??null,r.status);
          return {resourceId:id,action:'PASSENGER_CANCEL',appliedVersion:changed.version};
        })};
      });}catch(error){if(error instanceof DiscoveryChanged)continue;throw error;}
    }
    fail('TEMPORARILY_UNAVAILABLE',503);
  }
}
