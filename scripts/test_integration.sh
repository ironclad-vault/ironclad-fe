#!/bin/bash

# Test Script for Real ICRC-1 Integration
# Verifies that the ledger is deployed and balance can be queried

set -e

echo "======================================"
echo "🧪 Testing Real ICRC-1 Integration"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Your principal (from deployment)
PRINCIPAL="3wlcs-lucvo-xavdw-4tl56-rjw6g-lcfgi-43axc-yx6a6-s27ob-ssyin-pqe"

echo -e "${YELLOW}Step 1: Check dfx status${NC}"
if ! dfx ping >/dev/null 2>&1; then
    echo -e "${RED}✗ dfx replica is not running${NC}"
    echo "Run: dfx start --background"
    exit 1
fi
echo -e "${GREEN}✓ dfx replica is running${NC}"
echo ""

echo -e "${YELLOW}Step 2: Verify ckBTC ledger canister${NC}"
LEDGER_ID=$(dfx canister id ckbtc_ledger 2>/dev/null || echo "")
if [ -z "$LEDGER_ID" ]; then
    echo -e "${RED}✗ ckbtc_ledger canister not found${NC}"
    echo "Run: ./scripts/deploy_local_ckbtc.sh"
    exit 1
fi
echo -e "${GREEN}✓ ckBTC Ledger ID: $LEDGER_ID${NC}"
echo ""

echo -e "${YELLOW}Step 3: Query your ckBTC balance${NC}"
BALANCE=$(dfx canister call ckbtc_ledger icrc1_balance_of "(record { owner = principal \"$PRINCIPAL\"; subaccount = null })" 2>&1)

if echo "$BALANCE" | grep -q "error"; then
    echo -e "${RED}✗ Failed to query balance${NC}"
    echo "$BALANCE"
    exit 1
fi

echo -e "${GREEN}✓ Balance query successful${NC}"
echo "Raw response: $BALANCE"
echo ""

# Extract balance value (format: "(10_000_000_000_000 : nat)")
BALANCE_VALUE=$(echo "$BALANCE" | grep -oP '\d+[_\d]*' | tr -d '_')
BALANCE_BTC=$(echo "scale=8; $BALANCE_VALUE / 100000000" | bc)

echo -e "${GREEN}Your Balance:${NC}"
echo "  e8s:  $BALANCE_VALUE"
echo "  BTC:  $BALANCE_BTC ckBTC"
echo ""

echo -e "${YELLOW}Step 4: Verify backend canister${NC}"
BACKEND_ID=$(dfx canister id ironclad_vault_backend 2>/dev/null || echo "")
if [ -z "$BACKEND_ID" ]; then
    echo -e "${RED}✗ Backend canister not found${NC}"
    echo "Run: dfx deploy ironclad_vault_backend"
    exit 1
fi
echo -e "${GREEN}✓ Backend Canister ID: $BACKEND_ID${NC}"
echo ""

echo -e "${YELLOW}Step 5: Check environment variables${NC}"
if [ -f ".env" ]; then
    if grep -q "NEXT_PUBLIC_CKBTC_LEDGER_ID" .env; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_CKBTC_LEDGER_ID found in .env${NC}"
    else
        echo -e "${RED}✗ NEXT_PUBLIC_CKBTC_LEDGER_ID missing from .env${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi
echo ""

echo "======================================"
echo -e "${GREEN}✅ All Tests Passed!${NC}"
echo "======================================"
echo ""
echo "🚀 Ready to test:"
echo "   1. Start frontend: npm run dev"
echo "   2. Connect wallet"
echo "   3. Go to Settings → Switch to ckBTC Mode"
echo "   4. Create a vault"
echo "   5. Click 'DEPOSIT CKBTC (REAL TRANSACTION)'"
echo "   6. Watch your balance decrease!"
echo ""
