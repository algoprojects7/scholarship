export function resolveBackendApiUrl(): string {
  const base =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  return base.replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }

  return resolveBackendApiUrl();
}
