import Link from "next/link";

import { ApplicationStatus } from "@scholarship/shared";

import type { DashboardApplication, StudentScholarship } from "@/lib/student";



interface QuickActionsProps {

  application: DashboardApplication | null;

  scholarship?: StudentScholarship | null;

}



function getApplicationHref(application: DashboardApplication | null): string {

  if (!application) {

    return "/application";

  }



  if (application.status === ApplicationStatus.DRAFT) {

    return `/application/${application.id}`;

  }



  return "/application";

}



function hasScholarshipAllocation(

  application: DashboardApplication | null,

  scholarship: StudentScholarship | null | undefined,

): boolean {

  return (

    Boolean(scholarship) ||

    application?.status === ApplicationStatus.ALLOCATED

  );

}



export function QuickActions({

  application,

  scholarship = null,

}: QuickActionsProps) {

  const applicationHref = getApplicationHref(application);

  const continueLabel = application ? "Continue Application" : "Start Application";

  const showScholarshipLink = hasScholarshipAllocation(application, scholarship);



  return (

    <div className="card">

      <h2 className="text-base font-semibold text-[var(--color-foreground)]">

        Quick Actions

      </h2>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

        <Link href={applicationHref} className="btn-primary">

          {continueLabel}

        </Link>

        <Link href={applicationHref} className="btn-secondary">

          View Documents

        </Link>

        {showScholarshipLink ? (
          <Link href="/payment" className="btn-secondary">
            Payment Status
          </Link>
        ) : null}

        <Link href="/application-status" className="btn-secondary">
          Application Status
        </Link>

        <Link href="/profile#change-password" className="btn-secondary">
          Profile &amp; Password
        </Link>
      </div>

    </div>

  );

}


