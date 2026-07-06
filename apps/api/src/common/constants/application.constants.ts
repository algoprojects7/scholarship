import { DocumentType } from '@scholarship/shared';

export const CURRENT_ACADEMIC_YEAR = '2025-26';
export const APPLICATION_NUMBER_PREFIX = 'APP-2026';
export const FEE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;
export const REQUIRED_DOCUMENT_TYPES = Object.values(DocumentType);
export const SIGNED_URL_EXPIRY_SECONDS = 15 * 60;
export const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 5 * 60;
export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_DOCUMENT_MIMES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;
