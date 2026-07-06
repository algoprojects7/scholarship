import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, DocumentType } from '@scholarship/shared';
import { extname } from 'path';
import { REQUIRED_DOCUMENT_TYPES } from '../common/constants/application.constants';
import { getStudentProfileId } from '../common/helpers/get-student-profile-id';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIMES = ['image/jpeg', 'image/png'] as const;

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getDashboard(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        applications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            documents: {
              select: {
                documentType: true,
              },
            },
            _count: {
              select: {
                remarks: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    const latestApplication = profile.applications[0] ?? null;

    let remarks: Array<{
      id: string;
      remark: string;
      action: string;
      createdAt: Date;
    }> = [];

    if (latestApplication) {
      remarks = await this.prisma.applicationRemark.findMany({
        where: { applicationId: latestApplication.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          remark: true,
          action: true,
          createdAt: true,
        },
      });
    }

    const uploadedTypes = new Set(
      latestApplication?.documents.map((doc) => doc.documentType) ?? [],
    );

    const scholarship = await this.getLatestScholarship(profile.id);

    return {
      student: {
        fullName: profile.fullName,
        email: profile.user.email,
        mobile: profile.mobile,
        countryCode: profile.countryCode,
      },
      application: latestApplication
        ? {
            id: latestApplication.id,
            status: latestApplication.status,
            applicationNumber: latestApplication.applicationNumber,
            academicYear: latestApplication.academicYear,
            submittedAt: latestApplication.submittedAt,
            reviewedAt: latestApplication.reviewedAt,
            createdAt: latestApplication.createdAt,
            updatedAt: latestApplication.updatedAt,
          }
        : null,
      scholarship,
      remarks,
      documentsStatus: REQUIRED_DOCUMENT_TYPES.map((type) => ({
        documentType: type,
        uploaded: uploadedTypes.has(type as DocumentType),
      })),
    };
  }

  async getScholarship(userId: string) {
    const studentId = await getStudentProfileId(this.prisma, userId);
    const scholarship = await this.getLatestScholarship(studentId);

    return { scholarship };
  }

  private async getLatestScholarship(studentProfileId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        studentId: studentProfileId,
        status: ApplicationStatus.ALLOCATED,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!application) {
      return null;
    }

    const allocation = await this.prisma.scholarshipAllocation.findFirst({
      where: { applicationId: application.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!allocation) {
      return null;
    }

    return {
      id: allocation.id,
      type: allocation.type,
      amount: allocation.amount.toString(),
      academicYear: allocation.academicYear,
      paymentStatus: allocation.paymentStatus,
      paymentDate: allocation.paymentDate,
      notes: allocation.notes,
      applicationNumber: application.applicationNumber,
      createdAt: allocation.createdAt,
      updatedAt: allocation.updatedAt,
    };
  }

  async getStudentProfileIdForUser(userId: string): Promise<string> {
    return getStudentProfileId(this.prisma, userId);
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    return {
      fullName: profile.fullName,
      email: profile.user.email,
      gender: profile.gender,
      countryCode: profile.countryCode,
      mobile: profile.mobile,
      hasAvatar: Boolean(profile.avatarUrl),
    };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    this.validateAvatarFile(file);

    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    const extension = extname(file.originalname).toLowerCase() || '.jpg';
    const key = `avatars/${profile.id}/${Date.now()}${extension}`;

    const fileUrl = await this.storageService.upload(
      file.buffer,
      key,
      file.mimetype,
    );

    if (profile.avatarUrl) {
      try {
        await this.storageService.delete(profile.avatarUrl);
      } catch (err: any) {
        this.logger.warn(
          `Failed to delete old avatar ${profile.avatarUrl}: ${err.message}`,
        );
      }
    }

    await this.prisma.studentProfile.update({
      where: { id: profile.id },
      data: { avatarUrl: fileUrl },
    });

    return {
      message: 'Profile photo updated successfully',
      hasAvatar: true,
    };
  }

  async getAvatar(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile?.avatarUrl) {
      throw new NotFoundException('Profile photo not found');
    }

    if (this.storageService.isLocalStorage()) {
      const extension = extname(profile.avatarUrl).toLowerCase();
      const mimeType =
        extension === '.png'
          ? 'image/png'
          : extension === '.jpg' || extension === '.jpeg'
            ? 'image/jpeg'
            : 'application/octet-stream';

      return {
        mode: 'local' as const,
        filePath: this.storageService.getLocalFilePath(profile.avatarUrl),
        mimeType,
      };
    }

    const url = await this.storageService.getSignedUrl(profile.avatarUrl);
    return { mode: 'redirect' as const, url };
  }

  private validateAvatarFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Photo file is required');
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      throw new BadRequestException('Photo size must not exceed 2 MB');
    }

    if (
      !ALLOWED_AVATAR_MIMES.includes(
        file.mimetype as (typeof ALLOWED_AVATAR_MIMES)[number],
      )
    ) {
      throw new BadRequestException('Only JPEG and PNG photos are allowed');
    }
  }
}
