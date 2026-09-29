import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';const pg=createRequire(new URL('../../apps/api/package.json',import.meta.url))('pg');
import {isolatedDatabase} from './isolated-db.mjs';import {httpApp,book} from './http-fixture.mjs';
import {seed} from '../../apps/api/dist/database/seed.js';import {DatabaseService} from '../../apps/api/dist/database/database.service.js';
async function observedWait(db,fragment){const deadline=Date.now()+1500;while(Date.now()<deadline){if((await db.query("SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE $1",['%'+fragment+'%'])).rowCount)return;await new Promise(resolve=>setTimeout(resolve,10));}assert.fail('No actual PostgreSQL lock wait observed');}
for(const firstName of ['nusrat','shirin'])test(`two real Nest instances, SAME Jashim/Bullet: ${firstName} wins deterministic last-seat contention`,async()=>{
  const fixture=await isolatedDatabase();await seed(fixture.url,'Nonsecret-test-fixture-2026');
  const db=new pg.Pool({connectionString:fixture.url});const a=await httpApp(fixture.url),b=await httpApp(fixture.url);
  try{
    const j1=await a.login('jashim'),j2=await b.login('jashim'),r=await a.login('rafiq'),n=await a.login(firstName),s=await b.login(firstName==='nusrat'?'shirin':'nusrat');
    assert.equal(j1.user.id,j2.user.id);assert.notEqual(j1.headers.cookie,j2.headers.cookie);
    assert.equal((await j1.call('/driver/availability','PATCH',{online:true},randomUUID())).status,200);
    const rId=await book(r,2);const acceptR=await j1.call(`/driver/requests/${rId}/accept`,'POST',{},randomUUID());assert.equal(acceptR.status,201);
    const solo=(await r.call('/ride-requests/'+rId)).data;assert.equal(solo.pool.reservedSeats,2);assert.equal(solo.fare.totalPoysha,8000);assert.equal(solo.fare.discountPoysha,0);
    const first=await book(n),second=await book(s);
    let unlock;const gate=new Promise(resolve=>{unlock=resolve;});let entered;const acquired=new Promise(resolve=>{entered=resolve;});
    const service=a.app.get(DatabaseService);const original=service.transaction.bind(service);let once=true;
    service.transaction=(operation,readOnly)=>original(async client=>{
      const query=client.query.bind(client);
      client.query=async(...args)=>{const result=await query(...args);if(once&&typeof args[0]==='string'&&args[0].includes('driver_profiles')&&args[0].includes('FOR UPDATE')){once=false;entered();await gate;}return result;};
      try{return await operation(client);}finally{client.query=query;}
    },readOnly);
    const key=randomUUID();const winning=j1.call(`/driver/requests/${first}/accept`,'POST',{},key);await acquired;
    const losing=j2.call(`/driver/requests/${second}/accept`,'POST',{},randomUUID());await observedWait(db,'driver_profiles');unlock();
    const won=await winning,lost=await losing;service.transaction=original;
    assert.equal(won.status,201);assert.equal(lost.status,409);assert.equal(lost.error.code,'POOL_CAPACITY_EXCEEDED');
    assert.equal(won.data.resourceId,acceptR.data.resourceId);
    const actual=(await db.query("SELECT p.id,COALESCE(sum(r.seats),0)::int seats,count(r.id)::int members FROM pools p JOIN pool_memberships m ON m.pool_id=p.id JOIN ride_requests r ON r.id=m.ride_request_id WHERE p.ended_at IS NULL AND r.status='MATCHED' GROUP BY p.id")).rows;
    assert.equal(actual.length,1);assert.equal(actual[0].seats,3);assert.equal(actual[0].members,2);
    assert.equal((await s.call('/ride-requests/'+second)).data.status,'REQUESTED');
    const pooled=(await r.call('/ride-requests/'+rId)).data;assert.equal(pooled.fare.totalPoysha,6000);assert.equal(pooled.representationVersion.request,solo.representationVersion.request);assert.ok(pooled.representationVersion.pool>solo.representationVersion.pool);
    assert.ok(!JSON.stringify(pooled).includes(n.user.id));assert.ok(!JSON.stringify(pooled).includes(n.user.displayName));
    const eventCount=(await db.query('SELECT count(*)::int n FROM ride_events')).rows[0].n;
    assert.deepEqual((await j2.call(`/driver/requests/${first}/accept`,'POST',{},key)).data,won.data);
    assert.equal((await j1.call(`/driver/requests/${first}/accept`,'POST',{},randomUUID())).error.code,'REQUEST_UNAVAILABLE');
    assert.equal((await j1.call(`/driver/requests/${second}/accept`,'POST',{},key)).error.code,'IDEMPOTENCY_KEY_REUSED');
    assert.equal((await db.query('SELECT count(*)::int n FROM ride_events')).rows[0].n,eventCount);
    assert.equal((await j1.call('/driver/availability','PATCH',{online:false},randomUUID())).error.code,'ACTIVE_POOL_EXISTS');
    const cancelKey=randomUUID();const cancellation=await n.call(`/ride-requests/${first}/cancel`,'POST',{reason:'Own seat release'},cancelKey);assert.equal(cancellation.status,201);
    assert.equal((await r.call('/ride-requests/'+rId)).data.fare.totalPoysha,8000);
    assert.equal((await j1.call(`/driver/requests/${second}/accept`,'POST',{},randomUUID())).status,201);
    assert.deepEqual((await n.call(`/ride-requests/${first}/cancel`,'POST',{reason:'Own seat release'},cancelKey)).data,cancellation.data);
  }finally{await a.close();await b.close();await db.end();await fixture.close();}
});

