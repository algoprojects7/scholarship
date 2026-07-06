import {
  BadgeCheck,
  ClipboardList,
  FileUp,
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { FadeIn } from "./motion";
import { LandingSectionHeader } from "./LandingSectionHeader";

const steps = [
  {
    icon: UserPlus,
    title: "Register",
    description:
      "Create your student account with name, contact details, and secure password.",
  },
  {
    icon: LogIn,
    title: "Login",
    description:
      "Sign in with your email, password, and security code to access the portal.",
  },
  {
    icon: ClipboardList,
    title: "Fill Application",
    description:
      "Complete personal, educational, contact, bank, and fee details in the guided wizard.",
  },
  {
    icon: FileUp,
    title: "Upload & Submit",
    description:
      "Attach required documents and submit your application for organization review.",
  },
  {
    icon: ShieldCheck,
    title: "Verification",
    description:
      "Administrators verify your application and documents. Status shows as pending or in review.",
  },
  {
    icon: BadgeCheck,
    title: "Approval & Allocation",
    description:
      "On approval, your organization allocates a one-time or yearly scholarship with remarks.",
  },
  {
    icon: LayoutDashboard,
    title: "Track on Dashboard",
    description:
      "Monitor application status, remarks, allocation amount, and payment status anytime.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="landing-section landing-section-spacing relative overflow-hidden"
      aria-label="How it works"
    >
      <div className="page-container relative min-w-0">
        <LandingSectionHeader
          eyebrow="How It Works"
          title="Your path from registration to scholarship"
          description="The same workflow your organization uses — transparent at every stage for eligible students."
        />

        <div className="relative mx-auto mt-8 max-w-4xl sm:mt-10 lg:mt-12">
          <div
            className="absolute bottom-4 left-6 top-4 hidden w-px bg-gradient-to-b from-blue-200 via-cyan-300 to-blue-200 md:left-8 md:block"
            aria-hidden
          />

          <ol className="space-y-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <FadeIn key={step.title} delay={index * 0.06}>
                  <li className="relative flex gap-4 md:gap-6">
                    <div className="relative z-10 flex shrink-0 flex-col items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200/80 bg-white text-blue-600 shadow-soft">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      {!isLast ? (
                        <span
                          className="mt-2 hidden h-full min-h-[1.5rem] w-px bg-blue-100 md:block"
                          aria-hidden
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1 pb-2 pt-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                        Step {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                </FadeIn>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
