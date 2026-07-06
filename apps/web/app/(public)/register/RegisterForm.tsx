"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Gender, registerSchema, type RegisterInput } from "@scholarship/shared";
import { PasswordInput, PhoneInput, ShowPasswordCheckbox } from "@scholarship/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ApiError, register } from "@/lib/api";

const genderOptions = [
  { value: Gender.MALE, label: "Male" },
  { value: Gender.FEMALE, label: "Female" },
  { value: Gender.OTHER, label: "Other" },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

function RegistrationSuccessModal({
  open,
  message,
  onContinue,
}: {
  open: boolean;
  message: string;
  onContinue: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-foreground)]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-success-title"
      aria-describedby="registration-success-message"
    >
      <div className="card w-full max-w-sm shadow-card">
        <div className="text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl"
            aria-hidden="true"
          >
            ✓
          </div>
          <h2
            id="registration-success-title"
            className="mt-4 text-xl font-bold tracking-tight text-[var(--color-foreground)]"
          >
            Registration Successful
          </h2>
          <p
            id="registration-success-message"
            className="mt-2 text-sm text-muted-foreground"
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={onContinue}
        >
          Continue to Sign In
        </button>
      </div>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register: registerField,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "+91",
      mobile: "",
      password: "Test@123",
      confirmPassword: "Test@123",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);

    try {
      const response = await register(data);
      setSuccessMessage(
        response.message ?? "Registration successful. Please sign in.",
      );
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Registration failed. Please try again.",
      );
    }
  });

  return (
    <>
      <RegistrationSuccessModal
        open={successMessage !== null}
        message={successMessage ?? ""}
        onContinue={() => router.push("/login")}
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          className="input-field"
          aria-invalid={errors.fullName ? true : undefined}
          {...registerField("fullName")}
        />
        <FieldError message={errors.fullName?.message} />
      </div>

      <div>
        <label
          htmlFor="gender"
          className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          className="input-field"
          aria-invalid={errors.gender ? true : undefined}
          {...registerField("gender")}
        >
          <option value="" disabled>
            Select gender
          </option>
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.gender?.message} />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input-field"
          aria-invalid={errors.email ? true : undefined}
          {...registerField("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <label
          htmlFor="mobile"
          className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <PhoneInput
              id="mobile"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.mobile?.message}
            />
          )}
        />
        <input type="hidden" {...registerField("countryCode")} />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Password <span className="text-red-500">*</span>
        </label>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              id="password"
              variant="student"
              visible={showPassword}
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              {...field}
            />
          )}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <PasswordInput
              id="confirmPassword"
              variant="student"
              visible={showPassword}
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? true : undefined}
              {...field}
            />
          )}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      {submitError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      <ShowPasswordCheckbox
        checked={showPassword}
        onChange={setShowPassword}
        variant="student"
        disabled={isSubmitting}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Register Account"}
      </button>

      <Link
        href="/login"
        className="block text-center text-sm font-medium text-primary hover:text-indigo-600"
      >
        Already have an account? Sign in
      </Link>
    </form>
    </>
  );
}