test('two distinct drivers compete for one request with no orphan pool; foreign-driver ownership and dispatch privacy',async()=>{
  const fixture=await isolatedDatabase();await seed(fixture.url,'Nonsecret-test-fixture-2026');const db=new pg.Pool({connectionString:fixture.url});const a=await httpApp(fixture.url),b=await httpApp(fixture.url);
  try{
    const second=(await db.query("INSERT INTO users(email,display_name,password_hash,role) SELECT 'kamal@demo.dhaka.test','Kamal',password_hash,'DRIVER' FROM users WHERE email='jashim@demo.dhaka.test' RETURNING id")).rows[0];
    await db.query('INSERT INTO driver_profiles(user_id) VALUES($1)',[second.id]);await db.query("INSERT INTO vehicles(driver_id,display_name,capacity) VALUES($1,'Test rickshaw',3)",[second.id]);
    const j=await a.login('jashim'),k=await b.login('kamal'),n=await a.login('nusrat');
    const id=await book(n);assert.equal((await n.call('/ride-requests/'+id)).data.matchingHint.state,'NO_ELIGIBLE_DRIVER');
    await j.call('/driver/availability','PATCH',{online:true},randomUUID());await k.call('/driver/availability','PATCH',{online:true},randomUUID());
    assert.equal((await n.call('/ride-requests/'+id)).data.matchingHint.state,'WAITING_FOR_ACCEPTANCE');
    const lock=await db.connect();await lock.query('BEGIN');await lock.query('SELECT id FROM ride_requests WHERE id=$1 FOR UPDATE',[id]);
    const attempts=[j.call(`/driver/requests/${id}/accept`,'POST',{},randomUUID()),k.call(`/driver/requests/${id}/accept`,'POST',{},randomUUID())];
    const deadline=Date.now()+1500;let two=false;
    while(Date.now()<deadline){if((await db.query("SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%ride_requests%FOR UPDATE%'")).rows[0].n===2){two=true;break;}await new Promise(resolve=>setTimeout(resolve,10));}
    assert.ok(two);await lock.query('COMMIT');lock.release();const result=await Promise.all(attempts);assert.deepEqual(result.map(r=>r.status).sort(),[201,409]);
    assert.equal((await db.query('SELECT count(*)::int n FROM pools')).rows[0].n,1);assert.equal((await db.query('SELECT count(*)::int n FROM pool_memberships')).rows[0].n,1);
    const index=result[0].status===201?0:1;const pool=result[index].data.resourceId;const loser=index===0?k:j;
    assert.equal((await loser.call('/driver/pools/'+pool)).status,404);assert.equal((await loser.call('/driver/requests')).data.requests.length,0);
    assert.equal((await loser.call(`/driver/requests/${id}/accept`,'POST',{},randomUUID())).error.code,'REQUEST_UNAVAILABLE');
  }finally{await a.close();await b.close();await db.end();await fixture.close();}
});

