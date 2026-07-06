import Link from "next/link";
import { ApplicationStatus } from "@scholarship/shared";
import type { DashboardApplication } from "@/lib/student";

interface ApplicationStatusCardProps {
  application: DashboardApplication | null;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  [ApplicationStatus.DRAFT]: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  [ApplicationStatus.SUBMITTED]: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700",
  },
  [ApplicationStatus.UNDER_REVIEW]: {
    label: "Under Review",
    className: "bg-amber-50 text-amber-700",
  },
  [ApplicationStatus.APPROVED]: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700",
  },
  [ApplicationStatus.REJECTED]: {
    label: "Rejected",
    className: "bg-red-50 text-red-700",
  },
  [ApplicationStatus.ALLOCATED]: {
    label: "Allocated",
    className: "bg-primary-muted text-primary",
  },
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export function ApplicationStatusCard({
  application,
}: ApplicationStatusCardProps) {
  if (!application) {
    return (
      <div className="card border-dashed">
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">
          No Application Yet
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You haven&apos;t started a scholarship application. Begin now to
          submit your details and documents.
        </p>
        <Link href="/application" className="btn-primary mt-5">
          Start Application
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_CONFIG[application.status];

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">
          Application Status
        </h2>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Application Number
          </dt>
          <dd className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
            {application.applicationNumber ?? "Not assigned yet"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Academic Year
          </dt>
          <dd className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
            {application.academicYear}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Submitted
          </dt>
          <dd className="mt-1 text-sm text-[var(--color-foreground)]">
            {formatDate(application.submittedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last Reviewed
          </dt>
          <dd className="mt-1 text-sm text-[var(--color-foreground)]">
            {formatDate(application.reviewedAt)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
