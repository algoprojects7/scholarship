"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApplicationStatus } from "@scholarship/shared";
import { ApiError } from "@/lib/api";
import {
  fetchStudentDashboard,
  type StudentDashboardData,
} from "@/lib/student";
import { ApplicationStatusCard } from "@/components/dashboard/ApplicationStatusCard";
import { DocumentsChecklist } from "@/components/dashboard/DocumentsChecklist";
import { RemarksPanel } from "@/components/dashboard/RemarksPanel";
import { StatusTimeline } from "@/components/dashboard/StatusTimeline";

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="card h-48 animate-pulse bg-muted/60" />
      <div className="card h-40 animate-pulse bg-muted/60" />
      <div className="card h-36 animate-pulse bg-muted/60" />
    </div>
  );
}

function DraftApplicationState() {
  return (
    <div className="card border-dashed text-center">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
        Application not submitted yet
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        Complete and submit your scholarship application to track verification,
        approval, and allocation status here.
      </p>
      <Link href="/application" className="btn-primary mt-6 inline-flex">
        Continue Application
      </Link>
    </div>
  );
}

function isTrackableStatus(status: ApplicationStatus): boolean {
  return status !== ApplicationStatus.DRAFT;
}

export function ApplicationStatusClient() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dashboard = await fetchStudentDashboard();
      setData(dashboard);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load application status. Please try again.");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50/50">
        <h2 className="text-base font-semibold text-red-800">
          Could not load application status
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button type="button" onClick={() => void loadStatus()} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const application = data.application;

  if (!application) {
    return (
      <div className="card border-dashed text-center">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          No application found
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Start your scholarship application to view submission and verification
          progress.
        </p>
        <Link href="/application" className="btn-primary mt-6 inline-flex">
          Start Application
        </Link>
      </div>
    );
  }

  if (!isTrackableStatus(application.status)) {
    return <DraftApplicationState />;
  }

  return (
    <div className="space-y-6">
      <ApplicationStatusCard application={application} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusTimeline status={application.status} />
        <DocumentsChecklist documentsStatus={data.documentsStatus} />
      </div>

      <RemarksPanel remarks={data.remarks} />

      {application.status === ApplicationStatus.ALLOCATED ? (
        <div className="card border-primary/20 bg-primary-muted/20">
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            Scholarship allocated
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your application has been approved and a scholarship has been
            allocated. Check payment disbursement status on the payment page.
          </p>
          <Link href="/payment" className="btn-primary mt-4 inline-flex">
            View Payment Status
          </Link>
        </div>
      ) : null}
    </div>
  );
}
