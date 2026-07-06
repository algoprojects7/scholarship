#!/usr/bin/env bash
# Daily PostgreSQL backup for VPS / Dokploy-managed Postgres.
# Requires: pg_dump, gzip, DATABASE_URL in environment or .env file.
#
# Cron example (VPS):
#   0 2 * * * DATABASE_URL='postgresql://...' /path/to/scholarship/scripts/backup-postgres.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$REPO_ROOT/backups"
RETENTION_DAYS=30

if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env"
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/scholarship_${TIMESTAMP}.sql.gz"

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"

find "$BACKUP_DIR" -name 'scholarship_*.sql.gz' -type f -mtime +"$RETENTION_DAYS" -delete
echo "Pruned backups older than ${RETENTION_DAYS} days"
