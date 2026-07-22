"use client";

import { DocumentType } from "@scholarship/shared";
import { useCallback, useRef, useState } from "react";
import type { ApplicationDocument } from "@/lib/applications";
import { uploadDocument } from "@/lib/applications";
import { FieldError, StepHeading } from "../components/FormHelpers";

const DOCUMENT_CONFIG: {
  type: DocumentType;
  label: string;
  description: string;
  isOptional?: boolean;
}[] = [
  {
    type: DocumentType.STUDENT_ID_CARD,
    label: "Student ID Card (Allotted from Institute)",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.ADMISSION_RECEIPT,
    label: "Admission Receipt",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.AADHAAR_STUDENT,
    label: "Aadhar Card of the Student",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.VOTER_ID_STUDENT,
    label: "Voter ID card of the Student",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.NRC_FINAL_DRAFT,
    label: "NRC Final Draft of the Student",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.BANK_ACCOUNT_DETAILS,
    label: "Bank Account Details of the Student",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.PARENT_AADHAAR,
    label: "Father's/Mother's Aadhar Card",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.FULL_PHOTO_WITH_APRON,
    label: "Full Photo of the Student (with Apron)",
    description: "JPG or PNG — max 5 MB",
  },
  {
    type: DocumentType.COURSE_YEARLY_EXPENSE,
    label: "Course Yearly Expense Detail",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.HOSTEL_PAYMENT_RECEIPT,
    label: "Hostel Payment Receipt (Last/Current Month)",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.BPL_CERTIFICATE,
    label: "BPL Certificate (If any)",
    description: "PDF, JPG, or PNG — max 5 MB",
    isOptional: true,
  },
  {
    type: DocumentType.INCOME_CERTIFICATE,
    label: "Income Certificate (If any)",
    description: "PDF, JPG, or PNG — max 5 MB",
    isOptional: true,
  },
];

const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateFile(file: File, documentType: DocumentType): string | null {
  if (!ACCEPTED_MIME.includes(file.type as (typeof ACCEPTED_MIME)[number])) {
    return "Only PDF, JPG, or PNG files are allowed";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File must be 5 MB or smaller";
  }

  if (
    documentType === DocumentType.FULL_PHOTO_WITH_APRON &&
    file.type === "application/pdf"
  ) {
    return "Photo must be JPG or PNG image";
  }

  return null;
}

interface Step8DocumentsProps {
  applicationId: string;
  documents: ApplicationDocument[];
  onDocumentUploaded: (document: ApplicationDocument) => void;
}

export function Step8Documents({
  applicationId,
  documents,
  onDocumentUploaded,
}: Step8DocumentsProps) {
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [errors, setErrors] = useState<Partial<Record<DocumentType, string>>>({});
  const inputRefs = useRef<Partial<Record<DocumentType, HTMLInputElement>>>({});

  const documentsByType = new Map(
    documents.map((document) => [document.documentType, document]),
  );

  const handleFile = useCallback(
    async (documentType: DocumentType, file: File | undefined) => {
      if (!file) {
        return;
      }

      const validationError = validateFile(file, documentType);
      if (validationError) {
        setErrors((prev) => ({ ...prev, [documentType]: validationError }));
        return;
      }

      setErrors((prev) => ({ ...prev, [documentType]: undefined }));
      setUploadingType(documentType);

      try {
        const uploaded = await uploadDocument(applicationId, documentType, file);
        onDocumentUploaded(uploaded);
      } catch (err: any) {
        setErrors((prev) => ({
          ...prev,
          [documentType]: err?.message ?? "Upload failed",
        }));
      } finally {
        setUploadingType(null);
      }
    },
    [applicationId, onDocumentUploaded],
  );

  return (
    <div>
      <StepHeading
        title="Document Upload"
        description="Upload all required supporting documents. PDF, JPG, or PNG under 5 MB."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {DOCUMENT_CONFIG.map(({ type, label, description, isOptional }) => {
          const doc = documentsByType.get(type);
          const isUploading = uploadingType === type;
          const error = errors[type];

          return (
            <div
              key={type}
              className="flex flex-col justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-foreground)]">
                    {label}{" "}
                    {isOptional ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Optional
                      </span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </span>
                  {doc && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Uploaded
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {description}
                </p>

                {doc && (
                  <p className="mt-2 text-xs font-mono text-[var(--color-muted-foreground)] truncate">
                    {doc.fileName}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <input
                  ref={(el) => {
                    if (el) inputRefs.current[type] = el;
                  }}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    void handleFile(type, file);
                  }}
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => inputRefs.current[type]?.click()}
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-xs font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50"
                >
                  {isUploading
                    ? "Uploading..."
                    : doc
                      ? "Replace File"
                      : "Choose File"}
                </button>

                <FieldError message={error} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
