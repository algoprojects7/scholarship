"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ApplicationDocument } from "@/lib/applications";
import type { ApplicationFormValues } from "../schemas";
import { PAYMENT_TYPE_OPTIONS } from "../schemas";
import { StepHeading } from "../components/FormHelpers";
import { DOCUMENT_CONFIG, getMissingDocumentTypes } from "./Step7Documents";

interface StepReviewProps {
  documents: ApplicationDocument[];
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-[var(--color-foreground)]">{value || "—"}</dd>
    </div>
  );
}

export function StepReview({
  documents,
  onSubmit,
  isSubmitting,
}: StepReviewProps) {
  const { getValues } = useFormContext<ApplicationFormValues>();
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const values = getValues();
  const missingDocuments = getMissingDocumentTypes(documents);
  const paymentLabel =
    PAYMENT_TYPE_OPTIONS.find(
      (option) => option.value === values.feeDetails.paymentType,
    )?.label ?? values.feeDetails.paymentType;

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!confirmed) {
      setSubmitError("Please confirm that the information provided is accurate.");
      return;
    }

    if (missingDocuments.length > 0) {
      setSubmitError(
        `Please upload all required documents before submitting (${missingDocuments.length} missing).`,
      );
      return;
    }

    try {
      await onSubmit();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Submission failed. Please try again.",
      );
    }
  };

  return (
    <div>
      <StepHeading
        title="Review & Submit"
        description="Review your application details before final submission."
      />

      <div className="space-y-8">
        <section className="rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Personal
          </h3>
          <dl>
            <SummaryRow
              label="Student Name"
              value={values.personalDetails.studentName}
            />
            <SummaryRow
              label="Father's Name"
              value={values.personalDetails.fatherName}
            />
            <SummaryRow
              label="Mother's Name"
              value={values.personalDetails.motherName}
            />
            <SummaryRow label="Religion" value={values.personalDetails.religion} />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Education & Contact
          </h3>
          <dl>
            <SummaryRow
              label="Institution"
              value={values.educationalDetails.institutionName}
            />
            <SummaryRow
              label="Course"
              value={values.educationalDetails.courseName}
            />
            <SummaryRow
              label="Mobile"
              value={`+91 ${values.contactAddress.mobile}`}
            />
            <SummaryRow
              label="Address"
              value={`${values.contactAddress.village}, ${values.contactAddress.po}, ${values.contactAddress.district}, ${values.contactAddress.state} — ${values.contactAddress.pin}`}
            />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Bank & Fees
          </h3>
          <dl>
            <SummaryRow
              label="IFSC Code"
              value={values.bankDetails.ifscCode}
            />
            <SummaryRow label="Payment Type" value={paymentLabel} />
            <SummaryRow
              label="Year-wise Fees"
              value={values.feePayments
                .map((payment) => `${payment.year}: ₹${payment.amountPaid}`)
                .join(" · ")}
            />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Documents
          </h3>
          <ul className="space-y-2">
            {DOCUMENT_CONFIG.map(({ type, label }) => {
              const uploaded = documents.some(
                (document) => document.documentType === type,
              );

              return (
                <li
                  key={type}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{label}</span>
                  <span
                    className={
                      uploaded
                        ? "font-medium text-emerald-700"
                        : "font-medium text-red-600"
                    }
                  >
                    {uploaded ? "Uploaded" : "Missing"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="mt-8 space-y-4">
        <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-[var(--color-foreground)]">
            I confirm that all information and documents provided are accurate
            and complete.
          </span>
        </label>

        {submitError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
