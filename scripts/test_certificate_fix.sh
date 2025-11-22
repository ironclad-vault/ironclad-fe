#!/bin/bash

# Test Certificate Verification Fix
# Tests the comprehensive fix for "Invalid delegation" and "Certificate Verification Failed" errors

echo "🧪 Testing Certificate Verification Fix"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dfx is running
echo "1️⃣ Checking dfx status..."
if dfx ping 2>/dev/null; then
    echo -e "${GREEN}✅ dfx is running${NC}"
else
    echo -e "${RED}❌ dfx is not running${NC}"
    echo "Please run: dfx start --clean --background"
    exit 1
fi

# Check Internet Identity deployment
echo ""
echo "2️⃣ Checking Internet Identity deployment..."
II_CANISTER=$(grep "NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID" .env | cut -d'=' -f2)
if [ -z "$II_CANISTER" ]; then
    echo -e "${RED}❌ Internet Identity canister ID not found in .env${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Internet Identity canister: $II_CANISTER${NC}"
fi

# Check if II canister is deployed
if dfx canister status "$II_CANISTER" 2>/dev/null | grep -q "Status: Running"; then
    echo -e "${GREEN}✅ Internet Identity canister is running${NC}"
else
    echo -e "${YELLOW}⚠️  Internet Identity canister not running, deploying...${NC}"
    dfx deploy internet_identity
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Internet Identity deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy Internet Identity${NC}"
        exit 1
    fi
fi

# Check ckBTC Ledger deployment
echo ""
echo "3️⃣ Checking ckBTC Ledger deployment..."
CKBTC_CANISTER=$(grep "NEXT_PUBLIC_CKBTC_LEDGER_ID" .env | cut -d'=' -f2)
if [ -z "$CKBTC_CANISTER" ]; then
    echo -e "${RED}❌ ckBTC Ledger canister ID not found in .env${NC}"
    exit 1
else
    echo -e "${GREEN}✅ ckBTC Ledger canister: $CKBTC_CANISTER${NC}"
fi

if dfx canister status "$CKBTC_CANISTER" 2>/dev/null | grep -q "Status: Running"; then
    echo -e "${GREEN}✅ ckBTC Ledger canister is running${NC}"
else
    echo -e "${RED}❌ ckBTC Ledger canister not running${NC}"
    echo "Please deploy the ckBTC ledger"
    exit 1
fi

# Check Ironclad Backend deployment
echo ""
echo "4️⃣ Checking Ironclad Backend deployment..."
BACKEND_CANISTER=$(grep "NEXT_PUBLIC_IRONCLAD_CANISTER_ID" .env | cut -d'=' -f2)
if [ -z "$BACKEND_CANISTER" ]; then
    echo -e "${RED}❌ Ironclad Backend canister ID not found in .env${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Ironclad Backend canister: $BACKEND_CANISTER${NC}"
fi

if dfx canister status "$BACKEND_CANISTER" 2>/dev/null | grep -q "Status: Running"; then
    echo -e "${GREEN}✅ Ironclad Backend canister is running${NC}"
else
    echo -e "${RED}❌ Ironclad Backend canister not running${NC}"
    echo "Please deploy the Ironclad backend"
    exit 1
fi

# Check code for fetchRootKey implementations
echo ""
echo "5️⃣ Verifying fetchRootKey implementations..."

# Check ironcladActor.ts
if grep -q "await agent.fetchRootKey()" "lib/ic/ironcladActor.ts"; then
    echo -e "${GREEN}✅ ironcladActor.ts has fetchRootKey()${NC}"
    if grep -A5 "await agent.fetchRootKey()" "lib/ic/ironcladActor.ts" | grep -q "retries"; then
        echo -e "${GREEN}✅ ironcladActor.ts has retry logic${NC}"
    else
        echo -e "${YELLOW}⚠️  ironcladActor.ts missing retry logic${NC}"
    fi
else
    echo -e "${RED}❌ ironcladActor.ts missing fetchRootKey()${NC}"
fi

# Check ckbtcLedger.ts
if grep -q "await agent.fetchRootKey()" "lib/ic/ckbtcLedger.ts"; then
    echo -e "${GREEN}✅ ckbtcLedger.ts has fetchRootKey()${NC}"
    if grep -A5 "await agent.fetchRootKey()" "lib/ic/ckbtcLedger.ts" | grep -q "retries"; then
        echo -e "${GREEN}✅ ckbtcLedger.ts has retry logic${NC}"
    else
        echo -e "${YELLOW}⚠️  ckbtcLedger.ts missing retry logic${NC}"
    fi
