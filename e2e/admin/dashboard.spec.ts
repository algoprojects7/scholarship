import { expect, test } from "@playwright/test";
import { ADMIN_CREDENTIALS, loginAdmin } from "../fixtures/auth";

test.describe("Admin dashboard", () => {
  test("loads dashboard after super admin login", async ({ page }) => {
    await loginAdmin(
      page,
      ADMIN_CREDENTIALS.email,
      ADMIN_CREDENTIALS.password,
    );

    await expect(page).toHaveURL("/");
    await expect(page.getByText("Admin Portal").first()).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Admin navigation" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Key Metrics" })).toBeVisible(
      { timeout: 15_000 },
    );
    await expect(page.getByText("Total Applications")).toBeVisible();
  });
});
