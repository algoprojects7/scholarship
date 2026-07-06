"use client";

import { useCallback, useEffect, useState } from "react";
import type { CaptchaResponse } from "./types";

function resolveApiBaseUrl(apiBaseUrl?: string): string {
  const base =
    apiBaseUrl ??
    (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL
      : undefined);

  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return base.replace(/\/$/, "");
}

export function useCaptcha(apiBaseUrl?: string) {
  const [captchaId, setCaptchaId] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = resolveApiBaseUrl(apiBaseUrl);
      const response = await fetch(`${baseUrl}/auth/captcha`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load security code. Please try again.");
      }

      const data = (await response.json()) as CaptchaResponse;
      setCaptchaId(data.captchaId);
      setImageBase64(data.imageBase64);
      setExpiresIn(data.expiresIn);
    } catch (err) {
      setCaptchaId("");
      setImageBase64("");
      setExpiresIn(0);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load security code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    captchaId,
    imageBase64,
    expiresIn,
    loading,
    error,
    refresh,
  };
}

