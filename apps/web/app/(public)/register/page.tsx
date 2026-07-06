import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <section className="page-container py-16 sm:py-24">
      <div className="mx-auto max-w-md">
        <div className="card shadow-card">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Register as a student to apply for scholarships.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
