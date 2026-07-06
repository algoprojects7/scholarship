import { ApplicationStatus } from "@scholarship/shared";
import { apiFetch } from "./api";

export interface AdminDashboardRecentSubmission {
  id: string;
  applicationNumber: string | null;
  studentName: string | null;
  district: string | null;
  status: ApplicationStatus;
  submittedAt: string | null;
}

export interface AdminDashboardDistrictCount {
  district: string;
  count: number;
}

export interface AdminDashboardStats {
  totalApplications: number;
  pendingVerification: number;
  approved: number;
  rejected: number;
  allocated: number;
  totalDisbursed: number;
  recentSubmissions: AdminDashboardRecentSubmission[];
  byDistrict: AdminDashboardDistrictCount[];
}

export function fetchAdminDashboardStats() {
  return apiFetch<AdminDashboardStats>("/admin/dashboard/stats", {
    method: "GET",
    auth: true,
    portal: "admin",
  });
}
