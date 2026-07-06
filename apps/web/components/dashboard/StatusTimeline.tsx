import { ApplicationStatus } from "@scholarship/shared";

interface StatusTimelineProps {
  status: ApplicationStatus | null;
}

interface TimelineStep {
  id: string;
  label: string;
}

const BASE_STEPS: TimelineStep[] = [
  { id: "draft", label: "Draft" },
  { id: "submitted", label: "Submitted" },
  { id: "under_review", label: "Under Review" },
];

function getDecisionLabel(status: ApplicationStatus | null): string {
  if (status === ApplicationStatus.REJECTED) {
    return "Rejected";
  }
  if (status === ApplicationStatus.APPROVED || status === ApplicationStatus.ALLOCATED) {
    return "Approved";
  }
  return "Approved / Rejected";
}

function getActiveStepIndex(status: ApplicationStatus | null): number {
  if (!status) {
    return -1;
  }

  switch (status) {
    case ApplicationStatus.DRAFT:
      return 0;
    case ApplicationStatus.SUBMITTED:
      return 1;
    case ApplicationStatus.UNDER_REVIEW:
      return 2;
    case ApplicationStatus.APPROVED:
    case ApplicationStatus.REJECTED:
      return 3;
    case ApplicationStatus.ALLOCATED:
      return 4;
    default:
      return -1;
  }
}

export function StatusTimeline({ status }: StatusTimelineProps) {
  const steps: TimelineStep[] = [
    ...BASE_STEPS,
    { id: "decision", label: getDecisionLabel(status) },
    { id: "allocated", label: "Allocated" },
  ];

  const activeIndex = getActiveStepIndex(status);

  if (!status) {
    return (
      <div className="card">
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">
          Application Timeline
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Start your application to track progress through each stage.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-[var(--color-foreground)]">
        Application Timeline
      </h2>
      <ol className="mt-6 flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
        {steps.map((step, index) => {
          const isComplete = activeIndex > index;
          const isCurrent = activeIndex === index;
          const isRejectedBranch =
            status === ApplicationStatus.REJECTED && step.id === "decision";
          const isSkippedAfterReject =
            status === ApplicationStatus.REJECTED && step.id === "allocated";

          return (
            <li
              key={step.id}
              className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center"
            >
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute left-[11px] top-6 hidden h-px w-[calc(100%-22px)] sm:left-[calc(50%+14px)] sm:top-[14px] sm:block sm:h-0.5 sm:w-[calc(100%-28px)] ${
                    isComplete ? "bg-primary" : "bg-border"
                  }`}
                />
              ) : null}

              <span
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isRejectedBranch
                    ? "bg-red-100 text-red-700 ring-2 ring-red-200"
                    : isSkippedAfterReject
                      ? "bg-muted text-muted-foreground"
                      : isComplete
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "bg-primary-muted text-primary ring-2 ring-primary/30"
                          : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? "✓" : index + 1}
              </span>

              <div className="min-w-0 pb-6 sm:pb-0">
                <p
                  className={`text-sm font-medium ${
                    isCurrent || isComplete
                      ? "text-[var(--color-foreground)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent ? (
                  <p className="mt-0.5 text-xs text-primary">Current stage</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
