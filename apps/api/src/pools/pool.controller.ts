import {Body,Controller,Get,Headers,Inject,Param,ParseUUIDPipe,Patch,Post,Req} from '@nestjs/common';
import {IsBoolean} from 'class-validator';
import {Roles} from '../auth/access.guard.js';
import type {AuthRequest} from '../auth/auth.service.js';
import {PoolService} from './pool.service.js';
import {fail} from '../common/business-error.js';
export function emptyBody(body:unknown){if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length)fail('INVALID_INPUT',400);}
class AvailabilityDto {@IsBoolean() online!:boolean;}
@Roles('DRIVER') @Controller('driver')
export class PoolController {
  constructor(@Inject(PoolService) readonly service:PoolService){}
  @Patch('availability') availability(@Req() req:AuthRequest,@Headers('idempotency-key') key:string,@Body() body:AvailabilityDto){return this.service.availability(req.authSession!.user!.id,key,body.online);}
  @Get('requests') requests(@Req() req:AuthRequest){return this.service.requests(req.authSession!.user!.id);}
  @Post('requests/:id/accept') accept(@Req() req:AuthRequest,@Param('id',new ParseUUIDPipe()) id:string,@Headers('idempotency-key') key:string,@Body() body:unknown){emptyBody(body);return this.service.accept(req.authSession!.user!.id,id,key);}
  @Get('pools/current') current(@Req() req:AuthRequest){return this.service.current(req.authSession!.user!.id);}
  @Get('pools/:id') detail(@Req() req:AuthRequest,@Param('id',new ParseUUIDPipe()) id:string){return this.service.detail(req.authSession!.user!.id,id);}
}
