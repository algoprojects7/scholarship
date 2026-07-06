import {
  ApplicationStatus,
  DocumentVerificationStatus,
  type DocumentType,
  type RemarkAction,
} from "@scholarship/shared";
import { ApiError, apiFetch } from "./api";
import { getAccessToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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

export interface AdminApplication {
  id: string;
  status: ApplicationStatus;
  academicYear: string;
  applicationNumber?: string | null;
  personalDetails?: PersonalDetails | null;
  educationalDetails?: EducationalDetails | null;
  contactAddress?: ContactAddress | null;
  bankDetails?: BankDetails | null;
  feeDetails?: FeeDetails | null;
  feePayments?: FeePayment[];
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

export async function openDocumentPreview(documentId: string): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}/documents/${documentId}/preview`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-Portal": "admin",
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload.message === "string"
        ? payload.message
        : Array.isArray(payload.message)
          ? payload.message.join(", ")
          : "Unable to preview document";

    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
