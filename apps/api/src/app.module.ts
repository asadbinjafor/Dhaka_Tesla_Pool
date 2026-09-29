import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { DatabaseService } from './database/database.service.js';
import { HealthController } from './health/health.controller.js';
import { APP_GUARD } from '@nestjs/core';
import { AuthController, MeController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { AccessGuard } from './auth/access.guard.js';
import { VehicleController } from './auth/vehicle.controller.js';

@Module({})
export class AppModule {
  static configure(databaseUrl?: string): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController, AuthController, MeController, VehicleController],
      providers: [{ provide: DatabaseService, useFactory: () => new DatabaseService(databaseUrl) }, AuthService, {provide:APP_GUARD,useClass:AccessGuard}],
    };
  }
}
