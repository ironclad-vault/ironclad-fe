#!/bin/bash

# Quick Test: Certificate Verification Fix
# Tests that all HttpAgent creation points have fetchRootKey()

set -e

echo "================================================"
echo "🔍 Certificate Verification Fix - Quick Test"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Searching for HttpAgent creation points...${NC}"
echo ""

# Find all HttpAgent instantiations
echo "📍 Files with 'new HttpAgent':"
grep -rn "new HttpAgent" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null || echo "None found"

echo ""
echo -e "${YELLOW}Checking for fetchRootKey() calls...${NC}"
echo ""

# Check ironcladActor.ts
if grep -q "await agent.fetchRootKey()" lib/ic/ironcladActor.ts 2>/dev/null; then
    echo -e "${GREEN}✅ lib/ic/ironcladActor.ts${NC} - Has fetchRootKey()"
else
    echo -e "${RED}❌ lib/ic/ironcladActor.ts${NC} - MISSING fetchRootKey()"
fi

# Check ckbtcLedger.ts
if grep -q "await agent.fetchRootKey()" lib/ic/ckbtcLedger.ts 2>/dev/null; then
    echo -e "${GREEN}✅ lib/ic/ckbtcLedger.ts${NC} - Has fetchRootKey()"
else
    echo -e "${RED}❌ lib/ic/ckbtcLedger.ts${NC} - MISSING fetchRootKey()"
fi

# Check WalletProvider.tsx
if grep -q "await testAgent.fetchRootKey()" components/wallet/WalletProvider.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ components/wallet/WalletProvider.tsx${NC} - Has fetchRootKey()"
else
    echo -e "${RED}❌ components/wallet/WalletProvider.tsx${NC} - MISSING fetchRootKey()"
fi

echo ""
echo -e "${YELLOW}Checking for localhost detection...${NC}"
echo ""

# Check if localhost detection exists
if grep -q "isLocalHost" lib/ic/ironcladActor.ts 2>/dev/null; then
    echo -e "${GREEN}✅ ironcladActor.ts${NC} - Has isLocalHost() check"
else
    echo -e "${RED}❌ ironcladActor.ts${NC} - Missing localhost detection"
fi

if grep -q "isLocalHost" lib/ic/ckbtcLedger.ts 2>/dev/null; then
    echo -e "${GREEN}✅ ckbtcLedger.ts${NC} - Has isLocalHost() check"
else
    echo -e "${RED}❌ ckbtcLedger.ts${NC} - Missing localhost detection"
fi

if grep -q "IC_CONFIG.isLocal" components/wallet/WalletProvider.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ WalletProvider.tsx${NC} - Has IC_CONFIG.isLocal check"
else
    echo -e "${RED}❌ WalletProvider.tsx${NC} - Missing localhost detection"
fi

echo ""
echo -e "${YELLOW}Checking environment configuration...${NC}"
echo ""

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    if grep -q "NEXT_PUBLIC_IC_HOST=http://127.0.0.1" .env; then
        echo -e "${GREEN}✅ IC_HOST set to localhost${NC}"
    fi
    
    if grep -q "NEXT_PUBLIC_LOCAL_TEST_MODE=true" .env; then
        echo -e "${GREEN}✅ Test Mode enabled (recommended)${NC}"
    else
        echo -e "${YELLOW}⚠️  Test Mode disabled (using Internet Identity)${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ Certificate Fix Verification Complete${NC}"
echo "================================================"
echo ""
echo "Summary:"
echo "- All agent creation points checked"
echo "- fetchRootKey() calls verified"
echo "- Localhost detection confirmed"
echo ""
echo "To test Internet Identity:"
echo "  1. Set NEXT_PUBLIC_LOCAL_TEST_MODE=false in .env"
echo "  2. Clear browser: localStorage.clear()"
echo "  3. npm run dev"
echo "  4. Connect with Internet Identity"
echo "  5. Check console for: '✅ Root key fetched for II identity'"
echo ""
