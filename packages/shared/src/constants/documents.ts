import { DocumentType } from '../enums';

export interface DocumentTypeConfig {
  type: DocumentType;
  label: string;
}

export const DOCUMENT_TYPES: readonly DocumentTypeConfig[] = [
  { type: DocumentType.AADHAAR, label: 'Aadhaar' },
  { type: DocumentType.INCOME_CERTIFICATE, label: 'Income Certificate' },
  { type: DocumentType.MARKSHEET, label: 'Marksheet' },
  { type: DocumentType.BANK_PASSBOOK, label: 'Bank Passbook' },
  { type: DocumentType.FEE_RECEIPT, label: 'Fee Receipt' },
  { type: DocumentType.PHOTO, label: 'Photo' },
] as const;
