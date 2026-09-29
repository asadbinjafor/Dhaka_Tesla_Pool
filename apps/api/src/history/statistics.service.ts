import {Inject,Injectable} from '@nestjs/common';import {DatabaseService} from '../database/database.service.js';import {fail} from '../common/business-error.js';
export interface StatsQuery {from?:string;to?:string}
function civil(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))fail('INVALID_INPUT',400);const date=new Date(value+'T00:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)fail('INVALID_INPUT',400);return date;}
function safe(value:unknown){if(typeof value!=='string'||!/^\d+$/.test(value))fail('INTERNAL_ERROR',500);const number=Number(value);if(!Number.isSafeInteger(number)||number<0)fail('INTERNAL_ERROR',500);return number;}
@Injectable()
export class StatisticsService {
  constructor(@Inject(DatabaseService) readonly db:DatabaseService){}
  async statistics(actor:string,driver:boolean,q:StatsQuery){
    if(!!q.from!==!!q.to)fail('INVALID_INPUT',400);
    const today=(await this.db.query("SELECT to_char(clock_timestamp() AT TIME ZONE 'Asia/Dhaka','YYYY-MM-DD') AS today")).rows[0]!.today;
    const to=q.to??today,from=q.from??new Date(civil(to).getTime()-6*86400000).toISOString().slice(0,10);
    const days=(civil(to).getTime()-civil(from).getTime())/86400000+1;if(days<1||days>90)fail('INVALID_INPUT',400);
    return this.db.transaction(async client=>{
      const sql=driver?`WITH per_pool AS (
        SELECT p.id,(p.completed_at AT TIME ZONE 'Asia/Dhaka')::date AS report_date,p.capacity_snapshot,
          COALESCE(sum(r.seats) FILTER(WHERE r.status='COMPLETED'),0)::bigint AS served
        FROM pools p LEFT JOIN pool_memberships m ON m.pool_id=p.id LEFT JOIN ride_requests r ON r.id=m.ride_request_id
        WHERE p.driver_id=$1 AND p.status='COMPLETED' AND p.completed_at >= ($2::date::timestamp AT TIME ZONE 'Asia/Dhaka') AND p.completed_at < (($3::date+1)::timestamp AT TIME ZONE 'Asia/Dhaka')
        GROUP BY p.id
      ), daily AS (SELECT report_date,count(*)::text AS trips,sum(served)::text AS seats,sum(capacity_snapshot)::text AS capacity FROM per_pool GROUP BY report_date)
      SELECT d.report_date::date::text AS report_date,COALESCE(a.trips,'0') AS trips,COALESCE(a.seats,'0') AS seats,COALESCE(a.capacity,'0') AS capacity
      FROM generate_series($2::timestamp,$3::timestamp,interval '1 day') d(report_date) LEFT JOIN daily a ON a.report_date=d.report_date::date ORDER BY d.report_date`:
      `WITH daily AS (
        SELECT (completed_at AT TIME ZONE 'Asia/Dhaka')::date AS report_date,count(*)::text AS trips,
          sum((final_fare_snapshot->>'totalPoysha')::bigint)::text AS fare,sum((final_fare_snapshot->>'discountPoysha')::bigint)::text AS discount
        FROM ride_requests WHERE passenger_id=$1 AND status='COMPLETED' AND completed_at >= ($2::date::timestamp AT TIME ZONE 'Asia/Dhaka') AND completed_at < (($3::date+1)::timestamp AT TIME ZONE 'Asia/Dhaka') GROUP BY report_date
      ) SELECT d.report_date::date::text AS report_date,COALESCE(a.trips,'0') AS trips,COALESCE(a.fare,'0') AS fare,COALESCE(a.discount,'0') AS discount
      FROM generate_series($2::timestamp,$3::timestamp,interval '1 day') d(report_date) LEFT JOIN daily a ON a.report_date=d.report_date::date ORDER BY d.report_date`;
      const rows=(await client.query(sql,[actor,from,to])).rows;
      const daily=rows.map(row=>driver?{date:row.report_date,trips:safe(row.trips),seats:safe(row.seats),capacity:safe(row.capacity)}:{date:row.report_date,trips:safe(row.trips),farePoysha:safe(row.fare),discountPoysha:safe(row.discount)});
      const totals:Record<string,number>={};for(const row of daily)for(const [key,value] of Object.entries(row)){if(typeof value==='number'){totals[key]=(totals[key]??0)+value;if(!Number.isSafeInteger(totals[key]))fail('INTERNAL_ERROR',500);}}
      if(driver)totals.utilization=totals.capacity?(totals.seats??0)/totals.capacity:0;
      return {data:{actorRole:driver?'DRIVER':'PASSENGER',timeZone:'Asia/Dhaka',currency:'BDT',population:'COMPLETED_ONLY',from,to,daily,totals}};
    },true);
  }
}
