import { AdminType } from "@scholarship/shared";
import { apiFetch } from "./api";

const adminPortal = { auth: true, portal: "admin" as const };

export interface AdminListItem {
  id: string;
  adminType: AdminType;
  fullName: string;
  employeeId: string;
  department?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  user?: {
    email: string;
    isActive?: boolean;
  } | null;
}

export interface AdminsListResponse {
  items: AdminListItem[];
}

export interface CreateAdminPayload {
  fullName: string;
  employeeId: string;
  email: string;
  countryCode?: string;
  phone?: string;
  department?: string;
  password: string;
  adminType?: AdminType;
}

export interface UpdateAdminPayload {
  fullName?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
}

export function listAdmins() {
  return apiFetch<AdminsListResponse>("/admin/admins", {
    ...adminPortal,
  });
}

export function createAdmin(payload: CreateAdminPayload) {
  return apiFetch<AdminListItem>("/admin/admins", {
    method: "POST",
    ...adminPortal,
    body: {
      ...payload,
      adminType: payload.adminType ?? AdminType.OPERATOR,
      countryCode: payload.countryCode ?? "+91",
    },
  });
}

export function updateAdmin(id: string, payload: UpdateAdminPayload) {
  return apiFetch<AdminListItem>(`/admin/admins/${id}`, {
    method: "PATCH",
    ...adminPortal,
    body: payload,
  });
}
