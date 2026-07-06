import Link from "next/link";
import { PaymentStatus, ScholarshipType } from "@scholarship/shared";
import type { StudentScholarship } from "@/lib/student";
import {
  formatScholarshipAmount,
  formatScholarshipDate,
} from "@/components/dashboard/ScholarshipCard";

interface PaymentStatusPanelProps {
  scholarship: StudentScholarship;
}

const TYPE_LABELS: Record<ScholarshipType, string> = {
  [ScholarshipType.ONE_TIME]: "One-Time",
  [ScholarshipType.YEARLY]: "Yearly",
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string; description: string }
> = {
  [PaymentStatus.PENDING]: {
    label: "Pending",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    description:
      "Your scholarship has been allocated. Payment is being processed by your organization.",
  },
  [PaymentStatus.PARTIAL]: {
    label: "Partially Paid",
    className: "bg-blue-50 text-blue-800 border-blue-200",
    description:
      "A partial payment has been recorded. The remaining balance may be disbursed separately.",
  },
  [PaymentStatus.PAID]: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description:
      "Your scholarship payment has been completed for this allocation.",
  },
};

export function PaymentStatusPanel({ scholarship }: PaymentStatusPanelProps) {
  const paymentMeta = PAYMENT_STATUS_CONFIG[scholarship.paymentStatus];

  return (
    <div className="space-y-6">
      <div
        className={`card border-2 ${
          scholarship.paymentStatus === PaymentStatus.PAID
            ? "border-emerald-200"
            : scholarship.paymentStatus === PaymentStatus.PARTIAL
              ? "border-blue-200"
              : "border-amber-200"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current Payment Status
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">
              {paymentMeta.label}
            </h2>
          </div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${paymentMeta.className}`}
          >
            {paymentMeta.label}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {paymentMeta.description}
        </p>

        <p className="mt-6 text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
          {formatScholarshipAmount(scholarship.amount)}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Scholarship Type
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
              {TYPE_LABELS[scholarship.type]}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Academic Year
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
              {scholarship.academicYear}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Application Number
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
              {scholarship.applicationNumber ?? "Not assigned"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Allocated On
            </dt>
            <dd className="mt-1 text-sm text-[var(--color-foreground)]">
              {formatScholarshipDate(scholarship.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Last Updated
            </dt>
            <dd className="mt-1 text-sm text-[var(--color-foreground)]">
              {formatScholarshipDate(scholarship.updatedAt)}
            </dd>
          </div>
          {scholarship.paymentStatus === PaymentStatus.PAID &&
          scholarship.paymentDate ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Payment Date
              </dt>
              <dd className="mt-1 text-sm font-medium text-emerald-700">
                {formatScholarshipDate(scholarship.paymentDate)}
              </dd>
            </div>
          ) : null}
        </dl>

        {scholarship.notes ? (
          <div className="mt-6 rounded-xl border border-border bg-surface/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Organization Notes
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-foreground)]">
              {scholarship.notes}
            </p>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
          Payment progress
        </h3>
        <ol className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {(
            [
              PaymentStatus.PENDING,
              PaymentStatus.PARTIAL,
              PaymentStatus.PAID,
            ] as const
          ).map((step, index) => {
            const stepIndex = [
              PaymentStatus.PENDING,
              PaymentStatus.PARTIAL,
              PaymentStatus.PAID,
            ].indexOf(scholarship.paymentStatus);
            const isComplete = stepIndex > index;
            const isCurrent = scholarship.paymentStatus === step;

            return (
              <li
                key={step}
                className="flex flex-1 items-center gap-3 sm:flex-col sm:text-center"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isComplete
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span className="text-sm font-medium text-[var(--color-foreground)]">
                  {PAYMENT_STATUS_CONFIG[step].label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <Link href="/application-status" className="btn-secondary inline-flex">
        View Application Status
      </Link>
    </div>
  );
}
