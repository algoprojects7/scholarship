# Vercel Deployment Guide

Deploy the Scholarship Management System monorepo to Vercel with **Prisma Postgres**, **Upstash Redis**, **Vercel Blob** (document uploads), and three Vercel projects (API, student web, admin web).

## Architecture

```
┌─────────────────────────┐     ┌─────────────────────────┐
│  scholarship-web        │     │  scholarship-admin-web  │
│  (apps/web)             │     │  (apps/admin-web)       │
│  Next.js                │     │  Next.js                │
└───────────┬─────────────┘     └───────────┬─────────────┘
            │  API_URL (server proxy)         │
            └──────────────┬──────────────────┘
                           │ HTTPS
                           ▼
            ┌──────────────────────────────┐
            │  scholarship-api             │
            │  (apps/api)                  │
            │  NestJS → serverless fn      │
            └───────────┬──────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   ┌─────────────────┐          ┌─────────────────┐
   │ Prisma Postgres │          │ Upstash Redis   │
   │ (Vercel Storage)│          │ (Vercel Storage)│
   └─────────────────┘          └─────────────────┘
            │
            ▼
   ┌─────────────────┐
   │ Vercel Blob     │
   │ (document files)│
   └─────────────────┘
```

| Vercel project        | Root directory | Framework   |
|-----------------------|----------------|-------------|
| `scholarship-api`     | `apps/api`     | Other       |
| `scholarship-web`     | `apps/web`     | Next.js     |
| `scholarship-admin-web` | `apps/admin-web` | Next.js |

All three projects import the **same GitHub repository**; only the root directory differs.

### Current deployment URLs

| Vercel project | URL |
|----------------|-----|
| `scholarship-web` | https://scholarship-algo.vercel.app |
| `scholarship-admin-web` | https://scholarship-admin-algo.vercel.app |
| `scholarship-api` | https://scholarship-api-six.vercel.app |

After renaming frontend domains, update **`CORS_ORIGINS`**, **`SITE_URL`**, and **`ADMIN_URL`** on the API project (see Step 7).

---

## Prerequisites

