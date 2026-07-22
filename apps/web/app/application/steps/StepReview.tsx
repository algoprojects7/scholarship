"use client";

import { DocumentType } from "@scholarship/shared";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ApplicationDocument } from "@/lib/applications";
import { StepHeading } from "../components/FormHelpers";
import type { ApplicationFormValues } from "../schemas";

interface StepReviewProps {
  documents: ApplicationDocument[];
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const MANDATORY_DOCS = [
  DocumentType.STUDENT_ID_CARD,
  DocumentType.ADMISSION_RECEIPT,
  DocumentType.AADHAAR_STUDENT,
  DocumentType.VOTER_ID_STUDENT,
  DocumentType.NRC_FINAL_DRAFT,
  DocumentType.BANK_ACCOUNT_DETAILS,
  DocumentType.PARENT_AADHAAR,
  DocumentType.FULL_PHOTO_WITH_APRON,
  DocumentType.COURSE_YEARLY_EXPENSE,
  DocumentType.HOSTEL_PAYMENT_RECEIPT,
];

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-border)] py-2.5 sm:grid-cols-[200px_1fr]">
      <dt className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--color-foreground)]">{value || "—"}</dd>
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
  const uploadedSet = new Set(documents.map((d) => d.documentType));
  const missingMandatoryDocs = MANDATORY_DOCS.filter((t) => !uploadedSet.has(t));

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!confirmed) {
      setSubmitError("Please confirm that all details provided are accurate.");
      return;
    }

    if (missingMandatoryDocs.length > 0) {
      setSubmitError(
        `Please upload all mandatory documents before submitting (${missingMandatoryDocs.length} missing).`,
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
        description="Review all 8 application sections and confirm details before final submission."
      />

      <div className="space-y-6">
        {/* Step 1: Personal */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            1. Personal Details
          </h3>
          <dl>
            <SummaryRow label="Student Name" value={values.personalDetails.studentName} />
            <SummaryRow label="Gender" value={values.personalDetails.gender} />
            <SummaryRow label="Father's Name" value={values.personalDetails.fatherName} />
            <SummaryRow label="Father's Profession" value={values.personalDetails.fatherProfession} />
            <SummaryRow label="Mother's Name" value={values.personalDetails.motherName} />
            <SummaryRow label="Mother's Profession" value={values.personalDetails.motherProfession} />
            <SummaryRow label="Religion" value={values.personalDetails.religion} />
            <SummaryRow label="Caste" value={values.personalDetails.caste} />
          </dl>
        </section>

        {/* Step 2: Educational */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            2. Educational Details
          </h3>
          <dl>
            <SummaryRow label="Course Name" value={values.educationalDetails.courseName} />
            <SummaryRow label="Duration" value={values.educationalDetails.duration} />
            <SummaryRow label="Batch" value={values.educationalDetails.batch} />
            <SummaryRow label="Roll Number" value={values.educationalDetails.rollNumber} />
            <SummaryRow label="Current Semester" value={values.educationalDetails.currentSemester} />
            <SummaryRow label="Institute Name & Address" value={values.educationalDetails.instituteNameWithAddress} />
            <SummaryRow label="Date of Course Completion" value={values.educationalDetails.dateOfCourseCompletion} />
            <SummaryRow label="Accommodation" value={values.educationalDetails.residenceType} />
          </dl>
        </section>

        {/* Step 3: Contact */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            3. Contact & Address
          </h3>
          <dl>
            <SummaryRow label="Student Mobile" value={`+91 ${values.contactAddress.student.mobile}`} />
            <SummaryRow label="Student Email" value={values.contactAddress.student.email} />
            <SummaryRow label="WhatsApp" value={values.contactAddress.student.whatsapp ? `+91 ${values.contactAddress.student.whatsapp}` : "N/A"} />
            <SummaryRow label="Guardian Mobile" value={`+91 ${values.contactAddress.guardian.mobile}`} />
            <SummaryRow
              label="Address"
              value={`${values.contactAddress.address.villageTown}, P.O. ${values.contactAddress.address.po}, Dist. ${values.contactAddress.address.district}, ${values.contactAddress.address.state} - ${values.contactAddress.address.pin}`}
            />
          </dl>
        </section>

        {/* Step 4: Bank Details */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            4. Bank Details
          </h3>
          <dl>
            <SummaryRow label="Account Holder" value={values.bankDetails.accountHolder} />
            <SummaryRow label="Account Number" value={values.bankDetails.accountNumber} />
            <SummaryRow label="Bank Name" value={values.bankDetails.bankName} />
            <SummaryRow label="Branch Name" value={values.bankDetails.branchName} />
            <SummaryRow label="IFSC Code" value={values.bankDetails.ifscCode} />
          </dl>
        </section>

        {/* Step 5 & 6: Fee Details & Year-wise Fees */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            5 & 6. Fee Details & Year-wise Fees
          </h3>
          <dl>
            <SummaryRow label="Payment Type" value={values.feeDetails.paymentType} />
            <SummaryRow
              label="Year-wise Amounts"
              value={values.feePayments
                .map((payment) => `${payment.year}: ₹${payment.amountPaid}`)
                .join(" · ")}
            />
          </dl>
        </section>

        {/* Step 7: Family Details */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            7. Family Details
          </h3>
          <div className="overflow-x-auto my-3 rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-foreground)] font-semibold">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Gender</th>
                  <th className="py-2.5 px-3">Relation</th>
                  <th className="py-2.5 px-3">Qualification</th>
                  <th className="py-2.5 px-3">Occupation</th>
                </tr>
              </thead>
              <tbody>
                {values.familyDetails?.members?.map((member, index) => (
                  <tr key={index} className="border-b border-[var(--color-border)] last:border-b-0">
                    <td className="py-2.5 px-3 font-medium text-[var(--color-foreground)]">{member.name || "—"}</td>
                    <td className="py-2.5 px-3">{member.gender || "—"}</td>
                    <td className="py-2.5 px-3">{member.relation || "—"}</td>
                    <td className="py-2.5 px-3">{member.qualification || "—"}</td>
                    <td className="py-2.5 px-3">{member.occupation || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="mt-3 pt-2">
            <SummaryRow
              label="Family Monthly Income"
              value={`₹${values.familyDetails?.familyMonthlyIncome ?? 0}`}
            />
            <SummaryRow
              label="Family Monthly Expense"
              value={`₹${values.familyDetails?.familyMonthlyExpense ?? 0}`}
            />
          </dl>
        </section>

        {/* Step 8: Document Status */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            8. Document Upload Summary ({documents.length} / 12)
          </h3>
          <div className="text-xs text-[var(--color-muted-foreground)]">
            {missingMandatoryDocs.length === 0 ? (
              <span className="font-semibold text-emerald-600">✓ All 10 mandatory documents uploaded.</span>
            ) : (
              <span className="font-semibold text-red-600">⚠ {missingMandatoryDocs.length} mandatory document(s) missing.</span>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 space-y-4">
        <label className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <span className="text-sm text-[var(--color-foreground)]">
            I hereby declare that all information and documents provided in this scholarship application are true, complete, and accurate.
          </span>
        </label>

        {submitError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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
          {isSubmitting ? "Submitting Application..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
