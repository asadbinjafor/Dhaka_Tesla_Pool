import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import pg from 'pg';
import { BusinessError } from '../common/business-error.js';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: pg.Pool | null;

  constructor(databaseUrl?: string) {
    this.pool = databaseUrl ? new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
      connectionTimeoutMillis: 1500,
      idleTimeoutMillis: 10000,
      statement_timeout: 3000,
    }) : null;
    // Never log credentials, SQL or full connection errors on idle-client failure.
    this.pool?.on('error', () => console.error('database_idle_connection_failure'));
  }

  async isReady(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const result = await this.pool.query("SELECT name FROM schema_migrations WHERE name='001_initial.sql'");
      return result.rowCount === 1;
    } catch {
      return false;
    }
  }

  async query<T extends pg.QueryResultRow = pg.QueryResultRow>(sql: string, values: unknown[] = []): Promise<pg.QueryResult<T>> {
    if (!this.pool) throw new Error('Database unavailable');
    return this.pool.query<T>(sql, values);
  }

  async transaction<T>(operation: (client: pg.PoolClient) => Promise<T>, readOnly = false): Promise<T> {
    if (!this.pool) throw new Error('Database unavailable');
    for (let attempt = 0; ; attempt++) {
      const client = await this.pool.connect();
      let committing = false;
      let discard = false;
      try {
        await client.query(readOnly ? 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' : 'BEGIN ISOLATION LEVEL READ COMMITTED');
        await client.query("SET LOCAL lock_timeout = '2s'");
        const result = await operation(client);
        committing = true;
        await client.query('COMMIT');
        return result;
      } catch (error) {
        const code = (error as {code?: string}).code;
        const knownAbort = code === '40001' || code === '40P01';
        const definiteAbort = !!code && /^(22|23|25|40)/.test(code);
        discard = committing && !definiteAbort;
        await client.query('ROLLBACK').catch(() => { discard = true; });
        if (knownAbort && attempt < 2) continue;
        if (discard && committing) throw new BusinessError('COMMAND_OUTCOME_UNKNOWN', 503);
        throw error;
      } finally { client.release(discard); }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }
}
