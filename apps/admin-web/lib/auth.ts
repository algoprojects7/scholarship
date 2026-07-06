import type { AdminType } from "@scholarship/shared";
import { apiFetch } from "./api";

const TOKEN_STORAGE_KEY = "accessToken";
const TOKEN_COOKIE = "token";

export interface AdminUserProfile {
  fullName: string;
  employeeId: string;
}

export interface AdminMeResponse {
  user: {
    id: string;
    email: string;
    role: string;
    adminType?: AdminType;
    profile?: AdminUserProfile;
  };
}

export function getMe() {
  return apiFetch<AdminMeResponse>("/auth/me", {
    auth: true,
    portal: "admin",
  });
}

let memoryToken: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function setAccessToken(token: string): void {
  memoryToken = token;

  if (!isBrowser()) {
    return;
  }

  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }

  if (!isBrowser()) {
    return null;
  }

  const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (stored) {
    memoryToken = stored;
  }

  return stored;
}

export function clearAccessToken(): void {
  memoryToken = null;

  if (!isBrowser()) {
    return;
  }

  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
