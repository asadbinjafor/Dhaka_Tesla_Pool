import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../apps/api/dist/database/database.service.js';
import { migrate } from '../../apps/api/dist/database/migrate.js';

export async function isolatedDatabase() {
  const source=process.env.TEST_DATABASE_URL;
  if(!source) throw new Error('TEST_DATABASE_URL required');
  const parsed=new URL(source);
  if(!parsed.pathname.includes('dtp_test') || !['127.0.0.1','localhost','::1'].includes(parsed.hostname)) throw new Error('Dedicated local dtp_test DB required');
  const name=`dtp_test_${randomUUID().replaceAll('-','')}`;
  const admin=new DatabaseService(source);
  await admin.query(`CREATE DATABASE ${name}`);
  parsed.pathname=`/${name}`;
  const url=parsed.toString();
  await migrate(url);
  return {url, async close(){
    // Only this generated test database, never the supplied base/application database.
    if(!/^dtp_test_[a-f0-9]{32}$/.test(name)) throw new Error('Unsafe test cleanup target');
    await admin.query(`DROP DATABASE ${name}`);
    await admin.onModuleDestroy();
  }};
}
