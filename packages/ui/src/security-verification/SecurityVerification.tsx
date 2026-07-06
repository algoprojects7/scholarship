"use client";

import { useEffect } from "react";
import type { SecurityVerificationProps } from "./types";
import { useCaptcha } from "./useCaptcha";

const variantStyles = {
  student: {
    container:
      "rounded-xl border border-border bg-surface shadow-soft overflow-hidden",
    header: "border-b border-border bg-muted/40 px-4 py-3",
    title: "text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground)]",
    badge:
      "inline-flex items-center gap-1.5 rounded-full bg-primary-muted px-2 py-0.5 text-[0.6875rem] font-medium text-primary",
    dot: "h-1.5 w-1.5 rounded-full bg-emerald-500",
    body: "p-4",
    imageWrap:
      "flex h-14 min-w-[8.5rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-2",
    button:
      "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted hover:text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
    input:
      "h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm uppercase tracking-widest text-[var(--color-foreground)] placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
    hint: "text-xs text-red-500",
    error: "text-xs text-red-600",
    muted: "text-xs text-muted-foreground",
  },
  admin: {
    container:
      "rounded-md border border-admin-border bg-admin-surface overflow-hidden",
    header:
      "flex items-center justify-between border-b border-admin-border bg-[#0F172A] px-3 py-2.5",
    title: "text-2xs font-semibold uppercase tracking-wider text-white",
    badge:
      "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-2xs font-medium text-emerald-300",
    dot: "h-1.5 w-1.5 rounded-full bg-emerald-400",
    body: "bg-admin-bg p-3",
    imageWrap:
      "flex h-12 min-w-[8rem] items-center justify-center rounded border border-slate-200 bg-white px-2",
    button:
      "inline-flex h-8 w-8 items-center justify-center rounded border border-admin-border bg-admin-surface text-admin-muted transition-colors hover:border-admin-accent/40 hover:text-admin-accent disabled:cursor-not-allowed disabled:opacity-50",
    input:
      "h-8 w-full rounded border border-admin-border bg-admin-surface px-3 text-xs uppercase tracking-widest text-admin-primary placeholder:normal-case placeholder:tracking-normal placeholder:text-admin-muted/60 focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/20 disabled:cursor-not-allowed disabled:opacity-50",
    hint: "text-2xs text-red-500",
    error: "text-2xs text-red-600",
    muted: "text-2xs text-admin-muted",
  },
} as const;

function speakCaptchaCode(code: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(code.split("").join(" "));
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export function SecurityVerification({
  apiBaseUrl,
  value,
  onChange,
  variant = "student",
  error,
  disabled = false,
}: SecurityVerificationProps) {
  const styles = variantStyles[variant];
  const { captchaId, imageBase64, loading, error: fetchError, refresh } =
    useCaptcha(apiBaseUrl);

  useEffect(() => {
    if (captchaId && captchaId !== value.captchaId) {
      onChange({ captchaId, captchaCode: value.captchaCode });
    }
  }, [captchaId, onChange, value.captchaCode, value.captchaId]);

  const displayError = error ?? fetchError;

  return (
    <div className={styles.container} aria-live="polite">
      <div className={styles.header}>
        <div className="flex items-center gap-2">
          <span aria-hidden="true">🛡</span>
          <span className={styles.title}>AI Security Verification</span>
        </div>
        <span className={styles.badge}>
          <span className={styles.dot} aria-hidden="true" />
          Neural Shield Active
        </span>
      </div>

      <div className={styles.body}>
        <div className="flex flex-wrap items-center gap-2">
          <div className={styles.imageWrap}>
            {loading ? (
              <span className={styles.muted}>Loading…</span>
            ) : imageBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  imageBase64.startsWith("data:")
                    ? imageBase64
                    : `data:image/svg+xml;base64,${imageBase64}`
                }
                alt="Security verification code"
                className="max-h-12 max-w-full object-contain"
              />
            ) : (
              <span className={styles.muted}>No code</span>
            )}
          </div>

          <button
            type="button"
            className={styles.button}
            onClick={() => speakCaptchaCode(value.captchaCode || "security code")}
            disabled={disabled || loading || !value.captchaCode}
            aria-label="Play security code audio"
            title="Audio"
          >
            🔊
          </button>

          <button
            type="button"
            className={styles.button}
            onClick={() => void refresh()}
            disabled={disabled || loading}
            aria-label="Refresh security code"
            title="Refresh"
          >
            ↻
          </button>

          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            maxLength={6}
            value={value.captchaCode}
            onChange={(event) =>
              onChange({
                captchaId: value.captchaId || captchaId,
                captchaCode: event.target.value,
              })
            }
            placeholder="CODE"
            disabled={disabled || loading || !captchaId}
            className={`${styles.input} min-w-[7rem] flex-1`}
            aria-label="Security code"
          />
        </div>

        <p className={`${styles.hint} mt-2`}>
          Security code is not case-sensitive — you may use any case.
        </p>

        {displayError ? (
          <p className={`${styles.error} mt-2`} role="alert">
            {displayError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
