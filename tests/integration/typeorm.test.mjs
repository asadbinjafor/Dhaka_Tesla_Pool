import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { databaseOptions } from '../../dhaka-tesla-pool-backend/dist/database/database.config.js';
import { DatabaseService } from '../../dhaka-tesla-pool-backend/dist/database/database.service.js';
import { User } from '../../dhaka-tesla-pool-backend/dist/auth/entities/user.entity.js';
import { Vehicle } from '../../dhaka-tesla-pool-backend/dist/auth/entities/vehicle.entity.js';
import { RideRequest } from '../../dhaka-tesla-pool-backend/dist/rides/entities/ride-request.entity.js';
import { RidePool } from '../../dhaka-tesla-pool-backend/dist/pools/entities/pool.entity.js';
import { PoolMembership } from '../../dhaka-tesla-pool-backend/dist/pools/entities/pool-membership.entity.js';
import { seed } from '../../dhaka-tesla-pool-backend/dist/database/seed.js';
import { httpApp, book } from './http-fixture.mjs';
import { isolatedDatabase } from './isolated-db.mjs';
const { DataSource } = createRequire(new URL('../../dhaka-tesla-pool-backend/package.json', import.meta.url))('typeorm');
const exec = promisify(execFile);

test('reference-style PostgreSQL fields validate safely; explicit URL and migration policy are authoritative', () => {
  const fields = { DATABASE_HOST: 'localhost', DATABASE_PORT: '15432', DATABASE_NAME: 'dtp_test_config', DATABASE_USER: 'fixture', DATABASE_PASSWORD: 'test-only-$@:/ password', DATABASE_SSL: 'true', DATABASE_SYNCHRONIZE: 'false' };
  const options = databaseOptions(undefined, key => fields[key]);
  assert.equal(options.host, 'localhost'); assert.equal(options.port, 15432);
  assert.equal(options.password, fields.DATABASE_PASSWORD); assert.equal(options.database, 'dtp_test_config');
  assert.deepEqual(options.ssl, { rejectUnauthorized: true });
  assert.equal(options.synchronize, false); assert.equal(options.dropSchema, false); assert.equal(options.migrationsRun, false);
  assert.equal(databaseOptions('postgresql://fixture:test@127.0.0.1:1/dtp_test_explicit', key => fields[key]).url, 'postgresql://fixture:test@127.0.0.1:1/dtp_test_explicit');
  for (const [key, value] of [['DATABASE_SYNCHRONIZE', 'true'], ['DATABASE_PORT', 'NaN'], ['DATABASE_PORT', '0'], ['DATABASE_SSL', 'invalid'], ['DATABASE_PASSWORD', '']]) {
    assert.throws(() => databaseOptions(undefined, name => name === key ? value : fields[name]));
  }
});

