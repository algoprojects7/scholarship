"use client";

import { PasswordInput, SecurityVerification, ShowPasswordCheckbox } from "@scholarship/ui";
import { loginSchema, type LoginInput } from "@scholarship/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError, login } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";

type LoginFormValues = LoginInput;

/** Same-origin proxy — see `app/api/auth/captcha/route.ts` */
const CAPTCHA_API_BASE = "/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "Test@123",
      captchaId: "",
      captchaCode: "",
    },
  });

  const captchaId = watch("captchaId");
  const captchaCode = watch("captchaCode");

  const handleCaptchaChange = useCallback(
    (value: { captchaId: string; captchaCode: string }) => {
      setValue("captchaId", value.captchaId, { shouldValidate: true });
      setValue("captchaCode", value.captchaCode, { shouldValidate: true });
    },
    [setValue],
  );

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      const result = await login(
        values.email,
        values.password,
        values.captchaId,
        values.captchaCode,
      );

      setAccessToken(result.accessToken);

      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Unable to sign in. Please try again.");
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="input-field"
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-red-600" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Password
          </label>
          <PasswordInput
            id="password"
            variant="student"
            visible={showPassword}
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1.5 text-xs text-red-600" role="alert">
              {errors.password.message}
            </p>
          ) : null}
        </div>
      </div>

      <SecurityVerification
        apiBaseUrl={CAPTCHA_API_BASE}
        variant="student"
        disabled={isSubmitting}
        value={{ captchaId, captchaCode }}
        onChange={handleCaptchaChange}
        error={
          errors.captchaId?.message ??
          errors.captchaCode?.message ??
          undefined
        }
      />

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

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>

      <Link
        href="/register"
        className="block text-center text-sm font-medium text-primary hover:text-indigo-600"
      >
        Don&apos;t have an account? Register
      </Link>
    </form>
  );
}
