import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { SafeErrorFilter } from './common/safe-error.filter.js';

export async function createApplication(databaseUrl?: string) {
  const app = await NestFactory.create(AppModule.configure(databaseUrl), { logger: ['error', 'warn'] });
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use((_request:Request,response:Response,next:NextFunction)=>{response.setHeader('Cache-Control','private, no-store');response.setHeader('Vary','Cookie');next();});
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: false }));
  app.useGlobalFilters(new SafeErrorFilter());
  app.enableShutdownHooks();
  return app;
}
