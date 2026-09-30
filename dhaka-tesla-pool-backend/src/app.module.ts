import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { DatabaseService } from './database/database.service.js';
import { HealthController } from './health/health.controller.js';
import { APP_GUARD } from '@nestjs/core';
import { AuthController, MeController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { AccessGuard } from './auth/access.guard.js';
import { VehicleController } from './auth/vehicle.controller.js';
import { RideService } from './rides/ride.service.js';
import { CatalogController, RideController } from './rides/ride.controller.js';
import {PoolService} from './pools/pool.service.js';
import {PoolController} from './pools/pool.controller.js';
import {HistoryService} from './history/history.service.js';
import {StatisticsService} from './history/statistics.service.js';
import {PassengerHistoryController,DriverHistoryController} from './history/history.controller.js';

@Module({})
export class AppModule {
  static configure(databaseUrl?: string): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController, AuthController, MeController, VehicleController, CatalogController, RideController, PoolController, PassengerHistoryController, DriverHistoryController],
      providers: [{ provide: DatabaseService, useFactory: () => new DatabaseService(databaseUrl) }, AuthService, RideService, PoolService, HistoryService, StatisticsService, {provide:APP_GUARD,useClass:AccessGuard}],
    };
  }
}
