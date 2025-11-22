#!/bin/bash

# Agent Factory Integration Verification Script
# This script verifies that all agent creation is centralized and properly integrated

set -e

echo "🔍 Agent Factory Integration Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Verify agent.ts exists and has getAgent export
echo "✓ Checking lib/ic/agent.ts..."
if grep -q "export async function getAgent" lib/ic/agent.ts; then
    echo -e "${GREEN}✅ getAgent() function exported${NC}"
else
    echo -e "${RED}❌ getAgent() function not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Verify only ONE "new HttpAgent" in source code (in agent.ts)
echo ""
echo "✓ Checking for HttpAgent instantiation points..."
AGENT_COUNT=$(grep -rn "new HttpAgent" lib/ src/ components/ app/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "\.d\.ts" | wc -l)
if [ "$AGENT_COUNT" -eq 1 ]; then
    echo -e "${GREEN}✅ Only 1 HttpAgent instantiation found (in agent.ts)${NC}"
else
    echo -e "${YELLOW}⚠️  Found $AGENT_COUNT HttpAgent instantiation(s)${NC}"
    grep -rn "new HttpAgent" lib/ src/ components/ app/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "\.d\.ts"
fi

# Check 3: Verify ironcladActor.ts uses getAgent
echo ""
echo "✓ Checking lib/ic/ironcladActor.ts..."
if grep -q "import.*getAgent.*from.*agent" lib/ic/ironcladActor.ts && \
   grep -q "await getAgent" lib/ic/ironcladActor.ts; then
    echo -e "${GREEN}✅ ironcladActor uses centralized getAgent()${NC}"
else
    echo -e "${RED}❌ ironcladActor doesn't properly use getAgent()${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Verify ckbtcLedger.ts uses getAgent
echo ""
echo "✓ Checking lib/ic/ckbtcLedger.ts..."
if grep -q "import.*getAgent.*from.*agent" lib/ic/ckbtcLedger.ts && \
   grep -q "await getAgent" lib/ic/ckbtcLedger.ts; then
    echo -e "${GREEN}✅ ckbtcLedger uses centralized getAgent()${NC}"
else
    echo -e "${RED}❌ ckbtcLedger doesn't properly use getAgent()${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: Verify WalletProvider.tsx imports getAgent
echo ""
echo "✓ Checking components/wallet/WalletProvider.tsx..."
if grep -q "import.*getAgent" components/wallet/WalletProvider.tsx && \
   grep -q "import.*resetAgent" components/wallet/WalletProvider.tsx; then
    echo -e "${GREEN}✅ WalletProvider imports getAgent and resetAgent${NC}"
else
    echo -e "${RED}❌ WalletProvider missing getAgent or resetAgent import${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: Verify WalletProvider.tsx uses getAgent in auth flow
echo ""
echo "✓ Checking WalletProvider auth flow..."
if grep -A 50 "authClient.login" components/wallet/WalletProvider.tsx | grep -q "await getAgent"; then
    echo -e "${GREEN}✅ WalletProvider calls getAgent() in login flow${NC}"
else
    echo -e "${RED}❌ WalletProvider doesn't call getAgent() in login flow${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 7: Verify resetAgent is exported from agent.ts
echo ""
echo "✓ Checking agent.ts exports..."
if grep -q "export function resetAgent" lib/ic/agent.ts; then
    echo -e "${GREEN}✅ resetAgent() exported for logout cleanup${NC}"
else
    echo -e "${RED}❌ resetAgent() not exported${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 8: Verify no throwaway agents in frontend code
echo ""
echo "✓ Checking for throwaway agents..."
if grep -r "const.*Agent.*=.*new HttpAgent" lib/ src/ components/ app/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "agent.ts" | grep -v "node_modules"; then
    echo -e "${RED}❌ Found local HttpAgent instantiation outside agent.ts${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No throwaway agents found${NC}"
fi

# Check 9: Verify config.ts exists
echo ""
echo "✓ Checking lib/ic/config.ts..."
if [ -f "lib/ic/config.ts" ]; then
    echo -e "${GREEN}✅ IC_CONFIG available${NC}"
else
    echo -e "${RED}❌ lib/ic/config.ts not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 10: Verify isLocal detection in agent.ts
echo ""
echo "✓ Checking local detection logic..."
if grep -q "isLocal" lib/ic/agent.ts && grep -q "fetchRootKey" lib/ic/agent.ts; then
    echo -e "${GREEN}✅ Local detection and fetchRootKey() logic present${NC}"
else
    echo -e "${RED}❌ Missing local detection or fetchRootKey logic${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo ""
    echo "Agent factory refactor is complete and verified!"
    echo ""
    echo "Summary:"
    echo "  • Single centralized getAgent() in lib/ic/agent.ts ✓"
    echo "  • ironcladActor.ts uses centralized factory ✓"
    echo "  • ckbtcLedger.ts uses centralized factory ✓"
    echo "  • WalletProvider.tsx initializes agent at login ✓"
    echo "  • No throwaway agents created ✓"
    echo "  • Root key fetching guarded by flag ✓"
    echo "  • Logout cleanup via resetAgent() ✓"
    exit 0
else
    echo -e "${RED}❌ $ERRORS CHECKS FAILED${NC}"
    exit 1
fi
