"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ApplicationStatus } from "@scholarship/shared";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ApiError } from "@/lib/api";
import type { Application, ApplicationDocument } from "@/lib/applications";
import { submitApplication, updateApplication } from "@/lib/applications";
import {
  applicationFormSchema,
  type ApplicationFormValues,
} from "./schemas";
import { Step1Personal } from "./steps/Step1Personal";
import { Step2Educational } from "./steps/Step2Educational";
import { Step3Contact } from "./steps/Step3Contact";
import { Step4Bank } from "./steps/Step4Bank";
import { Step5Fee } from "./steps/Step5Fee";
import { Step6YearWiseFees } from "./steps/Step6YearWiseFees";
import { Step7Family } from "./steps/Step7Family";
import { Step8Documents } from "./steps/Step8Documents";
import { StepReview } from "./steps/StepReview";
import {
  buildDefaultFormValues,
  formValuesToPayload,
  STEP_FIELD_GROUPS,
  WIZARD_STEPS,
  type WizardStepId,
} from "./wizard-utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ApplicationWizardProps {
  application: Application;
  profile?: {
    fullName: string;
    countryCode: string;
    mobile: string;
    email?: string;
  };
}

export function ApplicationWizard({
  application: initialApplication,
  profile,
}: ApplicationWizardProps) {
  const router = useRouter();
  const [application, setApplication] = useState(initialApplication);
  const [documents, setDocuments] = useState<ApplicationDocument[]>(
    initialApplication.documents ?? [],
  );
  const [currentStep, setCurrentStep] = useState<WizardStepId>(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSaveRef = useRef(true);

  const methods = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: buildDefaultFormValues(application, profile),
    mode: "onBlur",
  });

  const { watch, trigger, getValues } = methods;

  const persistDraft = useCallback(
    async (values: ApplicationFormValues) => {
      setSaveStatus("saving");

      try {
        const updated = await updateApplication(
          application.id,
          formValuesToPayload(values),
        );
        setApplication((current) => ({
          ...current,
          ...updated,
          documents: current.documents,
        }));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [application.id],
  );

  useEffect(() => {
    const subscription = watch((values) => {
      if (skipSaveRef.current) {
        return;
      }

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      setSaveStatus("saving");

      saveTimerRef.current = setTimeout(() => {
        void persistDraft(values as ApplicationFormValues);
      }, 2000);
    });

    skipSaveRef.current = false;

    return () => {
      subscription.unsubscribe();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [watch, persistDraft]);

  const handleDocumentUploaded = useCallback((document: ApplicationDocument) => {
    setDocuments((current) => {
      const withoutType = current.filter(
        (item) => item.documentType !== document.documentType,
      );
      return [...withoutType, document];
    });
  }, []);

  const goToStep = async (step: WizardStepId) => {
    if (step > currentStep) {
      const fields = STEP_FIELD_GROUPS[currentStep];
      if (fields.length > 0) {
        const valid = await trigger(fields);
        if (!valid) {
          return;
        }

        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
        await persistDraft(getValues());
      }
    }

    setCurrentStep(step);
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);

    try {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      await persistDraft(getValues());
      await submitApplication(application.id);
      router.push("/dashboard");
    } catch (error) {
      setIsSubmitting(false);
      throw error instanceof ApiError
        ? error
        : new Error("Submission failed. Please try again.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Personal />;
      case 2:
        return <Step2Educational />;
      case 3:
        return <Step3Contact />;
      case 4:
        return <Step4Bank />;
      case 5:
        return <Step5Fee />;
      case 6:
        return <Step6YearWiseFees />;
      case 7:
        return <Step7Family />;
      case 8:
        return (
          <Step8Documents
            applicationId={application.id}
            documents={documents}
            onDocumentUploaded={handleDocumentUploaded}
          />
        );
      case 9:
        return (
          <StepReview
            documents={documents}
            onSubmit={handleSubmitApplication}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const statusLabel =
    application.status === ApplicationStatus.REJECTED
      ? "Rejected — you may edit and resubmit"
      : "Draft";

  return (
    <FormProvider {...methods}>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit lg:sticky lg:top-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Application Steps
            </p>
            <span className="rounded-full bg-primary-muted px-2.5 py-1 text-xs font-medium text-primary">
              {statusLabel}
            </span>
          </div>

          <nav aria-label="Application steps" className="space-y-2">
            {WIZARD_STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => void goToStep(step.id)}
                  className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-primary-muted text-primary"
                      : isComplete
                        ? "text-[var(--color-foreground)] hover:bg-muted"
                        : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? "✓" : step.id}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {step.label}
                      </span>
                      <span className="block text-xs opacity-80">
                        {step.description}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="card">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {WIZARD_STEPS.length}
            </p>
            <SaveIndicator status={saveStatus} />
          </div>

          {renderStep()}

          {currentStep < 9 ? (
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  setCurrentStep((step) => Math.max(1, step - 1) as WizardStepId)
                }
                disabled={currentStep === 1}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  void goToStep(Math.min(9, currentStep + 1) as WizardStepId)
                }
                className="btn-primary"
              >
                {currentStep === 8 ? "Review Application" : "Save & Continue"}
              </button>
            </div>
          ) : (
            <div className="mt-8 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="btn-secondary"
              >
                Back to Documents
              </button>
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case "saving":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Saving draft...
        </span>
      );
    case "saved":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Draft saved
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Failed to save draft
        </span>
      );
    default:
      return null;
  }
}