- GitHub repository pushed (e.g. `algoprojects7/scholarship`)
- [Vercel](https://vercel.com) account linked to GitHub
- Node.js ≥ 20 locally (for one-time database setup)
- pnpm 9.15.x locally (`corepack enable`)

---

## Step 1 — Create Prisma Postgres

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → **Storage**.
2. Click **Create Database** → **Prisma Postgres** (or connect an existing instance).
3. Name it (e.g. `scholarship-db`).
4. Copy the **pooled** connection string (`postgres://...@pooled.db.prisma.io:5432/postgres?sslmode=require`).

You will connect this database to the API project in Step 4.

---

## Step 2 — Push database schema (one-time, local)

From your machine, apply the Prisma schema to the production database:

```bash
cd packages/database

# Paste the pooled URL from Vercel Storage
export DATABASE_URL="postgres://USER:PASSWORD@pooled.db.prisma.io:5432/postgres?sslmode=require"

pnpm exec prisma db push
```

Seed the super admin (first deploy only):

```bash
export SEED_SUPER_ADMIN_EMAIL="super@scholarship.local"
export SEED_SUPER_ADMIN_PASSWORD="YourSecurePasswordHere"

pnpm exec prisma db seed
```

Default seed credentials (if env vars are omitted):

| Field    | Value                     |
|----------|---------------------------|
| Email    | `super@scholarship.local` |
| Password | `SuperAdmin@123`          |

Change the password after first login.

---

## Step 3 — Create Upstash Redis

1. **Storage** → **Create Database** → **Upstash Redis**.
2. Name it (e.g. `scholarship-redis`).
3. Connect it to the **API** project when prompted (or in Step 4).

Redis is required for captcha, JWT sessions, and admin cache.

---

## Step 3.5 — Create Vercel Blob (document uploads)

Required for students to upload Aadhaar, marksheets, and other application documents on Vercel. **Recommended for client demos and testing** — no AWS account needed.

1. **Storage** → **Create Database / Store** → **Blob**.
2. Name it (e.g. `scholarship-uploads`) → **Create**.
3. **Connect to Project** → select **`scholarship-api`** (not the web projects).
4. Vercel automatically adds **`BLOB_READ_WRITE_TOKEN`** to `scholarship-api` environment variables.
5. Redeploy **`scholarship-api`** after connecting.

### Where to verify `BLOB_READ_WRITE_TOKEN`

- **scholarship-api** → **Settings** → **Environment Variables** → search `BLOB_READ_WRITE_TOKEN`
- Or **Storage** → your Blob store → **Connected Projects** should list `scholarship-api`

You do not need to copy the token manually — Vercel injects it at runtime. If the variable is missing, the Blob store is not connected to the API project.

### How uploads work with Blob

1. Student selects a file in the application wizard.
2. Browser sends the file through the `/api` proxy → API.
3. API stores the file in **Vercel Blob** (persistent).
4. File metadata is saved in PostgreSQL.

No S3 CORS or IAM setup is required.

### Blob limits (testing)

| Item | Limit |
|------|--------|
| Max file size | **~4.5 MB** via serverless proxy (use smaller files for demos) |
| Cost | Vercel Blob free tier is enough for short client testing |
| Long-term production | Prefer Amazon S3 — see [aws-s3-setup.md](./aws-s3-setup.md) |

> **Storage priority:** If both Blob and S3 are configured, **Blob is used first**. Remove or disconnect Blob when switching to S3 for production.

See also: [vercel-blob-setup.md](./vercel-blob-setup.md)

---

## Step 4 — Deploy the API (`scholarship-api`)

### 4.1 Import project

1. **Add New…** → **Project** → import `scholarship` from GitHub.
2. Set **Project Name** to `scholarship-api`.
3. **Root Directory** → `apps/api`
4. Enable **Include files outside the root directory in the Build Step**.
5. **Framework Preset** → **Other**

### 4.2 Build settings

The repo includes `apps/api/vercel.json`. Prefer these values (turn **Override** off to use the file, or match manually):

| Setting            | Value |
|--------------------|-------|
| Install Command    | `cd ../.. && pnpm install --frozen-lockfile --prod=false` |
| Build Command      | `cd ../.. && pnpm run db:generate && pnpm run build --filter=@scholarship/api` |
| Output Directory   | `public` |
| Node.js Version    | `20.x` |

> `--prod=false` is required so devDependencies (`turbo`, `@nestjs/cli`, `typescript`) install during the build.

### 4.3 Connect storage

1. **Storage** → Prisma Postgres → **Connect Project** → `scholarship-api`
2. **Storage** → Upstash Redis → **Connect Project** → `scholarship-api`
3. **Storage** → Vercel Blob → **Connect Project** → `scholarship-api` (see Step 3.5)

Vercel injects `DATABASE_URL`, `REDIS_URL`, and `BLOB_READ_WRITE_TOKEN` automatically.

### 4.4 API environment variables

**Settings** → **Environment Variables** → **Production**:

```env
# Domains — update when you rename Vercel URLs or add custom domains
SITE_URL=https://scholarship-algo.vercel.app
ADMIN_URL=https://scholarship-admin-algo.vercel.app
API_URL=https://scholarship-api-six.vercel.app
CORS_ORIGINS=https://scholarship-algo.vercel.app,https://scholarship-admin-algo.vercel.app

# JWT — generate two different random strings (32+ chars each)
JWT_ACCESS_SECRET=your-long-random-access-secret
JWT_REFRESH_SECRET=your-long-random-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Captcha
CAPTCHA_TTL_SECONDS=300

# Document uploads — use ONE of the options below:

# Option A (recommended for testing): Vercel Blob
# Connect Blob store to scholarship-api in Step 3.5.
# BLOB_READ_WRITE_TOKEN is auto-injected — do not set manually.

# Option B (production): Amazon S3 — omit S3_ENDPOINT for native AWS:
# S3_BUCKET=scholarship-docs
# S3_REGION=ap-south-1
# S3_ACCESS_KEY=your-iam-access-key-id
# S3_SECRET_KEY=your-iam-secret-access-key

# Option C: Cloudflare R2 / MinIO — set endpoint:
# S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
# S3_BUCKET=scholarship-docs
# S3_REGION=auto
# S3_ACCESS_KEY=...
# S3_SECRET_KEY=...
```

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Auto-injected when Prisma Postgres is linked |
| `REDIS_URL` | Auto-injected when Upstash Redis is linked |
| `BLOB_READ_WRITE_TOKEN` | Auto-injected when Vercel Blob is linked to `scholarship-api` |
| `NODE_ENV` | **Do not set manually** — Vercel sets production automatically. Setting it can skip devDependencies during install. |
| `S3_*` | Optional if Vercel Blob is connected. Required for S3/R2-only setups. See [aws-s3-setup.md](./aws-s3-setup.md) |

### 4.4.1 Vercel Blob (recommended for testing)

Already covered in **Step 3.5**. Summary:

1. Create Blob store → connect to **`scholarship-api`**
2. Confirm `BLOB_READ_WRITE_TOKEN` under **Settings → Environment Variables**
3. Redeploy API
4. Test upload at https://scholarship-algo.vercel.app → application wizard → Document Upload
5. View files: **Storage** → Blob store → browse uploaded paths

No `S3_*` variables needed.

### 4.4.2 Amazon S3 (production)

Bucket: **`scholarship-docs`** in **`ap-south-1`**.

Full steps: **[deploy/aws-s3-setup.md](./aws-s3-setup.md)** (CORS, IAM user, Vercel env vars).

Vercel `scholarship-api` production:

```env
S3_BUCKET=scholarship-docs
S3_REGION=ap-south-1
S3_ACCESS_KEY=<IAM access key>
S3_SECRET_KEY=<IAM secret key>
```

Do **not** set `S3_ENDPOINT` for native AWS S3.

### 4.4.3 Cloudflare R2 (alternative)

1. In [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → create bucket `scholarship-docs`.
2. **Manage R2 API Tokens** → create token with **Object Read & Write** on that bucket.
3. Set API env vars (see block above). Use your account ID in the endpoint:
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
4. **CORS policy** on the bucket (required for browser uploads):

```json
[
  {
    "AllowedOrigins": [
      "https://scholarship-algo.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

5. Redeploy `scholarship-api` after setting `S3_*`.

Upload flow in production: browser → API presign (JSON via `/api` proxy) → direct **PUT** to R2 → API confirm. Files persist in R2, not on Vercel `/tmp`.

### 4.5 Deploy and verify

Deploy, then open:

```
https://scholarship-api-six.vercel.app/health
```

Expected:

```json
{"status":"ok","db":"ok","redis":"ok"}
```

Root endpoint:

```
https://scholarship-api-six.vercel.app/
```

Expected:

```json
{"name":"Scholarship API","status":"ok","health":"/health","docs":"/api/docs","url":"..."}
```

---

## Step 5 — Deploy student web (`scholarship-web`)

### 5.1 Import project

1. **Add New…** → **Project** → same GitHub repo.
2. **Project Name** → `scholarship-web`
3. **Root Directory** → `apps/web`
4. **Framework Preset** → **Next.js**

### 5.2 Environment variables

**Production**:

```env
API_URL=https://scholarship-api-six.vercel.app
NEXT_PUBLIC_SITE_URL=https://scholarship-algo.vercel.app
```

`NEXT_PUBLIC_API_URL` is optional for local dev; the browser uses the same-origin `/api` proxy in production.

### 5.3 Deploy

Click **Deploy**. After deploy, open https://scholarship-algo.vercel.app and test registration/login.

---

## Step 6 — Deploy admin web (`scholarship-admin-web`)

### 6.1 Import project

1. **Add New…** → **Project** → same GitHub repo.
2. **Project Name** → `scholarship-admin-web`
3. **Root Directory** → `apps/admin-web`
4. **Framework Preset** → **Next.js**

### 6.2 Environment variables

**Production**:

```env
API_URL=https://scholarship-api-six.vercel.app
NEXT_PUBLIC_PORTAL=admin
```

### 6.3 Deploy and verify

Open https://scholarship-admin-algo.vercel.app/login and sign in with the seeded super admin.

---

## Step 7 — Update API CORS after frontends are live

Once you know the final frontend URLs, set on **scholarship-api**:

```env
SITE_URL=https://scholarship-algo.vercel.app
ADMIN_URL=https://scholarship-admin-algo.vercel.app
API_URL=https://scholarship-api-six.vercel.app
CORS_ORIGINS=https://scholarship-algo.vercel.app,https://scholarship-admin-algo.vercel.app
```

Redeploy the API.

---

## Environment variable summary

### `scholarship-api`

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes (via Prisma Postgres) |
| `REDIS_URL` | Yes (via Upstash Redis) |
| `JWT_ACCESS_SECRET` | Yes |
| `JWT_REFRESH_SECRET` | Yes |
| `JWT_ACCESS_EXPIRY` | Yes (`15m`) |
| `JWT_REFRESH_EXPIRY` | Yes (`7d`) |
| `SITE_URL` | Yes |
| `ADMIN_URL` | Yes |
| `API_URL` | Yes |
| `CORS_ORIGINS` | Yes |
| `CAPTCHA_TTL_SECONDS` | Yes (`300`) |
| `BLOB_READ_WRITE_TOKEN` | Yes for uploads (auto-injected via Vercel Blob) |
| `S3_ENDPOINT` | Only if using S3/R2 instead of Blob |
| `S3_BUCKET` | Only if using S3/R2 instead of Blob |
| `S3_ACCESS_KEY` | Only if using S3/R2 instead of Blob |
| `S3_SECRET_KEY` | Only if using S3/R2 instead of Blob |
| `S3_REGION` | Only if using S3/R2 instead of Blob |

### `scholarship-web`

| Variable | Required |
|----------|----------|
| `API_URL` | Yes (server-side proxy to backend) |
| `NEXT_PUBLIC_SITE_URL` | Yes |
| `NEXT_PUBLIC_API_URL` | Optional (local dev fallback) |

### `scholarship-admin-web`

| Variable | Required |
|----------|----------|
| `API_URL` | Yes (server-side proxy to backend) |
| `NEXT_PUBLIC_PORTAL` | Yes (`admin`) |
| `NEXT_PUBLIC_API_URL` | Optional (local dev fallback) |

---

## Custom domains (optional)

For each Vercel project: **Settings** → **Domains** → add your domain.

Example:

| Project | Domain |
|---------|--------|
| `scholarship-web` | `scholarship.example.com` |
| `scholarship-admin-web` | `admin.scholarship.example.com` |
| `scholarship-api` | `api.scholarship.example.com` |

Update all environment variables (`SITE_URL`, `ADMIN_URL`, `API_URL`, `CORS_ORIGINS`, `NEXT_PUBLIC_*`) to use the custom domains, then redeploy all three projects.

---

## Troubleshooting

### Build fails: `devDependencies: skipped`

**Cause:** `NODE_ENV=production` during install.

**Fix:** Use `--prod=false` in the install command (already in `apps/api/vercel.json`). Remove manual `NODE_ENV` from API env vars.

### Build fails: `Cannot find module '../dist/create-app'`

**Cause:** Serverless handler compiled before `nest build`.

**Fix:** Ensure `buildCommand` runs `pnpm run build --filter=@scholarship/api` before packaging. Use current `apps/api/vercel.json`.

### Runtime: `mkdir '/var/task/uploads'`

**Cause:** No persistent storage configured; API tried local disk on read-only Vercel filesystem.

**Fix:** Connect **Vercel Blob** to `scholarship-api` (Step 3.5), or set `S3_*` env vars.

### Document upload shows `Unauthorized`

**Cause:** JWT expired (15 minutes) or not logged in.

**Fix:** Log in again and retry. With Vercel Blob connected, uploads go through the `/api` proxy with your session token.

### Document upload fails after choosing file

**Cause:** Blob store not connected to `scholarship-api`, or file exceeds ~4.5 MB serverless limit.

**Fix:**

1. Connect Vercel Blob to `scholarship-api` and redeploy.
2. Confirm `BLOB_READ_WRITE_TOKEN` exists under **Settings → Environment Variables**.
3. Use a test file ≤ 4.5 MB (PDF or JPG).

### Document upload — using S3/R2 instead of Blob

**Cause:** `S3_*` not configured, or R2 CORS does not allow your student site origin.

**Fix:** Set all `S3_*` variables, add CORS on the bucket for `https://scholarship-algo.vercel.app`, redeploy API. See [aws-s3-setup.md](./aws-s3-setup.md).

### Runtime: `Unable to determine event source based on event`

**Cause:** AWS `serverless-express` adapter used on Vercel.

**Fix:** Use `apps/api/api/index.js` (Express handler directly). Already in the repo.

### Login works for captcha but not sign-in

**Cause:** Browser API calls used `NEXT_PUBLIC_API_URL` at build time; when unset, the client called `http://localhost:4000`.

**Fix:** Frontends proxy all `/api/*` requests to the backend server-side. Set **`API_URL`** on `scholarship-web` and `scholarship-admin-web`:

```
API_URL=https://scholarship-api-six.vercel.app
```

Redeploy both frontends. `NEXT_PUBLIC_API_URL` is optional for local dev only.

### `/health` shows `db: "error"`

**Fix:** Link Prisma Postgres to `scholarship-api` or verify `DATABASE_URL`.

### `/health` shows `redis: "error"`

**Fix:** Create Upstash Redis and connect to `scholarship-api`.

### Admin login: `Invalid email or password`

**Fix:** Re-run `prisma db seed` against production `DATABASE_URL`, or reset password in the database.

---

## Post-deployment checklist

- [ ] `GET /health` returns `{"status":"ok","db":"ok","redis":"ok"}`
- [ ] Student site loads and can register/login
- [ ] Admin site login works at `/login`
- [ ] Super admin password changed from default
- [ ] Vercel Blob connected to `scholarship-api` (`BLOB_READ_WRITE_TOKEN` present)
- [ ] Document upload tested on student application wizard
- [ ] Database credentials rotated if ever exposed
- [ ] Custom domains and HTTPS configured (optional)

---

## Local development

See the root [README.md](../README.md) for local setup with Docker/MinIO/PostgreSQL.

## Related files

| File | Purpose |
|------|---------|
| `apps/api/vercel.json` | API Vercel build and serverless config |
| `apps/api/api/index.js` | Vercel serverless entrypoint |
| `deploy/vercel-blob-setup.md` | Vercel Blob quick reference |
| `deploy/aws-s3-setup.md` | Amazon S3 setup for production uploads |
| `packages/database/prisma/schema.prisma` | Database schema |
| `packages/database/prisma/seed.ts` | Super admin seed |
| `.env.prod.example` | Production env template |
