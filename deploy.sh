#!/bin/bash
# ============================================================
# PioneerOS — Safe Deploy (Build → Package → Upload → VPS)
# Features: Atomic deploy, health check, auto-rollback, backup retention
# Usage: ./deploy.sh
# ============================================================

set -e

VPS_HOST="root@srv1396855.hstgr.cloud"
VPS_PATH="/home/brandingpioneers.in/public_html"
PM2_PROCESS="branding-pioneers-in"
BUNDLE="pioneer-os-standalone.tar.gz"
OUT_DIR="pioneer-os-standalone"
BACKUP_RETENTION=3
REMOTE_SCRIPT="/tmp/pioneeros-deploy-$$.sh"

echo ""
echo "=========================================="
echo "  PioneerOS — Safe Deploy"
echo "=========================================="
echo ""

# ── Step 1: Build ─────────────────────────────────────────────
echo "[1/5] Building Next.js production..."
# Optimization: Skip memory-heavy Sentry/PWA wrappers during build
# Set memory limit to 2.5GB to force tighter garbage collection
# Disable telemetry to save a bit of overhead
NODE_ENV=production \
SKIP_SENTRY=true \
SKIP_PWA=true \
NEXT_TELEMETRY_DISABLED=1 \
NODE_OPTIONS="--max-old-space-size=2560" \
npm run build
echo "      ✅ Build complete"
echo ""

# ── Step 2: Package standalone ────────────────────────────────
echo "[2/5] Packaging standalone build..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Copy standalone build
cp -r .next/standalone/. "$OUT_DIR/"
mkdir -p "$OUT_DIR/.next/static"
cp -r .next/static/. "$OUT_DIR/.next/static/"
cp -r public/. "$OUT_DIR/public/"

# Do NOT bundle local .env to avoid overwriting production variables
# We will preserve the remote .env during the atomic swap instead.
# Bundle Prisma engines
mkdir -p "$OUT_DIR/prisma"
cp prisma/schema.prisma "$OUT_DIR/prisma/"
if [ -d node_modules/.prisma ]; then
  mkdir -p "$OUT_DIR/node_modules/.prisma"
  cp -r node_modules/.prisma/. "$OUT_DIR/node_modules/.prisma/"
fi

tar -czf "$BUNDLE" -C "$OUT_DIR" .
echo "      ✅ Packaged: $(du -sh $BUNDLE | cut -f1)"
echo ""

# ── Step 3: Upload to VPS ─────────────────────────────────────
echo "[3/5] Uploading to VPS..."
scp -C "$BUNDLE" "$VPS_HOST:/tmp/$BUNDLE"
echo "      ✅ Upload complete"
echo ""

# ── Step 4: Deploy on VPS ─────────────────────────────────────
echo "[4/5] Deploying on VPS (atomic swap + health check)..."

# Create remote deployment script
cat > "$REMOTE_SCRIPT" << 'SCRIPT_EOF'
#!/bin/bash
set -e

DEPLOY_DIR="/home/brandingpioneers.in/public_html"
BUNDLE="pioneer-os-standalone.tar.gz"
PM2_PROCESS="branding-pioneers-in"
RETENTION=3

echo "  → Pre-flight checks..."

# Clean old temp directories
rm -rf /tmp/pioneeros-deploy-* 2>/dev/null || true

echo "  → Creating backup..."
if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR 2>/dev/null)" ]; then
  BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
  cp -r "$DEPLOY_DIR" "/tmp/$BACKUP_NAME"
  echo "    Backup created: /tmp/$BACKUP_NAME"

  # Cleanup old backups (keep only RETENTION)
  cd /tmp
  BACKUP_COUNT=$(ls -d backup-* 2>/dev/null | wc -l)
  if [ "$BACKUP_COUNT" -gt "$RETENTION" ]; then
    ls -dt backup-* | tail -n +$((RETENTION + 1)) | xargs rm -rf
    echo "    Cleanup: removed $((BACKUP_COUNT - RETENTION)) old backup(s)"
  fi
else
  BACKUP_NAME=""
  echo "    No existing files to back up."
fi

echo "  → Atomic deployment..."
TEMP_DIR="/tmp/pioneeros-deploy-$(date +%s)"
mkdir -p "$TEMP_DIR"
tar -xzf "/tmp/$BUNDLE" -C "$TEMP_DIR"

# Atomic swap: rename old dir, move new dir into place
if [ -d "$DEPLOY_DIR" ]; then
  mv "$DEPLOY_DIR" "${DEPLOY_DIR}.old"
  
  # Preserve ownership
  OWNER=$(stat -c '%U:%G' "${DEPLOY_DIR}.old" 2>/dev/null || echo "brand7748:brand7748")
else
  OWNER="brand7748:brand7748"
fi

mv "$TEMP_DIR" "$DEPLOY_DIR"

# Restore production .env if it exists
if [ -d "${DEPLOY_DIR}.old" ] && [ -f "${DEPLOY_DIR}.old/.env" ]; then
  cp "${DEPLOY_DIR}.old/.env" "$DEPLOY_DIR/.env"
  echo "    Restored production .env"
fi

# Fix ownership for LiteSpeed
chown -R $OWNER "$DEPLOY_DIR"
echo "    Set ownership to $OWNER"

# Clean up old directory
rm -rf "${DEPLOY_DIR}.old"

echo "  → Restarting PM2 process..."
pm2 delete "$PM2_PROCESS" > /dev/null 2>&1 || true
cd "$DEPLOY_DIR"
PORT=3010 HOSTNAME=0.0.0.0 pm2 start server.js --name "$PM2_PROCESS"
pm2 save

echo "  → Health check (waiting 8s for server to start)..."
sleep 8

if curl -sf --max-time 10 https://brandingpioneers.in > /dev/null 2>&1; then
    echo "    ✅ Health check PASSED"
else
    echo "    ⚠️  Health check FAILED — rolling back..."
    if [ -n "$BACKUP_NAME" ] && [ -d "/tmp/$BACKUP_NAME" ]; then
      rm -rf "$DEPLOY_DIR"
      mv "/tmp/$BACKUP_NAME" "$DEPLOY_DIR"

      pm2 delete "$PM2_PROCESS" > /dev/null 2>&1 || true
      cd "$DEPLOY_DIR"
      PORT=3010 HOSTNAME=0.0.0.0 pm2 start server.js --name "$PM2_PROCESS"
      pm2 save

      echo "    ✅ Rollback complete"
      echo "    ❌ Deployment FAILED — restored previous version"
      exit 1
    else
      echo "    ❌ Rollback FAILED — no backup available"
      exit 1
    fi
fi

echo "  → Cleanup..."
rm -f "/tmp/$BUNDLE"

echo "  → PM2 Status:"
pm2 show "$PM2_PROCESS" | grep -E "status|restart|memory|uptime"

echo ""
echo "  Other VPS sites: NOT affected ✅"
SCRIPT_EOF

# Upload script and execute it
scp -C "$REMOTE_SCRIPT" "$VPS_HOST:$REMOTE_SCRIPT"
ssh "$VPS_HOST" "chmod +x $REMOTE_SCRIPT && bash $REMOTE_SCRIPT && rm -f $REMOTE_SCRIPT"

echo ""
echo "=========================================="
echo "  ✅ DEPLOYED SUCCESSFULLY"
echo "  🌐 https://brandingpioneers.in"
echo "=========================================="
echo ""

# Cleanup local tarball
rm -f "$BUNDLE"