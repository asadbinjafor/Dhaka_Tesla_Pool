import { randomUUID } from 'node:crypto';
import {createRequire} from 'node:module';
const pg=createRequire(new URL('../../dhaka-tesla-pool-backend/package.json',import.meta.url))('pg');
import { migrate } from '../../dhaka-tesla-pool-backend/dist/database/migrate.js';

export async function isolatedDatabase() {
  const source=process.env.TEST_DATABASE_URL;
  if(!source) throw new Error('TEST_DATABASE_URL required');
  const parsed=new URL(source);
  if(!/^\/dtp_test[a-z0-9_]*$/.test(parsed.pathname) || !['127.0.0.1','localhost','[::1]'].includes(parsed.hostname)) throw new Error('Dedicated local dtp_test DB required');
  const name=`dtp_test_${randomUUID().replaceAll('-','')}`;
  // Administrative CREATE/DROP includes filesystem work; it is not a business command.
  // Keep a separate bounded DDL budget. Production statement/lock timeouts stay unchanged.
  const admin=new pg.Pool({connectionString:source,max:1,connectionTimeoutMillis:5000,statement_timeout:15000});
  try{await admin.query(`CREATE DATABASE ${name}`);}catch(error){await admin.end();throw error;}
  parsed.pathname=`/${name}`;
  const url=parsed.toString();
  try{await migrate(url);}catch(error){try{await admin.query(`DROP DATABASE ${name}`);}finally{await admin.end();}throw error;}
  return {url, async close(){
    // Only this generated test database, never the supplied base/application database.
    if(!/^dtp_test_[a-f0-9]{32}$/.test(name)) throw new Error('Unsafe test cleanup target');
    try{await admin.query(`DROP DATABASE ${name}`);}finally{await admin.end();}
  }};
}
