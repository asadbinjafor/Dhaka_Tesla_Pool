import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { migrate } from '../../dhaka-tesla-pool-backend/dist/database/migrate.js';
import { seed } from '../../dhaka-tesla-pool-backend/dist/database/seed.js';
import { DatabaseService } from '../../dhaka-tesla-pool-backend/dist/database/database.service.js';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { isolatedDatabase } from './isolated-db.mjs';

test('real PostgreSQL migrations, repeat non-destructive seeds, constraints and atomic rollback', async () => {
  const fixture=await isolatedDatabase();
  const url=fixture.url;
  await migrate(url); await migrate(url);
  const db = new DatabaseService(url);
  try {
    await seed(url, 'Nonsecret-test-fixture-2026');
    const before = await db.query('SELECT id,email,password_hash,created_at FROM users ORDER BY email');
    await seed(url, 'Different-test-fixture-2026');
    assert.deepEqual((await db.query('SELECT id,email,password_hash,created_at FROM users ORDER BY email')).rows, before.rows);
    assert.equal((await db.query('SELECT count(*)::int n FROM vehicles')).rows[0].n, 1);
    assert.equal(await db.isReady(), true);
    const passenger = (await db.query("SELECT id FROM users WHERE email='nusrat@demo.dhaka.test'")).rows[0].id;
    await assert.rejects(db.query('INSERT INTO driver_profiles(user_id) VALUES($1)',[passenger]), e => e.code === '23503');
    const foreign = randomUUID();
    await assert.rejects(db.query('INSERT INTO vehicles(driver_id,display_name,capacity) VALUES($1,$2,4)',[foreign,'invalid']), e => ['23503','23514'].includes(e.code));
    const row = randomUUID();
    await assert.rejects(db.transaction(async client => {
      await client.query('INSERT INTO users(id,email,display_name,password_hash,role) VALUES($1,$2,$3,$4,$5)',[row,`${row}@test.invalid`,'Rollback fixture','fixture','PASSENGER']);
      throw new Error('injected precommit failure');
    }), /injected/);
    assert.equal((await db.query('SELECT id FROM users WHERE id=$1',[row])).rowCount, 0);
    await assert.rejects(db.query("UPDATE users SET role='DRIVER' WHERE id=$1",[passenger]), /immutable/);
    const quote = await db.query(`INSERT INTO fare_quotes(owner_id,route_id,pickup_id,destination_id,group_id,group_version,seats,demo_distance_m,base_poysha,rate_poysha,discount_poysha,policy_version,expires_at)
      SELECT $1,id,pickup_id,destination_id,group_id,group_version,1,demo_distance_m,base_poysha,rate_poysha,discount_poysha,policy_version,clock_timestamp()+interval '5 minutes' FROM route_rules LIMIT 1 RETURNING *`,[passenger]);
    const other = (await db.query("SELECT id FROM users WHERE email='rafiq@demo.dhaka.test'")).rows[0].id;
    const q=quote.rows[0];
    await assert.rejects(db.query(`INSERT INTO ride_requests(passenger_id,quote_id,booking_snapshot,pickup_id,destination_id,group_id,group_version,seats,status) VALUES($1,$2,'{}',$3,$4,$5,1,1,'REQUESTED')`,[other,q.id,q.pickup_id,q.destination_id,q.group_id]),e=>e.code==='23503');
    await assert.rejects(db.query('UPDATE fare_quotes SET seats=2 WHERE id=$1',[q.id]), /immutable/);
    await assert.rejects(db.query("INSERT INTO ride_events(actor_id,event_type,to_state) VALUES($1,'invalid','REQUESTED')",[passenger]),e=>e.code==='23514');
    const path=await mkdtemp(join(tmpdir(),'dtp-migration-'));
    try {
      await writeFile(join(path,'999_failure_probe.sql'),'CREATE TABLE migration_rollback_probe(id integer); SELECT missing_probe_column FROM migration_rollback_probe;');
      await assert.rejects(migrate(url,path));
      assert.equal((await db.query("SELECT to_regclass('migration_rollback_probe') probe")).rows[0].probe,null);
      assert.equal((await db.query("SELECT name FROM schema_migrations WHERE name='999_failure_probe.sql'")).rowCount,0);
    } finally {
      assert.ok(resolve(path).startsWith(join(resolve(tmpdir()),'dtp-migration-')));
      await rm(path,{recursive:true});
    }
  } finally { await db.onModuleDestroy(); await fixture.close(); }
});
