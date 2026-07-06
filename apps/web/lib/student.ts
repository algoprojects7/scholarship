import {
  ApplicationStatus,
  PaymentStatus,
  RemarkAction,
  ScholarshipType,
  type DocumentType,
} from "@scholarship/shared";
import { apiFetch } from "./api";

export interface DashboardStudent {
  fullName: string;
  email: string;
  countryCode: string;
  mobile: string;
}

export interface DashboardApplication {
  id: string;
  applicationNumber: string | null;
  status: ApplicationStatus;
  academicYear: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadStatus {
  documentType: DocumentType;
  uploaded: boolean;
}

export interface DashboardRemark {
  id: string;
  remark: string;
  action: RemarkAction;
  createdAt: string;
}

export interface StudentScholarship {
  id: string;
  type: ScholarshipType;
  amount: string;
  academicYear: string;
  paymentStatus: PaymentStatus;
  paymentDate: string | null;
  notes: string | null;
  applicationNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDashboardData {
  student: DashboardStudent;
  application: DashboardApplication | null;
  remarks: DashboardRemark[];
  documentsStatus: DocumentUploadStatus[];
  scholarship?: StudentScholarship | null;
}

export interface StudentScholarshipResponse {
  scholarship: StudentScholarship | null;
}

export function fetchStudentDashboard() {
  return apiFetch<StudentDashboardData>("/student/dashboard", {
    method: "GET",
    auth: true,
    portal: "student",
  });
}

export function fetchStudentScholarship() {
  return apiFetch<StudentScholarshipResponse>("/student/scholarship", {
    method: "GET",
    auth: true,
    portal: "student",
  });
}
