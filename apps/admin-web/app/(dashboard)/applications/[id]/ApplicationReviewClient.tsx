"use client";

import {
  ApplicationStatus,
  CURRENT_ACADEMIC_YEAR,
  DOCUMENT_TYPES,
  DocumentVerificationStatus,
  PaymentStatus,
  PaymentType,
  RemarkAction,
  ScholarshipType,
} from "@scholarship/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import type { AdminApplication, AdminApplicationDocument } from "@/lib/applications";
import {
  getAdminApplication,
  fetchDocumentPreview,
  startReview,
  submitDecision,
  verifyDocument,
  type DocumentPreviewContent,
} from "@/lib/applications";
import { createAllocation } from "@/lib/allocations";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";

type TabId =
  | "personal"
  | "education"
  | "contact"
  | "bank"
  | "fees"
  | "family"
  | "documents"
  | "history";

const TABS: { id: TabId; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
  { id: "bank", label: "Bank" },
  { id: "fees", label: "Fees" },
  { id: "family", label: "Family" },
  { id: "documents", label: "Documents" },
  { id: "history", label: "History" },
];

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.YEARLY]: "Yearly",
  [PaymentType.SEMESTER]: "Semester",
  [PaymentType.ONE_TIME]: "One Time",
};

const REMARK_ACTION_LABELS: Record<RemarkAction, string> = {
  [RemarkAction.SUBMITTED]: "Submitted",
  [RemarkAction.UNDER_REVIEW]: "Under Review",
  [RemarkAction.APPROVED]: "Approved",
  [RemarkAction.REJECTED]: "Rejected",
  [RemarkAction.DOCUMENT_REJECTED]: "Document Rejected",
  [RemarkAction.ALLOCATION_CREATED]: "Allocation Created",
  [RemarkAction.REALLOCATED]: "Reallocated",
};

const FEE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;

type ApplicationReviewClientProps = {
  applicationId: string;
};

type ToastState = {
  message: string;
  tone: "success" | "error";
} | null;