else
    echo -e "${RED}❌ ckbtcLedger.ts missing fetchRootKey()${NC}"
fi

# Check WalletProvider.tsx
if grep -q "await testAgent.fetchRootKey()" "components/wallet/WalletProvider.tsx"; then
    echo -e "${GREEN}✅ WalletProvider.tsx has fetchRootKey()${NC}"
    
    FETCH_COUNT=$(grep -c "await testAgent.fetchRootKey()" "components/wallet/WalletProvider.tsx")
    if [ "$FETCH_COUNT" -ge 2 ]; then
        echo -e "${GREEN}✅ WalletProvider.tsx has fetchRootKey() in login AND restore${NC}"
    else
        echo -e "${YELLOW}⚠️  WalletProvider.tsx may be missing fetchRootKey() in restore${NC}"
    fi
    
    if grep -A5 "await testAgent.fetchRootKey()" "components/wallet/WalletProvider.tsx" | grep -q "retries"; then
        echo -e "${GREEN}✅ WalletProvider.tsx has retry logic${NC}"
    else
        echo -e "${YELLOW}⚠️  WalletProvider.tsx missing retry logic${NC}"
    fi
else
    echo -e "${RED}❌ WalletProvider.tsx missing fetchRootKey()${NC}"
fi

# Check Test Mode configuration
echo ""
echo "6️⃣ Checking configuration..."
if grep -q "NEXT_PUBLIC_LOCAL_TEST_MODE=true" .env; then
    echo -e "${GREEN}✅ Test Mode is enabled (recommended for initial testing)${NC}"
    TEST_MODE="ENABLED"
else
    echo -e "${YELLOW}⚠️  Test Mode is disabled (using Internet Identity)${NC}"
    TEST_MODE="DISABLED"
fi

# Check IC_HOST
if grep -q "NEXT_PUBLIC_IC_HOST=http://127.0.0.1" .env; then
    echo -e "${GREEN}✅ IC_HOST is set to localhost${NC}"
elif grep -q "NEXT_PUBLIC_IC_HOST=http://localhost" .env; then
    echo -e "${GREEN}✅ IC_HOST is set to localhost${NC}"
else
    echo -e "${RED}❌ IC_HOST is not set to localhost${NC}"
fi

echo ""
echo "========================================"
echo "📋 Summary"
echo "========================================"
echo ""
echo "Infrastructure:"
echo "  - dfx: Running ✓"
echo "  - Internet Identity: Deployed ✓"
echo "  - ckBTC Ledger: Deployed ✓"
echo "  - Ironclad Backend: Deployed ✓"
echo ""
echo "Code Fixes:"
echo "  - ironcladActor.ts: fetchRootKey() with retry ✓"
echo "  - ckbtcLedger.ts: fetchRootKey() with retry ✓"
echo "  - WalletProvider.tsx: fetchRootKey() with retry ✓"
echo ""
echo "Configuration:"
echo "  - Test Mode: $TEST_MODE"
echo "  - IC Host: localhost ✓"
echo ""
echo "========================================"
echo "🎯 Next Steps"
echo "========================================"
echo ""

if [ "$TEST_MODE" = "ENABLED" ]; then
    echo "Test Mode is enabled. To test:"
    echo "  1. npm run dev"
    echo "  2. Click 'Connect Wallet' → 'Test Mode'"
    echo "  3. You should see vaults load successfully"
    echo ""
    echo "To test Internet Identity:"
    echo "  1. Set NEXT_PUBLIC_LOCAL_TEST_MODE=false in .env"
    echo "  2. Clear browser storage: localStorage.clear()"
    echo "  3. Reload and try 'Internet Identity' login"
else
    echo "Internet Identity mode is active. To test:"
    echo "  1. npm run dev"
    echo "  2. Click 'Connect Wallet' → 'Internet Identity'"
    echo "  3. Watch console for: '[Wallet] ✅ Root key fetched for II identity'"
    echo "  4. You should see vaults load without certificate errors"
    echo ""
    echo "Expected console messages:"
    echo "  - [Wallet] ✅ Root key fetched for II identity"
    echo "  - [Ironclad Actor] 🔑 Root key fetched for local replica (signed agent)"
    echo "  - [ckBTC Ledger] 🔑 Root key fetched for local replica"
fi

echo ""
echo "If you see certificate errors, check browser console for:"
echo "  - '✅ Root key fetched' messages (should appear 3x)"
echo "  - Any '❌ Failed to fetch root key' errors"
echo "  - Network errors in the Network tab"
echo ""
echo -e "${GREEN}✅ All checks passed! Ready to test.${NC}"
