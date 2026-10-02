import type { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import { databaseEntities } from './entities/index.js';

type ReadSetting = (key: string) => string | undefined;
type PostgresConnectionOptions = Extract<DataSourceOptions, { type: 'postgres' }>;
const readEnvironment: ReadSetting = key => process.env[key];

export function configuredDatabase(explicitUrl?: string, read: ReadSetting = readEnvironment): boolean {
  return !!(explicitUrl ?? read('DATABASE_URL')) || ['DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD'].some(key => read(key) !== undefined);
}

export function databaseOptions(explicitUrl?: string, read: ReadSetting = readEnvironment): PostgresConnectionOptions {
  if (read('DATABASE_SYNCHRONIZE') && read('DATABASE_SYNCHRONIZE') !== 'false') {
    throw new Error('DATABASE_SYNCHRONIZE must be false; use npm run db:migrate');
  }
  const url = explicitUrl ?? read('DATABASE_URL');
  const ssl = read('DATABASE_SSL');
  if (ssl !== undefined && !['true', 'false'].includes(ssl)) throw new Error('Invalid DATABASE_SSL');
  const connection: Partial<PostgresConnectionOptions> = {};
  if (url) {
    if (!/^postgres(?:ql)?:\/\//.test(url)) throw new Error('Invalid DATABASE_URL');
    Object.assign(connection, { url });
  } else if (configuredDatabase(undefined, read)) {
    const host = read('DATABASE_HOST'), database = read('DATABASE_NAME'), username = read('DATABASE_USER'), password = read('DATABASE_PASSWORD');
    if (!host || !database || !username || !password) throw new Error('DATABASE_HOST, DATABASE_NAME, DATABASE_USER and DATABASE_PASSWORD required');
    const port = Number(read('DATABASE_PORT') ?? '5432');
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid DATABASE_PORT');
    Object.assign(connection, { host, port, database, username, password });
  } else {
    Object.assign(connection, { host: '127.0.0.1', port: 1, database: 'unconfigured' });
  }
  return {
    type: 'postgres', ...connection,
    ...(ssl === undefined ? {} : { ssl: ssl === 'true' ? { rejectUnauthorized: true } : false }),
    entities: databaseEntities, synchronize: false, dropSchema: false,
    migrationsRun: false, logging: false,
    poolErrorHandler: () => console.error('database_idle_connection_failure'),
    extra: { max: 5, connectionTimeoutMillis: 1500, idleTimeoutMillis: 10000, statement_timeout: 3000 },
  };
}

export function nestDatabaseOptions(config: ConfigService, explicitUrl?: string) {
  return { ...databaseOptions(explicitUrl, key => config.get<string>(key)),
    autoLoadEntities: true, manualInitialization: true, retryAttempts: 1 };
}
