"use client";

import { useEffect, useState } from "react";

interface DocumentPreviewModalProps {
  fileName: string;
  mimeType: string;
  previewUrl: string;
  onClose: () => void;
}

function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function isPdfMime(mimeType: string): boolean {
  return mimeType === "application/pdf" || mimeType.endsWith("/pdf");
}

export function DocumentPreviewModal({
  fileName,
  mimeType,
  previewUrl,
  onClose,
}: DocumentPreviewModalProps) {
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Prevent body scrolling behind modal
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const openInNewTab = () => {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const isImage = isImageMime(mimeType);
  const isPdf = isPdfMime(mimeType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-admin-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-preview-title"
      onClick={onClose}
    >
      <div
        className="admin-card flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden bg-admin-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-admin-border px-5 py-4 bg-admin-surface">
          <div className="min-w-0">
            <h3
              id="document-preview-title"
              className="truncate text-sm font-semibold text-admin-primary"
            >
              {fileName}
            </h3>
            <p className="text-2xs text-admin-muted mt-0.5">{mimeType}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openInNewTab}
              className="rounded border border-admin-border bg-admin-surface px-3 py-1.5 text-2xs font-medium text-admin-primary hover:bg-admin-bg transition-colors"
            >
              Open in New Tab
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-admin-accent px-3 py-1.5 text-2xs font-medium text-white hover:bg-admin-accent-hover transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="relative flex-1 bg-admin-bg p-4 flex items-center justify-center overflow-hidden">
          {/* Loading Indicator for Iframe/Image */}
          {isIframeLoading && (isPdf || isImage) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-admin-bg/85 z-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-admin-accent border-t-transparent" />
              <p className="mt-2.5 text-2xs font-medium text-admin-muted">Loading document preview...</p>
            </div>
          )}

          {isPdf ? (
            <iframe
              src={previewUrl}
              title={fileName}
              className="h-full w-full rounded border border-admin-border bg-white shadow-sm"
              onLoad={() => setIsIframeLoading(false)}
            />
          ) : isImage ? (
            <div className="h-full w-full flex items-center justify-center overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-full max-w-full object-contain rounded border border-admin-border shadow-sm"
                onLoad={() => setIsIframeLoading(false)}
              />
            </div>
          ) : (
            <div className="text-center p-6 bg-admin-surface rounded-lg border border-admin-border max-w-md shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-admin-bg mb-3">
                <svg
                  className="h-6 w-6 text-admin-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="text-xs font-semibold text-admin-primary mb-1">Preview not supported</h4>
              <p className="mb-4 text-2xs text-admin-muted">
                Direct browser preview is not supported for this file type ({mimeType}).
              </p>
              <a
                href={previewUrl}
                download={fileName}
                className="inline-flex rounded bg-admin-accent px-4 py-2 text-2xs font-medium text-white hover:bg-admin-accent-hover transition-colors shadow"
              >
                Download Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
