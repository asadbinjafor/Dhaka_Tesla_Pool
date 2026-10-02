import type {QueryResultRow} from 'pg';
import type {DatabaseClient} from '../database/database.service.js';
import {fail} from '../common/business-error.js';
import {fare} from '../rides/ride.repository.js';
import type {Ride} from '../rides/ride.repository.js';
export interface TripPool extends QueryResultRow {id:string;driver_id:string;vehicle_id:string;pickup_id:string;group_id:string;group_version:number;capacity_snapshot:number;status:string;version:number;created_at:Date;ended_at:Date|null;cancellation_reason:string|null}
export class PoolRepository {
  constructor(readonly client:DatabaseClient){}
  async parent(driver:string) {
    const profile=(await this.client.query('SELECT * FROM driver_profiles WHERE user_id=$1 FOR UPDATE',[driver])).rows[0]??fail('NOT_FOUND',404);
    const vehicle=(await this.client.query('SELECT * FROM vehicles WHERE driver_id=$1 FOR UPDATE',[driver])).rows[0]??fail('NOT_FOUND',404);
    return {profile,vehicle};
  }
  async ownPool(id:string,driver:string,lock=false):Promise<TripPool>{return (await this.client.query<TripPool>(`SELECT * FROM pools WHERE id=$1 AND driver_id=$2${lock?' FOR UPDATE':''}`,[id,driver])).rows[0]??fail('NOT_FOUND',404);}
  async current(driver:string,lock=false):Promise<TripPool|null>{return (await this.client.query<TripPool>(`SELECT * FROM pools WHERE driver_id=$1 AND ended_at IS NULL${lock?' FOR UPDATE':''}`,[driver])).rows[0]??null;}
  async occupancy(id:string) {return (await this.client.query("SELECT COALESCE(sum(r.seats),0)::int AS seats,count(*)::int AS bookings FROM pool_memberships m JOIN ride_requests r ON r.id=m.ride_request_id WHERE m.pool_id=$1 AND r.status IN ('MATCHED','DRIVER_ARRIVED','STARTED')",[id])).rows[0]!;}
  async members(id:string,lock=false):Promise<Ride[]>{return (await this.client.query<Ride>(`SELECT r.* FROM pool_memberships m JOIN ride_requests r ON r.id=m.ride_request_id WHERE m.pool_id=$1 AND r.status IN ('MATCHED','DRIVER_ARRIVED','STARTED') ORDER BY r.id${lock?' FOR UPDATE OF r':''}`,[id])).rows;}
  async event(actor:string,type:string,pool:TripPool,from:string|null) {await this.client.query('INSERT INTO ride_events(actor_id,event_type,pool_id,from_state,to_state,pool_version) VALUES($1,$2,$3,$4,$5,$6)',[actor,type,pool.id,from,pool.status,pool.version]);}
  async detail(id:string,driver:string){
    const p=await this.ownPool(id,driver);const occupancy=await this.occupancy(id);
    const members=(await this.client.query<Ride & {display_name:string}>(`SELECT r.*,u.display_name FROM pool_memberships m JOIN ride_requests r ON r.id=m.ride_request_id JOIN users u ON u.id=r.passenger_id WHERE m.pool_id=$1 ORDER BY m.joined_at,r.id`,[id])).rows;
    return {id:p.id,status:p.status,capacity:p.capacity_snapshot,reservedSeats:occupancy.seats,version:p.version,createdAt:p.created_at,endedAt:p.ended_at,cancellationReason:p.cancellation_reason,
      members:members.map(r=>({id:r.id,displayName:r.display_name,status:r.status,seats:r.seats,pickupId:r.pickup_id,destinationId:r.destination_id,
        fare:r.status==='CANCELLED'?0:(r.final_fare_snapshot??fare(r.booking_snapshot,occupancy.bookings)).totalPoysha,
        fareKind:r.status==='CANCELLED'?'CANCELLED':r.final_fare_snapshot?'FINAL':'ESTIMATE',historicalFinal:r.status==='CANCELLED'?r.final_fare_snapshot:null})),
      allowedActions:p.status==='ACCEPTED'?['ARRIVE','CANCEL']:p.status==='DRIVER_ARRIVED'?['START','CANCEL']:p.status==='STARTED'?['COMPLETE']:[]};
  }
}
