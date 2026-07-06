#!/usr/bin/env bash
# External uptime check — exits 1 if API readiness probe fails.
# Usage: API_URL=https://api.example.com ./scripts/healthcheck.sh

set -euo pipefail

API_URL="${API_URL:-http://localhost:4000}"
RESPONSE="$(curl -sf "${API_URL}/health/ready" || true)"

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
  echo "OK: $API_URL/health/ready"
  exit 0
fi

echo "FAIL: $API_URL/health/ready — $RESPONSE" >&2
exit 1
