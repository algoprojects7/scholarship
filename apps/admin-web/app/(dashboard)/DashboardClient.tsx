"use client";

import { ApplicationStatus } from "@scholarship/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ApiError } from "@/lib/api";
import {
  fetchAdminDashboardStats,
  type AdminDashboardStats,
} from "@/lib/admin";
import { clearAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

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

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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

function formatLastUpdated(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(value);
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-admin-border" />
          <div className="h-3 w-56 animate-pulse rounded bg-admin-border/70" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-36 animate-pulse rounded bg-admin-border/70" />
          <div className="h-7 w-16 animate-pulse rounded bg-admin-border/70" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="admin-card h-24 animate-pulse bg-admin-bg/60" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="admin-card h-72 animate-pulse bg-admin-bg/60 lg:col-span-3" />
        <div className="admin-card h-72 animate-pulse bg-admin-bg/60 lg:col-span-2" />
      </div>
    </div>
  );
}

function DistrictBreakdown({
  items,
  maxCount,
}: {
  items: AdminDashboardStats["byDistrict"];
  maxCount: number;
}) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-xs text-admin-muted">
        No district data yet.
      </p>
    );
  }

  return (
    <div className="space-y-3 px-4 py-4">
      {items.map((item) => {
        const width =
          maxCount > 0 ? Math.max((item.count / maxCount) * 100, 4) : 0;

        return (
          <div key={item.district} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-medium text-admin-primary">
                {item.district}
              </span>
              <span className="shrink-0 tabular-nums text-admin-muted">
                {formatCount(item.count)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-admin-bg">
              <div
                className="h-full rounded-full bg-admin-accent transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminDashboardStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          clearAccessToken();
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Unable to load dashboard stats. Please try again.");
      }
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const maxDistrictCount = useMemo(
    () =>
      stats?.byDistrict.reduce((max, item) => Math.max(max, item.count), 0) ??
      0,
    [stats?.byDistrict],
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="admin-card border-red-200 bg-red-50/50 p-6">
        <h2 className="text-sm font-semibold text-red-800">
          Could not load dashboard
        </h2>
        <p className="mt-2 text-xs text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          className="mt-4 rounded-md bg-admin-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-admin-accent-hover"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="admin-page-title">Key Metrics</h2>
          <p className="admin-page-subtitle mt-0.5">
            Cached stats refresh every 5 minutes
          </p>
        </div>
        <div className="flex items-center gap-2 text-2xs text-admin-muted">
          <span className="rounded border border-admin-border bg-admin-surface px-2 py-1">
            Last updated:{" "}
            {lastUpdated ? formatLastUpdated(lastUpdated) : "—"}
          </span>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="rounded border border-admin-border bg-admin-surface px-2 py-1 font-medium text-admin-primary transition-colors hover:bg-admin-bg"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Total Applications"
          value={formatCount(stats.totalApplications)}
          hint="All time submissions"
        />
        <KpiCard
          label="Pending Verification"
          value={formatCount(stats.pendingVerification)}
          hint="Submitted + under review"
          accent="warning"
        />
        <KpiCard
          label="Approved"
          value={formatCount(stats.approved)}
          hint="Awaiting allocation"
          accent="success"
        />
        <KpiCard
          label="Rejected"
          value={formatCount(stats.rejected)}
          accent="danger"
        />
        <KpiCard
          label="Allocated"
          value={formatCount(stats.allocated)}
          hint="Scholarships assigned"
          accent="success"
        />
        <KpiCard
          label="Total Disbursed"
          value={formatInr(stats.totalDisbursed)}
          hint="Cumulative amount"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="admin-card lg:col-span-3">
          <div className="border-b border-admin-border px-4 py-3">
            <h3 className="text-xs font-semibold text-admin-primary">
              Applications by District
            </h3>
            <p className="text-2xs text-admin-muted">
              Non-draft applications grouped by district
            </p>
          </div>
          <DistrictBreakdown
            items={stats.byDistrict}
            maxCount={maxDistrictCount}
          />
        </div>

        <div className="admin-card lg:col-span-2">
          <div className="border-b border-admin-border px-4 py-3">
            <h3 className="text-xs font-semibold text-admin-primary">
              Recent Submissions
            </h3>
            <p className="text-2xs text-admin-muted">Last 10 applications</p>
          </div>

          {stats.recentSubmissions.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-admin-muted">
              No submissions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-admin-border bg-admin-bg/50 text-2xs font-medium uppercase tracking-wide text-admin-muted">
                    <th className="px-4 py-2.5">App No.</th>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5">District</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {stats.recentSubmissions.map((submission) => (
                    <tr key={submission.id} className="text-admin-primary">
                      <td className="px-4 py-2.5 font-medium tabular-nums">
                        {submission.applicationNumber ?? "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {submission.studentName ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-admin-muted">
                        {submission.district ?? "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="px-4 py-2.5 text-admin-muted">
                        {formatSubmittedAt(submission.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
