import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { configuredDatabase, databaseOptions } from './database.config.js';
import { databaseError } from './database.service.js';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { loadEnvironment } from '../config/environment.js';

export async function migrate(connectionString?: string, directory = resolve(import.meta.dirname, '../../migrations')) {
  const source = new DataSource({ ...databaseOptions(connectionString), extra: { max: 1, connectionTimeoutMillis: 5000, statement_timeout: 15000 } });
  await source.initialize();
  const client = source.createQueryRunner();
  await client.connect();
  try {
    await client.query('SELECT pg_advisory_lock(48102711)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT clock_timestamp())');
    for (const name of (await readdir(directory)).filter(name => /^\d+_[a-z_]+\.sql$/.test(name)).sort()) {
      const sql = await readFile(resolve(directory, name), 'utf8');
      const checksum = createHash('sha256').update(sql.replace(/\r\n/g, '\n')).digest('hex');
      const prior: {sha256:string}[] = await client.query('SELECT sha256 FROM schema_migrations WHERE name=$1', [name]);
      if (prior.length) {
        if (prior[0]!.sha256 !== checksum) throw new Error('Applied migration checksum changed');
        continue;
      }
      await client.startTransaction();
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(name,sha256) VALUES($1,$2)', [name, checksum]);
        await client.commitTransaction();
        console.log(`migration_applied ${name}`);
      } catch (error) { await client.rollbackTransaction(); throw databaseError(error); }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(48102711)').catch(() => undefined);
    await client.release();
    await source.destroy();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  loadEnvironment();
  if (!configuredDatabase()) throw new Error('Database configuration required');
  migrate(process.env.DATABASE_URL).catch(() => { console.error('migration_failed'); process.exitCode = 1; });
}
