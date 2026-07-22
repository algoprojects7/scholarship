import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <section className="page-container py-16 sm:py-24">
      <div className="mx-auto max-w-xl sm:max-w-2xl">
        <div className="card shadow-card">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Student Portal
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your scholarship application
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground">
                Loading sign-in form…
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
