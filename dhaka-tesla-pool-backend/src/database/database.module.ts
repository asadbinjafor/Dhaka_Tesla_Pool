import { Global, Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service.js';
import { configuredDatabase, databaseOptions, nestDatabaseOptions } from './database.config.js';
import { databaseEntities } from './entities/index.js';

@Global()
@Module({})
export class DatabaseModule {
  static configure(explicitUrl?: string | null): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule], inject: [ConfigService],
          useFactory: (config: ConfigService) => explicitUrl === null
            ? { ...databaseOptions(undefined, () => undefined), autoLoadEntities: true, manualInitialization: true, retryAttempts: 1 }
            : nestDatabaseOptions(config, explicitUrl),
        }), TypeOrmModule.forFeature(databaseEntities)],
      providers: [{ provide: DatabaseService, inject: [DataSource, ConfigService],
        useFactory: (source: DataSource, config: ConfigService) => new DatabaseService(source,
          explicitUrl !== null && configuredDatabase(explicitUrl, key => config.get<string>(key))) }],
      exports: [DatabaseService, TypeOrmModule],
    };
  }
}
