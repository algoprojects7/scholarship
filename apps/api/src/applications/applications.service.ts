import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus } from '@scholarship/shared';
import { Prisma } from '@scholarship/database';
import {
  APPLICATION_NUMBER_PREFIX,
  CURRENT_ACADEMIC_YEAR,
  FEE_YEARS,
  REQUIRED_DOCUMENT_TYPES,
} from '../common/constants/application.constants';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateApplicationDto } from './dto/update-application.dto';

const PERSONAL_FIELDS = [
  'studentName',
  'fatherName',
  'fatherProfession',
  'motherName',
  'motherProfession',
  'religion',
] as const;

const EDUCATIONAL_FIELDS = [
  'readingYear',
  'institutionName',
  'courseName',
  'batch',
] as const;

const CONTACT_FIELDS = [
  'mobile',
  'village',
  'po',
  'district',
  'pin',
  'state',
] as const;

const BANK_FIELDS = [
  'accountHolder',
  'accountNumber',
  'bankName',
  'branchName',
  'ifscCode',
] as const;

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDraft(studentId: string) {
    const existingSubmitted = await this.prisma.application.findFirst({
      where: {
        studentId,
        academicYear: CURRENT_ACADEMIC_YEAR,
        status: {
          notIn: [ApplicationStatus.DRAFT, ApplicationStatus.REJECTED],
        },
      },
    });

    if (existingSubmitted) {
      throw new ConflictException(
        'You already have a submitted application for this academic year',
      );
    }

    return this.prisma.application.create({
      data: {
        studentId,
        academicYear: CURRENT_ACADEMIC_YEAR,
        status: ApplicationStatus.DRAFT,
      },
      include: this.defaultInclude(),
    });
  }

  async findMine(studentId: string) {
    return this.prisma.application.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: this.defaultInclude(),
    });
  }

  async findOne(id: string, studentId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, studentId },
      include: this.defaultInclude(),
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, studentId: string, dto: UpdateApplicationDto) {
    const application = await this.findOne(id, studentId);

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Application can only be edited when in DRAFT or REJECTED status',
      );
    }

    const updateData: Prisma.ApplicationUpdateInput = {};

    if (dto.personalDetails !== undefined) {
      updateData.personalDetails = this.mergeJsonSection(
        application.personalDetails,
        dto.personalDetails,
      );
    }

    if (dto.educationalDetails !== undefined) {
      updateData.educationalDetails = this.mergeJsonSection(
        application.educationalDetails,
        dto.educationalDetails,
      );
    }

    if (dto.contactAddress !== undefined) {
      updateData.contactAddress = this.mergeJsonSection(
        application.contactAddress,
        dto.contactAddress,
      );
    }

    if (dto.bankDetails !== undefined) {
      updateData.bankDetails = this.mergeJsonSection(
        application.bankDetails,
        dto.bankDetails,
      );
    }

    if (dto.feeDetails !== undefined) {
      updateData.feeDetails = this.mergeJsonSection(
        application.feeDetails,
        { paymentType: dto.feeDetails.paymentType },
      );
    }

    if (application.status === ApplicationStatus.REJECTED) {
      updateData.status = ApplicationStatus.DRAFT;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id },
        data: updateData,
      });

      if (dto.feePayments?.length) {
        for (const payment of dto.feePayments) {
          await tx.feePayment.upsert({
            where: {
              applicationId_year: {
                applicationId: id,
                year: payment.year,
              },
            },
            create: {
              applicationId: id,
              year: payment.year,
              amountPaid: payment.amountPaid,
            },
            update: {
              amountPaid: payment.amountPaid,
            },
          });
        }
      }

      return tx.application.findUniqueOrThrow({
        where: { id },
        include: this.defaultInclude(),
      });
    });
  }

  async submit(id: string, studentId: string) {
    const application = await this.findOne(id, studentId);

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Application can only be submitted from DRAFT or REJECTED status',
      );
    }

    this.validateSectionsForSubmit(application);
    this.validateDocumentsForSubmit(application.documents);

    const applicationNumber = await this.generateApplicationNumber();

    return this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        applicationNumber,
        submittedAt: new Date(),
      },
      include: this.defaultInclude(),
    });
  }

  async findRemarks(id: string, studentId: string) {
    await this.findOne(id, studentId);

    return this.prisma.applicationRemark.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        remark: true,
        action: true,
        createdAt: true,
      },
    });
  }

  private defaultInclude() {
    return {
      feePayments: { orderBy: { year: 'asc' as const } },
      documents: true,
    };
  }

  private mergeJsonSection(
    existing: Prisma.JsonValue | null,
    incoming: Record<string, unknown>,
  ): Prisma.InputJsonValue {
    const base =
      existing && typeof existing === 'object' && !Array.isArray(existing)
        ? (existing as Record<string, unknown>)
        : {};

    return { ...base, ...incoming } as Prisma.InputJsonValue;
  }

  private validateSectionsForSubmit(application: {
    personalDetails: Prisma.JsonValue | null;
    educationalDetails: Prisma.JsonValue | null;
    contactAddress: Prisma.JsonValue | null;
    bankDetails: Prisma.JsonValue | null;
    feeDetails: Prisma.JsonValue | null;
    feePayments: { year: number; amountPaid: Prisma.Decimal }[];
  }): void {
    const missing: string[] = [];

    if (!this.hasFields(application.personalDetails, PERSONAL_FIELDS)) {
      missing.push('personal details');
    }

    if (!this.hasFields(application.educationalDetails, EDUCATIONAL_FIELDS)) {
      missing.push('educational details');
    }

    if (!this.hasFields(application.contactAddress, CONTACT_FIELDS)) {
      missing.push('contact & address');
    }

    if (!this.hasFields(application.bankDetails, BANK_FIELDS)) {
      missing.push('bank details');
    }

    const feeDetails = this.asRecord(application.feeDetails);
    if (!feeDetails?.paymentType) {
      missing.push('fee details (payment type)');
    }

    const paymentYears = new Set(application.feePayments.map((p) => p.year));
    for (const year of FEE_YEARS) {
      if (!paymentYears.has(year)) {
        missing.push(`fee payment for ${year}`);
      }
    }

    if (missing.length > 0) {
      throw new BadRequestException({
        message: 'Application is incomplete',
        missing,
      });
    }
  }

  private validateDocumentsForSubmit(
    documents: { documentType: string }[],
  ): void {
    const uploaded = new Set(documents.map((d) => d.documentType));
    const missingDocs = REQUIRED_DOCUMENT_TYPES.filter(
      (type) => !uploaded.has(type),
    );

    if (missingDocs.length > 0) {
      throw new BadRequestException({
        message: 'All required documents must be uploaded before submission',
        missingDocuments: missingDocs,
      });
    }
  }

  private hasFields(
    section: Prisma.JsonValue | null,
    fields: readonly string[],
  ): boolean {
    const record = this.asRecord(section);
    if (!record) {
      return false;
    }

    return fields.every((field) => {
      const value = record[field];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
  }

  private asRecord(value: Prisma.JsonValue | null): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }

  private async generateApplicationNumber(): Promise<string> {
    const latest = await this.prisma.application.findFirst({
      where: {
        applicationNumber: { startsWith: `${APPLICATION_NUMBER_PREFIX}-` },
      },
      orderBy: { applicationNumber: 'desc' },
      select: { applicationNumber: true },
    });

    let nextSequence = 1;
    if (latest?.applicationNumber) {
      const parts = latest.applicationNumber.split('-');
      const lastPart = parts[parts.length - 1];
      const parsed = Number.parseInt(lastPart ?? '', 10);
      if (!Number.isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }

    return `${APPLICATION_NUMBER_PREFIX}-${String(nextSequence).padStart(5, '0')}`;
  }
}
