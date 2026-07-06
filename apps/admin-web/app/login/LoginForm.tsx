"use client";

import { PasswordInput, SecurityVerification, ShowPasswordCheckbox } from "@scholarship/ui";
import { loginSchema, type LoginInput } from "@scholarship/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError, login } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";

type LoginFormValues = LoginInput;

/** Same-origin proxy — see `app/api/auth/captcha/route.ts` */
const CAPTCHA_API_BASE = "/api";

export function LoginForm() {
  const router = useRouter();
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
      router.push("/");
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
    <form
      className="space-y-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Admin login form"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium text-admin-primary"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
          disabled={isSubmitting}
          className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-primary placeholder:text-admin-muted/60 focus:outline-none focus:ring-2 focus:ring-admin-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-1 text-2xs text-red-600" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium text-admin-primary"
        >
          Password
        </label>
        <PasswordInput
          id="password"
          variant="admin"
          visible={showPassword}
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isSubmitting}
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-1 text-2xs text-red-600" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <SecurityVerification
        apiBaseUrl={CAPTCHA_API_BASE}
        variant="admin"
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
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      <ShowPasswordCheckbox
        checked={showPassword}
        onChange={setShowPassword}
        variant="admin"
        disabled={isSubmitting}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-admin-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
