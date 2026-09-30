import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const pg=createRequire(new URL('../../dhaka-tesla-pool-backend/package.json',import.meta.url))('pg');
import {isolatedDatabase} from './isolated-db.mjs';import {httpApp} from './http-fixture.mjs';import {seed} from '../../dhaka-tesla-pool-backend/dist/database/seed.js';

test('owned SQL graphs: Dhaka midnight, completed-only money/quantity and one capacity per pool; precise filtered keyset history',{timeout:15000},async()=>{
  const fixture=await isolatedDatabase();await seed(fixture.url,'Nonsecret-test-fixture-2026');const db=new pg.Pool({connectionString:fixture.url});const http=await httpApp(fixture.url);
  try{
    const n=await http.login('nusrat'),r=await http.login('rafiq'),j=await http.login('jashim'),s=await http.login('shirin');
    const vehicle=(await db.query('SELECT id FROM vehicles WHERE driver_id=$1',[j.user.id])).rows[0].id;
    async function pool(at,cancelled=false){return (await db.query(`INSERT INTO pools(driver_id,vehicle_id,pickup_id,group_id,group_version,capacity_snapshot,status,created_at,${cancelled?'cancelled_at':'completed_at'}) VALUES($1,$2,'banani','BANANI_V1',1,3,$3,$4::timestamptz-interval '20 minutes',$4) RETURNING id`,[j.user.id,vehicle,cancelled?'CANCELLED':'COMPLETED',at])).rows[0].id;}
    async function member(actor,poolId,at,seats,cancelled=false,discount=false,final=true){
      const b=(await db.query(`INSERT INTO fare_quotes(owner_id,route_id,pickup_id,destination_id,group_id,group_version,seats,demo_distance_m,base_poysha,rate_poysha,discount_poysha,policy_version,created_at,expires_at)
        SELECT $1,id,pickup_id,destination_id,group_id,group_version,$2,demo_distance_m,base_poysha,rate_poysha,discount_poysha,policy_version,$3::timestamptz-interval '30 minutes',$3::timestamptz-interval '25 minutes' FROM route_rules WHERE destination_id='mohakhali' AND active RETURNING *`,[actor,seats,at])).rows[0];
      const price={currency:'BDT',policyVersion:'fare-v1',seats,demoDistanceM:2000,basePoysha:2000*seats,distancePoysha:2000*seats,discountPoysha:(discount?1000:0)*seats,totalPoysha:(discount?3000:4000)*seats,soloMaximumPoysha:4000*seats};
      const id=(await db.query(`INSERT INTO ride_requests(passenger_id,quote_id,booking_snapshot,pickup_id,destination_id,group_id,group_version,seats,status,created_at,final_fare_snapshot,finalized_at,${cancelled?'cancelled_at':'completed_at'}) VALUES($1,$2,$3,'banani','mohakhali','BANANI_V1',1,$4,$5,$6::timestamptz-interval '29 minutes',$7,CASE WHEN $7::jsonb IS NULL THEN NULL ELSE $6::timestamptz-interval '10 minutes' END,$6) RETURNING id`,[actor,b.id,b,seats,cancelled?'CANCELLED':'COMPLETED',at,final?price:null])).rows[0].id;
      await db.query('INSERT INTO pool_memberships(pool_id,ride_request_id) VALUES($1,$2)',[poolId,id]);return id;
    }
    const day1='2026-09-27 17:59:59.999999+00',micro1='2026-09-27 18:00:00.123456+00',micro2='2026-09-27 18:00:00.123457+00';
    const p1=await pool(day1),p2=await pool(micro1),p3=await pool(micro2),pc=await pool(micro1,true);
    const ids=[await member(n.user.id,p1,day1,1,false,true),await member(n.user.id,p2,micro1,1),await member(n.user.id,p3,micro2,1),await member(n.user.id,pc,micro1,1,true)];
    await member(r.user.id,p1,day1,2,false,true);await member(r.user.id,p2,micro1,1,true,false,false);
    const stats=await n.call('/statistics/passenger?from=2026-09-27&to=2026-09-28');assert.equal(stats.status,200);
    assert.equal(stats.data.timeZone,'Asia/Dhaka');assert.deepEqual(stats.data.totals,{trips:3,farePoysha:11000,discountPoysha:1000});
    assert.deepEqual(stats.data.daily,[{date:'2026-09-27',trips:1,farePoysha:3000,discountPoysha:1000},{date:'2026-09-28',trips:2,farePoysha:8000,discountPoysha:0}]);
    const drivers=(await j.call('/statistics/driver?from=2026-09-27&to=2026-09-28')).data;
    assert.deepEqual(drivers.totals,{trips:3,seats:5,capacity:9,utilization:5/9});assert.equal(drivers.daily[1].capacity,6);assert.equal(drivers.daily[1].seats,2);
    const empty=(await s.call('/statistics/passenger?from=2026-09-27&to=2026-09-28')).data;assert.equal(empty.totals.trips,0);assert.equal(empty.daily.length,2);assert.ok(!JSON.stringify(empty).includes(n.user.id));
    assert.equal((await n.call('/statistics/driver')).status,403);assert.equal((await j.call('/statistics/passenger')).status,403);
    for(const query of ['from=2026-02-30&to=2026-03-01','from=2026-09-28&to=2026-09-27','from=2026-01-01&to=2026-09-28','from=2026-09-28','ownerId=foreign'])assert.equal((await n.call('/statistics/passenger?'+query)).status,400);
    const found=[];let cursor='';
    do{const page=await n.call('/ride-history?limit=1'+(cursor?'&cursor='+cursor:''));assert.equal(page.status,200);found.push(...page.data.items.map(x=>x.id));cursor=page.data.nextCursor??'';if(cursor){const decoded=JSON.parse(Buffer.from(cursor,'base64url').toString());assert.match(decoded.at,/\.\d{6}/);}}while(cursor);
    assert.equal(found.length,4);assert.equal(new Set(found).size,4);assert.deepEqual(new Set(found),new Set(ids));assert.equal(found[0],ids[2]);
    const first=(await n.call('/ride-history?limit=1')).data;
    assert.equal((await n.call('/ride-history?limit=1&status=CANCELLED&cursor='+first.nextCursor)).status,400);
    assert.equal((await r.call('/ride-history?limit=1&cursor='+first.nextCursor)).status,400);
    assert.equal((await n.call('/ride-history?cursor=not-a-cursor')).status,400);
    assert.equal((await n.call('/ride-history?status=REQUESTED')).status,400);assert.equal((await n.call('/ride-history?limit=51')).status,400);
    assert.equal((await n.call('/ride-history?status=COMPLETED&search='+encodeURIComponent('মহাখালী'))).data.items.length,3);
    assert.equal((await n.call('/ride-history?search='+encodeURIComponent('%'))).data.items.length,0);
    const own=(await r.call('/ride-history')).data.items;assert.equal(own.length,2);assert.ok(!JSON.stringify(own).includes('Nusrat'));
    const roster=(await j.call('/driver/trip-history?search=Nusrat')).data.items;assert.equal(roster.length,4);assert.ok(roster.every(x=>x.members.some(m=>m.displayName==='Nusrat')));
  }finally{await http.close();await db.end();await fixture.close();}
});
