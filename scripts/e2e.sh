#!/bin/bash
set -e

echo "=== KDashX3 E2E Journey Suite ==="
echo "Testing against: https://tdsesolutions.github.io/KDashX3"
echo ""

cd ~/KDashX3

# Check if playwright is installed
if ! command -v npx &> /dev/null; then
    echo "ERROR: npx not found. Run: npm install"
    exit 1
fi

# Run all journey specs
echo "Running acceptance journeys..."
npx playwright test tests/e2e/journeys/*.spec.cjs --reporter=list --trace=on

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ ALL JOURNEYS PASSED"
    exit 0
else
    echo ""
    echo "❌ JOURNEYS FAILED"
    echo "Traces saved to: test-results/"
    exit 1
fi
