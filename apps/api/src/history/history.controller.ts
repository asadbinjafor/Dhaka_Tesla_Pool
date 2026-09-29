import {Controller,Get,Inject,Query,Req} from '@nestjs/common';import {IsOptional,IsString,MaxLength} from 'class-validator';import {Roles} from '../auth/access.guard.js';import type {AuthRequest} from '../auth/auth.service.js';import {HistoryService} from './history.service.js';import {StatisticsService} from './statistics.service.js';
class HistoryDto {@IsOptional() @IsString() @MaxLength(20) status?:string;@IsOptional() @IsString() @MaxLength(100) search?:string;@IsOptional() @IsString() @MaxLength(2) limit?:string;@IsOptional() @IsString() @MaxLength(2048) cursor?:string;}
class StatsDto {@IsOptional() @IsString() @MaxLength(10) from?:string;@IsOptional() @IsString() @MaxLength(10) to?:string;}
@Roles('PASSENGER') @Controller()
export class PassengerHistoryController {
  constructor(@Inject(HistoryService) readonly history:HistoryService,@Inject(StatisticsService) readonly stats:StatisticsService){}
  @Get('ride-history') records(@Req() req:AuthRequest,@Query() q:HistoryDto){return this.history.history(req.authSession!.user!.id,false,q);}
  @Get('statistics/passenger') statistics(@Req() req:AuthRequest,@Query() q:StatsDto){return this.stats.statistics(req.authSession!.user!.id,false,q);}
}
@Roles('DRIVER') @Controller()
export class DriverHistoryController {
  constructor(@Inject(HistoryService) readonly history:HistoryService,@Inject(StatisticsService) readonly stats:StatisticsService){}
  @Get('driver/trip-history') records(@Req() req:AuthRequest,@Query() q:HistoryDto){return this.history.history(req.authSession!.user!.id,true,q);}
  @Get('statistics/driver') statistics(@Req() req:AuthRequest,@Query() q:StatsDto){return this.stats.statistics(req.authSession!.user!.id,true,q);}
}
