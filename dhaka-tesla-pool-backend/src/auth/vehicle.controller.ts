import { Controller, Get, Inject, Req } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { Roles } from './access.guard.js';
import type { AuthRequest } from './auth.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity.js';

@Controller('driver') @Roles('DRIVER')
export class VehicleController {
  constructor(@Inject(DatabaseService) private readonly db:DatabaseService,
    @InjectRepository(Vehicle) private readonly vehicles:Repository<Vehicle>) {}
  @Get('vehicle') async vehicle(@Req() request:AuthRequest) {
    const vehicle=await this.db.orm(()=>this.vehicles.findOne({where:{driverId:request.authSession!.user!.id},relations:{driver:true}}));
    return {data:vehicle?{id:vehicle.id,displayName:vehicle.displayName,capacity:vehicle.capacity,online:vehicle.driver.online}:undefined};
  }
}
