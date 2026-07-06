"use client";

import { DocumentType } from "@scholarship/shared";
import { useCallback, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import type { ApplicationDocument } from "@/lib/applications";
import { uploadDocument } from "@/lib/applications";
import { FieldError, StepHeading } from "../components/FormHelpers";

const DOCUMENT_CONFIG: {
  type: DocumentType;
  label: string;
  description: string;
}[] = [
  {
    type: DocumentType.AADHAAR,
    label: "Aadhaar Card",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.INCOME_CERTIFICATE,
    label: "Income Certificate",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.MARKSHEET,
    label: "Marksheet",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.BANK_PASSBOOK,
    label: "Bank Passbook",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.FEE_RECEIPT,
    label: "Fee Receipt",
    description: "PDF, JPG, or PNG — max 5 MB",
  },
  {
    type: DocumentType.PHOTO,
    label: "Passport Photo",
    description: "JPG or PNG — max 5 MB",
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
    documentType === DocumentType.PHOTO &&
    file.type === "application/pdf"
  ) {
    return "Photo must be JPG or PNG";
  }

  return null;
}

interface Step7DocumentsProps {
  applicationId: string;
  documents: ApplicationDocument[];
  onDocumentUploaded: (document: ApplicationDocument) => void;
}

export function Step7Documents({
  applicationId,
  documents,
  onDocumentUploaded,
}: Step7DocumentsProps) {
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
        setErrors((current) => ({ ...current, [documentType]: validationError }));
        return;
      }

      setErrors((current) => {
        const next = { ...current };
        delete next[documentType];
        return next;
      });
      setUploadingType(documentType);

      try {
        const uploaded = await uploadDocument(applicationId, documentType, file);
        onDocumentUploaded(uploaded);
      } catch (error) {
        setErrors((current) => ({
          ...current,
          [documentType]:
            error instanceof ApiError
              ? error.message
              : "Upload failed. Please try again.",
        }));
      } finally {
        setUploadingType(null);
        const input = inputRefs.current[documentType];
        if (input) {
          input.value = "";
        }
      }
    },
    [applicationId, onDocumentUploaded],
  );

  return (
    <div>
      <StepHeading
        title="Document Upload"
        description="Upload all required documents. Each file must be PDF, JPG, or PNG and under 5 MB."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {DOCUMENT_CONFIG.map(({ type, label, description }) => {
          const existing = documentsByType.get(type);
          const isUploading = uploadingType === type;

          return (
            <div
              key={type}
              className="rounded-xl border border-dashed border-border bg-muted/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {label} <span className="text-red-500">*</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
                {existing ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Uploaded
                  </span>
                ) : null}
              </div>

              {existing ? (
                <p className="mt-3 truncate text-xs text-muted-foreground">
                  {existing.fileName}
                </p>
              ) : null}

              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-border bg-surface px-4 py-6 text-center transition-colors hover:border-primary hover:bg-primary-muted/40">
                <span className="text-sm font-medium text-primary">
                  {isUploading
                    ? "Uploading..."
                    : existing
                      ? "Replace file"
                      : "Choose file or drag here"}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Click to browse
                </span>
                <input
                  ref={(element) => {
                    if (element) {
                      inputRefs.current[type] = element;
                    }
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="sr-only"
                  disabled={isUploading}
                  onChange={(event) => {
                    void handleFile(type, event.target.files?.[0]);
                  }}
                />
              </label>

              <FieldError message={errors[type]} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function getMissingDocumentTypes(
  documents: ApplicationDocument[],
): DocumentType[] {
  const uploaded = new Set(documents.map((document) => document.documentType));
  return DOCUMENT_CONFIG.map((config) => config.type).filter(
    (type) => !uploaded.has(type),
  );
}

export { DOCUMENT_CONFIG };
