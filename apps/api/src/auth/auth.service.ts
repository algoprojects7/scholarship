import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminType, UserRole } from '@scholarship/shared';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { CaptchaService } from '../captcha/captcha.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  BCRYPT_ROUNDS,
  Portal,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthUser } from './interfaces/auth-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenId: string;
}

interface RefreshTokenMetadata {
  portal: Portal;
  createdAt: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessExpiry: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
    private readonly configService: ConfigService,
  ) {
    this.accessExpiry = this.configService.get<string>(
      'JWT_ACCESS_EXPIRY',
      '15m',
    );
    this.refreshSecret = this.configService.getOrThrow<string>(
      'JWT_REFRESH_SECRET',
    );
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingMobile = await this.prisma.studentProfile.findUnique({
      where: { mobile: dto.mobile },
    });

    if (existingMobile) {
      throw new ConflictException('Mobile number is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.STUDENT,
        studentProfile: {
          create: {
            fullName: dto.fullName.trim(),
            gender: dto.gender,
            countryCode: dto.countryCode,
            mobile: dto.mobile,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    return {
      message: 'Registration successful. Please sign in.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.studentProfile?.fullName,
      },
    };
  }

  async login(dto: LoginDto, portalHeader: string | undefined) {
    const portal = this.parsePortal(portalHeader);

    await this.captchaService.validate(dto.captchaId, dto.captchaCode);

    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        studentProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.assertPortalAccess(user.role as UserRole, portal);

    if (
      user.role === UserRole.ADMIN &&
      user.admin &&
      !user.admin.isActive
    ) {
      throw new ForbiddenException('Admin account is deactivated');
    }

    if (user.role === UserRole.ADMIN && user.admin) {
      await this.prisma.admin.update({
        where: { id: user.admin.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role as UserRole, portal, {
      adminType: user.admin?.adminType as AdminType | undefined,
    });

    await this.redis
      .getClient()
      .set(
        `session:portal:${user.id}`,
        portal,
        'EX',
        REFRESH_TOKEN_TTL_SECONDS,
      );

    return {
      ...tokens,
      user: this.buildUserResponse(user),
    };
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: { sub: string; tokenId: string };

    try {
      payload = this.jwtService.verify<{ sub: string; tokenId: string }>(
        refreshToken,
        { secret: this.refreshSecret },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const redisKey = `refresh:${payload.sub}:${payload.tokenId}`;
    const stored = await this.redis.getClient().get(redisKey);

    if (!stored) {
      throw new UnauthorizedException('Refresh token has expired or been revoked');
    }

    const metadata = JSON.parse(stored) as RefreshTokenMetadata;
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { admin: true, studentProfile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (
      user.role === UserRole.ADMIN &&
      user.admin &&
      !user.admin.isActive
    ) {
      throw new ForbiddenException('Admin account is deactivated');
    }

    await this.redis.getClient().del(redisKey);

    const tokens = await this.issueTokens(
      user.id,
      user.email,
      user.role as UserRole,
      metadata.portal,
      { adminType: user.admin?.adminType as AdminType | undefined },
    );

    return {
      ...tokens,
      user: this.buildUserResponse(user),
    };
  }

  async logout(userId: string, refreshToken: string | undefined, jti?: string) {
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify<{ sub: string; tokenId: string }>(
          refreshToken,
          { secret: this.refreshSecret },
        );

        if (payload.sub === userId) {
          await this.redis
            .getClient()
            .del(`refresh:${payload.sub}:${payload.tokenId}`);
        }
      } catch {
        // Ignore invalid refresh tokens during logout.
      }
    }

    if (jti) {
      const ttlSeconds = this.parseExpirySeconds(this.accessExpiry);
      await this.redis
        .getClient()
        .set(`blacklist:access:${jti}`, '1', 'EX', ttlSeconds);
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(emailInput: string) {
    const email = emailInput.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        message:
          'If an account exists for this email, a password reset link has been sent.',
      };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.redis
      .getClient()
      .set(`otp:reset:${email}`, tokenHash, 'EX', 15 * 60);

    const siteUrl = this.configService.get<string>(
      'SITE_URL',
      'http://localhost:3000',
    );
    const resetUrl = `${siteUrl}/reset-password?token=${rawToken}`;

    this.logger.log(
      `[STUB EMAIL] Password reset for ${email}: ${resetUrl}`,
    );

    return {
      message:
        'If an account exists for this email, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
      orderBy: { expiresAt: 'desc' },
      take: 50,
    });

    let matchedToken: (typeof tokens)[number] | undefined;

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(dto.token, token.tokenHash);
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: matchedToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.invalidateAllRefreshTokens(matchedToken.userId);
    await this.redis.getClient().del(`otp:reset:${matchedToken.user.email}`);

    return { message: 'Password reset successful. Please sign in.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const currentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!currentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.invalidateAllRefreshTokens(userId);

    return { message: 'Password changed successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: true,
        studentProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { user: this.buildUserResponse(user) };
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: UserRole,
    portal: Portal,
    options?: { adminType?: JwtPayload['adminType'] },
  ): Promise<TokenPair> {
    const tokenId = uuidv4();
    const jti = uuidv4();

    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      role,
      jti,
      ...(options?.adminType ? { adminType: options.adminType } : {}),
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: this.accessExpiry,
    });

    const refreshToken = this.jwtService.sign(
      { sub: userId, tokenId },
      {
        secret: this.refreshSecret,
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRY',
          '7d',
        ),
      },
    );

    const metadata: RefreshTokenMetadata = {
      portal,
      createdAt: new Date().toISOString(),
    };

    await this.redis
      .getClient()
      .set(
        `refresh:${userId}:${tokenId}`,
        JSON.stringify(metadata),
        'EX',
        REFRESH_TOKEN_TTL_SECONDS,
      );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpirySeconds(this.accessExpiry),
      tokenId,
    };
  }

  private parsePortal(header: string | undefined): Portal {
    const normalized = header?.toLowerCase().trim();

    if (normalized === Portal.STUDENT || normalized === Portal.ADMIN) {
      return normalized;
    }

    throw new BadRequestPortalException();
  }

  private assertPortalAccess(role: UserRole, portal: Portal): void {
    const siteUrl = this.configService.get<string>(
      'SITE_URL',
      'http://localhost:3000',
    );
    const adminUrl = this.configService.get<string>(
      'ADMIN_URL',
      'http://localhost:3001',
    );

    if (portal === Portal.STUDENT && role === UserRole.ADMIN) {
      throw new ForbiddenException({
        code: 'PORTAL_MISMATCH',
        message:
          'Admin accounts must sign in via the admin portal.',
        redirectUrl: `${adminUrl}/login`,
      });
    }

    if (portal === Portal.ADMIN && role === UserRole.STUDENT) {
      throw new ForbiddenException({
        code: 'PORTAL_MISMATCH',
        message:
          'Student accounts must sign in via the student portal.',
        redirectUrl: `${siteUrl}/login`,
      });
    }
  }

  private buildUserResponse(user: {
    id: string;
    email: string;
    role: string;
    admin: {
      adminType: string;
      fullName: string;
      employeeId: string;
    } | null;
    studentProfile: {
      fullName: string;
      gender: string;
      countryCode: string;
      mobile: string;
      avatarUrl: string | null;
    } | null;
  }) {
    const base = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    if (user.role === UserRole.STUDENT && user.studentProfile) {
      return {
        ...base,
        profile: {
          fullName: user.studentProfile.fullName,
          gender: user.studentProfile.gender,
          countryCode: user.studentProfile.countryCode,
          mobile: user.studentProfile.mobile,
          hasAvatar: Boolean(user.studentProfile.avatarUrl),
        },
      };
    }

    if (user.role === UserRole.ADMIN && user.admin) {
      return {
        ...base,
        adminType: user.admin.adminType,
        profile: {
          fullName: user.admin.fullName,
          employeeId: user.admin.employeeId,
        },
      };
    }

    return base;
  }

  private async invalidateAllRefreshTokens(userId: string): Promise<void> {
    const client = this.redis.getClient();
    const pattern = `refresh:${userId}:*`;
    let cursor = '0';

    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== '0');
  }

  private parseExpirySeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 900;
    }

    const value = Number.parseInt(match[1]!, 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}

class BadRequestPortalException extends BadRequestException {
  constructor() {
    super({
      code: 'PORTAL_REQUIRED',
      message: 'X-Portal header must be "student" or "admin".',
    });
  }
}

export type { AuthUser };
