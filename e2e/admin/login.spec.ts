import { expect, test } from "@playwright/test";

test.describe("Admin login page", () => {
  test("renders admin login form", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Admin Portal" }),
    ).toBeVisible();
    await expect(
      page.getByText("Authorized personnel only — secure sign-in required"),
    ).toBeVisible();

    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByText("AI Security Verification")).toBeVisible();
    await expect(page.getByLabel("Security code")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Sign in" }),
    ).toBeVisible();
  });
});
