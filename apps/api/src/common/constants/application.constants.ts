import { DocumentType } from '@scholarship/shared';

export const CURRENT_ACADEMIC_YEAR = '2025-26';
export const APPLICATION_NUMBER_PREFIX = 'APP-2026';
export const FEE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;
export const MANDATORY_DOCUMENT_TYPES = [
  DocumentType.STUDENT_ID_CARD,
  DocumentType.ADMISSION_RECEIPT,
  DocumentType.AADHAAR_STUDENT,
  DocumentType.VOTER_ID_STUDENT,
  DocumentType.NRC_FINAL_DRAFT,
  DocumentType.BANK_ACCOUNT_DETAILS,
  DocumentType.PARENT_AADHAAR,
  DocumentType.FULL_PHOTO_WITH_APRON,
  DocumentType.COURSE_YEARLY_EXPENSE,
  DocumentType.HOSTEL_PAYMENT_RECEIPT,
] as const;

export const OPTIONAL_DOCUMENT_TYPES = [
  DocumentType.BPL_CERTIFICATE,
  DocumentType.INCOME_CERTIFICATE,
] as const;

export const REQUIRED_DOCUMENT_TYPES = MANDATORY_DOCUMENT_TYPES;
export const SIGNED_URL_EXPIRY_SECONDS = 15 * 60;
export const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 5 * 60;
export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_DOCUMENT_MIMES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;
