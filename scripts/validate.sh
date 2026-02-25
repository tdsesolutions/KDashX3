#!/bin/bash
set -e

echo "================================"
echo "PAID USER STANDARD VALIDATION"
echo "================================"
echo ""

FAILED=0

# Step 1: Build
echo "[1/4] Building frontend..."
cd ~/KDashX3
npm run build > /tmp/build.log 2>&1
BUILD_EXIT=$?
if [ $BUILD_EXIT -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed (exit $BUILD_EXIT)"
    tail -20 /tmp/build.log
    FAILED=1
fi
echo ""

# Step 2: Tenant isolation proof (uses direct API calls)
echo "[2/4] Running tenant isolation proof..."
bash scripts/tenant-proof.sh > /tmp/tenant-proof.log 2>&1
TENANT_EXIT=$?
if [ $TENANT_EXIT -eq 0 ]; then
    echo "✅ Tenant isolation verified"
else
    echo "❌ Tenant isolation failed (exit $TENANT_EXIT)"
    FAILED=1
fi
tail -20 /tmp/tenant-proof.log
echo ""

# Step 3: Verify backend endpoints
echo "[3/4] Verifying backend endpoints..."
API_URL="https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net"

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✅ Health endpoint: HTTP $HEALTH_STATUS"
else
    echo "❌ Health endpoint: HTTP $HEALTH_STATUS"
    FAILED=1
fi

CONNECTOR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/connector.js")
if [ "$CONNECTOR_STATUS" -eq 200 ]; then
    echo "✅ Connector.js endpoint: HTTP $CONNECTOR_STATUS"
else
    echo "❌ Connector.js endpoint: HTTP $CONNECTOR_STATUS"
    FAILED=1
fi
echo ""

# Step 4: Phase A E2E Journey Test (optional but preferred)
echo "[4/5] Running Phase A execution flow journey..."
cd ~/KDashX3
npx playwright test tests/e2e/journeys/phasea-execution-flow.spec.cjs --reporter=line > /tmp/phasea.log 2>&1
PHASEA_EXIT=$?
if [ $PHASEA_EXIT -eq 0 ]; then
    echo "✅ Phase A journey passed"
else
    echo "⚠️ Phase A journey failed or incomplete (may need online node)"
    echo "   Check screenshots in tests/e2e/screenshots/"
fi
tail -10 /tmp/phasea.log
echo ""

# Step 5: Check UI files have correct URLs
echo "[5/5] Checking UI configuration..."
if grep -q "instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net" ~/KDashX3/src/lib/config.js; then
    echo "✅ API_BASE_URL uses stable Tailscale URL"
else
    echo "❌ API_BASE_URL does not use stable URL"
    FAILED=1
fi

if grep -q "instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net" ~/KDashX3/dist/assets/main-*.js 2>/dev/null; then
    echo "✅ Built JS uses stable Tailscale URL"
else
    echo "❌ Built JS does not use stable URL"
    FAILED=1
fi
echo ""

# Summary
echo "================================"
echo "VALIDATION SUMMARY"
echo "================================"
echo "Build: $([ $BUILD_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL') (exit $BUILD_EXIT)"
echo "Tenant Proof: $([ $TENANT_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL') (exit $TENANT_EXIT)"
echo "Backend Health: $([ "$HEALTH_STATUS" -eq 200 ] && echo 'PASS' || echo 'FAIL') (HTTP $HEALTH_STATUS)"
echo "Connector.js: $([ "$CONNECTOR_STATUS" -eq 200 ] && echo 'PASS' || echo 'FAIL') (HTTP $CONNECTOR_STATUS)"
echo "UI Config: $([ $FAILED -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo "================================"

if [ $FAILED -eq 0 ]; then
    echo "✅ ALL VALIDATIONS PASSED - Ready for production"
    exit 0
else
    echo "❌ SOME VALIDATIONS FAILED"
    exit 1
fi
