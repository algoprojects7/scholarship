import { IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';
import { DocumentVerificationStatus } from '@scholarship/shared';

const VERIFY_STATUSES = [
  DocumentVerificationStatus.VERIFIED,
  DocumentVerificationStatus.REJECTED,
] as const;

export class VerifyDocumentDto {
  @IsIn(VERIFY_STATUSES)
  status!: (typeof VERIFY_STATUSES)[number];

  @ValidateIf(
    (dto: VerifyDocumentDto) =>
      dto.status === DocumentVerificationStatus.REJECTED,
  )
  @IsString()
  rejectionReason?: string;
}
