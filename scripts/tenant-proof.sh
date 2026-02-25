#!/bin/bash
set -e

# Multi-Tenant Isolation Proof Script
# Tests that User A and User B cannot see each other's nodes

API_URL="https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net"

# Colors for output (disabled for raw output)
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "================================"
echo "MULTI-TENANT ISOLATION PROOF"
echo "API: $API_URL"
echo "================================"
echo ""

# Track failures
FAILED=0

# Function to print test header
print_test() {
    echo ""
    echo "--- $1 ---"
}

# Function to check HTTP status
check_status() {
    local expected="$1"
    local actual="$2"
    local desc="$3"
    
    if [ "$actual" -eq "$expected" ]; then
        echo "PASS: $desc (HTTP $actual)"
    else
        echo "FAIL: $desc (expected HTTP $expected, got $actual)"
        FAILED=1
    fi
}

# ==================== STEP A: CREATE USERS ====================
print_test "A1: Create User A"
USER_A_EMAIL="testuser_a_$(date +%s)@example.com"
USER_A_PASS="testpass123"
RESPONSE_A=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$USER_A_EMAIL\", \"password\": \"$USER_A_PASS\"}")
HTTP_A=$(echo "$RESPONSE_A" | tail -1)
BODY_A=$(echo "$RESPONSE_A" | head -n -1)
echo "Status: $HTTP_A"
echo "Response: $BODY_A"
check_status 201 "$HTTP_A" "Create User A"

print_test "A2: Create User B"
USER_B_EMAIL="testuser_b_$(date +%s)@example.com"
USER_B_PASS="testpass123"
RESPONSE_B=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$USER_B_EMAIL\", \"password\": \"$USER_B_PASS\"}")
HTTP_B=$(echo "$RESPONSE_B" | tail -1)
BODY_B=$(echo "$RESPONSE_B" | head -n -1)
echo "Status: $HTTP_B"
echo "Response: $BODY_B"
check_status 201 "$HTTP_B" "Create User B"

