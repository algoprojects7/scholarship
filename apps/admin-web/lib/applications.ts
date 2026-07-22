import {
  ApplicationStatus,
  DocumentVerificationStatus,
  type DocumentType,
  type RemarkAction,
} from "@scholarship/shared";
import { apiFetch } from "./api";
const adminPortal = { auth: true, portal: "admin" as const };

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
  countryCode?: string;
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
  amountPaid: number | string;
}

export interface AdminApplicationDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  uploadedAt: string;
}

export interface AdminApplicationRemark {
  id: string;
  remark: string;
  action: RemarkAction;
  createdAt: string;
  admin?: {
    id: string;
    fullName?: string | null;
    email?: string | null;
  } | null;
}

export interface AdminApplicationStudent {
  id: string;
  fullName?: string | null;
  email?: string | null;
  mobile?: string | null;
}

export interface AdminApplicationListItem {
  id: string;
  applicationNumber?: string | null;
  studentName: string;
  district?: string | null;
  status: ApplicationStatus;
  submittedAt: string | null;
}

export interface AdminApplicationsListResponse {
  items: AdminApplicationListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListAdminApplicationsParams {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  district?: string;
  academicYear?: string;
}

export interface FamilyMember {
  name: string;
  gender: string;
  relation: string;
  qualification: string;
  occupation: string;
}

export interface FamilyDetails {
  members: FamilyMember[];
  familyMonthlyIncome: number;
  familyMonthlyExpense: number;
}

export interface AdminApplication {
  id: string;
  status: ApplicationStatus;
  academicYear: string;
  applicationNumber?: string | null;
  personalDetails?: any | null;
  educationalDetails?: any | null;
  contactAddress?: any | null;
  bankDetails?: BankDetails | null;
  feeDetails?: FeeDetails | null;
  feePayments?: FeePayment[];
  familyDetails?: FamilyDetails | null;
  documents?: AdminApplicationDocument[];
  remarks?: AdminApplicationRemark[];
  student?: AdminApplicationStudent | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationDecision = "APPROVED" | "REJECTED";

export interface SubmitDecisionPayload {
  decision: ApplicationDecision;
  remark?: string;
}

export interface VerifyDocumentPayload {
  status: DocumentVerificationStatus.VERIFIED | DocumentVerificationStatus.REJECTED;
  rejectionReason?: string;
}

export function listAdminApplications(params: ListAdminApplicationsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }
  if (params.district) {
    searchParams.set("district", params.district);
  }
  if (params.academicYear) {
    searchParams.set("academicYear", params.academicYear);
  }

  const query = searchParams.toString();
  const path = query ? `/admin/applications?${query}` : "/admin/applications";

  return apiFetch<AdminApplicationsListResponse>(path, {
    ...adminPortal,
  });
}

export function getAdminApplication(id: string) {
  return apiFetch<AdminApplication>(`/admin/applications/${id}`, {
    ...adminPortal,
  });
}

export function startReview(id: string) {
  return apiFetch<AdminApplication>(`/admin/applications/${id}/review`, {
    method: "PATCH",
    ...adminPortal,
    body: {},
  });
}

export function submitDecision(id: string, payload: SubmitDecisionPayload) {
  return apiFetch<AdminApplication>(`/admin/applications/${id}/decision`, {
    method: "POST",
    ...adminPortal,
    body: payload,
  });
}

export function verifyDocument(id: string, payload: VerifyDocumentPayload) {
  return apiFetch<AdminApplicationDocument>(`/admin/documents/${id}/verify`, {
    method: "PATCH",
    ...adminPortal,
    body: payload,
  });
}

export interface DocumentPreviewContent {
  previewUrl: string;
  mimeType: string;
  fileName: string;
}

interface AdminDocumentPreviewAccessResponse {
  mode: "url" | "proxy";
  url?: string;
  mimeType: string;
  fileName: string;
}

export async function fetchDocumentPreview(
  documentId: string,
): Promise<DocumentPreviewContent> {
  const access = await apiFetch<AdminDocumentPreviewAccessResponse>(
    `/admin/documents/${documentId}/preview-url`,
    {
      auth: true,
      portal: "admin",
    },
  );

  if (access.mode === "url" && access.url) {
    return {
      previewUrl: access.url,
      mimeType: access.mimeType,
      fileName: access.fileName,
    };
  }

  return {
    previewUrl: `/api/admin/documents/${documentId}/preview`,
    mimeType: access.mimeType,
    fileName: access.fileName,
  };
}

export function getDocumentPreviewHref(document: AdminApplicationDocument): string {
  if (document.fileUrl.startsWith("http")) {
    return document.fileUrl;
  }

  return `/api/admin/documents/${document.id}/preview`;
}
