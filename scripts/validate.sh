#!/bin/bash
set -e

echo "================================"
echo "PAID USER STANDARD VALIDATION"
echo "================================"
echo ""

FAILED=0
API_URL="https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net"
CONNECTOR_PID=""
TEST_DIR="/tmp/validation-$$"
mkdir -p "$TEST_DIR"

# Cleanup function
cleanup() {
  echo ""
  echo "=== CLEANUP ==="
  if [ -n "$CONNECTOR_PID" ]; then
    echo "Stopping test connector (PID: $CONNECTOR_PID)..."
    kill $CONNECTOR_PID 2>/dev/null || true
    wait $CONNECTOR_PID 2>/dev/null || true
  fi
  rm -rf "$TEST_DIR"
  echo "Cleanup complete"
}
trap cleanup EXIT

# Step 1: Build
echo "[1/5] Building frontend..."
cd ~/KDashX3
if npm run build > "$TEST_DIR/build.log" 2>&1; then
    echo "✅ Build successful"
    BUILD_EXIT=0
else
    echo "❌ Build failed"
    tail -20 "$TEST_DIR/build.log"
    exit 1
fi
echo ""

# Step 2: Tenant isolation proof
echo "[2/5] Running tenant isolation proof..."
if bash scripts/tenant-proof.sh > "$TEST_DIR/tenant.log" 2>&1; then
    echo "✅ Tenant isolation verified"
    TENANT_EXIT=0
else
    echo "❌ Tenant isolation failed"
    tail -20 "$TEST_DIR/tenant.log"
    exit 1
fi
echo ""

# Step 3: Verify backend endpoints
echo "[3/5] Verifying backend endpoints..."

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" || echo "000")
if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✅ Health endpoint: HTTP $HEALTH_STATUS"
else
    echo "❌ Health endpoint: HTTP $HEALTH_STATUS"
    exit 1
fi

CONNECTOR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/connector.js" || echo "000")
if [ "$CONNECTOR_STATUS" -eq 200 ]; then
    echo "✅ Connector.js endpoint: HTTP $CONNECTOR_STATUS"
else
    echo "❌ Connector.js endpoint: HTTP $CONNECTOR_STATUS"
    exit 1
fi
echo ""

# Step 4: Start test connector and run Phase A
echo "[4/5] Setting up test environment for Phase A..."

# Create test user
TEST_EMAIL="valtest_$(date +%s)@example.com"
TEST_PASS="testpass123"

echo "Creating test user..."
REG_RESULT=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" 2>/dev/null || echo '{"error":"register failed"}')

AUTH_TOKEN=$(echo "$REG_RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ Failed to create test user"
    echo "Response: $REG_RESULT"
    exit 1
fi
echo "✅ Test user created"

# Create pairing token
echo "Creating pairing token..."
PAIR_RESULT=$(curl -s -X POST "$API_URL/pairing-tokens" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null || echo '{"error":"pairing failed"}')

PAIRING_TOKEN=$(echo "$PAIR_RESULT" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -z "$PAIRING_TOKEN" ]; then
    echo "❌ Failed to create pairing token"
    echo "Response: $PAIR_RESULT"
    exit 1
fi
echo "✅ Pairing token created: ${PAIRING_TOKEN:0:16}..."

# Clear any existing credentials to force fresh pair
echo "Clearing old credentials..."
rm -rf ~/.claw/node-credentials.json ~/.claw/node-credentials.json.invalid.*

# Download connector
echo "Downloading connector..."
if ! curl -s "$API_URL/connector.js" -o "$TEST_DIR/connector.js"; then
    echo "❌ Failed to download connector"
    exit 1
fi

# Create minimal package.json
cat > "$TEST_DIR/package.json" << 'EOF'
{"dependencies":{"ws":"^8.0.0","yargs":"^17.0.0"}}
EOF

# Install dependencies
echo "Installing connector dependencies..."
cd "$TEST_DIR"
if ! npm install ws yargs --silent > npm.log 2>&1; then
    echo "❌ Failed to install dependencies"
    cat npm.log
    exit 1
fi

# Start connector with HOME pointing to test dir (isolated credentials)
export HOME="$TEST_DIR"
echo "Starting test connector..."
node connector.js \
  --api "$API_URL" \
  --token "$PAIRING_TOKEN" \
  --name "ValidationNode" \
  --type local \
  --capabilities python,nodejs \
  > "$TEST_DIR/connector.log" 2>&1 &

CONNECTOR_PID=$!
echo "Connector PID: $CONNECTOR_PID"

# Wait for node to come online (max 60 seconds)
echo "Waiting for node to come online (max 60s)..."
ONLINE=0
for i in $(seq 1 60); do
    NODES_RESULT=$(curl -s "$API_URL/nodes" -H "Authorization: Bearer $AUTH_TOKEN" 2>/dev/null || echo "[]")
    
    if echo "$NODES_RESULT" | grep -q '"online":true'; then
        NODE_ID=$(echo "$NODES_RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo ""
        echo "✅ Node is online! ID: ${NODE_ID:0:16}..."
        ONLINE=1
        break
    fi
    
    if [ $((i % 10)) -eq 0 ]; then
        echo -n "${i}s..."
    else
        echo -n "."
    fi
    
    sleep 1
done
echo ""

if [ "$ONLINE" -eq 0 ]; then
    echo "❌ Node did not come online in 60 seconds"
    echo "Connector log:"
    tail -30 "$TEST_DIR/connector.log"
    exit 1
fi

# Step 5: Run Phase A journey
echo ""
echo "[5/5] Running Phase A execution flow journey..."

# Export for Playwright
export TEST_EMAIL="$TEST_EMAIL"
export TEST_PASSWORD="$TEST_PASS"
export TEST_API_URL="$API_URL"

echo "Running Playwright test with online node..."
cd ~/KDashX3

# Run with timeout to ensure it completes
if timeout 120 npx playwright test \
    tests/e2e/journeys/phasea-execution-flow.spec.cjs \
    --reporter=list \
    > "$TEST_DIR/phasea.log" 2>&1; then
    
    echo "✅ Phase A journey passed"
    PHASEA_EXIT=0
else
    PHASEA_EXIT=$?
    if [ "$PHASEA_EXIT" -eq 124 ]; then
        echo "❌ Phase A journey timed out (120s)"
    else
        echo "❌ Phase A journey failed (exit $PHASEA_EXIT)"
    fi
    tail -50 "$TEST_DIR/phasea.log"
    exit 1
fi

echo ""

# Summary
echo "================================"
echo "VALIDATION SUMMARY"
echo "================================"
echo "Build: PASS (exit 0)"
echo "Tenant Proof: PASS (exit 0)"
echo "Backend Health: PASS (HTTP 200)"
echo "Connector.js: PASS (HTTP 200)"
echo "Phase A Journey: PASS (exit 0)"
echo "================================"
echo "✅ ALL VALIDATIONS PASSED - Ready for production"
echo "================================"

exit 0
