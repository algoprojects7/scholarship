"use client";

import { useEffect, useRef, useCallback } from "react";
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

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (captchaId && captchaId !== value.captchaId) {
      onChangeRef.current({ captchaId, captchaCode: value.captchaCode });
    }
  }, [captchaId, value.captchaId, value.captchaCode]);

  const handleSolve = useCallback(
    (token: string) => {
      onChangeRef.current({
        captchaId: value.captchaId || captchaId,
        captchaCode: token,
      });
    },
    [captchaId, value.captchaId],
  );

  const handleReset = useCallback(() => {
    void refresh();
    onChangeRef.current({
      captchaId: captchaId,
      captchaCode: "",
    });
  }, [captchaId, refresh]);

  return (
    <SecurityPuzzle
      captchaId={value.captchaId || captchaId}
      onSolve={handleSolve}
      onReset={handleReset}
      disabled={disabled}
      error={error}
    />
  );
}
