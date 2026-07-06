"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApplicationStatus } from "@scholarship/shared";
import { ApiError } from "@/lib/api";
import {
  fetchStudentDashboard,
  fetchStudentScholarship,
  type StudentScholarship,
} from "@/lib/student";
import { PaymentStatusPanel } from "@/components/dashboard/PaymentStatusPanel";

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="card h-56 animate-pulse bg-muted/60" />
      <div className="card h-32 animate-pulse bg-muted/60" />
    </div>
  );
}

function NoPaymentState({
  applicationSubmitted,
}: {
  applicationSubmitted: boolean;
}) {
  return (
    <div className="card border-dashed text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Payment Status
      </p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">
        No scholarship payment yet
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        {applicationSubmitted
          ? "Your application is under review. Payment details will appear here after your application is approved and a scholarship is allocated."
          : "Submit your scholarship application first. Once it is approved and allocated, payment status will be shown here."}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/application-status" className="btn-primary">
          View Application Status
        </Link>
        {!applicationSubmitted ? (
          <Link href="/application" className="btn-secondary">
            Go to Application
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function PaymentClient() {
  const [scholarship, setScholarship] = useState<StudentScholarship | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPaymentStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [scholarshipResponse, dashboard] = await Promise.all([
        fetchStudentScholarship(),
        fetchStudentDashboard(),
      ]);

      setScholarship(scholarshipResponse.scholarship);
      setApplicationSubmitted(
        Boolean(
          dashboard.application &&
            dashboard.application.status !== ApplicationStatus.DRAFT,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load payment status. Please try again.");
      }
      setScholarship(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPaymentStatus();
  }, [loadPaymentStatus]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50/50">
        <h2 className="text-base font-semibold text-red-800">
          Could not load payment status
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void loadPaymentStatus()}
          className="btn-primary mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!scholarship) {
    return <NoPaymentState applicationSubmitted={applicationSubmitted} />;
  }

  return <PaymentStatusPanel scholarship={scholarship} />;
}
