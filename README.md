# Scholarship Management System

A full-stack scholarship management platform for students and administrators. Students apply for scholarships, upload documents, and track payment status. Admins review applications, manage allocations, audit activity, and run reports.

Built as a **pnpm + Turborepo** monorepo with a NestJS API and two Next.js frontends.

## Repository structure

```
scholarship/
├── apps/
│   ├── api/          # NestJS REST API (port 4000)
│   ├── web/          # Student portal (Next.js, port 3000)
│   └── admin-web/    # Admin portal (Next.js, port 3001)
├── packages/
│   ├── database/     # Prisma schema, migrations, seed
│   ├── shared/         # Shared types, validators, constants
│   └── ui/             # Shared React components (captcha, phone input, etc.)
├── e2e/              # Playwright end-to-end tests
├── load-tests/       # k6 load tests
└── scripts/          # Backup and health-check utilities
```

## Tech stack

| Layer | Technology |
|-------|------------|
| API | NestJS, Prisma, PostgreSQL, Redis, S3/MinIO |
| Frontends | Next.js 15, React 19, Tailwind CSS |
| Monorepo | pnpm workspaces, Turborepo |
| Auth | JWT (access + refresh), role-based permissions |
| Testing | Playwright (e2e), k6 (load) |

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** 9.15.x (`corepack enable` recommended)
- **PostgreSQL** 16+
- **Redis**
- **S3-compatible storage** (MinIO for local development)

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env file and adjust values for your local services:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets (min 32 chars) |
| `S3_*` | Object storage for uploaded documents |
| `SITE_URL` / `ADMIN_URL` / `API_URL` | Portal and API base URLs |
| `CORS_ORIGINS` | Allowed frontend origins for the API |

Per-app examples are also available at `apps/api/.env.example`, `apps/web/.env.example`, and `apps/admin-web/.env.example`.

### 3. Prepare the database

```bash
pnpm run db:push      # sync schema to database
pnpm run db:seed      # seed super admin and reference data
```

### 4. Start development servers

Run all three apps:

```bash
pnpm run dev
```

Or start individually:

```bash
pnpm run dev:api      # http://localhost:4000
pnpm run dev:web      # http://localhost:3000
pnpm run dev:admin    # http://localhost:3001
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start API, student web, and admin web |
| `pnpm run build` | Build all apps and packages |
| `pnpm run lint` | Lint across the monorepo |
| `pnpm run typecheck` | TypeScript check across the monorepo |
| `pnpm run db:generate` | Generate Prisma client |
| `pnpm run db:migrate` | Run Prisma migrations (dev) |
| `pnpm run db:migrate:deploy` | Deploy migrations (production) |
| `pnpm run test:e2e` | Run Playwright e2e tests |
| `pnpm run test:load` | Run k6 health load test |

## Default seeded admin

After `db:seed`, a super admin account is available (override via `SEED_SUPER_ADMIN_*` in `.env`):

- **Email:** `super@scholarship.local`
- **Password:** `SuperAdmin@123`

## Testing

**E2E (Playwright)** — see [e2e/README.md](e2e/README.md). Start PostgreSQL, Redis, and the API with `CAPTCHA_BYPASS=test` for login flows.

**Load tests (k6)** — see [load-tests/README.md](load-tests/README.md).

```bash
pnpm run test:e2e
pnpm run test:load
```

## CI

GitHub Actions runs on pushes and pull requests to `main` and `develop`:

- Install dependencies
- Generate and validate Prisma schema
- Lint, typecheck, and build

Workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)

## Production notes

- Use `.env.prod.example` as a starting point for production environment variables.
- Never commit `.env` files or secrets to version control.
- Run `pnpm run db:migrate:deploy` before starting the API in production.
- Backup scripts are available in `scripts/` for PostgreSQL.

## License

Private — all rights reserved.
