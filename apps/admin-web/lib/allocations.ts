import {
  PaymentStatus,
  ScholarshipType,
  type ApplicationStatus,
} from "@scholarship/shared";
import { apiFetch } from "./api";

const adminPortal = { auth: true, portal: "admin" as const };

export interface AllocationStudent {
  id: string;
  fullName: string;
  mobile?: string | null;
  countryCode?: string | null;
  user?: { email?: string | null } | null;
}

export interface AllocationApplication {
  id: string;
  applicationNumber?: string | null;
  status: ApplicationStatus;
  academicYear: string;
  student?: AllocationStudent | null;
}

export interface AllocationListItem {
  id: string;
  applicationId: string;
  type: ScholarshipType;
  amount: number;
  academicYear: string;
  paymentStatus: PaymentStatus;
  paymentDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  application?: AllocationApplication | null;
  allocatedBy?: {
    id: string;
    fullName: string;
    employeeId: string;
  } | null;
}

export interface AllocationsListResponse {
  items: AllocationListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListAllocationsParams {
  page?: number;
  limit?: number;
  academicYear?: string;
}

export interface CreateAllocationPayload {
  applicationId: string;
  type: ScholarshipType;
  amount: number;
  academicYear: string;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export interface UpdateAllocationPaymentPayload {
  paymentStatus: PaymentStatus;
  paymentDate?: string;
}

export function listAllocations(params: ListAllocationsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.academicYear) {
    searchParams.set("academicYear", params.academicYear);
  }

  const query = searchParams.toString();
  const path = query ? `/admin/allocations?${query}` : "/admin/allocations";

  return apiFetch<AllocationsListResponse>(path, {
    ...adminPortal,
  });
}

export function createAllocation(payload: CreateAllocationPayload) {
  return apiFetch<AllocationListItem>("/admin/allocations", {
    method: "POST",
    ...adminPortal,
    body: payload,
  });
}

export function updateAllocationPayment(
  id: string,
  payload: UpdateAllocationPaymentPayload,
) {
  return apiFetch<AllocationListItem>(`/admin/allocations/${id}/payment`, {
    method: "PATCH",
    ...adminPortal,
    body: payload,
  });
}
