"use client";

import { ApplicationStatus, CURRENT_ACADEMIC_YEAR } from "@scholarship/shared";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  listAdminApplications,
  type AdminApplicationListItem,
  type AdminApplicationsListResponse,
} from "@/lib/applications";

const PAGE_SIZE = 20;

const STATUS_FILTER_OPTIONS: Array<{
  value: "" | ApplicationStatus;
  label: string;
}> = [
  { value: "", label: "All" },
  { value: ApplicationStatus.SUBMITTED, label: "Submitted" },
  { value: ApplicationStatus.UNDER_REVIEW, label: "Under Review" },
  { value: ApplicationStatus.APPROVED, label: "Approved" },
  { value: ApplicationStatus.REJECTED, label: "Rejected" },
  { value: ApplicationStatus.ALLOCATED, label: "Allocated" },
];

const STATUS_BADGE: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  [ApplicationStatus.DRAFT]: {
    label: "Draft",
    className: "border-admin-border bg-admin-bg text-admin-muted",
  },
  [ApplicationStatus.SUBMITTED]: {
    label: "Submitted",
    className: "border-blue-100 bg-blue-50 text-blue-700",
  },
  [ApplicationStatus.UNDER_REVIEW]: {
    label: "Under Review",
    className: "border-amber-100 bg-amber-50 text-amber-700",
  },
  [ApplicationStatus.APPROVED]: {
    label: "Approved",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  [ApplicationStatus.REJECTED]: {
    label: "Rejected",
    className: "border-red-100 bg-red-50 text-red-700",
  },
  [ApplicationStatus.ALLOCATED]: {
    label: "Allocated",
    className: "border-teal-100 bg-teal-50 text-teal-700",
  },
};

function buildAcademicYearOptions(): string[] {
  const startYear = Number.parseInt(CURRENT_ACADEMIC_YEAR.split("-")[0] ?? "2025", 10);
  const years: string[] = [];

  for (let offset = -2; offset <= 1; offset += 1) {
    const year = startYear + offset;
    years.push(`${year}-${String((year + 1) % 100).padStart(2, "0")}`);
  }

  return years;
}

function formatSubmittedAt(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_BADGE[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-2xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function ApplicationsTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.7fr)] gap-4 border-b border-admin-border px-4 py-3 last:border-b-0"
        >
          <span className="h-3 w-20 animate-pulse rounded bg-admin-border" />
          <span className="h-3 w-28 animate-pulse rounded bg-admin-border" />
          <span className="h-3 w-16 animate-pulse rounded bg-admin-border/80" />
          <span className="h-5 w-20 animate-pulse rounded-full bg-admin-border/70" />
          <span className="h-3 w-24 animate-pulse rounded bg-admin-border/80" />
          <span className="h-3 w-12 animate-pulse rounded bg-admin-border/70" />
        </div>
      ))}
    </>
  );
}

function ApplicationRow({ application }: { application: AdminApplicationListItem }) {
  return (
    <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.7fr)] items-center gap-4 border-b border-admin-border px-4 py-3 text-xs last:border-b-0">
      <span className="font-medium text-admin-primary">
        {application.applicationNumber ?? "—"}
      </span>
      <span className="truncate text-admin-primary">{application.studentName}</span>
      <span className="truncate text-admin-muted">
        {application.district ?? "—"}
      </span>
      <StatusBadge status={application.status} />
      <span className="text-admin-muted">{formatSubmittedAt(application.submittedAt)}</span>
      <Link
        href={`/applications/${application.id}`}
        className="font-medium text-admin-accent transition-colors hover:text-admin-accent-hover"
      >
        Review
      </Link>
    </div>
  );
}

export function ApplicationsClient() {
  const academicYearOptions = useMemo(() => buildAcademicYearOptions(), []);

  const [statusFilter, setStatusFilter] = useState<"" | ApplicationStatus>("");
  const [districtInput, setDistrictInput] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AdminApplicationsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDistrictFilter(districtInput.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [districtInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, districtFilter, academicYearFilter]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listAdminApplications({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        district: districtFilter || undefined,
        academicYear: academicYearFilter || undefined,
      });
      setData(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load applications. Please try again.");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [academicYearFilter, districtFilter, page, statusFilter]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const totalPages = data?.totalPages ?? 0;
  const hasResults = (data?.items.length ?? 0) > 0;
  const rangeStart = data && data.total > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const rangeEnd = data ? Math.min(data.page * data.limit, data.total) : 0;

  return (
    <div className="space-y-4">
      <div className="admin-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor="status-filter"
              className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "" | ApplicationStatus)
              }
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="district-filter"
              className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              District
            </label>
            <input
              id="district-filter"
              type="text"
              value={districtInput}
              onChange={(event) => setDistrictInput(event.target.value)}
              placeholder="Filter by district"
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary placeholder:text-admin-muted/60 focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
          </div>

          <div>
            <label
              htmlFor="academic-year-filter"
              className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Academic Year
            </label>
            <select
              id="academic-year-filter"
              value={academicYearFilter}
              onChange={(event) => setAcademicYearFilter(event.target.value)}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            >
              <option value="">All</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          role="alert"
        >
          <p className="font-medium">Could not load applications</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => void loadApplications()}
            className="mt-3 rounded-md border border-red-200 bg-white px-3 py-1.5 text-2xs font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      ) : null}

      <div className="admin-card overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.7fr)] gap-4 border-b border-admin-border bg-admin-bg/50 px-4 py-2.5 text-2xs font-medium uppercase tracking-wide text-admin-muted">
          <span>Application #</span>
          <span>Student Name</span>
          <span>District</span>
          <span>Status</span>
          <span>Submitted</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <ApplicationsTableSkeleton />
        ) : !hasResults ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-admin-primary">
              No applications found
            </p>
            <p className="mt-1 text-xs text-admin-muted">
              Try adjusting your filters or check back later for new submissions.
            </p>
          </div>
        ) : (
          data?.items.map((application) => (
            <ApplicationRow key={application.id} application={application} />
          ))
        )}
      </div>

      {!loading && data && data.total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xs text-admin-muted">
            Showing {rangeStart}–{rangeEnd} of {data.total}
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
