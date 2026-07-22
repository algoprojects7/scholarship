import { DocumentType } from '../enums';

export interface DocumentTypeConfig {
  type: DocumentType;
  label: string;
  isOptional?: boolean;
}

export const DOCUMENT_TYPES: readonly DocumentTypeConfig[] = [
  { type: DocumentType.STUDENT_ID_CARD, label: 'Student ID Card (Allotted from Institute)' },
  { type: DocumentType.ADMISSION_RECEIPT, label: 'Admission Receipt' },
  { type: DocumentType.AADHAAR_STUDENT, label: 'Aadhar Card of the Student' },
  { type: DocumentType.VOTER_ID_STUDENT, label: 'Voter ID card of the Student' },
  { type: DocumentType.NRC_FINAL_DRAFT, label: 'NRC Final Draft of the Student' },
  { type: DocumentType.BANK_ACCOUNT_DETAILS, label: 'Bank Account Details of the Student' },
  { type: DocumentType.PARENT_AADHAAR, label: "Father's/Mother's Aadhar Card" },
  { type: DocumentType.FULL_PHOTO_WITH_APRON, label: 'Full Photo of the Student (with Apron)' },
  { type: DocumentType.COURSE_YEARLY_EXPENSE, label: 'Course Yearly Expense Detail' },
  { type: DocumentType.HOSTEL_PAYMENT_RECEIPT, label: 'Hostel Payment Receipt' },
  { type: DocumentType.BPL_CERTIFICATE, label: 'BPL Certificate (If any)', isOptional: true },
  { type: DocumentType.INCOME_CERTIFICATE, label: 'Income Certificate (If any)', isOptional: true },
] as const;
