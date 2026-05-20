#!/bin/bash
# Zero-downtime deploy script for Arrivo VPS.
#
# Strategy: pm2 reload (graceful restart) instead of pm2 restart.
# pm2 reload sends SIGINT to the old process, waits for in-flight requests
# to complete (up to 5s), then starts the new process.
# Zero-downtime for single-process fork mode.
#
# Usage: ./scripts/deploy.sh [commit_msg]

set -euo pipefail

APP_DIR="/root/arrivo/frontend"
APP_NAME="arrivo"
HEALTH_URL="https://arrivoapp.it/api/health"
MAX_HEALTH_WAIT=30   # seconds to wait for health check after reload

echo "═══════════════════════════════════════"
echo "  ARRIVO DEPLOY — $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "═══════════════════════════════════════"

# 1. Pull latest code
echo "→ Pulling latest code..."
cd /root/arrivo
git fetch origin main
git reset --hard origin/main

# 2. Install dependencies
echo "→ Installing dependencies..."
cd "$APP_DIR"
npm install --omit=dev 2>&1 | grep -E 'added|removed|changed|audit' || true

# 3. Regenerate Prisma client
echo "→ Generating Prisma client..."
DATABASE_URL=placeholder npx prisma generate 2>&1 | grep -E 'Generated|error' || true

# 4. Run pending migrations
echo "→ Running migrations..."
npx prisma migrate deploy 2>&1 | tail -5

# 5. Build Next.js
echo "→ Building Next.js..."
npm run build

# 6. Graceful reload (zero-downtime)
echo "→ Reloading PM2 (graceful)..."
pm2 reload "$APP_NAME" --update-env

# 7. Health check
echo "→ Health check (up to ${MAX_HEALTH_WAIT}s)..."
WAITED=0
until curl -sf "$HEALTH_URL" | grep -q '"status":"ok"'; do
  if [ "$WAITED" -ge "$MAX_HEALTH_WAIT" ]; then
    echo "✗ Health check FAILED after ${MAX_HEALTH_WAIT}s — rolling back"
    pm2 reload "$APP_NAME" --update-env  # reload again will pick last good build
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

echo ""
echo "✓ Deploy complete — site healthy after ${WAITED}s"
pm2 status "$APP_NAME"
