#!/bin/bash
set -e

echo "=== KDashX3 VALIDATION SCRIPT (PAID USER STANDARD) ==="
echo ""

# 1. Build Check
echo "[1/5] Build Check..."
cd ~/KDashX3
npm run build > /tmp/build.log 2>&1
BUILD_EXIT=$?
if [ $BUILD_EXIT -eq 0 ]; then
    echo "✅ Build exits 0"
else
    echo "❌ Build failed (exit $BUILD_EXIT)"
    cat /tmp/build.log
    exit 1
fi

# 2. Deploy Check (GitHub Pages)
echo ""
echo "[2/5] Deploy Check..."
DEPLOY_URL="https://tdsesolutions.github.io/KDashX3"
HTTP_CODE=$(curl -sL -o /dev/null -w "%{http_code}" $DEPLOY_URL)
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

# 4. E2E Journey Suite (MUST FAIL IF ANY JOURNEY FAILS)
echo ""
echo "[4/5] Running E2E Journey Suite..."
cd ~/KDashX3
npx playwright test tests/e2e/journeys/*.spec.cjs --reporter=list --trace=on
JOURNEY_EXIT=$?

if [ $JOURNEY_EXIT -ne 0 ]; then
    echo ""
    echo "❌ JOURNEYS FAILED (exit $JOURNEY_EXIT)"
    echo "Traces: test-results/"
    echo "Screenshots: tests/e2e/screenshots/"
    exit 1
fi

# 5. AUDITOR DECLARATION
echo ""
echo "[5/5] AUDITOR DECLARATION:"
echo "================================"
echo "Build: PASS (exit 0)"
echo "Deploy: PASS ($DEPLOY_URL)"
echo "Backend: PASS ($BACKEND_URL)"
echo "Journeys: PASS (all 5 journeys)"
echo "================================"
echo ""
echo "🎉 AUDIT PASS - Ready for production"
exit 0
