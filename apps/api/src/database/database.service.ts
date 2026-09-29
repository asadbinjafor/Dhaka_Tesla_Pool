import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import pg from 'pg';

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
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }
}
