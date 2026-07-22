import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, DocumentType } from '@scholarship/shared';
import { DocumentType as PrismaDocumentType } from '@scholarship/database';
import {
  ALLOWED_DOCUMENT_MIMES,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../common/constants/application.constants';
import { getStudentProfileId } from '../common/helpers/get-student-profile-id';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { isAllowedDocumentMime } from './dto/presign-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async createPresignedUpload(
    applicationId: string,
    userId: string,
    documentType: DocumentType,
    fileName: string,
    contentType: string,
    fileSize: number,
  ) {
    if (!this.storageService.supportsPresignedUpload()) {
      throw new HttpException(
        {
          message:
            'Presigned upload is not used for this storage backend. Use the direct upload endpoint.',
          code: 'STORAGE_LOCAL',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const { studentId } = await this.assertCanUploadDocuments(
      applicationId,
      userId,
    );
    this.validateFileMeta(fileSize, contentType, documentType);

    const key = this.buildStorageKey(
      studentId,
      applicationId,
      documentType,
      fileName,
    );
    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      key,
      contentType,
    );

    return { uploadUrl, key };
  }

  async confirmUpload(
    applicationId: string,
    userId: string,
    documentType: DocumentType,
    key: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ) {
    const { studentId } = await this.assertCanUploadDocuments(
      applicationId,
      userId,
    );
    this.validateFileMeta(fileSize, mimeType, documentType);

    const expectedPrefix = `${studentId}/${applicationId}/${documentType}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new BadRequestException('Invalid storage key');
    }

    return this.saveDocumentRecord(
      applicationId,
      documentType,
      fileName,
      key,
      fileSize,
      mimeType,
    );
  }

  async upload(
    applicationId: string,
    userId: string,
    documentType: DocumentType,
    file: Express.Multer.File,
  ) {
    const isServerless =
      process.env.VERCEL === '1' ||
      process.env.NOW_BUILDER === '1' ||
      !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
      !!process.env.VERCEL_ENV;

    if (this.storageService.isLocalStorage() && isServerless) {
      throw new HttpException(
        {
          message:
            'Document uploads on Vercel require storage. Connect Vercel Blob (easiest) or configure S3_* — see deploy/vercel-blob-setup.md',
          code: 'STORAGE_REQUIRED',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const { studentId } = await this.assertCanUploadDocuments(
      applicationId,
      userId,
    );

    this.validateFile(file, documentType);

    const key = this.buildStorageKey(
      studentId,
      applicationId,
      documentType,
      file.originalname,
    );
    const fileUrl = await this.storageService.upload(
      file.buffer,
      key,
      file.mimetype,
    );

    return this.saveDocumentRecord(
      applicationId,
      documentType,
      file.originalname,
      fileUrl,
      file.size,
      file.mimetype,
    );
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

    return this.buildPreviewResult(document);
  }

  async getAdminPreviewUrl(documentId: string) {
    const document = await this.prisma.applicationDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.buildAdminPreviewResult(document);
  }

  async getAdminDocumentPreviewAccess(documentId: string) {
    const document = await this.prisma.applicationDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const mimeType = document.mimeType ?? 'application/octet-stream';

    if (this.storageService.isLocalStorage()) {
      return {
        mode: 'proxy' as const,
        mimeType,
        fileName: document.fileName,
      };
    }

    const url = await this.storageService
      .getSignedUrl(document.fileUrl)
      .catch(() => {
        throw new NotFoundException(
          'Document file is missing from storage. Ask the student to re-upload it.',
        );
      });

    return {
      mode: 'url' as const,
      url,
      mimeType,
      fileName: document.fileName,
    };
  }

  private async buildPreviewResult(document: {
    fileUrl: string;
    mimeType: string | null;
    fileName: string;
  }) {
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

  private async buildAdminPreviewResult(document: {
    fileUrl: string;
    mimeType: string | null;
    fileName: string;
  }) {
    const mimeType = document.mimeType ?? 'application/octet-stream';

    if (this.storageService.isLocalStorage()) {
      return {
        mode: 'local' as const,
        filePath: this.storageService.getLocalFilePath(document.fileUrl),
        mimeType,
        fileName: document.fileName,
      };
    }

    if (
      this.storageService.isBlobStorage() &&
      document.fileUrl.startsWith('http')
    ) {
      return {
        mode: 'redirect' as const,
        url: document.fileUrl,
        mimeType,
        fileName: document.fileName,
      };
    }

    if (this.storageService.isBlobStorage()) {
      const url = await this.storageService.getSignedUrl(document.fileUrl);

      return {
        mode: 'redirect' as const,
        url,
        mimeType,
        fileName: document.fileName,
      };
    }

    const { buffer, contentType } =
      await this.storageService.fetchFileContent(document.fileUrl);

    return {
      mode: 'buffer' as const,
      buffer,
      mimeType: contentType || mimeType,
      fileName: document.fileName,
    };
  }

  private async assertCanUploadDocuments(
    applicationId: string,
    userId: string,
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

    return { studentId, application };
  }

  private buildStorageKey(
    studentId: string,
    applicationId: string,
    documentType: DocumentType,
    fileName: string,
  ): string {
    return `${studentId}/${applicationId}/${documentType}/${Date.now()}-${fileName}`;
  }

  private async saveDocumentRecord(
    applicationId: string,
    documentType: PrismaDocumentType,
    fileName: string,
    key: string,
    fileSize: number,
    mimeType: string,
  ) {
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
        fileName,
        fileUrl: key,
        fileSize,
        mimeType,
      },
      update: {
        fileName,
        fileUrl: key,
        fileSize,
        mimeType,
        uploadedAt: new Date(),
      },
    });
  }

  private validateFileMeta(
    fileSize: number,
    mimeType: string,
    documentType: DocumentType,
  ): void {
    if (fileSize > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException('File size must not exceed 5 MB');
    }

    if (!isAllowedDocumentMime(mimeType)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and PDF files are allowed',
      );
    }

    if (
      documentType === DocumentType.FULL_PHOTO_WITH_APRON &&
      mimeType === 'application/pdf'
    ) {
      throw new BadRequestException('Photo must be JPG or PNG');
    }
  }

  private validateFile(
    file: Express.Multer.File,
    documentType: DocumentType,
  ): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.validateFileMeta(file.size, file.mimetype, documentType);
  }
}
