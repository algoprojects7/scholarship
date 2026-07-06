import { DocumentType } from "@scholarship/shared";
import { apiFetch, apiFetchFormData } from "./api";

export interface PersonalDetails {
  studentName: string;
  fatherName: string;
  fatherProfession: string;
  motherName: string;
  motherProfession: string;
  religion: string;
}

export interface EducationalDetails {
  readingYear: string;
  institutionName: string;
  courseName: string;
  batch: string;
}

export interface ContactAddress {
  countryCode: "+91";
  mobile: string;
  village: string;
  po: string;
  district: string;
  pin: string;
  state: string;
}

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
}

export interface FeeDetails {
  paymentType: string;
}

export interface FeePayment {
  year: number;
  amountPaid: number;
}

export interface ApplicationDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  verificationStatus: string;
  uploadedAt: string;
}

export interface Application {
  id: string;
  status: string;
  academicYear: string;
  applicationNumber?: string | null;
  personalDetails?: PersonalDetails | null;
  educationalDetails?: EducationalDetails | null;
  contactAddress?: ContactAddress | null;
  bankDetails?: BankDetails | null;
  feeDetails?: FeeDetails | null;
  feePayments?: FeePayment[];
  documents?: ApplicationDocument[];
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateApplicationPayload {
  personalDetails?: PersonalDetails;
  educationalDetails?: EducationalDetails;
  contactAddress?: ContactAddress;
  bankDetails?: BankDetails;
  feeDetails?: FeeDetails;
  feePayments?: FeePayment[];
}

export interface SubmitApplicationResponse {
  id: string;
  status: string;
  applicationNumber: string;
  submittedAt: string;
}

const studentPortal = { auth: true, portal: "student" as const };

export function createApplication(academicYear?: string) {
  return apiFetch<Application>("/applications", {
    method: "POST",
    ...studentPortal,
    body: academicYear ? { academicYear } : {},
  });
}

export function getMyApplications() {
  return apiFetch<Application[]>("/applications/mine", {
    ...studentPortal,
  });
}

export function getApplication(id: string) {
  return apiFetch<Application>(`/applications/${id}`, {
    ...studentPortal,
  });
}

export function updateApplication(id: string, data: UpdateApplicationPayload) {
  return apiFetch<Application>(`/applications/${id}`, {
    method: "PATCH",
    ...studentPortal,
    body: data,
  });
}

export function submitApplication(id: string) {
  return apiFetch<SubmitApplicationResponse>(`/applications/${id}/submit`, {
    method: "POST",
    ...studentPortal,
    body: {},
  });
}

export function uploadDocument(
  applicationId: string,
  documentType: DocumentType,
  file: File,
) {
  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("file", file);

  return apiFetchFormData<ApplicationDocument>(
    `/applications/${applicationId}/documents`,
    {
      method: "POST",
      ...studentPortal,
      body: formData,
    },
  );
}
