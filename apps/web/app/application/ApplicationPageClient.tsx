"use client";

import { ApplicationStatus } from "@scholarship/shared";
import { useEffect, useState } from "react";
import { StudentShell } from "@/components/layout/StudentShell";
import { ApiError, getMe } from "@/lib/api";
import type { Application } from "@/lib/applications";
import {
  createApplication,
  getApplication,
  getMyApplications,
} from "@/lib/applications";
import { ApplicationWizard } from "./ApplicationWizard";

function findEditableDraft(applications: Application[]): Application | null {
  const editable = applications.filter(
    (application) =>
      application.status === ApplicationStatus.DRAFT ||
      application.status === ApplicationStatus.REJECTED,
  );

  if (editable.length === 0) {
    return null;
  }

  return editable.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )[0]!;
}

export function ApplicationPageClient() {
  const [application, setApplication] = useState<Application | null>(null);
  const [profile, setProfile] = useState<
    { fullName: string; countryCode: string; mobile: string } | undefined
  >();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadApplication() {
      setIsLoading(true);
      setError(null);

      try {
        const [meResponse, myApplications] = await Promise.all([
          getMe(),
          getMyApplications(),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(meResponse.user.profile);

        let draft = findEditableDraft(myApplications);

        if (!draft) {
          draft = await createApplication();
        }

        const fullApplication = await getApplication(draft.id);

        if (cancelled) {
          return;
        }

        setApplication(fullApplication);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Unable to load your application. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadApplication();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StudentShell
      title="Scholarship Application"
      description="Complete your application step by step. Your progress is saved automatically."
    >
      {isLoading ? (
        <div className="card">
          <p className="text-sm text-muted-foreground">Loading application...</p>
        </div>
      ) : null}

      {error ? (
        <div
          className="card border-red-200 bg-red-50 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {application ? (
        <ApplicationWizard application={application} profile={profile} />
      ) : null}
    </StudentShell>
  );
}
