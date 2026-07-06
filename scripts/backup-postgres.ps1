# Daily PostgreSQL backup (Windows / PowerShell)
# Requires pg_dump in PATH and DATABASE_URL set.
#
# Usage:
#   $env:DATABASE_URL = 'postgresql://...'
#   .\scripts\backup-postgres.ps1

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$BackupDir = Join-Path $RepoRoot 'backups'
$RetentionDays = 30

if (-not $env:DATABASE_URL) {
    if (Test-Path (Join-Path $RepoRoot '.env')) {
        Get-Content (Join-Path $RepoRoot '.env') | ForEach-Object {
            if ($_ -match '^\s*([^#=]+)=(.*)$') {
                [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
            }
        }
    }
}

if (-not $env:DATABASE_URL) {
    Write-Error 'DATABASE_URL is not set'
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$Timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$BackupFile = Join-Path $BackupDir "scholarship_$Timestamp.sql.gz"

& pg_dump $env:DATABASE_URL | & gzip > $BackupFile
Write-Host "Backup created: $BackupFile"

Get-ChildItem $BackupDir -Filter 'scholarship_*.sql.gz' |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } |
    Remove-Item -Force

Write-Host "Pruned backups older than $RetentionDays days"
