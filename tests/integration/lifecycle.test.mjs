import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {createRequire} from 'node:module';
const pg=createRequire(new URL('../../apps/api/package.json',import.meta.url))('pg');
import {isolatedDatabase} from './isolated-db.mjs';import {httpApp,book} from './http-fixture.mjs';import {seed} from '../../apps/api/dist/database/seed.js';import {DatabaseService} from '../../apps/api/dist/database/database.service.js';
async function setup(){const fixture=await isolatedDatabase();await seed(fixture.url,'Nonsecret-test-fixture-2026');const db=new pg.Pool({connectionString:fixture.url});const http=await httpApp(fixture.url);const j=await http.login('jashim'),n=await http.login('nusrat'),r=await http.login('rafiq'),s=await http.login('shirin');await j.call('/driver/availability','PATCH',{online:true},randomUUID());const state={fixture,db,http,j,n,r,s,async close(){await state.http.close();await db.end();await fixture.close();}};return state;}
async function accept(j,id){const response=await j.call(`/driver/requests/${id}/accept`,'POST',{},randomUUID());assert.equal(response.status,201);return response.data.resourceId;}
async function action(j,id,verb,key=randomUUID(),body={}){return j.call(`/driver/pools/${id}/${verb}`,'POST',body,key);}
async function waitForLock(db,fragment){const deadline=Date.now()+1500;while(Date.now()<deadline){if((await db.query("SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE $1",['%'+fragment+'%'])).rowCount)return;await new Promise(resolve=>setTimeout(resolve,10));}assert.fail('Expected actual lock contention');}

test('real lifecycle: allowed transitions, immutable quoted/final fares, terminal receipt replay, ownership and API restart persistence',{timeout:15000},async()=>{
  const f=await setup();const {j,n,r,s,db}=f;
  try{
    const nId=await book(n),rId=await book(r,2,'gulshan-1');const pool=await accept(j,nId);await accept(j,rId);
    const nBefore=(await n.call('/ride-requests/'+nId)).data;assert.equal(nBefore.fare.totalPoysha,3000);const rBefore=(await r.call('/ride-requests/'+rId)).data;assert.equal(rBefore.fare.totalPoysha,8000);
    assert.equal((await action(j,pool,'start')).error.code,'INVALID_TRANSITION');assert.equal((await action(j,pool,'complete')).error.code,'INVALID_TRANSITION');
    assert.equal((await n.call(`/driver/pools/${pool}/arrive`,'POST',{},randomUUID())).status,403);
    assert.equal((await s.call(`/ride-requests/${nId}/cancel`,'POST',{reason:'Foreign'},randomUUID())).status,404);
    assert.equal((await action(j,pool,'arrive',randomUUID(),{fare:1})).status,400);
    // New catalog values cannot rewrite the booking's immutable price basis.
    await db.query('UPDATE route_rules SET rate_poysha=9000 WHERE active');
    const arrivalKey=randomUUID();const arrived=await action(j,pool,'arrive',arrivalKey);assert.equal(arrived.status,201);
    const finalN=(await n.call('/ride-requests/'+nId)).data;const finalR=(await r.call('/ride-requests/'+rId)).data;
    assert.equal(finalN.fare.kind,'FINAL');assert.equal(finalN.fare.chargePoysha,3000);assert.equal(finalR.fare.chargePoysha,8000);
    assert.equal((await n.call(`/ride-requests/${nId}/cancel`,'POST',{reason:'Too late'},randomUUID())).error.code,'CANCELLATION_CLOSED');
    const sId=await book(s);assert.equal((await j.call(`/driver/requests/${sId}/accept`,'POST',{},randomUUID())).error.code,'POOL_CLOSED');
    assert.equal((await action(j,pool,'complete')).error.code,'INVALID_TRANSITION');assert.equal((await action(j,pool,'start')).status,201);
    assert.equal((await action(j,pool,'cancel',randomUUID(),{reason:'Too late'})).error.code,'INVALID_TRANSITION');assert.equal((await action(j,pool,'complete')).status,201);
    const completed=(await n.call('/ride-requests/'+nId)).data;assert.equal(completed.status,'COMPLETED');assert.deepEqual(completed.fare,finalN.fare);assert.equal(completed.pool.reservedSeats,0);
    assert.equal((await n.call('/ride-requests/current')).data,null);assert.equal((await j.call('/driver/pools/current')).data,null);
    const count=(await db.query('SELECT count(*)::int n FROM ride_events')).rows[0].n;
    assert.deepEqual((await action(j,pool,'arrive',arrivalKey)).data,arrived.data);assert.equal((await action(j,pool,'arrive')).error.code,'INVALID_TRANSITION');
    assert.equal((await db.query('SELECT count(*)::int n FROM ride_events')).rows[0].n,count);
    const oldCookie=n.headers.cookie;await f.http.close();f.http=await httpApp(f.fixture.url);
    const after=await fetch(f.http.base+'/api/v1/ride-requests/'+nId,{headers:{cookie:oldCookie}});assert.equal(after.status,200);assert.equal((await after.json()).data.status,'COMPLETED');
    const stored=(await db.query('SELECT final_fare_snapshot,ended_at FROM ride_requests WHERE id=$1',[nId])).rows[0];assert.equal(stored.final_fare_snapshot.totalPoysha,3000);assert.ok(stored.ended_at);
  }finally{await f.close();}
});

