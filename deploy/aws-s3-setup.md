# Amazon S3 setup for document uploads

Use this guide for your bucket **`scholarship-docs`** in **`ap-south-1` (Mumbai)**.

The API stores uploaded scholarship documents in S3 using **presigned URLs** (browser uploads directly to S3; files persist permanently).

---

## 1. Bucket (already done)

You created:

| Setting | Value |
|---------|--------|
| Bucket name | `scholarship-docs` |
| Region | `ap-south-1` |

Recommended bucket settings (AWS Console → bucket → **Properties**):

- **Block Public Access**: keep **all blocked** (access via presigned URLs only)
- **Versioning** (optional): enable if you want file history / recovery

---

## 2. CORS (required for browser uploads)

AWS Console → **S3** → `scholarship-docs` → **Permissions** → **Cross-origin resource sharing (CORS)** → **Edit**

Paste the contents of [`aws-s3-cors.json`](./aws-s3-cors.json), or:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "https://scholarship-algo.vercel.app",
      "https://scholarship-admin-algo.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Save.

---

## 3. IAM user for the API

1. **IAM** → **Users** → **Create user** (e.g. `scholarship-api-s3`)
2. **Attach policies directly** → **Create policy** → JSON
3. Paste [`aws-s3-iam-policy.json`](./aws-s3-iam-policy.json)
4. Name the policy `scholarship-s3-docs` and attach it to the user
5. Open the user → **Security credentials** → **Create access key** → **Application running outside AWS**
6. Copy **Access key ID** and **Secret access key** (shown once)

---

## 4. Vercel environment variables

On project **`scholarship-api`** → **Settings** → **Environment Variables** → **Production**:

```env
S3_BUCKET=scholarship-docs
S3_REGION=ap-south-1
S3_ACCESS_KEY=AKIA........................
S3_SECRET_KEY=........................................
```

For **native Amazon S3**, leave **`S3_ENDPOINT` unset** (the API uses the AWS SDK default for `ap-south-1`).

| Variable | Amazon S3 value |
|----------|-----------------|
| `S3_BUCKET` | `scholarship-docs` |
| `S3_REGION` | `ap-south-1` |
| `S3_ACCESS_KEY` | IAM access key ID |
| `S3_SECRET_KEY` | IAM secret access key |
| `S3_ENDPOINT` | *(omit for AWS)* |

Redeploy **`scholarship-api`** after saving.

---

## 5. Deploy application code

Ensure presigned upload code is deployed on API and student web, then redeploy both projects.

---

## 6. Verify

1. Log in at https://scholarship-algo.vercel.app
2. Open the application wizard → **Document Upload**
3. Upload a small PDF or JPG
4. In AWS Console → S3 → `scholarship-docs`, objects appear under:
   `{studentId}/{applicationId}/{documentType}/...`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Unauthorized` | Log in again (token expires after 15m) |
| CORS error in browser console | Fix CORS on the bucket (step 2) |
| `Access Denied` from S3 | Check IAM policy and Vercel access keys |
| File missing in S3 | Confirm `S3_REGION=ap-south-1` matches bucket region |

---

## Optional: apply CORS with AWS CLI

```bash
aws s3api put-bucket-cors \
  --bucket scholarship-docs \
  --cors-configuration file://deploy/aws-s3-cors-cli.json \
  --region ap-south-1
```
