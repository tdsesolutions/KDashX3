#!/bin/bash
set -e

echo "=== KDashX3 Validation Script ==="
echo ""

echo "1. Git Status Check..."
cd ~/KDashX3
if [ -n "$(git status --porcelain)" ]; then
    echo "   ❌ FAIL: Uncommitted changes"
    git status --short
    exit 1
else
    echo "   ✅ PASS: Working tree clean"
fi

echo ""
echo "2. Build Check..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ PASS: Build successful"
else
    echo "   ❌ FAIL: Build failed"
    cat /tmp/build.log
    exit 1
fi

echo ""
echo "3. dist/ Directory Check..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "   ✅ PASS: dist/ exists with index.html"
    ls -la dist/
else
    echo "   ❌ FAIL: dist/ missing or incomplete"
    exit 1
fi

echo ""
echo "4. Router Check..."
if [ -f "src/main.js" ] && grep -q "const routes" src/main.js; then
    ROUTE_COUNT=$(grep -E "^\s+'/" src/main.js | wc -l)
    echo "   ✅ PASS: Router exists with $ROUTE_COUNT routes"
    grep -E "^\s+'/" src/main.js | sed 's/^/      /'
else
    echo "   ❌ FAIL: Router not found"
    exit 1
fi

echo ""
echo "5. Backend Health Check..."
if curl -sf http://104.197.56.55:4010/health > /tmp/health.json 2>&1; then
    echo "   ✅ PASS: Backend healthy"
    cat /tmp/health.json
else
    echo "   ❌ FAIL: Backend not responding"
    exit 1
fi

echo ""
echo "6. Frontend Deployed Check..."
if curl -sf -o /dev/null -w "%{http_code}" https://tdsesolutions.github.io/KDashX3/ | grep -q "200"; then
    echo "   ✅ PASS: Frontend deployed (HTTP 200)"
else
    echo "   ❌ FAIL: Frontend not accessible"
    exit 1
fi

echo ""
echo "=== ALL VALIDATION CHECKS PASSED ==="
exit 0
