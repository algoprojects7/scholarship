import { CalendarClock, RefreshCw, Wallet } from "lucide-react";
import { StaggerChildren, StaggerItem } from "./motion";
import { LandingSectionHeader } from "./LandingSectionHeader";

const scholarshipTypes = [
  {
    icon: Wallet,
    title: "One-Time Scholarship",
    description:
      "A single disbursement awarded after your application is verified and approved by the organization.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: CalendarClock,
    title: "Yearly Scholarship",
    description:
      "Recurring support across academic years, with allocation amount and payment status tracked per year.",
    color: "text-cyan-600 bg-cyan-50",
  },
  {
    icon: RefreshCw,
    title: "Payment Status Tracking",
    description:
      "View allocation details, academic year, and payment status directly from your student dashboard.",
    color: "text-amber-700 bg-amber-50",
  },
] as const;

export function LandingScholarshipTypes() {
  return (
    <section
      id="scholarship-types"
      className="landing-section-alt landing-section-spacing relative overflow-hidden"
      aria-label="Scholarship types"
    >
      <div className="page-container min-w-0">
        <LandingSectionHeader
          eyebrow="Scholarship Programs"
          title="Support designed for your organization's students"
          description="Eligible students can apply for organization-funded scholarships with transparent verification, approval, and disbursement tracking."
        />

        <StaggerChildren className="mx-auto mt-8 grid w-full min-w-0 max-w-5xl gap-4 sm:mt-10 sm:gap-5 lg:mt-12 md:grid-cols-3">
          {scholarshipTypes.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <article className="landing-card h-full text-center sm:text-left">
                  <span
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl sm:mx-0 ${item.color}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
