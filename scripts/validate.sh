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

# Step 2: Tenant isolation proof
echo "[2/4] Running tenant isolation proof..."
bash scripts/tenant-proof.sh > /tmp/tenant-proof.log 2>&1
TENANT_EXIT=$?
if [ $TENANT_EXIT -eq 0 ]; then
    echo "✅ Tenant isolation verified"
else
    echo "❌ Tenant isolation failed (exit $TENANT_EXIT)"
    FAILED=1
fi
tail -30 /tmp/tenant-proof.log
echo ""

# Step 3: Playwright journeys
echo "[3/4] Running Playwright acceptance journeys..."
cd ~/KDashX3
rm -rf test-results
npx playwright test tests/e2e/journeys/*.spec.cjs --reporter=list 2>&1 | tee /tmp/playwright.log
PLAYWRIGHT_EXIT=${PIPESTATUS[0]}
if [ $PLAYWRIGHT_EXIT -eq 0 ]; then
    echo "✅ All Playwright journeys passed"
else
    echo "❌ Some Playwright journeys failed (exit $PLAYWRIGHT_EXIT)"
    FAILED=1
fi
echo ""

# Step 4: Summary
echo "================================"
echo "VALIDATION SUMMARY"
echo "================================"
echo "Build: $([ $BUILD_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL') (exit $BUILD_EXIT)"
echo "Tenant Proof: $([ $TENANT_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL') (exit $TENANT_EXIT)"
echo "Playwright: $([ $PLAYWRIGHT_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL') (exit $PLAYWRIGHT_EXIT)"
echo "================================"

if [ $FAILED -eq 0 ]; then
    echo "✅ ALL VALIDATIONS PASSED - Ready for production"
    exit 0
else
    echo "❌ SOME VALIDATIONS FAILED"
    exit 1
fi
