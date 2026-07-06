import { Injectable } from '@nestjs/common';
import { ApplicationStatus } from '@scholarship/shared';
import {
  ADMIN_STATS_CACHE_KEY,
  ADMIN_STATS_CACHE_TTL_SECONDS,
} from '../common/constants/admin-cache.constants';
import { extractDistrict } from '../common/helpers/extract-district';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface AdminDashboardStats {
  totalApplications: number;
  pendingVerification: number;
  approved: number;
  rejected: number;
  allocated: number;
  totalDisbursed: number;
  recentSubmissions: Array<{
    id: string;
    applicationNumber: string | null;
    studentName: string | null;
    district: string | null;
    status: ApplicationStatus;
    submittedAt: Date | null;
  }>;
  byDistrict: Array<{ district: string; count: number }>;
}

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getStats(): Promise<AdminDashboardStats> {
    const cached = await this.redisService
      .getClient()
      .get(ADMIN_STATS_CACHE_KEY);

    if (cached) {
      return JSON.parse(cached) as AdminDashboardStats;
    }

    const stats = await this.computeStats();
    await this.redisService
      .getClient()
      .set(
        ADMIN_STATS_CACHE_KEY,
        JSON.stringify(stats),
        'EX',
        ADMIN_STATS_CACHE_TTL_SECONDS,
      );

    return stats;
  }

  async invalidateStatsCache(): Promise<void> {
    await this.redisService.getClient().del(ADMIN_STATS_CACHE_KEY);
  }

  private async computeStats(): Promise<AdminDashboardStats> {
    const [
      totalApplications,
      pendingVerification,
      approved,
      rejected,
      allocated,
      disbursementAggregate,
      recentSubmissions,
      districtApplications,
    ] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.application.count({
        where: {
          status: {
            in: [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW],
          },
        },
      }),
      this.prisma.application.count({
        where: { status: ApplicationStatus.APPROVED },
      }),
      this.prisma.application.count({
        where: { status: ApplicationStatus.REJECTED },
      }),
      this.prisma.application.count({
        where: { status: ApplicationStatus.ALLOCATED },
      }),
      this.prisma.scholarshipAllocation.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.application.findMany({
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          applicationNumber: true,
          status: true,
          submittedAt: true,
          contactAddress: true,
          personalDetails: true,
        },
      }),
      this.prisma.application.findMany({
        where: { status: { not: ApplicationStatus.DRAFT } },
        select: { contactAddress: true },
      }),
    ]);

    const districtCounts = new Map<string, number>();
    for (const application of districtApplications) {
      const district = extractDistrict(application.contactAddress) ?? 'Unknown';
      districtCounts.set(district, (districtCounts.get(district) ?? 0) + 1);
    }

    const byDistrict = [...districtCounts.entries()]
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalApplications,
      pendingVerification,
      approved,
      rejected,
      allocated,
      totalDisbursed: Number(disbursementAggregate._sum.amount ?? 0),
      recentSubmissions: recentSubmissions.map((application) => ({
        id: application.id,
        applicationNumber: application.applicationNumber,
        studentName: this.extractStudentName(application.personalDetails),
        district: extractDistrict(application.contactAddress),
        status: application.status as ApplicationStatus,
        submittedAt: application.submittedAt,
      })),
      byDistrict,
    };
  }

  private extractStudentName(
    personalDetails: unknown,
  ): string | null {
    if (
      !personalDetails ||
      typeof personalDetails !== 'object' ||
      Array.isArray(personalDetails)
    ) {
      return null;
    }

    const name = (personalDetails as Record<string, unknown>).studentName;
    if (name === undefined || name === null) {
      return null;
    }

    const value = String(name).trim();
    return value.length > 0 ? value : null;
  }
}
