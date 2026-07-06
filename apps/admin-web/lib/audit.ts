import { apiFetch } from "./api";

const adminPortal = { auth: true, portal: "admin" as const };

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
  admin?: {
    id?: string;
    fullName?: string | null;
  } | null;
}

export interface AuditLogsResponse {
  items: AuditLogEntry[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FetchAuditLogsParams {
  page?: number;
  limit?: number;
}

export function fetchAuditLogs(params: FetchAuditLogsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  const path = query ? `/admin/audit-logs?${query}` : "/admin/audit-logs";

  return apiFetch<AuditLogsResponse>(path, {
    ...adminPortal,
  });
}

export function fetchMyAuditLogs(params: FetchAuditLogsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  const path = query
    ? `/admin/audit-logs/mine?${query}`
    : "/admin/audit-logs/mine";

  return apiFetch<AuditLogsResponse>(path, {
    ...adminPortal,
  });
}
