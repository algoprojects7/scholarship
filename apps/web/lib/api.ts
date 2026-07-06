import { getAccessToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
  credentials?: RequestCredentials;
}

interface ApiFetchFormDataOptions extends Omit<RequestInit, "body"> {
  body: FormData;
  auth?: boolean;
  portal?: "student" | "admin";
  credentials?: RequestCredentials;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName: string;
      gender: string;
      countryCode: string;
      mobile: string;
      hasAvatar?: boolean;
    };
  };
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, auth = false, portal, credentials, headers: initHeaders, ...rest } = options;
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

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    credentials: credentials ?? (auth ? "include" : "same-origin"),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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

export async function apiFetchFormData<T>(
  path: string,
  options: ApiFetchFormDataOptions,
): Promise<T> {
  const { body, auth = false, portal, credentials, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (portal) {
    headers.set("X-Portal", portal);
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    credentials: credentials ?? (auth ? "include" : "same-origin"),
    body,
  });

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

export function getMe() {
  return apiFetch<MeResponse>("/auth/me", {
    auth: true,
    portal: "student",
  });
}

export interface RegisterResponse {
  message?: string;
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
    portal: "student",
    body: { email, password, captchaId, captchaCode },
  });
}

export function register(data: {
  fullName: string;
  gender: string;
  email: string;
  countryCode: "+91";
  mobile: string;
  password: string;
  confirmPassword: string;
}) {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    portal: "student",
    body: data,
  });
}

export interface LogoutResponse {
  message: string;
}

export function logout() {
  return apiFetch<LogoutResponse>("/auth/logout", {
    method: "POST",
    auth: true,
    portal: "student",
    credentials: "include",
  });
}

export interface ChangePasswordResponse {
  message: string;
}

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return apiFetch<ChangePasswordResponse>("/auth/change-password", {
    method: "PATCH",
    auth: true,
    portal: "student",
    body: data,
  });
}
