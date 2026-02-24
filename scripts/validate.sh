#!/bin/bash
set -e

echo "=== KDashX3 VALIDATION SCRIPT ==="
echo ""

# 1. Build Check
echo "[1/5] Build Check..."
cd ~/KDashX3
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build exits 0"
else
    echo "❌ Build failed"
    cat /tmp/build.log
    exit 1
fi

# 2. Deploy Check (GitHub Pages)
echo ""
echo "[2/5] Deploy Check..."
DEPLOY_URL="https://tdsesolutions.github.io/KDashX3"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $DEPLOY_URL)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Deployed: $DEPLOY_URL"
else
    echo "❌ Deploy failed (HTTP $HTTP_CODE)"
    exit 1
fi

# 3. Backend Health Check
echo ""
echo "[3/5] Backend Health Check..."
BACKEND_URL=$(grep -o 'https://[^"]*trycloudflare.com' src/lib/config.js | head -1)
if curl -sf "$BACKEND_URL/health" > /tmp/health.json 2>&1; then
    echo "✅ Backend healthy: $BACKEND_URL"
    cat /tmp/health.json
else
    echo "❌ Backend not reachable"
    exit 1
fi

# 4. E2E Journey Suite
echo ""
echo "[4/5] Running E2E Journey Suite..."
bash scripts/e2e.sh

# 5. Audit Result
echo ""
echo "[5/5] AUDITOR DECLARATION:"
echo "================================"
echo "Build: PASS"
echo "Deploy: PASS ($DEPLOY_URL)"
echo "Backend: PASS ($BACKEND_URL)"
echo "Journeys: PASS"
echo "================================"
echo ""
echo "🎉 AUDIT PASS - Ready for production"
exit 0
