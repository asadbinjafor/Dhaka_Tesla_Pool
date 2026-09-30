import pg from 'pg';
import argon2 from 'argon2';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadEnvironment } from '../config/environment.js';

export const passwordOptions = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;
export async function seed(connectionString: string, password: string) {
  if (password.length < 12 || password.length > 128) throw new Error('Demo password must be 12-128 characters');
  const passwordHash = await argon2.hash(password, passwordOptions);
  const pool = new pg.Pool({ connectionString, max: 1 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(48102712)');
    for (const [name, role] of [['Jashim','DRIVER'],['Nusrat','PASSENGER'],['Rafiq','PASSENGER'],['Shirin','PASSENGER']]) {
      const inserted = await client.query('INSERT INTO users(email,display_name,password_hash,role) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id', [`${name?.toLowerCase()}@demo.dhaka.test`, name, passwordHash, role]);
      if (role === 'DRIVER' && inserted.rowCount) {
        const id = inserted.rows[0].id;
        await client.query('INSERT INTO driver_profiles(user_id) VALUES($1)', [id]);
        await client.query("INSERT INTO vehicles(driver_id,display_name,capacity) VALUES($1,'Bullet',3)", [id]);
      }
    }
    await client.query('COMMIT');
    console.log('demo_seed_complete_no_existing_records_overwritten');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  loadEnvironment();
  if (process.env.ENABLE_DEMO_SEED !== '1' || !process.env.DATABASE_URL || !process.env.DEMO_PASSWORD) throw new Error('Explicit ENABLE_DEMO_SEED=1, DATABASE_URL and DEMO_PASSWORD required');
  seed(process.env.DATABASE_URL, process.env.DEMO_PASSWORD).catch(() => { console.error('demo_seed_failed'); process.exitCode = 1; });
}
