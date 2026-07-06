const TOKEN_STORAGE_KEY = "accessToken";
const TOKEN_COOKIE = "token";

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

function readTokenFromCookie(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`),
  );
  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
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
    return stored;
  }

  const fromCookie = readTokenFromCookie();
  if (fromCookie) {
    memoryToken = fromCookie;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, fromCookie);
  }

  return fromCookie;
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

export function clearAccessToken(): void {
  memoryToken = null;

  if (!isBrowser()) {
    return;
  }

  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export async function logoutUser(): Promise<void> {
  const { logout } = await import("./api");

  try {
    await logout();
  } catch {
    // Clear local session even if the API call fails.
  }

  clearAccessToken();
}
