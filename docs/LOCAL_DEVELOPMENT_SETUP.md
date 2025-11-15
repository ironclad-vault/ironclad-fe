# Local Development Setup Guide

## ✅ Completed Setup

### 1. Internet Identity Local Deployment

Internet Identity has been successfully deployed locally for development:

```bash
# Backend location
cd /Users/kidman/Code/crypto-dev/ironclad-vault/ironclad-canister/ironclad_vault

# Internet Identity is configured in dfx.json
# Canister ID: rdmx6-jaaaa-aaaaa-aaadq-cai
```

### 2. Environment Configuration

`.env.local` has been configured with:

```env
# Internet Computer Configuration
NEXT_PUBLIC_IC_HOST=http://127.0.0.1:4943

# Ironclad Vault Backend Canister
NEXT_PUBLIC_IRONCLAD_VAULT_BACKEND_CANISTER_ID=u6s2n-gx777-77774-qaaba-cai

# Internet Identity Canister
NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
```

### 3. WalletProvider Configuration

`WalletProvider.tsx` now correctly uses:
- **Local Development**: `http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`
- **Production**: `https://identity.ic0.app`

Auto-detection based on `window.location.hostname`.

## 🧪 Testing Features

### Test Dashboard

Access the comprehensive test dashboard at:
```
http://localhost:3000/vault/test
```

### Features to Test

#### 1. **Wallet Connection** ✅
- Click "Connect Wallet" in header
- Select "Internet Identity"
- Should redirect to local II at `http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`
- Complete authentication
- Should see principal and wallet type displayed

#### 2. **Vault Management** 🔐
- **Create Vault**: Set lock days and expected deposit amount
- **View Vaults**: All your vaults displayed with status
- **Mock Deposit**: Simulate Bitcoin deposit to vault (for testing)
- **Withdraw**: When vault is unlockable

#### 3. **Auto-Reinvest** ♻️
- **Schedule**: Set up auto-reinvest for a vault with new lock duration
- **View Configs**: See all active auto-reinvest configurations
- **Cancel**: Remove auto-reinvest schedule

#### 4. **Marketplace** 🏪
- **Create Listing**: List a vault for sale with price in sats
- **View Listings**: Browse all active marketplace listings
- **Buy**: Purchase listed vaults
- **Cancel**: Remove your listings

## 📁 Project Structure

```
ironclad-fe/
├── app/
│   ├── vault/
│   │   ├── page.tsx           # Main vault dashboard
│   │   ├── test/
│   │   │   └── page.tsx       # Test dashboard ✨
│   │   ├── deposit/           # Create vault flow
│   │   ├── withdraw/          # Withdrawal flow
│   │   ├── history/           # Event history
│   │   ├── access/            # Auto-reinvest settings
│   │   └── marketplace/       # Vault marketplace
│   └── landing/               # Landing page
├── components/
│   └── wallet/
│       ├── WalletProvider.tsx # Wallet connection logic
│       └── ConnectWalletButton.tsx
├── hooks/
│   └── ironclad/
│       ├── useVaults.ts       # Fetch user vaults
│       ├── useVaultActions.ts # Create/deposit/withdraw
│       ├── useAutoReinvest.ts # Auto-reinvest management
│       └── useMarketplace.ts  # Marketplace operations
├── lib/
│   ├── ic/
│   │   ├── config.ts          # IC configuration
│   │   ├── ironcladActor.ts   # Actor factory
│   │   └── ironcladClient.ts  # High-level client
│   └── ironclad-service.ts    # Service layer with DTOs
└── .env.local                 # Environment variables
```

## 🚀 Running the Application

### Start dfx Replica (Backend)

```bash
# Terminal 1: Start dfx
cd /Users/kidman/Code/crypto-dev/ironclad-vault/ironclad-canister/ironclad_vault
dfx start --clean

# Terminal 2: Deploy canisters
dfx deploy

# Deploy Internet Identity (if not already)
dfx deps pull
dfx deps init internet_identity --argument '(null)'
dfx deps deploy internet_identity
```

### Start Frontend

```bash
# Terminal 3: Start Next.js dev server
cd /Users/kidman/Code/crypto-dev/ironclad-vault/ironclad-fe
npm run dev
```

Open browser: `http://localhost:3000`

## 🔧 Troubleshooting

### Issue: 404 - Canister Not Found

**Solution**: Ensure Internet Identity is deployed
```bash
dfx canister id internet_identity
# Should return: rdmx6-jaaaa-aaaaa-aaadq-cai
```

### Issue: Actor Creation Fails

**Solution**: Check environment variables
```bash
# Print env vars
echo $NEXT_PUBLIC_IC_HOST
echo $NEXT_PUBLIC_IRONCLAD_VAULT_BACKEND_CANISTER_ID
echo $NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID

# Restart dev server if needed
npm run dev
```

### Issue: TypeScript Errors

**Solution**: Rebuild types
```bash
npm run build
```

## 📊 Test Checklist

Use `/vault/test` page to verify:

- [ ] **Connection Status**: Shows connected with principal
- [ ] **Wallet Type**: Displays "ii" (Internet Identity)
- [ ] **Actor Ready**: Shows "✅ Ready"
- [ ] **Create Vault**: Successfully creates vault with ID
- [ ] **Fetch Vaults**: Displays all user vaults
- [ ] **Mock Deposit**: Adds balance to vault
- [ ] **Auto-Reinvest**: Schedule and cancel reinvest configs
- [ ] **Marketplace**: Create, view, and manage listings

## 🎯 Next Steps

1. **Test Each Feature**: Use the test dashboard to verify all functionality
2. **Check Console**: Monitor browser console for errors or warnings
3. **Test UI Pages**: Navigate through deposit/withdraw/history/access/marketplace
4. **Verify Transactions**: Ensure all canister calls complete successfully
5. **Test Error Handling**: Try invalid operations to verify error messages

## 📝 Notes

- All operations require wallet connection
- Test with small amounts first (e.g., 100,000 sats = 0.001 BTC)
- Mock deposit is for testing only - real deposits require Bitcoin transactions
- Lock duration in seconds (7 days = 604800 seconds)
- Auto-reinvest uses same duration units

## 🔗 Useful Links

- **Frontend**: http://localhost:3000
- **Test Dashboard**: http://localhost:3000/vault/test
- **Vault Dashboard**: http://localhost:3000/vault
- **dfx Local Network**: http://localhost:4943
- **Internet Identity**: http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai

## 🐛 Known Issues

None currently! 🎉

If you encounter issues, check:
1. dfx replica is running (`dfx ping`)
2. Canisters are deployed (`dfx canister id ironclad_vault_backend`)
3. Environment variables are loaded (restart dev server)
4. Browser console for detailed error messages
