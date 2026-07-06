import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, DocumentType } from '@scholarship/shared';
import {
  ALLOWED_DOCUMENT_MIMES,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../common/constants/application.constants';
import { getStudentProfileId } from '../common/helpers/get-student-profile-id';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async upload(
    applicationId: string,
    userId: string,
    documentType: DocumentType,
    file: Express.Multer.File,
  ) {
    const studentId = await getStudentProfileId(this.prisma, userId);
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, studentId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.REJECTED
    ) {
      throw new ForbiddenException(
        'Documents can only be uploaded for DRAFT or REJECTED applications',
      );
    }

    this.validateFile(file);

    const key = `${studentId}/${applicationId}/${documentType}/${Date.now()}-${file.originalname}`;
    await this.storageService.upload(file.buffer, key, file.mimetype);

    const existing = await this.prisma.applicationDocument.findUnique({
      where: {
        applicationId_documentType: {
          applicationId,
          documentType,
        },
      },
    });

    if (existing) {
      await this.storageService.delete(existing.fileUrl);
    }

    return this.prisma.applicationDocument.upsert({
      where: {
        applicationId_documentType: {
          applicationId,
          documentType,
        },
      },
      create: {
        applicationId,
        documentType,
        fileName: file.originalname,
        fileUrl: key,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      update: {
        fileName: file.originalname,
        fileUrl: key,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      },
    });
  }

  async remove(documentId: string, userId: string) {
    const studentId = await getStudentProfileId(this.prisma, userId);
    const document = await this.prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: { application: true },
    });

    if (!document || document.application.studentId !== studentId) {
      throw new NotFoundException('Document not found');
    }

    if (document.application.status !== ApplicationStatus.DRAFT) {
      throw new ForbiddenException(
        'Documents can only be deleted while application is in DRAFT status',
      );
    }

    await this.storageService.delete(document.fileUrl);
    await this.prisma.applicationDocument.delete({
      where: { id: documentId },
    });

    return { deleted: true };
  }

  async getPreviewUrl(documentId: string, userId: string) {
    const studentId = await getStudentProfileId(this.prisma, userId);
    const document = await this.prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: { application: true },
    });

    if (!document || document.application.studentId !== studentId) {
      throw new NotFoundException('Document not found');
    }

    if (this.storageService.isLocalStorage()) {
      return {
        mode: 'local' as const,
        filePath: this.storageService.getLocalFilePath(document.fileUrl),
        mimeType: document.mimeType ?? 'application/octet-stream',
        fileName: document.fileName,
      };
    }

    const url = await this.storageService.getSignedUrl(document.fileUrl);
    return { mode: 'redirect' as const, url };
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException('File size must not exceed 5 MB');
    }

    if (
      !ALLOWED_DOCUMENT_MIMES.includes(
        file.mimetype as (typeof ALLOWED_DOCUMENT_MIMES)[number],
      )
    ) {
      throw new BadRequestException(
        'Only JPEG, PNG, and PDF files are allowed',
      );
    }
  }
}
