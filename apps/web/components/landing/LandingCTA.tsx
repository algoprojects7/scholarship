import Link from "next/link";
import { APP_NAME } from "@scholarship/shared";
import { FadeIn } from "./motion";

export function LandingCTA() {
  return (
    <section
      className="landing-section landing-section-spacing relative overflow-hidden"
      aria-label="Call to action"
    >
      <div className="page-container min-w-0">
        <FadeIn>
          <div className="relative mx-auto w-full min-w-0 max-w-5xl overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 py-10 text-center shadow-card sm:rounded-[1.5rem] sm:px-10 sm:py-12 md:px-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.4) 0%, transparent 45%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <h2 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                Ready to apply for your organization&apos;s scholarship?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-blue-50">
                Register on {APP_NAME}, complete your application, and track every
                step until your scholarship is allocated.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition-all duration-300 hover:bg-blue-50 sm:w-auto"
                >
                  Create Student Account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 sm:w-auto"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
