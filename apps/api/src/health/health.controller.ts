import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

type HealthStatus = 'ok' | 'error';

type ReadinessResponse = {
  status: 'ok' | 'degraded';
  db: HealthStatus;
  redis: HealthStatus;
};

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('live')
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(): Promise<ReadinessResponse> {
    const result = await this.checkDependencies();
    if (result.status === 'degraded') {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }

  @Get()
  async check(): Promise<ReadinessResponse> {
    return this.checkDependencies();
  }

  private async checkDependencies(): Promise<ReadinessResponse> {
    let db: HealthStatus = 'ok';
    let redis: HealthStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = 'error';
    }

    try {
      const pong = await this.redis.ping();
      if (pong !== 'PONG') {
        redis = 'error';
      }
    } catch {
      redis = 'error';
    }

    return {
      status: db === 'ok' && redis === 'ok' ? 'ok' : 'degraded',
      db,
      redis,
    };
  }
}
