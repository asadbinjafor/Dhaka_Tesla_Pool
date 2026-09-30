import type { PoolClient, QueryResultRow } from 'pg';
import { fail } from '../common/business-error.js';

export interface Booking extends QueryResultRow {
  id:string; owner_id:string; pickup_id:string; destination_id:string; group_id:string; group_version:number;
  seats:number; demo_distance_m:number; base_poysha:number; rate_poysha:number; discount_poysha:number; policy_version:string;
  expires_at:Date;
}
export interface Ride extends QueryResultRow {
  id:string; passenger_id:string; quote_id:string; pickup_id:string; destination_id:string; group_id:string; group_version:number;
  seats:number; status:string; version:number; booking_snapshot:Booking; final_fare_snapshot:ReturnType<typeof fare>|null;
  created_at:Date; ended_at:Date|null; cancellation_reason:string|null;
}
export function fare(b:Booking, bookings:number) {
  const distancePoysha=b.demo_distance_m/1000*b.rate_poysha;
  const discountPoysha=bookings>=2?b.discount_poysha:0;
  const soloMaximumPoysha=(b.base_poysha+distancePoysha)*b.seats;
  const totalPoysha=(b.base_poysha+distancePoysha-discountPoysha)*b.seats;
  if(![distancePoysha,soloMaximumPoysha,totalPoysha].every(Number.isSafeInteger)) fail('INTERNAL_ERROR',500);
  return {currency:'BDT' as const,policyVersion:b.policy_version,seats:b.seats,demoDistanceM:b.demo_distance_m,
    basePoysha:b.base_poysha*b.seats,distancePoysha:distancePoysha*b.seats,discountPoysha:discountPoysha*b.seats,totalPoysha,soloMaximumPoysha};
}
export class RideRepository {
  constructor(readonly client:PoolClient) {}
  async ownRide(id:string,owner:string,lock=false):Promise<Ride> {
    const result=await this.client.query<Ride>(`SELECT * FROM ride_requests WHERE id=$1 AND passenger_id=$2${lock?' FOR UPDATE':''}`,[id,owner]);
    return result.rows[0]??fail('NOT_FOUND',404);
  }
  async ownQuote(id:string,owner:string,lock=false):Promise<Booking> {
    const result=await this.client.query<Booking>(`SELECT * FROM fare_quotes WHERE id=$1 AND owner_id=$2${lock?' FOR UPDATE':''}`,[id,owner]);
    return result.rows[0]??fail('NOT_FOUND',404);
  }
  async event(actor:string,type:string,request:Ride,poolId:string|null=null,poolVersion:number|null=null,from:string|null=null) {
    await this.client.query('INSERT INTO ride_events(actor_id,event_type,ride_request_id,pool_id,from_state,to_state,request_version,pool_version) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
      [actor,type,request.id,poolId,from,request.status,request.version,poolVersion]);
  }
  async detail(id:string,owner:string) {
    const r=await this.ownRide(id,owner);
    const found=await this.client.query(`SELECT p.*,u.display_name AS driver_name,v.display_name AS vehicle_name,
      (SELECT COALESCE(sum(rr.seats),0)::int FROM pool_memberships mm JOIN ride_requests rr ON rr.id=mm.ride_request_id WHERE mm.pool_id=p.id AND rr.status IN ('MATCHED','DRIVER_ARRIVED','STARTED')) AS reserved,
      (SELECT count(*)::int FROM pool_memberships mm JOIN ride_requests rr ON rr.id=mm.ride_request_id WHERE mm.pool_id=p.id AND rr.status IN ('MATCHED','DRIVER_ARRIVED','STARTED')) AS bookings
      FROM pool_memberships m JOIN pools p ON p.id=m.pool_id JOIN users u ON u.id=p.driver_id JOIN vehicles v ON v.id=p.vehicle_id WHERE m.ride_request_id=$1`,[id]);
    const pool=found.rows[0];
    const cancelled=r.status==='CANCELLED';
    const price=r.final_fare_snapshot??fare(r.booking_snapshot,pool?.bookings??1);
    const matching=r.status==='REQUESTED'?(await this.client.query(`SELECT clock_timestamp() AS as_of, EXISTS(
      SELECT 1 FROM driver_profiles d JOIN vehicles v ON v.driver_id=d.user_id
      LEFT JOIN pools p ON p.driver_id=d.user_id AND p.ended_at IS NULL
      WHERE d.online AND $1='banani' AND $2='BANANI_V1' AND $3=1
        AND (p.id IS NULL OR (p.status='ACCEPTED' AND p.pickup_id=$1 AND p.group_id=$2 AND p.group_version=$3
          AND $4+(SELECT COALESCE(sum(rr.seats),0) FROM pool_memberships mm JOIN ride_requests rr ON rr.id=mm.ride_request_id WHERE mm.pool_id=p.id AND rr.status IN ('MATCHED','DRIVER_ARRIVED','STARTED'))<=p.capacity_snapshot))) AS eligible`,[r.pickup_id,r.group_id,r.group_version,r.seats])).rows[0]:null;
    // Allowlisted response: no other passenger identifiers/names/statuses/fares or internal events.
    return {id:r.id,status:r.status,seats:r.seats,createdAt:r.created_at,endedAt:r.ended_at,cancellationReason:r.cancellation_reason,
      route:{pickupId:r.pickup_id,destinationId:r.destination_id,isDemoGeography:true},
      fare:{...price,kind:cancelled?'CANCELLED':r.final_fare_snapshot?'FINAL':'ESTIMATE',chargePoysha:cancelled?0:r.final_fare_snapshot?price.totalPoysha:null,collectionStatus:'NOT_TRACKED',historicalFinal:cancelled?r.final_fare_snapshot:null},
      pool:pool?{id:pool.id,capacity:pool.capacity_snapshot,reservedSeats:r.ended_at?0:pool.reserved,ownSeats:r.seats,status:pool.status}:null,
      driver:pool?{displayName:pool.driver_name,vehicleName:pool.vehicle_name}:null,
      allowedActions:['REQUESTED','MATCHED'].includes(r.status)?['CANCEL']:[],
      matchingHint:matching?{state:matching.eligible?'WAITING_FOR_ACCEPTANCE':'NO_ELIGIBLE_DRIVER',asOf:matching.as_of}:null,
      representationVersion:{request:r.version,pool:pool?.version??0}};
  }
}
