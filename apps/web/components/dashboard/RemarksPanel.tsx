import { RemarkAction } from "@scholarship/shared";
import type { DashboardRemark } from "@/lib/student";

interface RemarksPanelProps {
  remarks: DashboardRemark[];
}

const ACTION_LABELS: Record<RemarkAction, string> = {
  [RemarkAction.SUBMITTED]: "Submitted",
  [RemarkAction.UNDER_REVIEW]: "Under Review",
  [RemarkAction.APPROVED]: "Approved",
  [RemarkAction.REJECTED]: "Rejected",
  [RemarkAction.DOCUMENT_REJECTED]: "Document Rejected",
  [RemarkAction.ALLOCATION_CREATED]: "Allocation Created",
  [RemarkAction.REALLOCATED]: "Reallocated",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export function RemarksPanel({ remarks }: RemarksPanelProps) {
  return (
    <div className="card">
      <h2 className="text-base font-semibold text-[var(--color-foreground)]">
        Remarks
      </h2>

      {remarks.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No remarks from the review team yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {remarks.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-muted/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {ACTION_LABELS[item.action] ?? item.action}
                </span>
                <time
                  dateTime={item.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatDate(item.createdAt)}
                </time>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-foreground)]">
                {item.remark}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
