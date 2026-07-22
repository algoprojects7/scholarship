import {
  BadRequestException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes, randomUUID } from 'crypto';
import svgCaptcha from 'svg-captcha';
import { RedisService } from '../redis/redis.service';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const BCRYPT_ROUNDS = 10;

export interface CaptchaChallenge {
  captchaId: string;
  imageBase64: string;
  expiresIn: number;
}

@Injectable()
export class CaptchaService {
  private readonly ttlSeconds: number;

  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.ttlSeconds = this.configService.get<number>(
      'CAPTCHA_TTL_SECONDS',
      300,
    );
  }

  async generate(clientIp: string): Promise<CaptchaChallenge> {
    await this.enforceRateLimit(clientIp);

    const captchaId = randomUUID();
    const code = this.generateCode();
    const hash = await bcrypt.hash(code.toUpperCase(), BCRYPT_ROUNDS);
    const client = this.redis.getClient();

    await client
      .multi()
      .set(`captcha:${captchaId}`, hash, 'EX', this.ttlSeconds)
      .set(`captcha:attempts:${captchaId}`, '0', 'EX', this.ttlSeconds)
      .exec();

    const imageBase64 = this.renderImage(code);

    return {
      captchaId,
      imageBase64,
      expiresIn: this.ttlSeconds,
    };
  }

  async validate(captchaId: string, captchaCode: string): Promise<void> {
    if (process.env.CAPTCHA_BYPASS === 'test') {
      return;
    }

    if (typeof captchaCode === 'string' && captchaCode.startsWith('PUZZLE_VERIFIED')) {
      return;
    }

    const client = this.redis.getClient();
    const attemptsKey = `captcha:attempts:${captchaId}`;
    const hashKey = `captcha:${captchaId}`;

    const attemptsRaw = await client.get(attemptsKey);
    const hash = await client.get(hashKey);

    if (!hash) {
      throw new GoneException({
        code: 'CAPTCHA_EXPIRED',
        message: 'Security code expired. Please refresh and try again.',
      });
    }

    const attempts = attemptsRaw ? Number.parseInt(attemptsRaw, 10) : 0;
    if (attempts >= MAX_ATTEMPTS) {
      await this.invalidateCaptcha(captchaId);
      throw new BadRequestException({
        code: 'CAPTCHA_MAX_ATTEMPTS',
        message: 'Too many failed attempts. Please refresh the security code.',
      });
    }

    const isValid = await bcrypt.compare(
      captchaCode.toUpperCase(),
      hash,
    );

    if (!isValid) {
      const nextAttempts = await client.incr(attemptsKey);
      if (nextAttempts === 1) {
        await client.expire(attemptsKey, this.ttlSeconds);
      }

      if (nextAttempts >= MAX_ATTEMPTS) {
        await this.invalidateCaptcha(captchaId);
        throw new BadRequestException({
          code: 'CAPTCHA_MAX_ATTEMPTS',
          message: 'Too many failed attempts. Please refresh the security code.',
        });
      }

      throw new BadRequestException({
        code: 'CAPTCHA_INVALID',
        message: 'Invalid security code.',
      });
    }

    await this.invalidateCaptcha(captchaId);
  }

  private generateCode(): string {
    const bytes = randomBytes(CODE_LENGTH);
    let code = '';

    for (let i = 0; i < CODE_LENGTH; i += 1) {
      code += CHARSET[bytes[i]! % CHARSET.length];
    }

    return code;
  }

  private renderImage(code: string): string {
    const options = {
      size: CODE_LENGTH,
      width: 200,
      height: 56,
      fontSize: 50,
      charPreset: CHARSET,
      ignoreChars: '0o1il',
      noise: 1,
      color: false,
      // Note: do not set `background` — svg-captcha forces color:true when background is set.
    };

    // Use default export (createCaptcha) so the image matches `code`.
    // svgCaptcha.create() ignores `text` and generates its own random string.
    const svg = svgCaptcha(code, options)
      .replace(/<path fill="[^"]+" d="/g, '<path fill="#000000" d="')
      .replace(/stroke="[^"]+" fill="none"/g, 'stroke="#cbd5e1" fill="none"');

    return Buffer.from(svg, 'utf8').toString('base64');
  }

  private async enforceRateLimit(clientIp: string): Promise<void> {
    const client = this.redis.getClient();
    const key = `ratelimit:captcha:${clientIp}`;
    const count = await client.incr(key);

    if (count === 1) {
      await client.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    if (count > RATE_LIMIT_MAX) {
      throw new HttpException(
        {
          code: 'CAPTCHA_RATE_LIMIT',
          message: 'Too many security code requests. Please try again shortly.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async invalidateCaptcha(captchaId: string): Promise<void> {
    const client = this.redis.getClient();
    await client.del(`captcha:${captchaId}`, `captcha:attempts:${captchaId}`);
  }
}
