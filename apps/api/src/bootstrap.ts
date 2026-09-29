import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { SafeErrorFilter } from './common/safe-error.filter.js';

export async function createApplication(databaseUrl?: string) {
  const app = await NestFactory.create(AppModule.configure(databaseUrl), { logger: ['error', 'warn'] });
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: false }));
  app.useGlobalFilters(new SafeErrorFilter());
  app.enableShutdownHooks();
  return app;
}
