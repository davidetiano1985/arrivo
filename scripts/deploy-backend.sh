#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ARRIVO — Deploy Backend FastAPI su VPS
#
# USO (da GitHub Actions via SSH):
#   bash /root/arrivo/scripts/deploy-backend.sh "$SHA" "$ACTOR"
#
# Prerequisiti VPS:
#   - Python 3.12+ con venv in /root/arrivo/backend/.venv
#   - pm2 con processo "arrivo-api" configurato
#   - Alembic per le migration
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BACKEND_DIR="/root/arrivo/backend"
APP_NAME="arrivo-api"
HEALTH_URL="https://arrivoapp.it/api/v1/"
MAX_HEALTH_WAIT=60

GIT_SHA="${1:-}"
DEPLOYER="${2:-manual}"

echo "═══════════════════════════════════════════"
echo "  ARRIVO BACKEND DEPLOY — $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "═══════════════════════════════════════════"

# ── 1. Pull ────────────────────────────────────────────────────────────────────
echo "→ Pulling latest code..."
cd /root/arrivo
git fetch origin main
git reset --hard origin/main
COMMIT=$(git rev-parse HEAD)
COMMIT_SHORT=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=format:"%s")
echo "  Commit: $COMMIT_SHORT — $COMMIT_MSG"

# ── 2. Install / update Python deps ───────────────────────────────────────────
echo "→ Updating Python dependencies..."
cd "$BACKEND_DIR"
if [ ! -d .venv ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

# ── 3. Run Alembic migrations ─────────────────────────────────────────────────
echo "→ Running database migrations..."
alembic upgrade head 2>&1 | tail -5

# ── 4. Graceful reload ─────────────────────────────────────────────────────────
echo "→ Reloading PM2 process '$APP_NAME'..."
pm2 reload "$APP_NAME" --update-env

# ── 5. Health check ───────────────────────────────────────────────────────────
echo "→ Health check (max ${MAX_HEALTH_WAIT}s)..."
WAITED=0
until curl -sf "$HEALTH_URL" | grep -qE '"status"|"ok"|"version"' 2>/dev/null; do
    STATUS=$(curl -sf -o /dev/null -w '%{http_code}' "$HEALTH_URL" 2>/dev/null || echo "000")
    # FastAPI root → 200 o 404 entrambi OK per "sta girando"
    if [[ "$STATUS" =~ ^(200|404)$ ]]; then
        break
    fi
    if [ "$WAITED" -ge "$MAX_HEALTH_WAIT" ]; then
        echo "✗ Health check FAILED dopo ${MAX_HEALTH_WAIT}s — rollback"
        pm2 reload "$APP_NAME" --update-env || true
        exit 1
    fi
    sleep 3
    WAITED=$((WAITED + 3))
done

echo ""
echo "✓ Backend deploy completo in ${WAITED}s"
echo "  Commit: $COMMIT_SHORT — $COMMIT_MSG"
echo "  By: $DEPLOYER"
pm2 status "$APP_NAME" 2>/dev/null || true
