"use client";

import {
  CURRENT_ACADEMIC_YEAR,
  PaymentStatus,
  ScholarshipType,
} from "@scholarship/shared";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  listAllocations,
  updateAllocationPayment,
  type AllocationListItem,
  type AllocationsListResponse,
} from "@/lib/allocations";

const PAGE_SIZE = 20;

const SCHOLARSHIP_TYPE_LABELS: Record<ScholarshipType, string> = {
  [ScholarshipType.ONE_TIME]: "One-Time",
  [ScholarshipType.YEARLY]: "Yearly",
};

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.PARTIAL,
  PaymentStatus.PAID,
];

function buildAcademicYearOptions(): string[] {
  const startYear = Number.parseInt(
    CURRENT_ACADEMIC_YEAR.split("-")[0] ?? "2025",
    10,
  );
  const years: string[] = [];

  for (let offset = -2; offset <= 1; offset += 1) {
    const year = startYear + offset;
    years.push(`${year}-${String((year + 1) % 100).padStart(2, "0")}`);
  }

  return years;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStudentName(allocation: AllocationListItem): string {
  return (
    allocation.application?.student?.fullName ??
    allocation.application?.student?.user?.email ??
    "—"
  );
}

function AllocationsTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] gap-4 border-b border-admin-border px-4 py-3 last:border-b-0"
        >
          {Array.from({ length: 7 }).map((__, cellIndex) => (
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

function PaymentStatusSelect({
  allocation,
  onUpdate,
}: {
  allocation: AllocationListItem;
  onUpdate: (id: string, status: PaymentStatus) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (nextStatus: PaymentStatus) => {
    if (nextStatus === allocation.paymentStatus) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await onUpdate(allocation.id, nextStatus);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to update payment status.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0">
      <select
        value={allocation.paymentStatus}
        disabled={busy}
        onChange={(event) =>
          void handleChange(event.target.value as PaymentStatus)
        }
        className="w-full rounded-md border border-admin-border bg-admin-bg px-2 py-1 text-2xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30 disabled:opacity-60"
        aria-label={`Payment status for ${getStudentName(allocation)}`}
      >
        {PAYMENT_STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-0.5 text-[10px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function AllocationRow({
  allocation,
  onPaymentUpdate,
}: {
  allocation: AllocationListItem;
  onPaymentUpdate: (id: string, status: PaymentStatus) => Promise<void>;
}) {
  const applicationId = allocation.application?.id ?? allocation.applicationId;

  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] items-center gap-4 border-b border-admin-border px-4 py-3 text-xs last:border-b-0">
      <span className="truncate font-medium text-admin-primary">
        {getStudentName(allocation)}
      </span>
      <span className="truncate text-admin-muted">
        {allocation.application?.applicationNumber ?? "—"}
      </span>
      <span className="text-admin-primary">
        {SCHOLARSHIP_TYPE_LABELS[allocation.type] ?? allocation.type}
      </span>
      <span className="font-medium tabular-nums text-admin-primary">
        {formatCurrency(allocation.amount)}
      </span>
      <span className="text-admin-muted">{allocation.academicYear}</span>
      <PaymentStatusSelect allocation={allocation} onUpdate={onPaymentUpdate} />
      <Link
        href={`/applications/${applicationId}`}
        className="font-medium text-admin-accent transition-colors hover:text-admin-accent-hover"
      >
        View
      </Link>
    </div>
  );
}

export function AllocationsClient() {
  const academicYearOptions = useMemo(() => buildAcademicYearOptions(), []);
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AllocationsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [academicYearFilter]);

  const loadAllocations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listAllocations({
        page,
        limit: PAGE_SIZE,
        academicYear: academicYearFilter || undefined,
      });
      setData(response);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load allocations. Please try again.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [academicYearFilter, page]);

  useEffect(() => {
    void loadAllocations();
  }, [loadAllocations]);

  const handlePaymentUpdate = async (id: string, paymentStatus: PaymentStatus) => {
    const updated = await updateAllocationPayment(id, { paymentStatus });

    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) => (item.id === id ? updated : item)),
      };
    });
  };

  const totalPages = data?.meta.totalPages ?? 0;
  const hasResults = (data?.items.length ?? 0) > 0;
  const rangeStart =
    data && data.meta.total > 0 ? (data.meta.page - 1) * data.meta.limit + 1 : 0;
  const rangeEnd = data
    ? Math.min(data.meta.page * data.meta.limit, data.meta.total)
    : 0;

  return (
    <div className="space-y-4">
      <div className="admin-card p-4">
        <div className="max-w-xs">
          <label
            htmlFor="allocation-academic-year-filter"
            className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
          >
            Academic Year
          </label>
          <select
            id="allocation-academic-year-filter"
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

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          role="alert"
        >
          <p className="font-medium">Could not load allocations</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => void loadAllocations()}
            className="mt-3 rounded-md border border-red-200 bg-white px-3 py-1.5 text-2xs font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      ) : null}

      <div className="admin-card overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] gap-4 border-b border-admin-border bg-admin-bg/50 px-4 py-2.5 text-2xs font-medium uppercase tracking-wide text-admin-muted">
          <span>Student</span>
          <span>App #</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Academic Year</span>
          <span>Payment Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <AllocationsTableSkeleton />
        ) : !hasResults ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-admin-primary">
              No allocations found
            </p>
            <p className="mt-1 text-xs text-admin-muted">
              Approved applications can be allocated from the application review
              page.
            </p>
          </div>
        ) : (
          data?.items.map((allocation) => (
            <AllocationRow
              key={allocation.id}
              allocation={allocation}
              onPaymentUpdate={handlePaymentUpdate}
            />
          ))
        )}
      </div>

      {!loading && data && data.meta.total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xs text-admin-muted">
            Showing {rangeStart}–{rangeEnd} of {data.meta.total}
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
