import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  DocumentVerificationStatus,
  RemarkAction,
} from '@scholarship/shared';
import { Prisma } from '@scholarship/database';
import { AdminDashboardService } from '../admin-dashboard/admin-dashboard.service';
import { AuditService } from '../audit/audit.service';
import { extractDistrict } from '../common/helpers/extract-district';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApplicationDecision,
  ApplicationDecisionDto,
} from './dto/decision.dto';
import { AdminApplicationsQueryDto } from './dto/query.dto';

@Injectable()
export class AdminApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminDashboardService: AdminDashboardService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: AdminApplicationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.academicYear) {
      where.academicYear = query.academicYear;
    }

    if (query.district) {
      where.contactAddress = {
        path: ['district'],
        equals: query.district,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: { sort: 'desc', nulls: 'last' } },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              mobile: true,
              gender: true,
              countryCode: true,
              user: { select: { email: true } },
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      items: items.map((application) => ({
        ...application,
        studentName: application.student?.fullName ?? '—',
        district: extractDistrict(application.contactAddress),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
        documents: {
          orderBy: { documentType: 'asc' },
        },
        remarks: {
          orderBy: { createdAt: 'asc' },
          include: {
            admin: {
              select: {
                id: true,
                fullName: true,
                employeeId: true,
              },
            },
          },
        },
        feePayments: { orderBy: { year: 'asc' } },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return {
      ...application,
      district: extractDistrict(application.contactAddress),
    };
  }

  async startReview(id: string, adminId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ApplicationStatus.SUBMITTED) {
      throw new BadRequestException(
        'Only SUBMITTED applications can be moved to UNDER_REVIEW',
      );
    }

    return this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.UNDER_REVIEW },
      include: this.detailInclude(),
    });
  }

  async decide(id: string, adminId: string, dto: ApplicationDecisionDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ApplicationStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        'Decision can only be made on applications in UNDER_REVIEW status',
      );
    }

    if (dto.decision === ApplicationDecision.APPROVE) {
      const unverified = application.documents.filter(
        (document) =>
          document.verificationStatus !== DocumentVerificationStatus.VERIFIED,
      );

      if (unverified.length > 0) {
        throw new BadRequestException(
          'All documents must be verified before approving the application',
        );
      }
    }

    if (dto.decision === ApplicationDecision.REJECT) {
      if (!dto.remark || dto.remark.trim().length < 10) {
        throw new BadRequestException(
          'Rejection remark must be at least 10 characters',
        );
      }
    }

    const newStatus =
      dto.decision === ApplicationDecision.APPROVE
        ? ApplicationStatus.APPROVED
        : ApplicationStatus.REJECTED;

    const remarkAction =
      dto.decision === ApplicationDecision.APPROVE
        ? RemarkAction.APPROVED
        : RemarkAction.REJECTED;

    const remarkText =
      dto.remark?.trim() ||
      (dto.decision === ApplicationDecision.APPROVE
        ? 'Application approved'
        : '');

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.applicationRemark.create({
        data: {
          applicationId: id,
          adminId,
          remark: remarkText,
          action: remarkAction,
        },
      });

      return tx.application.update({
        where: { id },
        data: {
          status: newStatus,
          reviewedById: adminId,
          reviewedAt: new Date(),
        },
        include: this.detailInclude(),
      });
    });

    await this.adminDashboardService.invalidateStatsCache();

    await this.auditService.logAction(
      adminId,
      dto.decision === ApplicationDecision.APPROVE
        ? 'APPLICATION_APPROVED'
        : 'APPLICATION_REJECTED',
      'application',
      id,
      { remark: remarkText, status: newStatus },
    );

    return updated;
  }

  private detailInclude() {
    return {
      student: {
        include: {
          user: { select: { email: true } },
        },
      },
      documents: { orderBy: { documentType: 'asc' as const } },
      remarks: {
        orderBy: { createdAt: 'asc' as const },
        include: {
          admin: {
            select: {
              id: true,
              fullName: true,
              employeeId: true,
            },
          },
        },
      },
      feePayments: { orderBy: { year: 'asc' as const } },
    };
  }
}
