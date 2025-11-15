# Quick Setup Guide

## Prerequisites

- Node.js 18+
- dfx (Internet Computer SDK)
- Rust backend deployed

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_IRONCLAD_CANISTER_ID=your-canister-id-here
NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
```

### 3. Deploy Backend & Generate Declarations

```bash
# Start local replica
dfx start --background --clean

# Deploy backend canister
dfx deploy ironclad_vault_backend

# Generate TypeScript declarations
dfx generate ironclad_vault_backend
```

### 4. Update Actor Import

Edit `lib/ic/ironcladActor.ts`:

```typescript
// REMOVE:
declare const idlFactory: any;
const DEFAULT_CANISTER_ID = process.env.NEXT_PUBLIC_IRONCLAD_CANISTER_ID || "u6s2n-gx777-77774-qaaba-cai";

// ADD:
import { idlFactory, canisterId } from "../../declarations/ironclad_vault_backend";
const DEFAULT_CANISTER_ID = canisterId || process.env.NEXT_PUBLIC_IRONCLAD_CANISTER_ID;
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Connect Wallet

1. Open http://localhost:3000/vault
2. Click "Connect Wallet"
3. Choose Internet Identity or Plug
4. Authorize the connection

### 7. Test Features

- View dashboard
- Create new vault
- Mock deposit (development only)
- View vault details

## File Structure (New Files)

```
lib/
├── ic/
│   └── ironcladActor.ts          ✅ NEW
└── ironclad-service.ts           ✅ NEW

components/wallet/
├── WalletProvider.tsx             ✅ NEW
├── ConnectWalletButton.tsx        ✅ NEW
└── useWallet.ts                   ✅ NEW

hooks/ironclad/
├── useVaults.ts                   ✅ NEW
├── useVaultActions.ts             ✅ NEW
├── useAutoReinvest.ts             ✅ NEW
└── useMarketplace.ts              ✅ NEW

app/
├── wrapper.tsx                    ✅ UPDATED
├── vault/
│   ├── page.tsx                   ✅ UPDATED
│   └── deposit/
│       ├── page.tsx               ✅ UPDATED
│       └── _components/
│           └── DepositForm.tsx    ✅ UPDATED

components/layout/
└── VaultHeader.tsx                ✅ UPDATED
```

## Troubleshooting

### "Certificate verification failed"

```bash
dfx start --background --clean
dfx deploy
```

### "Canister not found"

Check `.env.local` has correct canister ID from `dfx canister id ironclad_vault_backend`

### Wallet not connecting

- Internet Identity: Ensure local II canister is deployed
- Plug: Install browser extension from https://plugwallet.ooo

### TypeScript errors after dfx generate

Restart TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

## Next Steps

Implement remaining pages:

- [ ] Withdraw page
- [ ] History page
- [ ] Access page (auto-reinvest)
- [ ] Marketplace page

See `docs/ICP_INTEGRATION_COMPLETE.md` for detailed implementation guide.