test('accept rollback injection and ambiguous COMMIT acknowledgement recover one effect; no-pool concurrent acceptance and last-member cancellation',async()=>{
  const fixture=await isolatedDatabase();await seed(fixture.url,'Nonsecret-test-fixture-2026');const db=new pg.Pool({connectionString:fixture.url});const a=await httpApp(fixture.url);
  try{
    const j=await a.login('jashim'),n=await a.login('nusrat'),r=await a.login('rafiq');
    await j.call('/driver/availability','PATCH',{online:true},randomUUID());const id=await book(n),other=await book(r);
    const service=a.app.get(DatabaseService);const original=service.transaction.bind(service);let injected=false;
    service.transaction=(operation,readOnly)=>original(async client=>{const query=client.query.bind(client);client.query=async(...args)=>{const result=await query(...args);if(!injected&&String(args[0]).startsWith('INSERT INTO pool_memberships')){injected=true;throw new Error('test-only rollback injection');}return result;};try{return await operation(client);}finally{client.query=query;}},readOnly);
    const key=randomUUID();assert.equal((await j.call(`/driver/requests/${id}/accept`,'POST',{},key)).status,500);service.transaction=original;
    for(const table of ['pools','pool_memberships'])assert.equal((await db.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n,0);
    assert.equal((await db.query('SELECT status FROM ride_requests WHERE id=$1',[id])).rows[0].status,'REQUESTED');
    assert.equal((await db.query('SELECT count(*)::int n FROM idempotency_keys WHERE key=$1',[key])).rows[0].n,0);
    // Real COMMIT runs, then only its acknowledgement is lost inside the test adapter.
    let commitLost=false;
    service.transaction=(operation,readOnly)=>original(async client=>{const query=client.query.bind(client);client.query=async(...args)=>{const result=await query(...args);if(!commitLost&&args[0]==='COMMIT'){commitLost=true;client.query=query;throw new Error('test-only commit acknowledgement loss');}return result;};return operation(client);},readOnly);
    assert.equal((await j.call(`/driver/requests/${id}/accept`,'POST',{},key)).error.code,'COMMAND_OUTCOME_UNKNOWN');service.transaction=original;
    const replay=await j.call(`/driver/requests/${id}/accept`,'POST',{},key);assert.equal(replay.status,201);
    assert.equal((await db.query('SELECT count(*)::int n FROM pool_memberships WHERE ride_request_id=$1',[id])).rows[0].n,1);
    assert.equal((await j.call(`/driver/requests/${other}/accept`,'POST',{},randomUUID())).status,201);
    await n.call(`/ride-requests/${id}/cancel`,'POST',{reason:'Leave'},randomUUID());await r.call(`/ride-requests/${other}/cancel`,'POST',{reason:'Leave'},randomUUID());
    assert.equal((await j.call('/driver/pools/current')).data,null);
    const historical=(await j.call('/driver/pools/'+replay.data.resourceId)).data;assert.equal(historical.status,'CANCELLED');assert.equal(historical.members.length,2);
    assert.deepEqual((await j.call(`/driver/requests/${id}/accept`,'POST',{},key)).data,replay.data);
    const next=await book(n),nextOther=await book(r);
    const lock=await db.connect();await lock.query('BEGIN');await lock.query('SELECT user_id FROM driver_profiles WHERE user_id=$1 FOR UPDATE',[j.user.id]);
    const both=[j.call(`/driver/requests/${next}/accept`,'POST',{},randomUUID()),j.call(`/driver/requests/${nextOther}/accept`,'POST',{},randomUUID())];
    let twoWaiters=false;const deadline=Date.now()+1500;
    while(Date.now()<deadline){const count=(await db.query("SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%driver_profiles%FOR UPDATE%'")).rows[0].n;if(count===2){twoWaiters=true;break;}await new Promise(resolve=>setTimeout(resolve,10));}
    assert.ok(twoWaiters);await lock.query('COMMIT');lock.release();
    const joined=await Promise.all(both);assert.equal(joined[0].status,201);assert.equal(joined[1].status,201);assert.equal(joined[0].data.resourceId,joined[1].data.resourceId);
    assert.equal((await db.query('SELECT count(*)::int n FROM pools WHERE ended_at IS NULL')).rows[0].n,1);
  }finally{await a.close();await db.end();await fixture.close();}
});
