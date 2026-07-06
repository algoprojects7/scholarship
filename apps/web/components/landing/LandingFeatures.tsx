import {
  Bell,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  Lock,
  Upload,
} from "lucide-react";
import { StaggerChildren, StaggerItem } from "./motion";
import { LandingSectionHeader } from "./LandingSectionHeader";

const features = [
  {
    icon: KeyRound,
    title: "Student Registration & Login",
    description:
      "Register with your details, sign in securely, and reset or change your password when needed.",
  },
  {
    icon: ClipboardList,
    title: "7-Step Application Wizard",
    description:
      "Personal, educational, contact, bank, and fee details — guided step by step per organization requirements.",
  },
  {
    icon: Upload,
    title: "Document Upload",
    description:
      "Upload all six required document types with validation before submission to your organization.",
  },
  {
    icon: Bell,
    title: "Application Status & Remarks",
    description:
      "Follow verification progress and read admin remarks when your application is approved or rejected.",
  },
  {
    icon: LayoutDashboard,
    title: "Student Dashboard",
    description:
      "View your profile, application status, scholarship allocation, and payment details in one place.",
  },
  {
    icon: Lock,
    title: "Secure Access",
    description:
      "Security code on login, encrypted sessions, and role-based access protect your scholarship data.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="landing-section landing-section-spacing relative overflow-hidden"
      aria-label="Platform features"
    >
      <div className="page-container min-w-0">
        <LandingSectionHeader
          eyebrow="Portal Features"
          title={
            <>
              Built for your organization&apos;s{" "}
              <span className="landing-gradient-text">scholarship workflow</span>
            </>
          }
          description="Every feature maps to the student journey — from registration and application to verification and allocation."
        />

        <StaggerChildren className="mx-auto mt-8 grid w-full min-w-0 max-w-6xl gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title}>
                <article className="landing-card group h-full">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
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
