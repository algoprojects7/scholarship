import { expect, test } from "@playwright/test";
import { uniqueMobile, uniqueStudentEmail } from "../fixtures/auth";

test.describe("Student registration", () => {
  test("submits registration form and redirects to login", async ({ page }) => {
    const email = uniqueStudentEmail();
    const mobile = uniqueMobile();

    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: "Create Account" }),
    ).toBeVisible();

    await page.getByLabel("Full Name").fill("E2E Test Student");
    await page.getByLabel("Gender").selectOption("MALE");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mobile number").fill(mobile);
    await page.getByLabel("Password", { exact: true }).fill("TestPass1");
    await page.getByLabel("Confirm Password").fill("TestPass1");

    await page.getByRole("button", { name: "Register Account" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });
});
