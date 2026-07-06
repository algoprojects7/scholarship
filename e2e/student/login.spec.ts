import { expect, test } from "@playwright/test";

test.describe("Student login page", () => {
  test("renders login form with captcha verification", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Student Portal")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();

    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    await expect(page.getByText("AI Security Verification")).toBeVisible();
    await expect(page.getByLabel("Security code")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Security verification code" }),
    ).toBeVisible();

    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Register/i }),
    ).toBeVisible();
  });
});
