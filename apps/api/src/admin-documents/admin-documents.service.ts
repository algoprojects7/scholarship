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
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyDocumentDto } from './dto/verify-document.dto';

@Injectable()
export class AdminDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async verify(documentId: string, adminId: string, dto: VerifyDocumentDto) {
    if (
      dto.status !== DocumentVerificationStatus.VERIFIED &&
      dto.status !== DocumentVerificationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Status must be VERIFIED or REJECTED',
      );
    }

    if (
      dto.status === DocumentVerificationStatus.REJECTED &&
      (!dto.rejectionReason || dto.rejectionReason.trim().length === 0)
    ) {
      throw new BadRequestException(
        'Rejection reason is required when rejecting a document',
      );
    }

    const document = await this.prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: { application: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (
      document.application.status !== ApplicationStatus.SUBMITTED &&
      document.application.status !== ApplicationStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        'Documents can only be verified while application is SUBMITTED or UNDER_REVIEW',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const verifiedDocument = await tx.applicationDocument.update({
        where: { id: documentId },
        data: {
          verificationStatus: dto.status,
          verifiedById: adminId,
          verifiedAt: new Date(),
          rejectionReason:
            dto.status === DocumentVerificationStatus.REJECTED
              ? dto.rejectionReason?.trim()
              : null,
        },
      });

      if (dto.status === DocumentVerificationStatus.REJECTED) {
        await tx.applicationRemark.create({
          data: {
            applicationId: document.applicationId,
            adminId,
            remark: `Document ${document.documentType} rejected: ${dto.rejectionReason?.trim()}`,
            action: RemarkAction.DOCUMENT_REJECTED,
          },
        });
      }

      return verifiedDocument;
    });

    await this.auditService.logAction(
      adminId,
      dto.status === DocumentVerificationStatus.VERIFIED
        ? 'DOCUMENT_VERIFIED'
        : 'DOCUMENT_REJECTED',
      'application_document',
      documentId,
      {
        applicationId: document.applicationId,
        documentType: document.documentType,
        rejectionReason: dto.rejectionReason ?? null,
      },
    );

    return updated;
  }
}
