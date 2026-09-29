import { Controller, Get, Inject, Req } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { Roles } from './access.guard.js';
import type { AuthRequest } from './auth.service.js';

@Controller('driver') @Roles('DRIVER')
export class VehicleController {
  constructor(@Inject(DatabaseService) private readonly db:DatabaseService) {}
  @Get('vehicle') async vehicle(@Req() request:AuthRequest) {
    const result=await this.db.query(`SELECT v.id,v.display_name "displayName",v.capacity,d.online FROM vehicles v JOIN driver_profiles d ON d.user_id=v.driver_id WHERE v.driver_id=$1`,[request.authSession!.user!.id]);
    return {data:result.rows[0]};
  }
}
