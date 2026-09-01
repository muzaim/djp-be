import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Check application health status' })
  check() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'System is healthy and running',
    };
  }
}
