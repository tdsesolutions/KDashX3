#!/bin/bash
set -e

echo "================================"
echo "PAID USER STANDARD VALIDATION"
echo "================================"
echo ""

FAILED=0
API_URL="https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net"
TEST_DIR="/tmp/val-$$"
mkdir -p "$TEST_DIR"

# Cleanup function
cleanup() {
  echo ""
  echo "=== CLEANUP ==="
  if [ -n "$CONNECTOR_PID" ]; then
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
else
    echo "❌ Build failed"
    tail -20 "$TEST_DIR/build.log"
    exit 1
fi
echo ""

# Step 2: Tenant proof
echo "[2/5] Running tenant isolation proof..."
if bash scripts/tenant-proof.sh > "$TEST_DIR/tenant.log" 2>&1; then
    echo "✅ Tenant isolation verified"
else
    echo "❌ Tenant isolation failed"
    exit 1
fi
echo ""

# Step 3: Backend endpoints
echo "[3/5] Verifying backend endpoints..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
CONN=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/connector.js")
if [ "$HEALTH" -eq 200 ] && [ "$CONN" -eq 200 ]; then
    echo "✅ Health: HTTP $HEALTH"
    echo "✅ Connector: HTTP $CONN"
else
    echo "❌ Backend check failed"
    exit 1
fi
echo ""

# Step 4: Setup test environment
echo "[4/5] Setting up Phase A test environment..."

# Create user
TEST_EMAIL="valtest_$(date +%s)@example.com"
TEST_PASS="testpass123"
REG=$(curl -s -X POST "$API_URL/auth/register" -H "Content-Type: application/json" -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")
AUTH=$(echo "$REG" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$AUTH" ]; then
    echo "❌ Failed to create test user"
    exit 1
fi
echo "✅ Test user: $TEST_EMAIL"

# Create pairing token
PAIR=$(curl -s -X POST "$API_URL/pairing-tokens" -H "Authorization: Bearer $AUTH" -H "Content-Type: application/json")
PAIR_TOKEN=$(echo "$PAIR" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PAIR_TOKEN" ]; then
    echo "❌ Failed to create pairing token"
    exit 1
fi
echo "✅ Pairing token created"

# Download connector
curl -s "$API_URL/connector.js" -o "$TEST_DIR/connector.js"
cat > "$TEST_DIR/package.json" << 'EOF'
{"dependencies":{"ws":"^8.0.0","yargs":"^17.0.0"}}
EOF

# Install deps
cd "$TEST_DIR"
npm install ws yargs --silent > npm.log 2>&1 || { echo "❌ npm install failed"; cat npm.log; exit 1; }

# Start connector with isolated credentials directory
export CLAW_CREDENTIALS_DIR="$TEST_DIR/.claw"
mkdir -p "$CLAW_CREDENTIALS_DIR"
node connector.js --api "$API_URL" --token "$PAIR_TOKEN" --name "ValNode" --type local > "$TEST_DIR/conn.log" 2>&1 &
CONNECTOR_PID=$!
echo "✅ Connector started (PID: $CONNECTOR_PID)"

# Wait for online
echo "Waiting for node online (max 60s)..."
ONLINE=0
for i in $(seq 1 60); do
    NODES=$(curl -s "$API_URL/nodes" -H "Authorization: Bearer $AUTH")
    if echo "$NODES" | grep -q '"online":true'; then
        NODE_ID=$(echo "$NODES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo ""
        echo "✅ Node online: ${NODE_ID:0:16}..."
        ONLINE=1
        break
    fi
    [ $((i % 10)) -eq 0 ] && echo -n "${i}s" || echo -n "."
    sleep 1
done
echo ""

if [ "$ONLINE" -eq 0 ]; then
    echo "❌ Node did not come online"
    tail -20 "$TEST_DIR/conn.log"
    exit 1
fi

# Step 5: Run Phase A journey
echo ""
echo "[5/5] Running Phase A journey..."

cd /home/teddiescott30/KDashX3
export TEST_EMAIL="$TEST_EMAIL"
export TEST_PASSWORD="$TEST_PASS"
export TEST_API_URL="$API_URL"

if timeout 120 npx playwright test tests/e2e/journeys/phasea-execution-flow.spec.cjs --reporter=list > "$TEST_DIR/phasea.log" 2>&1; then
    echo "✅ Phase A journey passed"
    PHASEA=0
else
    PHASEA=$?
    if [ "$PHASEA" -eq 124 ]; then
        echo "❌ Phase A timed out"
    else
        echo "❌ Phase A failed (exit $PHASEA)"
        tail -40 "$TEST_DIR/phasea.log"
    fi
    exit 1
fi

echo ""
echo "================================"
echo "VALIDATION SUMMARY"
echo "================================"
echo "Build: PASS"
echo "Tenant: PASS"
echo "Backend: PASS"
echo "Phase A: PASS"
echo "================================"
echo "✅ ALL VALIDATIONS PASSED"
echo "================================"

exit 0