test('TypeORM maps every existing table/column without schema changes; repositories preserve relations and generated terminal facts', async () => {
  const fixture = await isolatedDatabase();
  await seed(fixture.url, 'Nonsecret-test-fixture-2026');
  const http = await httpApp(fixture.url);
  const db = http.app.get(DatabaseService);
  try {
    const driver = await http.login('jashim'), passenger = await http.login('nusrat');
    const source = await db.initialize();
    assert.equal(http.app.get(DataSource), source);
    const schema = (await db.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,column_name")).rows;
    const mapped = source.entityMetadatas.flatMap(entity => {
      assert.equal(entity.synchronize, false);
      return entity.columns.map(column => ({ table_name: entity.tableName, column_name: column.databaseName }));
    }).sort((a, b) => a.table_name.localeCompare(b.table_name) || a.column_name.localeCompare(b.column_name));
    assert.deepEqual(mapped, schema);
    const users = source.getRepository(User);
    const user = await users.findOneByOrFail({ id: passenger.user.id });
    assert.equal(user.displayName, 'Nusrat'); assert.equal(user.passwordHash, undefined);
    const vehicle = await source.getRepository(Vehicle).findOneOrFail({ where: { driverId: driver.user.id }, relations: { driver: { user: true } } });
    assert.equal(vehicle.driver.user.id, driver.user.id); assert.equal(vehicle.capacity, 3);
    await driver.call('/driver/availability', 'PATCH', { online: true }, randomUUID());
    const id = await book(passenger);
    const accepted = await driver.call(`/driver/requests/${id}/accept`, 'POST', {}, randomUUID());
    assert.equal(accepted.status, 201);
    for (const action of ['arrive', 'start', 'complete']) assert.equal((await driver.call(`/driver/pools/${accepted.data.resourceId}/${action}`, 'POST', {}, randomUUID())).status, 201);
    const ride = await source.getRepository(RideRequest).findOneOrFail({ where: { id }, relations: { quote: { owner: true }, passenger: true, pickup: true, destination: true } });
    assert.equal(ride.quote.owner.id, passenger.user.id); assert.equal(ride.passenger.id, passenger.user.id);
    assert.equal(ride.endedAt.getTime(), ride.completedAt.getTime()); assert.equal(ride.finalFareSnapshot.totalPoysha, 4000);
    const pool = await source.getRepository(RidePool).findOneOrFail({ where: { id: accepted.data.resourceId }, relations: { vehicle: true, driver: true } });
    assert.equal(pool.vehicle.driverId, pool.driverId); assert.equal(pool.status, 'COMPLETED');
    const membership = await source.getRepository(PoolMembership).findOneOrFail({ where: { rideRequestId: id }, relations: { pool: true, request: true } });
    assert.equal(membership.pool.id, pool.id); assert.equal(membership.request.id, id);
    await assert.rejects(db.orm(() => users.update(user.id, { role: 'DRIVER' })), /immutable/);
  } finally { await http.close(); await fixture.close(); }
});

test('transaction manager and SQL share a real connection, rollback together, and keep read-only snapshots', async () => {
  const fixture = await isolatedDatabase(), db = new DatabaseService(fixture.url);
  const email = `${randomUUID()}@fixture.invalid`;
  try {
    await assert.rejects(db.transaction(async client => {
      const sql = (await client.query('SELECT pg_backend_pid() pid')).rows[0];
      const orm = await client.manager.query('SELECT pg_backend_pid() pid');
      assert.equal(sql.pid, orm[0].pid);
      assert.equal((await client.manager.query('SHOW transaction_isolation'))[0].transaction_isolation, 'read committed');
      await client.manager.save(User, { email, displayName: 'ORM rollback', passwordHash: 'test-only', role: 'PASSENGER' });
      assert.equal((await client.query('SELECT email FROM users WHERE email=$1', [email])).rowCount, 1);
      throw new Error('rollback both access paths');
    }), /rollback both/);
    assert.equal((await db.query('SELECT email FROM users WHERE email=$1', [email])).rowCount, 0);
    await db.transaction(async client => {
      assert.equal((await client.manager.query('SHOW transaction_isolation'))[0].transaction_isolation, 'repeatable read');
      assert.equal((await client.manager.query('SHOW transaction_read_only'))[0].transaction_read_only, 'on');
      await assert.rejects(client.query("INSERT INTO zones VALUES('read-only-probe','Probe','Probe')"), error => error.code === '25006');
    }, true);
  } finally { await db.onModuleDestroy(); await fixture.close(); }
});

test('field-only configuration runs migration, repeat seed and real Nest login independently of working directory', async () => {
  const fixture = await isolatedDatabase();
  const parsed = new URL(fixture.url);
  const env = { ...process.env, DATABASE_URL: '', DATABASE_HOST: parsed.hostname, DATABASE_PORT: parsed.port, DATABASE_NAME: parsed.pathname.slice(1), DATABASE_USER: decodeURIComponent(parsed.username), DATABASE_PASSWORD: decodeURIComponent(parsed.password), DATABASE_SSL: 'false', DATABASE_SYNCHRONIZE: 'false', DEMO_PASSWORD: 'Nonsecret-test-fixture-2026', ENABLE_DEMO_SEED: '1' };
  const root = new URL('../../dhaka-tesla-pool-backend/dist/', import.meta.url);
  try {
    for (const script of ['database/migrate.js', 'database/seed.js', 'database/seed.js']) await exec(process.execPath, [fileURLToPath(new URL(script, root))], { cwd: tmpdir(), env, timeout: 30000 });
    const code = `import {loadEnvironment} from ${JSON.stringify(new URL('config/environment.js', root).href)}; import {createApplication} from ${JSON.stringify(new URL('bootstrap.js', root).href)}; loadEnvironment(); const app=await createApplication(); try {await app.listen(0,'127.0.0.1'); const base=await app.getUrl(); const boot=await fetch(base+'/api/v1/auth/csrf'); const csrf=(await boot.json()).data.csrfToken; const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{cookie:boot.headers.getSetCookie()[0].split(';')[0],origin:'http://127.0.0.1:3000','x-csrf-token':csrf,'content-type':'application/json'},body:JSON.stringify({email:'nusrat@demo.dhaka.test',password:'Nonsecret-test-fixture-2026'})}); if(response.status!==201)throw new Error('field login failed'); console.log('field_login_pass');} finally {await app.close();}`;
    const result = await exec(process.execPath, ['--input-type=module', '-e', code], { cwd: tmpdir(), env, timeout: 30000 });
    assert.equal(result.stdout.trim(), 'field_login_pass');
  } finally { await fixture.close(); }
});

test('TypeORM retry rolls back the entire attempt; unknown COMMIT discards its connection and retains one effect', async () => {
  const fixture = await isolatedDatabase(), db = new DatabaseService(fixture.url);
  const email = `${randomUUID()}@fixture.invalid`;
  try {
    let attempts = 0;
    await db.transaction(async client => {
      await client.manager.insert(User, { email, displayName: 'Retry fixture', passwordHash: 'test-only', role: 'PASSENGER' });
      if (++attempts === 1) { const error = new Error('test-only serialization abort'); error.code = '40001'; throw error; }
    });
    assert.equal(attempts, 2);
    assert.equal((await db.query('SELECT id FROM users WHERE email=$1', [email])).rowCount, 1);
    let oldPid;
    const lostEmail = `${randomUUID()}@fixture.invalid`;
    await assert.rejects(db.transaction(async client => {
      oldPid = (await client.query('SELECT pg_backend_pid() pid')).rows[0].pid;
      await client.manager.insert(User, { email: lostEmail, displayName: 'Lost ACK fixture', passwordHash: 'test-only', role: 'PASSENGER' });
      const query = client.query.bind(client);
      client.query = async (...args) => { const result = await query(...args); if (args[0] === 'COMMIT') throw new Error('test-only lost acknowledgement'); return result; };
    }), error => error.code === 'COMMAND_OUTCOME_UNKNOWN');
    assert.notEqual((await db.query('SELECT pg_backend_pid() pid')).rows[0].pid, oldPid);
    assert.equal((await db.query('SELECT id FROM users WHERE email=$1', [lostEmail])).rowCount, 1);
  } finally { await db.onModuleDestroy(); await fixture.close(); }
});
