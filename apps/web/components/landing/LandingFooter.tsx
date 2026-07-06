"use client";

import Link from "next/link";
import { APP_NAME } from "@scholarship/shared";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

const quickLinks = [
  { href: "#features", label: "Features" },
  { href: "#scholarship-types", label: "Scholarship Programs" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Login" },
] as const;

export function LandingFooter() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const year = new Date().getFullYear();

  if (!isLanding) {
    return <Footer />;
  }

  return (
    <footer className="landing-section-alt border-t border-slate-200/80">
      <div className="page-container min-w-0 py-10 sm:py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-1">
            <p className="text-lg font-bold text-blue-600">SMS</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {APP_NAME}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              The official scholarship portal for eligible students of your
              organization — register, apply, upload documents, and track
              verification through allocation.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Quick Links
            </h2>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Support
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              For application or login help, contact your organization&apos;s
              scholarship office.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Email: support@scholarship.local
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-slate-600">
            &copy; {year} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Powered by Algoguido Technologies
          </p>
        </div>
      </div>
    </footer>
  );
}
