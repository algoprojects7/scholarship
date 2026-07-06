import { defineConfig, devices } from "@playwright/test";

const studentBaseURL = process.env.STUDENT_BASE_URL ?? "http://localhost:3000";
const adminBaseURL = process.env.ADMIN_BASE_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "../test-results",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "student",
      testMatch: /student\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: studentBaseURL,
      },
    },
    {
      name: "admin",
      testMatch: /admin\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminBaseURL,
      },
    },
  ],
});
