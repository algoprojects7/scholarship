# Vercel Blob — easiest upload storage for testing

Use this for **client demos and testing** on Vercel. No AWS account, IAM, or S3 CORS setup.

Files are stored in **Vercel Blob** (persistent) and linked from your database.

---

## Setup (about 2 minutes)

1. Open [Vercel Dashboard](https://vercel.com) → project **`scholarship-api`**
2. **Storage** tab → **Create Database / Store** → **Blob**
3. Name it (e.g. `scholarship-uploads`) → **Create**
4. **Connect to Project** → select **`scholarship-api`** → connect
5. Vercel adds **`BLOB_READ_WRITE_TOKEN`** automatically.

### Where to check `BLOB_READ_WRITE_TOKEN`

- **scholarship-api** → **Settings** → **Environment Variables**
- Or **Storage** → your Blob store → **Connected Projects** → `scholarship-api`

You do not need to copy the value — Vercel injects it at deploy time.

6. **Redeploy** `scholarship-api` (and `scholarship-web` if upload code is not deployed yet)

That is all. You do **not** need `S3_*` variables for this path.

---

## How uploads work

1. Student selects a file in the application wizard
2. Browser sends the file through `/api` proxy → API
3. API saves the file to Vercel Blob (persistent storage)
4. Metadata is saved in PostgreSQL

No direct browser → S3 upload, so **no S3 CORS** configuration.

---

## Limits (testing)

| Item | Limit |
|------|--------|
| Max file size | **4.5 MB** on Vercel serverless (proxy upload). App allows 5 MB — use files ≤ 4.5 MB for demos. |
| Cost | Vercel Blob free tier is enough for short client testing |
| Production at scale | Prefer Amazon S3 or R2 — see [aws-s3-setup.md](./aws-s3-setup.md) |

---

## Storage priority

The API picks storage automatically:

1. **`BLOB_READ_WRITE_TOKEN` set** → Vercel Blob (easiest on Vercel)
2. **`S3_ACCESS_KEY` + `S3_SECRET_KEY` set** → Amazon S3 / R2
3. Otherwise → local disk (dev only; not persistent on Vercel)

If both Blob and S3 are set, **Blob wins** (good for quick testing without removing S3 vars).

---

## Verify

1. Log in at https://scholarship-algo.vercel.app
2. Upload a document (PDF/JPG under 4.5 MB)
3. Vercel → **Storage** → your Blob store → files appear under paths like `{studentId}/{applicationId}/...`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Unauthorized` on upload | Log in again; token expires after 15 minutes |
| Upload fails silently | Redeploy API after connecting Blob store |
| `STORAGE_REQUIRED` error | Connect Blob to `scholarship-api` or set S3 vars |
| File too large | Use a smaller test file (≤ 4.5 MB) |

---

## When to switch to S3

For long-term production with larger files (5 MB+) and lower egress cost, use [aws-s3-setup.md](./aws-s3-setup.md) and remove or disconnect Blob.

See also the main guide: [vercel.md](./vercel.md) (Step 3.5).
