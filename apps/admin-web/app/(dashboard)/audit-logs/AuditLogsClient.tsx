"use client";

import { AdminType } from "@scholarship/shared";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  fetchAuditLogs,
  fetchMyAuditLogs,
  type AuditLogEntry,
  type AuditLogsResponse,
} from "@/lib/audit";
import { getMe } from "@/lib/auth";

const PAGE_SIZE = 30;

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatEntity(entry: AuditLogEntry): string {
  const type = entry.entityType?.replace(/_/g, " ") ?? "—";
  if (entry.entityId) {
    return `${type} (${entry.entityId.slice(0, 8)}…)`;
  }
  return type;
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ");
}

function AuditLogsTableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] gap-4 border-b border-admin-border px-4 py-3 last:border-b-0"
        >
          {Array.from({ length: 4 }).map((__, cellIndex) => (
            <span
              key={cellIndex}
              className="h-3 animate-pulse rounded bg-admin-border"
            />
          ))}
        </div>
      ))}
    </>
  );
}

function AuditLogRow({
  entry,
  showAdminName,
}: {
  entry: AuditLogEntry;
  showAdminName: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] items-center gap-4 border-b border-admin-border px-4 py-3 text-xs last:border-b-0">
      <time className="text-admin-muted">{formatTimestamp(entry.createdAt)}</time>
      <span className="font-medium uppercase tracking-wide text-admin-primary">
        {formatAction(entry.action)}
      </span>
      <span className="truncate text-admin-muted">{formatEntity(entry)}</span>
      <span className="truncate text-admin-muted">
        {showAdminName
          ? (entry.admin?.fullName ?? "System")
          : "—"}
      </span>
    </div>
  );
}

export function AuditLogsClient() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getMe()
      .then((response) => {
        setIsSuperAdmin(response.user.adminType === AdminType.SUPER);
      })
      .catch(() => {
        setIsSuperAdmin(false);
      });
  }, []);

  const loadLogs = useCallback(async () => {
    if (isSuperAdmin === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetcher = isSuperAdmin ? fetchAuditLogs : fetchMyAuditLogs;
      const response = await fetcher({ page, limit: PAGE_SIZE });
      setData(response);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load audit logs. Please try again.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, page]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const totalPages = data?.meta?.totalPages ?? 1;
  const hasResults = (data?.items.length ?? 0) > 0;
  const total = data?.meta?.total ?? data?.items.length ?? 0;
  const rangeStart =
    data?.meta && data.meta.total > 0
      ? (data.meta.page - 1) * data.meta.limit + 1
      : hasResults
        ? 1
        : 0;
  const rangeEnd = data?.meta
    ? Math.min(data.meta.page * data.meta.limit, data.meta.total)
    : data?.items.length ?? 0;

  if (isSuperAdmin === null) {
    return (
      <div className="admin-card overflow-hidden">
        <AuditLogsTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-admin-muted">
        {isSuperAdmin
          ? "Full audit trail across all admin actions"
          : "Your recent admin actions"}
      </p>

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          role="alert"
        >
          <p className="font-medium">Could not load audit logs</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => void loadLogs()}
            className="mt-3 rounded-md border border-red-200 bg-white px-3 py-1.5 text-2xs font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      ) : null}

      <div className="admin-card overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] gap-4 border-b border-admin-border bg-admin-bg/50 px-4 py-2.5 text-2xs font-medium uppercase tracking-wide text-admin-muted">
          <span>Timestamp</span>
          <span>Action</span>
          <span>Entity</span>
          <span>Admin</span>
        </div>

        {loading ? (
          <AuditLogsTableSkeleton />
        ) : !hasResults ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-admin-primary">No audit logs</p>
            <p className="mt-1 text-xs text-admin-muted">
              Admin actions will appear here as they occur.
            </p>
          </div>
        ) : (
          data?.items.map((entry) => (
            <AuditLogRow
              key={entry.id}
              entry={entry}
              showAdminName={isSuperAdmin}
            />
          ))
        )}
      </div>

      {!loading && hasResults && data?.meta && data.meta.total > PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xs text-admin-muted">
            Showing {rangeStart}–{rangeEnd} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 text-2xs font-medium text-admin-primary transition-colors hover:bg-admin-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-2xs text-admin-muted">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 text-2xs font-medium text-admin-primary transition-colors hover:bg-admin-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
