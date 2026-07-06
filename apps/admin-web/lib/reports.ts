import { ApplicationStatus } from "@scholarship/shared";
import { ApiError } from "./api";
import { getAccessToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ReportFormat = "pdf" | "xlsx";

export type ReportType =
  | "applications"
  | "allocations"
  | "district"
  | "status";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: ApplicationStatus;
  district?: string;
  academicYear?: string;
}

export interface ExportReportParams {
  type: ReportType;
  format: ReportFormat;
  filters?: ReportFilters;
}

function parseFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  const plainMatch = contentDisposition.match(/filename=([^;]+)/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim();
  }

  return null;
}

function defaultFilename(type: ReportType, format: ReportFormat): string {
  const extension = format === "pdf" ? "pdf" : "xlsx";
  return `${type}-report.${extension}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function exportReport(params: ExportReportParams): Promise<void> {
  const searchParams = new URLSearchParams({
    type: params.type,
    format: params.format,
  });

  const filters = params.filters;
  if (filters?.dateFrom) {
    searchParams.set("dateFrom", filters.dateFrom);
  }
  if (filters?.dateTo) {
    searchParams.set("dateTo", filters.dateTo);
  }
  if (filters?.status) {
    searchParams.set("status", filters.status);
  }
  if (filters?.district) {
    searchParams.set("district", filters.district);
  }
  if (filters?.academicYear) {
    searchParams.set("academicYear", filters.academicYear);
  }

  const token = getAccessToken();
  const response = await fetch(
    `${API_URL}/admin/reports/export?${searchParams.toString()}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-Portal": "admin",
      },
    },
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload.message === "string"
        ? payload.message
        : Array.isArray(payload.message)
          ? payload.message.join(", ")
          : "Unable to export report";

    throw new ApiError(
      message,
      response.status,
      typeof payload.code === "string" ? payload.code : undefined,
    );
  }

  const blob = await response.blob();
  const filename =
    parseFilename(response.headers.get("Content-Disposition")) ??
    defaultFilename(params.type, params.format);

  triggerDownload(blob, filename);
}
