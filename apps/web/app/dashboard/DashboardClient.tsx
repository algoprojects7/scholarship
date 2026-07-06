"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  fetchStudentDashboard,
  type StudentDashboardData,
} from "@/lib/student";
import { ApplicationStatusCard } from "@/components/dashboard/ApplicationStatusCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RemarksPanel } from "@/components/dashboard/RemarksPanel";
import { ScholarshipCard } from "@/components/dashboard/ScholarshipCard";
import { StatusTimeline } from "@/components/dashboard/StatusTimeline";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card h-48 animate-pulse bg-muted/60" />
        <div className="card h-48 animate-pulse bg-muted/60" />
      </div>
      <div className="card h-36 animate-pulse bg-muted/60" />
      <div className="card h-28 animate-pulse bg-muted/60" />
    </div>
  );
}

export function DashboardClient() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dashboard = await fetchStudentDashboard();
      setData(dashboard);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load your dashboard. Please try again.");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50/50">
        <h2 className="text-base font-semibold text-red-800">
          Could not load dashboard
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button type="button" onClick={() => void loadDashboard()} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <p className="text-lg text-muted-foreground">
        Welcome back,{" "}
        <span className="font-semibold text-[var(--color-foreground)]">
          {data.student.fullName}
        </span>
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationStatusCard application={data.application} />
        <StatusTimeline status={data.application?.status ?? null} />
      </div>

      {data.scholarship ? (
        <ScholarshipCard scholarship={data.scholarship} showViewDetailsLink />
      ) : null}

      <RemarksPanel remarks={data.remarks} />
      <QuickActions
        application={data.application}
        scholarship={data.scholarship ?? null}
      />
    </div>
  );
}
