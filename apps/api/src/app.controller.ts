import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  root() {
    return {
      name: 'Scholarship API',
      status: 'ok',
      health: '/health',
      docs: '/api/docs',
      url: this.configService.get<string>('API_URL'),
    };
  }
}
