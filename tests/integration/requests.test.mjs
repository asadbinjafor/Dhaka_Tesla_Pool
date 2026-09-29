import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
const pg=createRequire(new URL('../../apps/api/package.json',import.meta.url))('pg');
import { isolatedDatabase } from './isolated-db.mjs';
import { httpApp } from './http-fixture.mjs';
import { seed } from '../../apps/api/dist/database/seed.js';

test('owned quotes/requests: exact fare, typed validation, private detail, concurrent active constraint, terminal replay and expiry after lock wait',async()=>{
  const fixture=await isolatedDatabase(); await seed(fixture.url,'Nonsecret-test-fixture-2026');
  const db=new pg.Pool({connectionString:fixture.url}); const http=await httpApp(fixture.url);
  try {
    const n=await http.login('nusrat'),r=await http.login('rafiq');
    const input={pickupId:'banani',destinationId:'mohakhali',seats:1};
    for(const seats of [0,-1,4,1.5]) assert.equal((await n.call('/fare-quotes','POST',{...input,seats})).status,422);
    assert.equal((await n.call('/fare-quotes','POST',{...input,seats:'1'})).status,400);
    assert.equal((await n.call('/fare-quotes','POST',{...input,destinationId:'banani'})).status,422);
    assert.equal((await n.call('/fare-quotes','POST',{...input,price:1})).status,400);
    const q=(await n.call('/fare-quotes','POST',input)).data;
    assert.equal(q.solo.totalPoysha,4000); assert.equal(q.pooled.totalPoysha,3000);
    const q2=(await n.call('/fare-quotes','POST',input)).data;
    assert.equal((await r.call('/ride-requests','POST',{quoteId:q.id,paymentMethod:'CASH'},randomUUID())).status,404);
    const body={quoteId:q.id,paymentMethod:'CASH'},key=randomUUID();
    const pair=await Promise.all([n.call('/ride-requests','POST',body,key),n.call('/ride-requests','POST',{quoteId:q2.id,paymentMethod:'CASH'},randomUUID())]);
    assert.deepEqual(pair.map(x=>x.status).sort(),[201,409]);
    const won=pair[0].status===201?pair[0]:pair[1];
    const wonBody=pair[0].status===201?body:{quoteId:q2.id,paymentMethod:'CASH'};
    // Use a known separately replayable original command; if second command won, query its stored fixture receipt/key.
    const stored=(await db.query('SELECT key,receipt FROM idempotency_keys WHERE actor_id=$1 AND action_scope=$2',[n.user.id,'CREATE_REQUEST'])).rows[0];
    assert.deepEqual((await n.call('/ride-requests','POST',wonBody,stored.key)).data,won.data);
    assert.equal((await n.call('/ride-requests','POST',{...wonBody,paymentMethod:'CARD'},stored.key)).status,400);
    const detail=(await n.call('/ride-requests/'+won.data.resourceId)).data;
    assert.equal(detail.status,'REQUESTED');assert.equal(detail.pool,null);
    assert.equal((await r.call('/ride-requests/'+detail.id)).status,404);
    assert.equal((await r.call('/ride-requests/'+detail.id+'/cancel','POST',{reason:'Foreign'},randomUUID())).status,404);
    const cancelKey=randomUUID();
    const cancelled=await n.call('/ride-requests/'+detail.id+'/cancel','POST',{reason:'Changed plans'},cancelKey);
    assert.equal(cancelled.status,201);
    assert.deepEqual((await n.call('/ride-requests/'+detail.id+'/cancel','POST',{reason:'Changed plans'},cancelKey)).data,cancelled.data);
    assert.equal((await n.call('/ride-requests/'+detail.id+'/cancel','POST',{reason:'Again'},randomUUID())).status,409);
    assert.deepEqual((await n.call('/ride-requests','POST',wonBody,stored.key)).data,won.data);
    assert.equal((await n.call('/ride-requests','POST',{quoteId:wonBody.quoteId===q.id?q2.id:q.id,paymentMethod:'CASH'},stored.key)).error.code,'IDEMPOTENCY_KEY_REUSED');
    assert.equal((await n.call('/ride-requests/current')).data,null);
    const terminal=(await n.call('/ride-requests/'+detail.id)).data;
    assert.equal(terminal.status,'CANCELLED');assert.equal(terminal.fare.chargePoysha,0);
    assert.equal((await db.query('SELECT count(*)::int n FROM pool_memberships')).rows[0].n,0);
    assert.equal((await db.query('SELECT count(*)::int n FROM ride_events')).rows[0].n,2);
    // Short-lived quote is a fixture insert; immutable applied rows are never edited.
    const rule=(await db.query("SELECT * FROM route_rules WHERE destination_id='mohakhali'")).rows[0];
    const short=(await db.query(`INSERT INTO fare_quotes(owner_id,route_id,pickup_id,destination_id,group_id,group_version,seats,demo_distance_m,base_poysha,rate_poysha,discount_poysha,policy_version,expires_at)
      VALUES($1,$2,'banani','mohakhali','BANANI_V1',1,1,2000,2000,1000,1000,'fare-v1',clock_timestamp()+interval '600 milliseconds') RETURNING id`,[n.user.id,rule.id])).rows[0];
    const lock=await db.connect(); await lock.query('BEGIN'); await lock.query('SELECT id FROM fare_quotes WHERE id=$1 FOR UPDATE',[short.id]);
    const pending=n.call('/ride-requests','POST',{quoteId:short.id,paymentMethod:'CASH'},randomUUID());
    let waited=false;const deadline=Date.now()+1000;
    while(Date.now()<deadline){if((await db.query("SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%fare_quotes%FOR UPDATE%'")).rowCount){waited=true;break;} await new Promise(resolve=>setTimeout(resolve,10));}
    assert.ok(waited,'actual separate API connection waited on the quote lock');
    await new Promise(resolve=>setTimeout(resolve,650)); await lock.query('COMMIT');lock.release();
    assert.equal((await pending).error.code,'QUOTE_EXPIRED');
    assert.equal((await db.query('SELECT count(*)::int n FROM ride_requests WHERE quote_id=$1',[short.id])).rows[0].n,0);
  } finally {await http.close();await db.end();await fixture.close();}
});
