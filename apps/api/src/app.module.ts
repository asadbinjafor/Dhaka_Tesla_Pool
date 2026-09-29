import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { DatabaseService } from './database/database.service.js';
import { HealthController } from './health/health.controller.js';

@Module({})
export class AppModule {
  static configure(databaseUrl?: string): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController],
      providers: [{ provide: DatabaseService, useFactory: () => new DatabaseService(databaseUrl) }],
    };
  }
}
