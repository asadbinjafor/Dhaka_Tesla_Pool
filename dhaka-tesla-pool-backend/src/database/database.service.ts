import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import type { EntityManager, QueryRunner, QueryResult } from 'typeorm';
import type { QueryResultRow } from 'pg';
import { BusinessError } from '../common/business-error.js';
import { databaseOptions } from './database.config.js';

export interface DatabaseResult<T> { rows: T[]; rowCount: number }
export interface DatabaseClient {
  manager: EntityManager;
  query<T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[]): Promise<DatabaseResult<T>>;
}

export function databaseError(error: unknown): unknown {
  return error instanceof QueryFailedError ? error.driverError : error;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly dataSource: DataSource | null;
  private initializing: Promise<DataSource> | null = null;

  constructor(source?: string | DataSource, configured = true) {
    this.dataSource = !source || !configured ? null : typeof source === 'string' ? new DataSource(databaseOptions(source)) : source;
  }

  async initialize(): Promise<DataSource> {
    if (!this.dataSource) throw new Error('Database unavailable');
    if (this.dataSource.isInitialized) return this.dataSource;
    if (!this.initializing) this.initializing = this.dataSource.initialize().catch(error => {
      this.initializing = null;
      throw databaseError(error);
    });
    return this.initializing;
  }

  async orm<T>(operation: () => Promise<T>): Promise<T> {
    await this.initialize();
    try { return await operation(); } catch (error) { throw databaseError(error); }
  }

  async isReady(): Promise<boolean> {
    try { return (await this.query("SELECT name FROM schema_migrations WHERE name='001_initial.sql'")).rowCount === 1; }
    catch { return false; }
  }

  private client(runner: QueryRunner): DatabaseClient {
    return {
      manager: runner.manager,
      async query<T extends QueryResultRow>(sql: string, values: unknown[] = []): Promise<DatabaseResult<T>> {
        try {
          if (sql === 'COMMIT') { await runner.commitTransaction(); return { rows: [], rowCount: 0 }; }
          if (sql === 'ROLLBACK') {
            if (runner.isTransactionActive) await runner.rollbackTransaction();
            return { rows: [], rowCount: 0 };
          }
          const result: QueryResult<T> = await runner.query(sql, values, true);
          return { rows: result.records, rowCount: result.affected ?? result.records.length };
        } catch (error) { throw databaseError(error); }
      },
    };
  }

  private async release(runner: QueryRunner, discard: boolean) {
    if (discard && !runner.isReleased) {
      // connect() returns the checked-out pg client; ending it prevents reuse of
      // an ambiguous socket without relying on TypeORM's private release method.
      const connection = await runner.connect();
      await connection.end().catch(() => undefined);
    }
    await runner.release();
  }

  async query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<DatabaseResult<T>> {
    const source = await this.initialize();
    const runner = source.createQueryRunner();
    try { return await this.client(runner).query<T>(sql, values); }
    finally { await runner.release(); }
  }

  async transaction<T>(operation: (client: DatabaseClient) => Promise<T>, readOnly = false): Promise<T> {
    const source = await this.initialize();
    for (let attempt = 0; ; attempt++) {
      const runner = source.createQueryRunner();
      const client = this.client(runner);
      let committing = false, discard = false;
      try {
        await runner.startTransaction(readOnly ? 'REPEATABLE READ' : 'READ COMMITTED');
        if (readOnly) await client.query('SET TRANSACTION READ ONLY');
        await client.query("SET LOCAL lock_timeout = '2s'");
        const result = await operation(client);
        committing = true;
        await client.query('COMMIT');
        return result;
      } catch (cause) {
        const error = databaseError(cause);
        const code = (error as { code?: string }).code;
        const knownAbort = code === '40001' || code === '40P01';
        const definiteAbort = !!code && /^(22|23|25|40)/.test(code);
        discard = committing && !definiteAbort;
        await client.query('ROLLBACK').catch(() => { discard = true; });
        if (knownAbort && attempt < 2) continue;
        if (discard && committing) throw new BusinessError('COMMAND_OUTCOME_UNKNOWN', 503);
        throw error;
      } finally { await this.release(runner, discard); }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.initializing?.catch(() => undefined);
    if (this.dataSource?.isInitialized) await this.dataSource.destroy();
  }
}
