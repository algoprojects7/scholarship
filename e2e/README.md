# E2E Tests (Playwright)

End-to-end tests for the Scholarship Management System student portal (`localhost:3000`) and admin portal (`localhost:3001`).

## Prerequisites

1. **Infrastructure** — local PostgreSQL and Redis (see [docs/local-dev.md](../docs/local-dev.md)):

   ```bash
   pnpm run db:push
   pnpm run db:seed
   ```

2. **API** — start with captcha bypass enabled for login flows:

   ```bash
   CAPTCHA_BYPASS=test pnpm run dev:api
   ```

   When `CAPTCHA_BYPASS=test`, the API skips captcha validation so E2E tests can sign in without solving the image captcha. Do **not** use this in production.

3. **Frontends** — in separate terminals:

   ```bash
   pnpm run dev:web      # http://localhost:3000
   pnpm run dev:admin    # http://localhost:3001
   ```

## Install browsers (first time)

```bash
npx playwright install chromium
```

## Run tests

From the repository root:

```bash
pnpm run test:e2e
```

Useful variants:

```bash
# Single project
npx playwright test --config e2e/playwright.config.ts --project=student
npx playwright test --config e2e/playwright.config.ts --project=admin

# Headed / debug
npx playwright test --config e2e/playwright.config.ts --headed
npx playwright test --config e2e/playwright.config.ts --ui
```

## Test layout

| Path | Description |
|------|-------------|
| `student/register.spec.ts` | Student registration form submit → login redirect |
| `student/login.spec.ts` | Login page renders; captcha visible |
| `admin/login.spec.ts` | Admin login page renders |
| `admin/dashboard.spec.ts` | Super admin login → dashboard KPIs |

## Credentials

Admin dashboard tests use seeded super admin credentials (see `docs/test.md`):

- Email: `super@scholarship.local`
- Password: `SuperAdmin@123`

Override via `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`.

Student registration tests create a unique account on each run.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CAPTCHA_BYPASS` | _(unset)_ | Set to `test` on the **API** to bypass captcha validation |
| `API_URL` | `http://localhost:4000` | API base URL for fixtures |
| `STUDENT_BASE_URL` | `http://localhost:3000` | Student Playwright `baseURL` |
| `ADMIN_BASE_URL` | `http://localhost:3001` | Admin Playwright `baseURL` |
| `E2E_ADMIN_EMAIL` | `super@scholarship.local` | Admin login email |
| `E2E_ADMIN_PASSWORD` | `SuperAdmin@123` | Admin login password |

## Reports

HTML report (after a run):

```bash
npx playwright show-report
```

Test artifacts are written to `test-results/` at the repo root; HTML report to `playwright-report/`.
