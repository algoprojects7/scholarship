import { type APIRequestContext, type Page, request } from "@playwright/test";

export const API_URL = process.env.API_URL ?? "http://localhost:4000";

/** Placeholder captcha code — accepted when API runs with CAPTCHA_BYPASS=test */
export const CAPTCHA_BYPASS_CODE = "E2ETST";

export const ADMIN_CREDENTIALS = {
  email: process.env.E2E_ADMIN_EMAIL ?? "super@scholarship.local",
  password: process.env.E2E_ADMIN_PASSWORD ?? "SuperAdmin@123",
} as const;

export interface CaptchaChallenge {
  captchaId: string;
  imageBase64: string;
  expiresIn?: number;
}

export async function createApiContext(): Promise<APIRequestContext> {
  return request.newContext({ baseURL: API_URL });
}

export async function fetchCaptcha(
  api: APIRequestContext,
): Promise<CaptchaChallenge> {
  const response = await api.get("/auth/captcha");
  if (!response.ok()) {
    throw new Error(`Failed to fetch captcha: ${response.status()}`);
  }

  return response.json() as Promise<CaptchaChallenge>;
}

async function fillLoginForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);

  await page
    .getByRole("img", { name: "Security verification code" })
    .waitFor({ state: "visible" });
  await page.getByLabel("Security code").fill(CAPTCHA_BYPASS_CODE);
}

export async function loginStudent(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await fillLoginForm(page, email, password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function loginAdmin(
  page: Page,
  email: string = ADMIN_CREDENTIALS.email,
  password: string = ADMIN_CREDENTIALS.password,
): Promise<void> {
  await page.goto("/login");
  await fillLoginForm(page, email, password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export function uniqueStudentEmail(): string {
  return `e2e-student-${Date.now()}@test.local`;
}

export function uniqueMobile(): string {
  const suffix = String(Date.now()).slice(-9);
  return `9${suffix}`;
}
