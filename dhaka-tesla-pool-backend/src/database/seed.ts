import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { configuredDatabase, databaseOptions } from './database.config.js';
import { User } from '../auth/entities/user.entity.js';
import { DriverProfile } from '../auth/entities/driver-profile.entity.js';
import { Vehicle } from '../auth/entities/vehicle.entity.js';
import argon2 from 'argon2';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadEnvironment } from '../config/environment.js';

export const passwordOptions = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;
export async function seed(connectionString: string | undefined, password: string) {
  if (password.length < 12 || password.length > 128) throw new Error('Demo password must be 12-128 characters');
  const passwordHash = await argon2.hash(password, passwordOptions);
  const source = new DataSource(databaseOptions(connectionString));
  await source.initialize();
  const client = source.createQueryRunner();
  try {
    await client.startTransaction();
    await client.query('SELECT pg_advisory_xact_lock(48102712)');
    for (const [name, role] of [['Jashim','DRIVER'],['Nusrat','PASSENGER'],['Rafiq','PASSENGER'],['Shirin','PASSENGER']] as const) {
      const inserted = await client.manager.createQueryBuilder().insert().into(User)
        .values({email:`${name.toLowerCase()}@demo.dhaka.test`,displayName:name,passwordHash,role})
        .orIgnore().returning('id').execute();
      if (role === 'DRIVER' && inserted.raw.length) {
        const id = inserted.raw[0].id;
        await client.manager.insert(DriverProfile, {userId:id});
        await client.manager.insert(Vehicle, {driverId:id,displayName:'Bullet',capacity:3});
      }
    }
    await client.commitTransaction();
    console.log('demo_seed_complete_no_existing_records_overwritten');
  } catch (error) { await client.rollbackTransaction(); throw error; }
  finally { await client.release(); await source.destroy(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  loadEnvironment();
  if (process.env.ENABLE_DEMO_SEED !== '1' || !configuredDatabase() || !process.env.DEMO_PASSWORD) throw new Error('Explicit ENABLE_DEMO_SEED=1, database settings and DEMO_PASSWORD required');
  seed(process.env.DATABASE_URL, process.env.DEMO_PASSWORD).catch(() => { console.error('demo_seed_failed'); process.exitCode = 1; });
}