function formatCurrency(value: number | string): string {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(amount)) {
    return "—";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStudentName(application: AdminApplication): string {
  return (
    application.personalDetails?.studentName ??
    application.student?.fullName ??
    "—"
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    [ApplicationStatus.DRAFT]: "bg-slate-100 text-slate-700",
    [ApplicationStatus.SUBMITTED]: "bg-amber-50 text-amber-800 ring-amber-200",
    [ApplicationStatus.UNDER_REVIEW]: "bg-sky-50 text-sky-800 ring-sky-200",
    [ApplicationStatus.APPROVED]: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    [ApplicationStatus.REJECTED]: "bg-red-50 text-red-800 ring-red-200",
    [ApplicationStatus.ALLOCATED]: "bg-teal-50 text-teal-800 ring-teal-200",
  };

  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide ring-1 ring-inset ${styles[status]}`}
    >
      {label}
    </span>
  );
}

function DocumentStatusBadge({
  status,
}: {
  status: DocumentVerificationStatus;
}) {
  const styles: Record<DocumentVerificationStatus, string> = {
    [DocumentVerificationStatus.PENDING]: "bg-amber-50 text-amber-800",
    [DocumentVerificationStatus.VERIFIED]: "bg-emerald-50 text-emerald-800",
    [DocumentVerificationStatus.REJECTED]: "bg-red-50 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-2xs font-medium uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid gap-0.5 border-b border-admin-border py-2.5 sm:grid-cols-[160px_1fr]">
      <dt className="text-2xs font-medium uppercase tracking-wide text-admin-muted">
        {label}
      </dt>
      <dd className="text-xs text-admin-primary">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

function ReadOnlySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card">
      <div className="border-b border-admin-border px-4 py-2.5">
        <h3 className="text-xs font-semibold text-admin-primary">{title}</h3>
      </div>
      <dl className="px-4">{children}</dl>
    </section>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  if (!toast) {
    return null;
  }

  const toneStyles =
    toast.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-xs shadow-lg ${toneStyles}`}
      role="status"
    >
      <p className="flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 font-medium opacity-70 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

function DocumentsTab({
  documents,
  canVerify,
  onVerify,
  onPreview,
  busyDocumentId,
  previewingDocumentId,
}: {
  documents: AdminApplicationDocument[];
  canVerify: boolean;
  onVerify: (
    documentId: string,
    status: DocumentVerificationStatus.VERIFIED | DocumentVerificationStatus.REJECTED,
    rejectionReason?: string,
  ) => Promise<void>;
  onPreview: (document: AdminApplicationDocument) => void;
  busyDocumentId: string | null;
  previewingDocumentId: string | null;
}) {
  const documentsByType = useMemo(
    () => new Map(documents.map((document) => [document.documentType, document])),
    [documents],
  );

  return (
    <div className="admin-card overflow-hidden">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-3 border-b border-admin-border bg-admin-bg/50 px-4 py-2 text-2xs font-medium uppercase tracking-wide text-admin-muted">
        <span>Document</span>
        <span>File</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>

      {DOCUMENT_TYPES.map(({ type, label }) => {
        const document = documentsByType.get(type);
        const isBusy = document ? busyDocumentId === document.id : false;
        const isPreviewing = document ? previewingDocumentId === document.id : false;

        return (
          <div
            key={type}
            className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-3 border-b border-admin-border px-4 py-3 last:border-b-0"
          >
            <div>
              <p className="text-xs font-medium text-admin-primary">{label}</p>
              {document?.rejectionReason ? (
                <p className="mt-0.5 text-2xs text-red-600">
                  {document.rejectionReason}
                </p>
              ) : null}
            </div>

            <p className="truncate text-2xs text-admin-muted">
              {document?.fileName ?? "Not uploaded"}
            </p>

            <div>
              {document ? (
                <DocumentStatusBadge status={document.verificationStatus} />
              ) : (
                <span className="text-2xs text-admin-muted">—</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5">
              {document ? (
                <>
                  <button
                    type="button"
                    disabled={isBusy || isPreviewing}
                    onClick={() => onPreview(document)}
                    className="rounded border border-admin-border bg-admin-surface px-2 py-1 text-2xs font-medium text-admin-primary hover:bg-admin-bg disabled:opacity-60 transition-colors"
                  >
                    {isPreviewing ? "Loading..." : "Preview"}
                  </button>
                  {canVerify &&
                  document.verificationStatus !==
                    DocumentVerificationStatus.VERIFIED ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        void onVerify(
                          document.id,
                          DocumentVerificationStatus.VERIFIED,
                        )
                      }
                      className="rounded bg-emerald-600 px-2 py-1 text-2xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Verify
                    </button>
                  ) : null}
                  {canVerify &&
                  document.verificationStatus !==
                    DocumentVerificationStatus.REJECTED ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        const reason = window.prompt(
                          "Rejection reason for this document:",
                        );
                        if (!reason?.trim()) {
                          return;
                        }
                        void onVerify(
                          document.id,
                          DocumentVerificationStatus.REJECTED,
                          reason.trim(),
                        );
                      }}
                      className="rounded bg-red-600 px-2 py-1 text-2xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  ) : null}
                </>
              ) : (
                <span className="text-2xs text-admin-muted">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistoryTab({
  remarks,
}: {
  remarks: AdminApplication["remarks"];
}) {
  const sortedRemarks = [...(remarks ?? [])].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  if (sortedRemarks.length === 0) {
    return (
      <div className="admin-card px-4 py-8 text-center text-xs text-admin-muted">
        No remarks recorded yet.
      </div>
    );
  }

  return (
    <div className="admin-card divide-y divide-admin-border">
      {sortedRemarks.map((entry) => (
        <div key={entry.id} className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex rounded bg-admin-bg px-2 py-0.5 text-2xs font-medium uppercase tracking-wide text-admin-primary">
              {REMARK_ACTION_LABELS[entry.action] ?? entry.action}
            </span>
            <time className="text-2xs text-admin-muted">
              {formatDateTime(entry.createdAt)}
            </time>
          </div>
          <p className="mt-2 text-xs text-admin-primary">{entry.remark}</p>
          {entry.admin ? (
            <p className="mt-1 text-2xs text-admin-muted">
              {entry.admin.fullName ?? entry.admin.email ?? "Admin"}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DecisionPanel({
  application,
  onStartReview,
  onSubmitDecision,
  isStartingReview,
  isSubmittingDecision,
}: {
  application: AdminApplication;
  onStartReview: () => Promise<void>;
  onSubmitDecision: (decision: "APPROVED" | "REJECTED", remark: string) => Promise<void>;
  isStartingReview: boolean;
  isSubmittingDecision: boolean;
}) {
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [remark, setRemark] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const canStartReview = application.status === ApplicationStatus.SUBMITTED;
  const canDecide = application.status === ApplicationStatus.UNDER_REVIEW;
  const isFinalized =
    application.status === ApplicationStatus.APPROVED ||
    application.status === ApplicationStatus.REJECTED ||
    application.status === ApplicationStatus.ALLOCATED;

  const handleSubmit = async () => {
    setFormError(null);

    if (decision === "REJECTED" && remark.trim().length < 10) {
      setFormError("Rejection remarks are required (minimum 10 characters).");
      return;
    }

    try {
      await onSubmitDecision(decision, remark.trim());
      setRemark("");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Unable to submit decision. Please try again.",
      );
    }
  };

  return (
    <aside className="admin-card flex flex-col">
      <div className="border-b border-admin-border px-4 py-3">
        <h3 className="text-xs font-semibold text-admin-primary">Decision</h3>
        <p className="mt-0.5 text-2xs text-admin-muted">
          Verify documents, then approve or reject
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {canStartReview ? (
          <button
            type="button"
            onClick={() => void onStartReview()}
            disabled={isStartingReview}
            className="w-full rounded-md bg-admin-accent px-3 py-2 text-xs font-medium text-white hover:bg-admin-accent-hover disabled:opacity-60"
          >
            {isStartingReview ? "Starting review…" : "Start Review"}
          </button>
        ) : null}

        {canDecide ? (
          <>
            <fieldset className="space-y-2">
              <legend className="text-2xs font-medium uppercase tracking-wide text-admin-muted">
                Outcome
              </legend>
              <label className="flex cursor-pointer items-center gap-2 rounded border border-admin-border px-3 py-2 text-xs">
                <input
                  type="radio"
                  name="decision"
                  value="APPROVED"
                  checked={decision === "APPROVED"}
                  onChange={() => setDecision("APPROVED")}
                  className="text-admin-accent focus:ring-admin-accent"
                />
                <span className="font-medium text-admin-primary">Approve</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded border border-admin-border px-3 py-2 text-xs">
                <input
                  type="radio"
                  name="decision"
                  value="REJECTED"
                  checked={decision === "REJECTED"}
                  onChange={() => setDecision("REJECTED")}
                  className="text-admin-accent focus:ring-admin-accent"
                />
                <span className="font-medium text-admin-primary">Reject</span>
              </label>
            </fieldset>

            <div>
              <label
                htmlFor="decision-remark"
                className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
              >
                Remarks
                {decision === "REJECTED" ? (
                  <span className="normal-case text-red-600"> (required)</span>
                ) : null}
              </label>
              <textarea
                id="decision-remark"
                rows={4}
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                placeholder={
                  decision === "REJECTED"
                    ? "Explain why this application is rejected…"
                    : "Optional notes for approval…"
                }
                className="w-full resize-y rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary placeholder:text-admin-muted/60 focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
              />
            </div>

            {formError ? (
              <p className="text-2xs text-red-600" role="alert">
                {formError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmittingDecision}
              className="w-full rounded-md bg-admin-primary px-3 py-2 text-xs font-medium text-white hover:bg-admin-primary/90 disabled:opacity-60"
            >
              {isSubmittingDecision ? "Submitting…" : "Submit Decision"}
            </button>
          </>
        ) : null}

        {isFinalized ? (
          <div className="rounded-md border border-admin-border bg-admin-bg/60 px-3 py-3 text-xs text-admin-muted">
            <p>
              This application is{" "}
              <span className="font-medium text-admin-primary">
                {application.status.replace(/_/g, " ").toLowerCase()}
              </span>
              .
            </p>
            {application.reviewedAt ? (
              <p className="mt-1 text-2xs">
                Reviewed {formatDateTime(application.reviewedAt)}
              </p>
            ) : null}
          </div>
        ) : null}

        {!canStartReview && !canDecide && !isFinalized ? (
          <p className="text-xs text-admin-muted">
            Decision actions are unavailable for this status.
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function AllocationPanel({
  application,
  onAllocated,
  isSubmitting,
  setIsSubmitting,
}: {
  application: AdminApplication;
  onAllocated: () => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}) {
  const [type, setType] = useState<ScholarshipType>(ScholarshipType.ONE_TIME);
  const [amount, setAmount] = useState("");
  const [academicYear, setAcademicYear] = useState(
    application.academicYear || CURRENT_ACADEMIC_YEAR,
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    PaymentStatus.PENDING,
  );
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFormError(null);

    const parsedAmount = Number.parseFloat(amount);
    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter a valid allocation amount greater than zero.");
      return;
    }

    if (!academicYear.trim()) {
      setFormError("Academic year is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createAllocation({
        applicationId: application.id,
        type,
        amount: parsedAmount,
        academicYear: academicYear.trim(),
        paymentStatus,
        notes: notes.trim() || undefined,
      });
      await onAllocated();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Unable to create allocation. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="admin-card flex flex-col">
      <div className="border-b border-admin-border px-4 py-3">
        <h3 className="text-xs font-semibold text-admin-primary">
          Allocate Scholarship
        </h3>
        <p className="mt-0.5 text-2xs text-admin-muted">
          Create a scholarship allocation for this approved application
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <label
            htmlFor="allocation-type"
            className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
          >
            Type
          </label>
          <select
            id="allocation-type"
            value={type}
            onChange={(event) => setType(event.target.value as ScholarshipType)}
            className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
          >
            <option value={ScholarshipType.ONE_TIME}>One-Time</option>
            <option value={ScholarshipType.YEARLY}>Yearly</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="allocation-amount"
            className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
          >
            Amount (₹)
          </label>
          <input
            id="allocation-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="50000"
            className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary placeholder:text-admin-muted/60 focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
          />
        </div>

        <div>
          <label
            htmlFor="allocation-academic-year"
            className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
          >
            Academic Year
          </label>
          <input
            id="allocation-academic-year"
            type="text"
            value={academicYear}
            onChange={(event) => setAcademicYear(event.target.value)}
            placeholder="2025-26"
            className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary placeholder:text-admin-muted/60 focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
          />
        </div>

        <div>
          <label
            htmlFor="allocation-payment-status"
            className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
          >
            Payment Status
          </label>
          <select
            id="allocation-payment-status"
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(event.target.value as PaymentStatus)
            }
            className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
          >
            <option value={PaymentStatus.PENDING}>Pending</option>
            <option value={PaymentStatus.PARTIAL}>Partial</option>
            <option value={PaymentStatus.PAID}>Paid</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="allocation-notes"
            className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
          >
            Notes
          </label>
          <textarea
            id="allocation-notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional allocation notes…"
            className="w-full resize-y rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary placeholder:text-admin-muted/60 focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
          />
        </div>

        {formError ? (
          <p className="text-2xs text-red-600" role="alert">
            {formError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="w-full rounded-md bg-admin-accent px-3 py-2 text-xs font-medium text-white hover:bg-admin-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? "Allocating…" : "Create Allocation"}
        </button>
      </div>
    </aside>
  );
}

export function ApplicationReviewClient({
  applicationId,
}: ApplicationReviewClientProps) {
  const router = useRouter();
  const [application, setApplication] = useState<AdminApplication | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [isStartingReview, setIsStartingReview] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState<string | null>(null);
  const [previewingDocumentId, setPreviewingDocumentId] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentPreviewContent | null>(null);

  const showToast = useCallback((message: string, tone: "success" | "error") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const loadApplication = useCallback(async () => {
    setError(null);

    try {
      const data = await getAdminApplication(applicationId);
      setApplication(data);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : "Unable to load application. Please try again.",
      );
    }
  }, [applicationId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      await loadApplication();

      if (!cancelled) {
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadApplication]);

  const handleStartReview = async () => {
    setIsStartingReview(true);

    try {
      const updated = await startReview(applicationId);
      setApplication(updated);
      showToast("Review started. Application is now under review.", "success");
    } catch (reviewError) {
      showToast(
        reviewError instanceof ApiError
          ? reviewError.message
          : "Unable to start review.",
        "error",
      );
    } finally {
      setIsStartingReview(false);
    }
  };

  const handleSubmitDecision = async (
    decision: "APPROVED" | "REJECTED",
    remark: string,
  ) => {
    setIsSubmittingDecision(true);

    try {
      await submitDecision(applicationId, {
        decision,
        remark: remark || undefined,
      });
      showToast(
        decision === "APPROVED"
          ? "Application approved successfully."
          : "Application rejected.",
        "success",
      );
      router.push("/applications");
      router.refresh();
    } catch (decisionError) {
      showToast(
        decisionError instanceof ApiError
          ? decisionError.message
          : "Unable to submit decision.",
        "error",
      );
      throw decisionError;
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleVerifyDocument = async (
    documentId: string,
    status: DocumentVerificationStatus.VERIFIED | DocumentVerificationStatus.REJECTED,
    rejectionReason?: string,
  ) => {
    setBusyDocumentId(documentId);

    try {
      const updatedDocument = await verifyDocument(documentId, {
        status,
        rejectionReason,
      });

      setApplication((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          documents: (current.documents ?? []).map((document) =>
            document.id === updatedDocument.id ? updatedDocument : document,
          ),
        };
      });

      showToast(
        status === DocumentVerificationStatus.VERIFIED
          ? "Document verified."
          : "Document rejected.",
        "success",
      );

      await loadApplication();
    } catch (verifyError) {
      showToast(
        verifyError instanceof ApiError
          ? verifyError.message
          : "Unable to update document status.",
        "error",
      );
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handlePreviewDocument = async (doc: AdminApplicationDocument) => {
    if (doc.fileUrl.startsWith("http")) {
      setPreviewDocument({
        previewUrl: doc.fileUrl,
        mimeType: doc.mimeType ?? "application/pdf",
        fileName: doc.fileName,
      });
      return;
    }

    setPreviewingDocumentId(doc.id);
    try {
      const preview = await fetchDocumentPreview(doc.id);
      setPreviewDocument(preview);
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : "Unable to load document preview URL.",
        "error",
      );
    } finally {
      setPreviewingDocumentId(null);
    }
  };

  const handleAllocated = async () => {
    showToast("Scholarship allocated successfully.", "success");
    await loadApplication();
    router.refresh();
  };

  const canVerifyDocuments =
    application?.status === ApplicationStatus.UNDER_REVIEW ||
    application?.status === ApplicationStatus.SUBMITTED;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-admin-border" />
        <div className="admin-card h-64 animate-pulse bg-admin-border/40" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="admin-card px-6 py-10 text-center">
        <p className="text-sm font-medium text-admin-primary">
          Unable to load application
        </p>
        <p className="mt-1 text-xs text-admin-muted">
          {error ?? "Application not found."}
        </p>
        <Link
          href="/applications"
          className="mt-4 inline-flex rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-medium text-admin-primary hover:bg-admin-bg"
        >
          Back to applications
        </Link>
      </div>
    );
  }

  const paymentLabel =
    application.feeDetails?.paymentType &&
    application.feeDetails.paymentType in PAYMENT_TYPE_LABELS
      ? PAYMENT_TYPE_LABELS[
          application.feeDetails.paymentType as PaymentType
        ]
      : application.feeDetails?.paymentType;

  const feePaymentsByYear = new Map(
    (application.feePayments ?? []).map((payment) => [payment.year, payment]),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1 text-2xs font-medium text-admin-muted hover:text-admin-primary"
          >
            ← Applications
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="admin-page-title">
              {application.applicationNumber ?? "Draft Application"}
            </h2>
            <StatusBadge status={application.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-admin-muted">
            <span>
              <span className="font-medium text-admin-primary">Student:</span>{" "}
              {getStudentName(application)}
            </span>
            <span>
              <span className="font-medium text-admin-primary">
                Academic year:
              </span>{" "}
              {application.academicYear}
            </span>
            {application.submittedAt ? (
              <span>
                <span className="font-medium text-admin-primary">Submitted:</span>{" "}
                {formatDateTime(application.submittedAt)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-4">
          <div className="admin-card overflow-hidden">
            <div
              className="flex overflow-x-auto border-b border-admin-border"
              role="tablist"
              aria-label="Application sections"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-admin-accent text-admin-accent"
                      : "border-transparent text-admin-muted hover:text-admin-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "personal" ? (
            <ReadOnlySection title="Personal Details">
              <ReadOnlyField
                label="Student Name"
                value={application.personalDetails?.studentName}
              />
              <ReadOnlyField
                label="Gender"
                value={application.personalDetails?.gender}
              />
              <ReadOnlyField
                label="Father's Name"
                value={application.personalDetails?.fatherName}
              />
              <ReadOnlyField
                label="Father's Profession"
                value={application.personalDetails?.fatherProfession}
              />
              <ReadOnlyField
                label="Mother's Name"
                value={application.personalDetails?.motherName}
              />
              <ReadOnlyField
                label="Mother's Profession"
                value={application.personalDetails?.motherProfession}
              />
              <ReadOnlyField
                label="Religion"
                value={application.personalDetails?.religion}
              />
              <ReadOnlyField
                label="Caste"
                value={application.personalDetails?.caste}
              />
            </ReadOnlySection>
          ) : null}

          {activeTab === "education" ? (
            <ReadOnlySection title="Educational Details">
              <ReadOnlyField
                label="Course Name"
                value={application.educationalDetails?.courseName}
              />
              <ReadOnlyField
                label="Duration"
                value={application.educationalDetails?.duration}
              />
              <ReadOnlyField
                label="Batch"
                value={application.educationalDetails?.batch}
              />
              <ReadOnlyField
                label="Roll Number"
                value={application.educationalDetails?.rollNumber}
              />
              <ReadOnlyField
                label="Current Semester"
                value={application.educationalDetails?.currentSemester}
              />
              <ReadOnlyField
                label="Institute Name & Address"
                value={
                  application.educationalDetails?.instituteNameWithAddress ??
                  application.educationalDetails?.institutionName
                }
              />
              <ReadOnlyField
                label="Date of Course Completion"
                value={application.educationalDetails?.dateOfCourseCompletion}
              />
              <ReadOnlyField
                label="Accommodation"
                value={application.educationalDetails?.residenceType}
              />
            </ReadOnlySection>
          ) : null}

          {activeTab === "contact" ? (
            <ReadOnlySection title="Contact & Address">
              <ReadOnlyField
                label="Student Mobile"
                value={
                  application.contactAddress?.student?.mobile
                    ? `${application.contactAddress.student.countryCode ?? "+91"} ${application.contactAddress.student.mobile}`
                    : application.contactAddress?.mobile
                      ? `+91 ${application.contactAddress.mobile}`
                      : undefined
                }
              />
              <ReadOnlyField
                label="Student Email"
                value={application.contactAddress?.student?.email}
              />
              <ReadOnlyField
                label="WhatsApp"
                value={
                  application.contactAddress?.student?.whatsapp
                    ? `+91 ${application.contactAddress.student.whatsapp}`
                    : undefined
                }
              />
              <ReadOnlyField
                label="Guardian Mobile"
                value={
                  application.contactAddress?.guardian?.mobile
                    ? `${application.contactAddress.guardian.countryCode ?? "+91"} ${application.contactAddress.guardian.mobile}`
                    : undefined
                }
              />
              <ReadOnlyField
                label="Village / Town"
                value={
                  application.contactAddress?.address?.villageTown ??
                  application.contactAddress?.village
                }
              />
              <ReadOnlyField
                label="P.O."
                value={
                  application.contactAddress?.address?.po ??
                  application.contactAddress?.po
                }
              />
              <ReadOnlyField
                label="District"
                value={
                  application.contactAddress?.address?.district ??
                  application.contactAddress?.district
                }
              />
              <ReadOnlyField
                label="PIN"
                value={
                  application.contactAddress?.address?.pin ??
                  application.contactAddress?.pin
                }
              />
              <ReadOnlyField
                label="State"
                value={
                  application.contactAddress?.address?.state ??
                  application.contactAddress?.state
                }
              />
            </ReadOnlySection>
          ) : null}

          {activeTab === "bank" ? (
            <ReadOnlySection title="Bank Details">
              <ReadOnlyField
                label="Account Holder"
                value={application.bankDetails?.accountHolder}
              />
              <ReadOnlyField
                label="Account Number"
                value={application.bankDetails?.accountNumber}
              />
              <ReadOnlyField
                label="Bank Name"
                value={application.bankDetails?.bankName}
              />
              <ReadOnlyField
                label="Branch"
                value={application.bankDetails?.branchName}
              />
              <ReadOnlyField
                label="IFSC Code"
                value={application.bankDetails?.ifscCode}
              />
            </ReadOnlySection>
          ) : null}

          {activeTab === "family" ? (
            <ReadOnlySection title="Family Details">
              <ReadOnlyField
                label="Family Members"
                value={
                  application.familyDetails?.members
                    ? `${application.familyDetails.members.length} members`
                    : "—"
                }
              />
              {application.familyDetails?.members?.map((member, idx) => (
                <div key={idx} className="col-span-full border-t border-admin-border pt-2 text-xs">
                  <span className="font-semibold text-admin-fg">Member #{idx + 1}:</span> {member.name} ({member.relation}, {member.gender}) — {member.qualification}, {member.occupation}
                </div>
              ))}
              <ReadOnlyField
                label="Family Monthly Income"
                value={
                  application.familyDetails?.familyMonthlyIncome !== undefined
                    ? formatCurrency(application.familyDetails.familyMonthlyIncome)
                    : "—"
                }
              />
              <ReadOnlyField
                label="Family Monthly Expense"
                value={
                  application.familyDetails?.familyMonthlyExpense !== undefined
                    ? formatCurrency(application.familyDetails.familyMonthlyExpense)
                    : "—"
                }
              />
            </ReadOnlySection>
          ) : null}

          {activeTab === "fees" ? (
            <div className="space-y-4">
              <ReadOnlySection title="Fee Details">
                <ReadOnlyField label="Payment Type" value={paymentLabel} />
              </ReadOnlySection>
              <ReadOnlySection title="Year-wise Fees">
                {FEE_YEARS.map((year) => {
                  const payment = feePaymentsByYear.get(year);
                  return (
                    <ReadOnlyField
                      key={year}
                      label={String(year)}
                      value={
                        payment
                          ? formatCurrency(payment.amountPaid)
                          : undefined
                      }
                    />
                  );
                })}
              </ReadOnlySection>
            </div>
          ) : null}

          {activeTab === "documents" ? (
            <DocumentsTab
              documents={application.documents ?? []}
              canVerify={canVerifyDocuments}
              onVerify={handleVerifyDocument}
              onPreview={handlePreviewDocument}
              busyDocumentId={busyDocumentId}
              previewingDocumentId={previewingDocumentId}
            />
          ) : null}

          {activeTab === "history" ? (
            <HistoryTab remarks={application.remarks} />
          ) : null}
        </div>

        <div className="space-y-4">
          <DecisionPanel
            application={application}
            onStartReview={handleStartReview}
            onSubmitDecision={handleSubmitDecision}
            isStartingReview={isStartingReview}
            isSubmittingDecision={isSubmittingDecision}
          />

          {application.status === ApplicationStatus.APPROVED ? (
            <AllocationPanel
              application={application}
              onAllocated={handleAllocated}
              isSubmitting={isSubmittingAllocation}
              setIsSubmitting={setIsSubmittingAllocation}
            />
          ) : null}
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {previewDocument && (
        <DocumentPreviewModal
          fileName={previewDocument.fileName}
          mimeType={previewDocument.mimeType}
          previewUrl={previewDocument.previewUrl}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}
