import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminType, UserRole } from '@scholarship/shared';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../auth/auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

const adminInclude = {
  user: {
    select: {
      email: true,
      isActive: true,
    },
  },
} as const;

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const admins = await this.prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      include: adminInclude,
    });

    return {
      items: admins.map((admin) => this.formatAdmin(admin)),
    };
  }

  async findOne(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: adminInclude,
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return this.formatAdmin(admin);
  }

  async create(superAdminId: string, dto: CreateAdminDto) {
    const email = dto.email.toLowerCase().trim();
    const adminType = dto.adminType ?? AdminType.OPERATOR;

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingEmployeeId = await this.prisma.admin.findUnique({
      where: { employeeId: dto.employeeId.trim() },
    });

    if (existingEmployeeId) {
      throw new ConflictException('Employee ID is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const admin = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.ADMIN,
        },
      });

      return tx.admin.create({
        data: {
          userId: user.id,
          adminType,
          fullName: dto.fullName.trim(),
          employeeId: dto.employeeId.trim(),
          department: dto.department?.trim(),
          countryCode: dto.countryCode ?? '+91',
          phone: dto.phone,
          createdById: superAdminId,
        },
        include: adminInclude,
      });
    });

    return this.formatAdmin(admin);
  }

  async update(id: string, dto: UpdateAdminDto, requestingAdminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (dto.isActive === false && id === requestingAdminId) {
      await this.assertNotLastActiveSuper(id);
    }

    const adminData: {
      fullName?: string;
      department?: string | null;
      phone?: string;
      isActive?: boolean;
    } = {};

    if (dto.fullName !== undefined) {
      adminData.fullName = dto.fullName.trim();
    }

    if (dto.department !== undefined) {
      adminData.department = dto.department.trim() || null;
    }

    if (dto.phone !== undefined) {
      adminData.phone = dto.phone;
    }

    if (dto.isActive !== undefined) {
      adminData.isActive = dto.isActive;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.isActive !== undefined) {
        await tx.user.update({
          where: { id: admin.userId },
          data: { isActive: dto.isActive },
        });
      }

      return tx.admin.update({
        where: { id },
        data: adminData,
        include: adminInclude,
      });
    });

    return this.formatAdmin(updated);
  }

  private async assertNotLastActiveSuper(adminId: string): Promise<void> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { adminType: true, isActive: true },
    });

    if (!admin || admin.adminType !== AdminType.SUPER || !admin.isActive) {
      return;
    }

    const activeSuperCount = await this.prisma.admin.count({
      where: {
        adminType: AdminType.SUPER,
        isActive: true,
      },
    });

    if (activeSuperCount <= 1) {
      throw new BadRequestException(
        'Cannot deactivate the last active Super Admin account',
      );
    }
  }

  private formatAdmin(admin: {
    id: string;
    userId: string;
    adminType: string;
    fullName: string;
    employeeId: string;
    department: string | null;
    countryCode: string;
    phone: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    createdById: string | null;
    user: { email: string; isActive: boolean };
  }) {
    const { user, ...rest } = admin;

    return {
      ...rest,
      user: {
        email: user.email,
        isActive: user.isActive,
      },
    };
  }
}
