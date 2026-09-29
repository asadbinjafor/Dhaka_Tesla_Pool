import { Controller, Get, Header, Inject, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Controller('health')
export class HealthController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  @Get('live')
  @Header('Cache-Control', 'no-store')
  live() {
    return { data: { status: 'ok', service: 'api' } };
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async ready() {
    if (!await this.database.isReady()) throw new ServiceUnavailableException();
    return { data: { status: 'ready', service: 'api' } };
  }
}
