import { DOCUMENT_TYPES } from "@scholarship/shared";
import type { DocumentUploadStatus } from "@/lib/student";

interface DocumentsChecklistProps {
  documentsStatus: DocumentUploadStatus[];
}

export function DocumentsChecklist({ documentsStatus }: DocumentsChecklistProps) {
  const statusByType = new Map(
    documentsStatus.map((item) => [item.documentType, item.uploaded]),
  );

  const uploadedCount = documentsStatus.filter((item) => item.uploaded).length;

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">
          Uploaded Documents
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {uploadedCount} of {documentsStatus.length} uploaded
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {DOCUMENT_TYPES.map((doc) => {
          const uploaded = statusByType.get(doc.type) ?? false;

          return (
            <li
              key={doc.type}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
            >
              <span className="text-sm text-[var(--color-foreground)]">
                {doc.label}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  uploaded
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {uploaded ? "Uploaded" : "Missing"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
