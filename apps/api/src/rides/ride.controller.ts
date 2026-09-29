import { Body, Controller, Get, Headers, Inject, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { Equals, IsNumber, IsString, IsUUID, Length } from 'class-validator';
import { Roles } from '../auth/access.guard.js';
import type { AuthRequest } from '../auth/auth.service.js';
import { RideService } from './ride.service.js';
class QuoteDto {
  @IsString() @Length(1,40) pickupId!:string;
  @IsString() @Length(1,40) destinationId!:string;
  @IsNumber({allowInfinity:false,allowNaN:false}) seats!:number;
}
class CreateDto { @IsUUID() quoteId!:string; @Equals('CASH') paymentMethod!:'CASH'; }
export class CancelDto { @IsString() @Length(1,200) reason!:string; }
@Controller()
export class CatalogController {
  constructor(@Inject(RideService) readonly service:RideService) {}
  @Get('zones') zones(){return this.service.zones();}
}
@Roles('PASSENGER') @Controller()
export class RideController {
  constructor(@Inject(RideService) readonly service:RideService) {}
  @Post('fare-quotes') quote(@Req() req:AuthRequest,@Body() body:QuoteDto){return this.service.quote(req.authSession!.user!.id,body);}
  @Post('ride-requests') create(@Req() req:AuthRequest,@Headers('idempotency-key') key:string,@Body() body:CreateDto){return this.service.create(req.authSession!.user!.id,key,body);}
  @Get('ride-requests/current') current(@Req() req:AuthRequest){return this.service.current(req.authSession!.user!.id);}
  @Get('ride-requests/:id') detail(@Req() req:AuthRequest,@Param('id',new ParseUUIDPipe()) id:string){return this.service.detail(req.authSession!.user!.id,id);}
  @Post('ride-requests/:id/cancel') cancel(@Req() req:AuthRequest,@Param('id',new ParseUUIDPipe()) id:string,@Headers('idempotency-key') key:string,@Body() body:CancelDto){return this.service.cancelWaiting(req.authSession!.user!.id,id,key,body.reason.trim());}
}