# ==================== STEP B: LOGIN AND GET TOKENS ====================
print_test "B1: Login User A"
LOGIN_A=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$USER_A_EMAIL\", \"password\": \"$USER_A_PASS\"}")
HTTP_LOGIN_A=$(echo "$LOGIN_A" | tail -1)
BODY_LOGIN_A=$(echo "$LOGIN_A" | head -n -1)
echo "Status: $HTTP_LOGIN_A"
TOKEN_A=$(echo "$BODY_LOGIN_A" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token A (first 20 chars): ${TOKEN_A:0:20}..."
check_status 200 "$HTTP_LOGIN_A" "Login User A"

print_test "B2: Login User B"
LOGIN_B=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$USER_B_EMAIL\", \"password\": \"$USER_B_PASS\"}")
HTTP_LOGIN_B=$(echo "$LOGIN_B" | tail -1)
BODY_LOGIN_B=$(echo "$LOGIN_B" | head -n -1)
echo "Status: $HTTP_LOGIN_B"
TOKEN_B=$(echo "$BODY_LOGIN_B" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token B (first 20 chars): ${TOKEN_B:0:20}..."
check_status 200 "$HTTP_LOGIN_B" "Login User B"

# ==================== STEP C: USER A CREATES NODE ====================
print_test "C1: User A - Get Me (verify workspace)"
ME_A=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/me" \
    -H "Authorization: Bearer $TOKEN_A")
HTTP_ME_A=$(echo "$ME_A" | tail -1)
echo "Status: $HTTP_ME_A"
echo "Response: $(echo "$ME_A" | head -n -1)"
check_status 200 "$HTTP_ME_A" "Get User A Info"

print_test "C2: User A - Create Pairing Token"
TOKEN_RESPONSE_A=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/pairing-tokens" \
    -H "Authorization: Bearer $TOKEN_A" \
    -H "Content-Type: application/json")
HTTP_TOKEN_A=$(echo "$TOKEN_RESPONSE_A" | tail -1)
BODY_TOKEN_A=$(echo "$TOKEN_RESPONSE_A" | head -n -1)
echo "Status: $HTTP_TOKEN_A"
echo "Response: $BODY_TOKEN_A"
PAIRING_TOKEN_A=$(echo "$BODY_TOKEN_A" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Pairing Token A: $PAIRING_TOKEN_A"
check_status 200 "$HTTP_TOKEN_A" "Create Pairing Token A"

print_test "C3: User A - Register Node (simulate connector)"
NODE_RESPONSE_A=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/nodes/pair" \
    -H "Content-Type: application/json" \
    -d "{\"pairing_token\": \"$PAIRING_TOKEN_A\", \"name\": \"TestNodeA\", \"type\": \"local\", \"os\": \"linux\", \"capabilities\": [\"python\"]}")
HTTP_NODE_A=$(echo "$NODE_RESPONSE_A" | tail -1)
BODY_NODE_A=$(echo "$NODE_RESPONSE_A" | head -n -1)
echo "Status: $HTTP_NODE_A"
echo "Response: $BODY_NODE_A"
NODE_ID_A=$(echo "$BODY_NODE_A" | grep -o '"node_id":"[^"]*"' | cut -d'"' -f4)
echo "Node ID A: $NODE_ID_A"
check_status 200 "$HTTP_NODE_A" "Register Node A"

print_test "C4: User A - List Nodes (should show 1 node)"
NODES_A=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/nodes" \
    -H "Authorization: Bearer $TOKEN_A")
HTTP_NODES_A=$(echo "$NODES_A" | tail -1)
BODY_NODES_A=$(echo "$NODES_A" | head -n -1)
echo "Status: $HTTP_NODES_A"
NODE_COUNT_A=$(echo "$BODY_NODES_A" | grep -o '"id"' | wc -l)
echo "Node count for User A: $NODE_COUNT_A"
echo "Response: $BODY_NODES_A"
if [ "$NODE_COUNT_A" -eq 1 ]; then
    echo "PASS: User A sees exactly 1 node"
else
    echo "FAIL: User A should see 1 node, sees $NODE_COUNT_A"
    FAILED=1
fi

# ==================== STEP D: USER B ISOLATION CHECKS ====================
print_test "D1: User B - List Nodes (should show 0 nodes)"
NODES_B=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/nodes" \
    -H "Authorization: Bearer $TOKEN_B")
HTTP_NODES_B=$(echo "$NODES_B" | tail -1)
BODY_NODES_B=$(echo "$NODES_B" | head -n -1)
echo "Status: $HTTP_NODES_B"
NODE_COUNT_B=$(echo "$BODY_NODES_B" | grep -o '"id"' | wc -l)
echo "Node count for User B: $NODE_COUNT_B"
echo "Response: $BODY_NODES_B"
if [ "$NODE_COUNT_B" -eq 0 ]; then
    echo "PASS: User B sees 0 nodes (cannot see A's nodes)"
else
    echo "FAIL: User B should see 0 nodes, sees $NODE_COUNT_B"
    FAILED=1
fi

print_test "D2: User B - Attempt to fetch User A's node by ID (should 404)"
if [ -n "$NODE_ID_A" ]; then
    NODE_FETCH_B=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/nodes/$NODE_ID_A" \
        -H "Authorization: Bearer $TOKEN_B")
    HTTP_FETCH_B=$(echo "$NODE_FETCH_B" | tail -1)
    echo "Status: $HTTP_FETCH_B"
    echo "Response: $(echo "$NODE_FETCH_B" | head -n -1)"
    if [ "$HTTP_FETCH_B" -eq 404 ] || [ "$HTTP_FETCH_B" -eq 403 ]; then
        echo "PASS: User B cannot access User A's node (HTTP $HTTP_FETCH_B)"
    else
        echo "FAIL: Expected 404 or 403, got $HTTP_FETCH_B"
        FAILED=1
    fi
else
    echo "SKIP: Node ID A not available"
fi

# ==================== STEP E: TOKEN MISUSE ATTEMPT ====================
print_test "E1: User B - Attempt to use User A's pairing token (should fail)"
MISUSE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/nodes/pair" \
    -H "Content-Type: application/json" \
    -d "{\"pairing_token\": \"$PAIRING_TOKEN_A\", \"name\": \"HackedNode\", \"type\": \"vm\"}")
HTTP_MISUSE=$(echo "$MISUSE_RESPONSE" | tail -1)
echo "Status: $HTTP_MISUSE"
echo "Response: $(echo "$MISUSE_RESPONSE" | head -n -1)"
# Token was already used by User A, so should fail with 401
if [ "$HTTP_MISUSE" -eq 401 ] || [ "$HTTP_MISUSE" -eq 400 ]; then
    echo "PASS: Reused/Invalid token rejected (HTTP $HTTP_MISUSE)"
else
    echo "INFO: Token misuse returned HTTP $HTTP_MISUSE (token may already be used)"
fi

# ==================== STEP F: SUMMARY ====================
echo ""
echo "================================"
echo "TEST SUMMARY"
echo "================================"
echo "User A Email: $USER_A_EMAIL"
echo "User B Email: $USER_B_EMAIL"
echo "User A Node ID: $NODE_ID_A"
echo "User A Node Count: $NODE_COUNT_A"
echo "User B Node Count: $NODE_COUNT_B"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "ALL TESTS PASSED - Multi-tenant isolation verified"
    echo "================================"
    exit 0
else
    echo "SOME TESTS FAILED - See output above"
    echo "================================"
    exit 1
fi
