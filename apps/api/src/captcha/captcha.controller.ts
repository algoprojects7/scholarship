import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CaptchaService } from './captcha.service';

@Controller('auth')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Get('captcha')
  async getCaptcha(@Req() req: Request) {
    const clientIp = this.resolveClientIp(req);
    return this.captchaService.generate(clientIp);
  }

  private resolveClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]!.trim();
    }

    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
  }
}