test('driver cancellation after arrival: zero charge and retained final evidence; previously cancelled member/time/event never rewritten',{timeout:10000},async()=>{
  const f=await setup();const {j,n,r,db}=f;
  try{
    const nId=await book(n),rId=await book(r);const pool=await accept(j,nId);await accept(j,rId);
    await n.call(`/ride-requests/${nId}/cancel`,'POST',{reason:'Earlier cancel'},randomUUID());
    const earlier=(await db.query('SELECT * FROM ride_requests WHERE id=$1',[nId])).rows[0];const events=(await db.query('SELECT count(*)::int n FROM ride_events WHERE ride_request_id=$1',[nId])).rows[0].n;
    assert.equal((await action(j,pool,'arrive')).status,201);assert.equal((await r.call('/ride-requests/'+rId)).data.fare.chargePoysha,4000);
    const key=randomUUID();const cancelled=await action(j,pool,'cancel',key,{reason:'Driver emergency'});assert.equal(cancelled.status,201);
    const detail=(await r.call('/ride-requests/'+rId)).data;assert.equal(detail.status,'CANCELLED');assert.equal(detail.fare.chargePoysha,0);assert.equal(detail.fare.historicalFinal.totalPoysha,4000);assert.equal(detail.fare.collectionStatus,'NOT_TRACKED');
    assert.deepEqual((await db.query('SELECT * FROM ride_requests WHERE id=$1',[nId])).rows[0],earlier);assert.equal((await db.query('SELECT count(*)::int n FROM ride_events WHERE ride_request_id=$1',[nId])).rows[0].n,events);
    assert.deepEqual((await action(j,pool,'cancel',key,{reason:'Driver emergency'})).data,cancelled.data);assert.equal((await action(j,pool,'cancel',randomUUID(),{reason:'Again'})).status,409);
  }finally{await f.close();}
});

for(const first of ['join','arrive','cancel'])test(`cutoff serialization: ${first} acquires driver before competing command`,{timeout:12000},async()=>{
  const f=await setup();const {j,n,r,db}=f;
  try{
    const nId=await book(n),rId=await book(r);const pool=await accept(j,nId);
    if(first==='cancel')await accept(j,rId);
    const service=f.http.app.get(DatabaseService);const original=service.transaction.bind(service);
    let release;const gate=new Promise(resolve=>{release=resolve;});let entered;const acquired=new Promise(resolve=>{entered=resolve;});let once=true;
    service.transaction=(operation,readOnly)=>original(async client=>{const query=client.query.bind(client);client.query=async(...args)=>{const result=await query(...args);if(once&&String(args[0]).includes('driver_profiles')&&String(args[0]).includes('FOR UPDATE')){once=false;entered();await gate;}return result;};try{return await operation(client);}finally{client.query=query;}},readOnly);
    const one=first==='join'?j.call(`/driver/requests/${rId}/accept`,'POST',{},randomUUID()):first==='cancel'?n.call(`/ride-requests/${nId}/cancel`,'POST',{reason:'Cutoff'},randomUUID()):action(j,pool,'arrive');await acquired;
    const two=first==='arrive'?j.call(`/driver/requests/${rId}/accept`,'POST',{},randomUUID()):action(j,pool,'arrive');await waitForLock(db,'driver_profiles');release();const a=await one,b=await two;service.transaction=original;
    assert.equal(a.status,201);assert.equal(b.status,first==='arrive'?409:201);
    const detail=(await n.call('/ride-requests/'+nId)).data;
    if(first==='join'){assert.equal(detail.fare.totalPoysha,3000);assert.equal(detail.status,'DRIVER_ARRIVED');}
    if(first==='arrive'){assert.equal(detail.fare.totalPoysha,4000);assert.equal((await r.call('/ride-requests/'+rId)).data.status,'REQUESTED');assert.equal((await n.call(`/ride-requests/${nId}/cancel`,'POST',{reason:'Late'},randomUUID())).error.code,'CANCELLATION_CLOSED');}
    if(first==='cancel'){assert.equal(detail.status,'CANCELLED');assert.equal((await r.call('/ride-requests/'+rId)).data.fare.totalPoysha,4000);}
  }finally{await f.close();}
});

test('unassigned cancellation discovers committed acceptance after request-lock wait and retries driver-first without partial effects',{timeout:12000},async()=>{
  const f=await setup();const {j,n,db}=f;
  try{
    const id=await book(n);const service=f.http.app.get(DatabaseService);const original=service.transaction.bind(service);
    let release;const gate=new Promise(resolve=>{release=resolve;});let entered;const acquired=new Promise(resolve=>{entered=resolve;});let once=true;
    service.transaction=(operation,readOnly)=>original(async client=>{const query=client.query.bind(client);client.query=async(...args)=>{const result=await query(...args);if(once&&String(args[0]).includes('ride_requests')&&String(args[0]).includes('FOR UPDATE')){once=false;entered();await gate;}return result;};try{return await operation(client);}finally{client.query=query;}},readOnly);
    const acceptance=j.call(`/driver/requests/${id}/accept`,'POST',{},randomUUID());await acquired;
    const key=randomUUID();const cancellation=n.call(`/ride-requests/${id}/cancel`,'POST',{reason:'Race cancel'},key);await waitForLock(db,'ride_requests');release();
    assert.equal((await acceptance).status,201);assert.equal((await cancellation).status,201);service.transaction=original;
    assert.equal((await n.call('/ride-requests/'+id)).data.status,'CANCELLED');assert.equal((await db.query('SELECT count(*)::int n FROM pool_memberships WHERE ride_request_id=$1',[id])).rows[0].n,1);
    assert.equal((await db.query('SELECT count(*)::int n FROM idempotency_keys WHERE key=$1',[key])).rows[0].n,1);assert.equal((await j.call('/driver/pools/current')).data,null);
  }finally{await f.close();}
});
