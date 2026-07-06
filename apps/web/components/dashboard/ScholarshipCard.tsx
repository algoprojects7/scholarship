import Link from "next/link";
import { PaymentStatus, ScholarshipType } from "@scholarship/shared";
import type { StudentScholarship } from "@/lib/student";

interface ScholarshipCardProps {
  scholarship: StudentScholarship;
  showViewDetailsLink?: boolean;
}

const TYPE_LABELS: Record<ScholarshipType, string> = {
  [ScholarshipType.ONE_TIME]: "One-Time",
  [ScholarshipType.YEARLY]: "Yearly",
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  [PaymentStatus.PENDING]: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700",
  },
  [PaymentStatus.PARTIAL]: {
    label: "Partial",
    className: "bg-blue-50 text-blue-700",
  },
  [PaymentStatus.PAID]: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700",
  },
};

export function formatScholarshipAmount(amount: string): string {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return `₹${amount}`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatScholarshipDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export function ScholarshipCard({
  scholarship,
  showViewDetailsLink = false,
}: ScholarshipCardProps) {
  const paymentMeta = PAYMENT_STATUS_CONFIG[scholarship.paymentStatus];
  const showPaymentDate =
    scholarship.paymentStatus === PaymentStatus.PAID && scholarship.paymentDate;

  return (
    <div className="card border-primary/20 bg-gradient-to-br from-surface to-primary-muted/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Scholarship Allocation
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--color-foreground)]">
            {TYPE_LABELS[scholarship.type]} Scholarship
          </h2>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentMeta.className}`}
        >
          {paymentMeta.label}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
        {formatScholarshipAmount(scholarship.amount)}
      </p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Academic Year
          </dt>
          <dd className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
            {scholarship.academicYear}
          </dd>
        </div>
        {showPaymentDate ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payment Date
            </dt>
            <dd className="mt-1 text-sm text-[var(--color-foreground)]">
              {formatScholarshipDate(scholarship.paymentDate)}
            </dd>
          </div>
        ) : null}
      </dl>

      {scholarship.notes ? (
        <div className="mt-4 rounded-xl border border-border bg-surface/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Notes
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-foreground)]">
            {scholarship.notes}
          </p>
        </div>
      ) : null}

      {showViewDetailsLink ? (
        <Link href="/payment" className="btn-secondary mt-5">
          View Payment Status
        </Link>
      ) : null}
    </div>
  );
}
