"use client";



import Link from "next/link";

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";

import {

  fetchStudentScholarship,

  type StudentScholarship,

} from "@/lib/student";

import {

  formatScholarshipDate,

  ScholarshipCard,

} from "@/components/dashboard/ScholarshipCard";



function ScholarshipSkeleton() {

  return (

    <div className="space-y-6">

      <div className="card h-64 animate-pulse bg-muted/60" />

      <div className="card h-32 animate-pulse bg-muted/60" />

    </div>

  );

}



function NoAllocationState() {

  return (

    <div className="card border-dashed text-center">

      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">

        Scholarship Status

      </p>

      <h2 className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">

        No Scholarship Allocated Yet

      </h2>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">

        Your application has not received a scholarship allocation yet. Once your

        application is approved and allocated, payment details will appear here.

      </p>

      <Link href="/dashboard" className="btn-secondary mt-6 inline-flex">

        Back to Dashboard

      </Link>

    </div>

  );

}



export function ScholarshipClient() {

  const [scholarship, setScholarship] = useState<StudentScholarship | null>(

    null,

  );

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);



  const loadScholarship = useCallback(async () => {

    setLoading(true);

    setError(null);



    try {

      const response = await fetchStudentScholarship();

      setScholarship(response.scholarship);

    } catch (err) {

      if (err instanceof ApiError) {

        setError(err.message);

      } else {

        setError("Unable to load scholarship details. Please try again.");

      }

      setScholarship(null);

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    void loadScholarship();

  }, [loadScholarship]);



  if (loading) {

    return <ScholarshipSkeleton />;

  }



  if (error) {

    return (

      <div className="card border-red-200 bg-red-50/50">

        <h2 className="text-base font-semibold text-red-800">

          Could not load scholarship

        </h2>

        <p className="mt-2 text-sm text-red-700">{error}</p>

        <button

          type="button"

          onClick={() => void loadScholarship()}

          className="btn-primary mt-4"

        >

          Try Again

        </button>

      </div>

    );

  }



  if (!scholarship) {

    return <NoAllocationState />;

  }



  return (

    <div className="space-y-6">

      <ScholarshipCard scholarship={scholarship} />



      <div className="card">

        <h2 className="text-base font-semibold text-[var(--color-foreground)]">

          Allocation Details

        </h2>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">

          <div>

            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

              Application Number

            </dt>

            <dd className="mt-1 text-sm font-medium text-[var(--color-foreground)]">

              {scholarship.applicationNumber ?? "Not assigned"}

            </dd>

          </div>

          <div>

            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

              Allocated On

            </dt>

            <dd className="mt-1 text-sm text-[var(--color-foreground)]">

              {formatScholarshipDate(scholarship.createdAt)}

            </dd>

          </div>

          <div>

            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

              Last Updated

            </dt>

            <dd className="mt-1 text-sm text-[var(--color-foreground)]">

              {formatScholarshipDate(scholarship.updatedAt)}

            </dd>

          </div>

        </dl>

      </div>

    </div>

  );

}


