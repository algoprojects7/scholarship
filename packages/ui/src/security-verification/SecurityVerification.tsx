"use client";

import { useEffect } from "react";
import type { SecurityVerificationProps } from "./types";
import { useCaptcha } from "./useCaptcha";
import { SecurityPuzzle } from "./SecurityPuzzle";

export function SecurityVerification({
  apiBaseUrl,
  value,
  onChange,
  error,
  disabled = false,
}: SecurityVerificationProps) {
  const { captchaId, refresh } = useCaptcha(apiBaseUrl);

  useEffect(() => {
    if (captchaId && captchaId !== value.captchaId) {
      onChange({ captchaId, captchaCode: value.captchaCode });
    }
  }, [captchaId, onChange, value.captchaCode, value.captchaId]);

  return (
    <SecurityPuzzle
      captchaId={value.captchaId || captchaId}
      onSolve={(token) => {
        onChange({
          captchaId: value.captchaId || captchaId,
          captchaCode: token,
        });
      }}
      onReset={() => {
        void refresh();
        onChange({
          captchaId: captchaId,
          captchaCode: "",
        });
      }}
      disabled={disabled}
      error={error}
    />
  );
}
