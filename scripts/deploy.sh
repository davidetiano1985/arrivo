#!/bin/bash
# Deploy script for Arrivo VPS.
#
# Strategy: pm2 restart (hard restart) — ~1-2s downtime, but prevents
# Next.js "Failed to find Server Action" errors that occur when pm2 reload
# briefly runs two workers with different Server Action IDs simultaneously.
# Build backup + rollback: keeps .next.bak for instant revert on failure.
# Migration: sources .env so DATABASE_URL is real, not placeholder.
#
# Usage:
#   ./scripts/deploy.sh [commit_sha] [deployer]
#   Called by GitHub Actions: bash /root/arrivo/scripts/deploy.sh "$SHA" "$ACTOR"

set -euo pipefail

APP_DIR="/root/arrivo/frontend"
APP_NAME="arrivo"
HEALTH_URL="https://arrivoapp.it/api/health"
MAX_HEALTH_WAIT=60     # seconds to wait for health check after reload
DEPLOY_INFO="$APP_DIR/.deploy-info.json"

GIT_SHA="${1:-}"      # optional: passed by GitHub Actions
DEPLOYER="${2:-cron}" # optional: passed by GitHub Actions

echo "═══════════════════════════════════════════"
echo "  ARRIVO DEPLOY — $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "═══════════════════════════════════════════"

# ── 1. Pull latest code ────────────────────────────────────────────────────────
echo "→ Pulling latest code..."
cd /root/arrivo
git fetch origin main
git reset --hard origin/main
COMMIT=$(git rev-parse HEAD)
COMMIT_SHORT=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=format:"%s")

echo "  Commit: $COMMIT_SHORT — $COMMIT_MSG"

# ── 2. Install dependencies ────────────────────────────────────────────────────
# Note: --include=dev ensures tailwindcss/postcss/autoprefixer are present even
# if a previous install used --omit=dev. These devDeps are required by next build.
echo "→ Installing dependencies..."
cd "$APP_DIR"
npm install --include=dev 2>&1 | grep -E 'added|removed|changed|audit' || true

# ── 3. Regenerate Prisma client (type-safe, no DB needed) ─────────────────────
echo "→ Generating Prisma client..."
DATABASE_URL=placeholder npx prisma generate 2>&1 | grep -E 'Generated|error' || true

# ── 4. Run pending migrations (requires real DATABASE_URL) ────────────────────
echo "→ Running migrations..."
# Extract DATABASE_URL directly from .env — handles quoted values and CRLF endings
_DB_URL=$(grep '^DATABASE_URL=' "$APP_DIR/.env" \
  | sed 's/^DATABASE_URL=//' \
  | tr -d '"' | tr -d "'" | tr -d '\r' | sed 's/[[:space:]]*$//')
# Temporarily disable pipefail so a migration warning doesn't abort the deploy
set +o pipefail
DATABASE_URL="$_DB_URL" npx prisma migrate deploy 2>&1 | tail -5 || \
  echo "  ⚠ Migration step returned non-zero (may be non-fatal if already applied)"
set -o pipefail

# ── 5. Backup current build for rollback ──────────────────────────────────────
echo "→ Backing up current build..."
if [ -d .next ]; then
  rm -rf .next.bak 2>/dev/null || true
  cp -r .next .next.bak
  echo "  ✓ .next backed up"
else
  echo "  ⚠ No existing .next build to back up"
fi

# ── 6. Build Next.js ──────────────────────────────────────────────────────────
echo "→ Building Next.js..."
if ! npm run build; then
  echo "✗ Build FAILED"

  # Restore previous build and keep the app running
  if [ -d .next.bak ]; then
    echo "→ Restoring previous build..."
    rm -rf .next
    mv .next.bak .next
    pm2 restart "$APP_NAME" --update-env || true
    echo "  ✓ Previous build restored — app still running"
  else
    echo "  ⚠ No backup available — app may be in a degraded state"
  fi

  # Write failure info
  cat > "$DEPLOY_INFO" <<JSONEOF
{
  "commit": "$COMMIT",
  "commitShort": "$COMMIT_SHORT",
  "commitMsg": "$COMMIT_MSG",
  "deployer": "$DEPLOYER",
  "deployedAt": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "status": "build_failed"
}
JSONEOF
  exit 1
fi

# ── 7. Write deploy info ──────────────────────────────────────────────────────
DEPLOYED_AT=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
cat > "$DEPLOY_INFO" <<JSONEOF
{
  "commit": "$COMMIT",
  "commitShort": "$COMMIT_SHORT",
  "commitMsg": "$COMMIT_MSG",
  "deployer": "$DEPLOYER",
  "deployedAt": "$DEPLOYED_AT",
  "status": "success"
}
JSONEOF
echo "→ Deploy info: $COMMIT_SHORT @ $DEPLOYED_AT"

# ── 8. Hard restart (prevents Server Action stale-worker ID mismatch) ─────────
echo "→ Restarting PM2 (hard restart + env refresh)..."
pm2 restart "$APP_NAME" --update-env

# ── 9. Health check with rollback ─────────────────────────────────────────────
echo "→ Health check (up to ${MAX_HEALTH_WAIT}s)..."
WAITED=0
until curl -sf "$HEALTH_URL" | grep -q '"status":"ok"'; do
  if [ "$WAITED" -ge "$MAX_HEALTH_WAIT" ]; then
    echo "✗ Health check FAILED after ${MAX_HEALTH_WAIT}s — rolling back"

    # Revert to previous build
    if [ -d .next.bak ]; then
      echo "→ Restoring previous build..."
      rm -rf .next
      mv .next.bak .next
      pm2 restart "$APP_NAME" --update-env || true
      echo "  ✓ Rollback complete"
    else
      echo "  ⚠ No backup available for rollback"
      pm2 restart "$APP_NAME" --update-env || true
    fi

    # Update deploy info with rollback status
    cat > "$DEPLOY_INFO" <<JSONEOF
{
  "commit": "$COMMIT",
  "commitShort": "$COMMIT_SHORT",
  "commitMsg": "$COMMIT_MSG",
  "deployer": "$DEPLOYER",
  "deployedAt": "$DEPLOYED_AT",
  "status": "rolled_back",
  "rollbackAt": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
}
JSONEOF
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

# ── 10. Cleanup backup on success ─────────────────────────────────────────────
rm -rf .next.bak 2>/dev/null || true

echo ""
echo "✓ Deploy complete in ${WAITED}s"
echo "  Commit:  $COMMIT_SHORT — $COMMIT_MSG"
echo "  By:      $DEPLOYER"
echo "  At:      $DEPLOYED_AT"
pm2 status "$APP_NAME"
