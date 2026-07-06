import { getAccessToken } from "./auth";
import { getApiBaseUrl } from "./resolve-api-base";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  portal?: "student" | "admin";
  _retry?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, auth = false, portal, headers: initHeaders, _retry, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (portal) {
    headers.set("X-Portal", portal);
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && !_retry) {
    const { refreshAccessToken } = await import("./auth");
    const refreshed = await refreshAccessToken(portal);
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retry: true });
    }
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : Array.isArray(payload.message)
          ? payload.message.join(", ")
          : "Request failed";

    throw new ApiError(
      message,
      response.status,
      typeof payload.code === "string" ? payload.code : undefined,
    );
  }

  return payload as T;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export function login(
  email: string,
  password: string,
  captchaId: string,
  captchaCode: string,
) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    portal: "admin",
    body: { email, password, captchaId, captchaCode },
  });
}

export interface LogoutResponse {
  message: string;
}

export function logout() {
  return apiFetch<LogoutResponse>("/auth/logout", {
    method: "POST",
    auth: true,
    portal: "admin",
  });
}
