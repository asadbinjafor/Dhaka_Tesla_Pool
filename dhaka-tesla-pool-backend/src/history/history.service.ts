import {createHash} from 'node:crypto';import {Inject,Injectable} from '@nestjs/common';
import {DatabaseService} from '../database/database.service.js';import {fail} from '../common/business-error.js';
import {RideRepository} from '../rides/ride.repository.js';import {PoolRepository} from '../pools/pool.repository.js';
export interface HistoryQuery {status?:string;search?:string;limit?:string;cursor?:string}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
@Injectable()
export class HistoryService {
  constructor(@Inject(DatabaseService) readonly db:DatabaseService){}
  async history(actor:string,driver:boolean,q:HistoryQuery){
    const status=q.status??'ALL',search=(q.search??'').trim(),limit=Number(q.limit??'10');
    if(!['ALL','COMPLETED','CANCELLED'].includes(status)||search.length>100||!/^\d{1,2}$/.test(q.limit??'10')||limit<1||limit>50)fail('INVALID_INPUT',400);
    const binding=createHash('sha256').update(JSON.stringify({actor,driver,status,search})).digest('hex');
    let cursor:{at:string;id:string;binding:string}|null=null;
    if(q.cursor){
      try{
        if(q.cursor.length>2048||!/^[A-Za-z0-9_-]+$/.test(q.cursor))throw new Error();
        cursor=JSON.parse(Buffer.from(q.cursor,'base64url').toString());
        if(!cursor||cursor.binding!==binding||!uuid.test(cursor.id)||typeof cursor.at!=='string'||!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?[+-]\d{2}(:\d{2})?$/.test(cursor.at)||!Number.isFinite(Date.parse(cursor.at.replace(' ','T').replace(/([+-]\d{2})$/,'$1:00'))))throw new Error();
      }catch{fail('INVALID_INPUT',400);}
    }
    return this.db.transaction(async client=>{
      const table=driver?'pools':'ride_requests',owner=driver?'driver_id':'passenger_id';
      const params:unknown[]=[actor];const bind=(v:unknown)=>{params.push(v);return '$'+params.length;};
      const where=[`r.${owner}=$1`,'r.ended_at IS NOT NULL'];
      if(status!=='ALL')where.push(`r.status=${bind(status)}`);
      if(search){const term=bind('%'+search.replace(/[\\%_]/g,'\\$&')+'%');
        where.push(driver?`(r.id::text ILIKE ${term} ESCAPE '\\' OR EXISTS(SELECT 1 FROM pool_memberships m JOIN ride_requests rr ON rr.id=m.ride_request_id JOIN users u ON u.id=rr.passenger_id WHERE m.pool_id=r.id AND u.display_name ILIKE ${term} ESCAPE '\\'))`:
          `(r.id::text ILIKE ${term} ESCAPE '\\' OR EXISTS(SELECT 1 FROM zones z WHERE z.id IN(r.pickup_id,r.destination_id) AND (z.label_en ILIKE ${term} ESCAPE '\\' OR z.label_bn ILIKE ${term} ESCAPE '\\')))`);
      }
      if(cursor)where.push(`(r.ended_at,r.id)<(${bind(cursor.at)}::timestamptz,${bind(cursor.id)}::uuid)`);
      const rows=(await client.query(`SELECT r.id,r.ended_at::text AS ended_at FROM ${table} r WHERE ${where.join(' AND ')} ORDER BY r.ended_at DESC,r.id DESC LIMIT ${bind(limit+1)}`,params)).rows;
      const page=rows.slice(0,limit);const rides=new RideRepository(client),pools=new PoolRepository(client);
      const items=[];for(const row of page)items.push(driver?await pools.detail(row.id,actor):await rides.detail(row.id,actor));
      const last=page.at(-1);const nextCursor=rows.length>limit&&last?Buffer.from(JSON.stringify({at:last.ended_at,id:last.id,binding})).toString('base64url'):null;
      return {data:{items,nextCursor,filters:{status,search},limit}};
    },true);
  }
}
