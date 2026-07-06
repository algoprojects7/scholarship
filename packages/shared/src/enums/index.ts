export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export enum AdminType {
  SUPER = 'SUPER',
  OPERATOR = 'OPERATOR',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ALLOCATED = 'ALLOCATED',
}

export enum DocumentType {
  AADHAAR = 'AADHAAR',
  INCOME_CERTIFICATE = 'INCOME_CERTIFICATE',
  MARKSHEET = 'MARKSHEET',
  BANK_PASSBOOK = 'BANK_PASSBOOK',
  FEE_RECEIPT = 'FEE_RECEIPT',
  PHOTO = 'PHOTO',
}

export enum DocumentVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum ScholarshipType {
  ONE_TIME = 'ONE_TIME',
  YEARLY = 'YEARLY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}

export enum PaymentType {
  YEARLY = 'YEARLY',
  SEMESTER = 'SEMESTER',
  ONE_TIME = 'ONE_TIME',
}

export enum RemarkAction {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  ALLOCATION_CREATED = 'ALLOCATION_CREATED',
  REALLOCATED = 'REALLOCATED',
}
