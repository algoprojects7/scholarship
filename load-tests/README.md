# Load Tests (k6)

Phase 6 load and smoke tests for the Scholarship API (`http://localhost:4000` by default).

## Install k6

k6 is not bundled with this repository. Install it from [k6.io](https://k6.io/docs/get-started/installation/):

- **Windows (winget):** `winget install k6 --source winget`
- **macOS (Homebrew):** `brew install k6`
- **Linux:** see [installation docs](https://grafana.com/docs/k6/latest/set-up/install-k6/)

Verify:

```bash
k6 version
```

## Prerequisites

1. **Infrastructure** — local PostgreSQL and Redis (see [docs/local-dev.md](../docs/local-dev.md)):

   ```bash
   pnpm run db:push
   pnpm run db:seed
   ```

2. **API** — start on port 4000 with captcha bypass for auth scripts:

   ```bash
   CAPTCHA_BYPASS=test pnpm run dev:api
   ```

   `CAPTCHA_BYPASS=test` must be set on the **API process** so login load tests can use the placeholder captcha code (`E2ETST`) without solving the image captcha. **Do not enable this in production.**

3. Seeded super admin credentials (see `docs/test.md`):
   - Email: `super@scholarship.local`
   - Password: `SuperAdmin@123`

## Run tests

From the repository root:

```bash
# Default smoke test (health endpoints)
pnpm run test:load

# Individual scripts
k6 run load-tests/health.js
k6 run load-tests/captcha-login.js
k6 run load-tests/admin-applications.js
```

Override the API URL:

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/health.js
```

Override admin credentials:

```bash
k6 run -e ADMIN_EMAIL=super@scholarship.local -e ADMIN_PASSWORD=SuperAdmin@123 load-tests/captcha-login.js
```

## Scripts

| Script | Description | Threshold |
|--------|-------------|-----------|
| `health.js` | Smoke test `GET /health`, `/health/live`, `/health/ready` | p95 &lt; 300ms |
| `captcha-login.js` | `GET /auth/captcha` then admin `POST /auth/login` (`X-Portal: admin`) | p95 &lt; 500ms |
| `admin-applications.js` | Login then `GET /admin/applications` with Bearer token | p95 &lt; 500ms |

All scripts assert `checks` pass rate is 100%.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `http://localhost:4000` | API base URL |
| `ADMIN_EMAIL` | `super@scholarship.local` | Admin login email |
| `ADMIN_PASSWORD` | `SuperAdmin@123` | Admin login password |
| `CAPTCHA_BYPASS` | _(unset)_ | Set to `test` on the **API** (not k6) to bypass captcha validation |

## Notes

- Auth scripts require `CAPTCHA_BYPASS=test` on the running API.
- Health smoke test does not require captcha bypass.
- Tune `vus` and `duration` in each script's `options` block for heavier load scenarios.
