import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  PaymentStatus,
  RemarkAction,
} from '@scholarship/shared';
import { Prisma } from '@scholarship/database';
import { AdminDashboardService } from '../admin-dashboard/admin-dashboard.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { AllocationsQueryDto } from './dto/query.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class AllocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminDashboardService: AdminDashboardService,
    private readonly auditService: AuditService,
  ) {}

  async create(adminId: string, dto: CreateAllocationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ApplicationStatus.APPROVED) {
      throw new BadRequestException(
        'Allocation can only be created for APPROVED applications',
      );
    }

    const existing = await this.prisma.scholarshipAllocation.findUnique({
      where: {
        applicationId_academicYear: {
          applicationId: dto.applicationId,
          academicYear: dto.academicYear,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'An allocation already exists for this application and academic year',
      );
    }

    const paymentStatus = dto.paymentStatus ?? PaymentStatus.PENDING;
    const remarkText =
      dto.notes?.trim() ||
      `Scholarship allocated: ${dto.type} amount ${dto.amount} for ${dto.academicYear}`;

    let allocation;
    try {
      allocation = await this.prisma.$transaction(async (tx) => {
        await tx.applicationRemark.create({
          data: {
            applicationId: dto.applicationId,
            adminId,
            remark: remarkText,
            action: RemarkAction.ALLOCATION_CREATED,
          },
        });

        const created = await tx.scholarshipAllocation.create({
          data: {
            applicationId: dto.applicationId,
            allocatedById: adminId,
            type: dto.type,
            amount: dto.amount,
            academicYear: dto.academicYear,
            paymentStatus,
            notes: dto.notes?.trim() || null,
          },
          include: this.allocationInclude(),
        });

        await tx.application.update({
          where: { id: dto.applicationId },
          data: { status: ApplicationStatus.ALLOCATED },
        });

        return created;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'An allocation already exists for this application and academic year',
        );
      }
      throw error;
    }

    await this.adminDashboardService.invalidateStatsCache();

    await this.auditService.logAction(
      adminId,
      'ALLOCATION_CREATED',
      'scholarship_allocation',
      allocation.id,
      {
        applicationId: dto.applicationId,
        type: dto.type,
        amount: dto.amount,
        academicYear: dto.academicYear,
        paymentStatus,
      },
    );

    return this.formatAllocation(allocation);
  }

  async list(query: AllocationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ScholarshipAllocationWhereInput = {};

    if (query.academicYear) {
      where.academicYear = query.academicYear;
    }

    const [items, total] = await Promise.all([
      this.prisma.scholarshipAllocation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.allocationInclude(),
      }),
      this.prisma.scholarshipAllocation.count({ where }),
    ]);

    return {
      items: items.map((allocation) => this.formatAllocation(allocation)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePayment(id: string, adminId: string, dto: UpdatePaymentDto) {
    const allocation = await this.prisma.scholarshipAllocation.findUnique({
      where: { id },
    });

    if (!allocation) {
      throw new NotFoundException('Allocation not found');
    }

    const updated = await this.prisma.scholarshipAllocation.update({
      where: { id },
      data: {
        paymentStatus: dto.paymentStatus,
        paymentDate: dto.paymentDate ?? null,
      },
      include: this.allocationInclude(),
    });

    await this.auditService.logAction(
      adminId,
      'ALLOCATION_PAYMENT_UPDATED',
      'scholarship_allocation',
      id,
      {
        paymentStatus: dto.paymentStatus,
        paymentDate: dto.paymentDate ?? null,
      },
    );

    return this.formatAllocation(updated);
  }

  async findByApplication(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const allocations = await this.prisma.scholarshipAllocation.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
      include: this.allocationInclude(),
    });

    return allocations.map((allocation) => this.formatAllocation(allocation));
  }

  private allocationInclude() {
    return {
      application: {
        select: {
          id: true,
          applicationNumber: true,
          status: true,
          academicYear: true,
          student: {
            select: {
              id: true,
              fullName: true,
              mobile: true,
              countryCode: true,
              user: { select: { email: true } },
            },
          },
        },
      },
      allocatedBy: {
        select: {
          id: true,
          fullName: true,
          employeeId: true,
        },
      },
    };
  }

  private formatAllocation<
    T extends { amount: Prisma.Decimal | number | string },
  >(allocation: T): T & { amount: number } {
    return {
      ...allocation,
      amount: Number(allocation.amount),
    };
  }
}
