# ⚡ **IRONCLAD PROTOCOL**

## **The First Liquid Vesting & Inheritance Layer for Bitcoin**

Institutional-Grade DeFi Infrastructure • Cryptographic Ownership Proof • Non-Custodial
Powered by ICP, ckBTC & Threshold ECDSA

![IRONCLAD PROTOCOL Logo](public/ironclad-vault-logo.png)

---

## 🚀 **Overview**

**IRONCLAD PROTOCOL** is an institutional-grade DeFi infrastructure that enables:

- **Liquid Vesting**: Time-lock Bitcoin with tradeable zero-coupon bonds
- **Dead Man Switch**: Automated inheritance protocol with Proof of Life
- **Bond Marketplace**: Trade illiquid time-locked positions for instant liquidity
- **Cryptographic Ownership**: Trustless auditability via ICP Threshold ECDSA
- **Auto-Roll Strategy**: Automated vault renewal for disciplined long-term holding

This protocol is built with institutional-grade security principles using **Next.js** and **strict TypeScript**, providing a complete DeFi infrastructure for Bitcoin custody and inheritance.

The mission is clear:
**Transform Bitcoin custody into a programmable, liquid, and inheritable asset class.**

---

## 💎 **Protocol Features**

## 🔐 **1. Liquid Vesting Vaults**

- Create time-locked Bitcoin positions with configurable maturity dates
- Deposit ckBTC into cryptographically secured vaults
- Unlock and withdraw upon maturity with full auditability
- Comprehensive event history with cryptographic proof timestamps

## 🔁 **2. Auto-Roll Strategy**

- Enable automated vault renewal upon maturity
- Configurable parameters:

  - Lock duration: 30 days to 5 years
  - Automatic renewal cycles
  - On-chain execution tracking

- Real-time execution status and next cycle timestamps
- Manual execution override with instant settlement

## 🧾 **3. Cryptographic Transaction Proofs**

- Deposit & withdrawal verification
- Proof verification:

  - Transaction ID (on-chain verifiable)
  - Network confirmations
  - Cryptographic status validation
  - Real-time state updates

- Direct Bitcoin network integration

## 🧠 **4. Threshold ECDSA Signatures**

- Sign Bitcoin messages via decentralized threshold cryptography
- Signature formats:

  - Hexadecimal encoding
  - Base64 encoding

- Export and verify `.sig` files
- Technical documentation for curve, hash function, and key derivation

## 🛒 **5. Zero-Coupon Bond Market**

- List time-locked positions for immediate liquidity
- Purchase discounted Bitcoin from bond sellers
- Ownership verification with cryptographic proofs
- Maturity validation before listing eligibility

## 🛰️ **6. Dead Man Switch Protocol**

- Automated inheritance with 180-day inactivity timeout
- Proof of Life verification system
- Beneficiary designation and automated transfer
- On-chain validation with cryptographic timestamping

## 🧩 **7. Institutional-Grade Architecture**

- Strict TypeScript with zero tolerance for loose typing
- Type-safe DTOs, enums, and generated actor interfaces
- Unified client abstraction via `ironcladClient`
- Comprehensive service layer with error handling

---

## 🏗️ **System Architecture**

```text
Frontend
  ↓
Hooks
  - useVaults
  - useVaultActions
  - useCkbtcSync
  - useMarketplace
  - useAutoReinvest
  - useNetworkMode
  ↓
ironcladClient   (service abstraction)
  ↓
ironcladActor    (typed ICP actor)
  ↓
Motoko Backend   (vault / reinvest / signing / proofs / market)
```

Every interaction is:
✔ Strongly typed
✔ Properly error-handled
✔ UI-friendly (loading, error, and empty states)

---

## ⚙️ **Technical Highlights**

### ✔ Strict TypeScript

All components, hooks, and services enforce strict TypeScript.

### ✔ Service Layer

`ironcladClient.ts` ensures:

- typed responses
- normalized errors
- uniform UX state handling

### ✔ Typed Actor API

Semua calls (vault, marketplace, reinvest, proofs, signatures) → didefinisikan di `.did.d.ts`.

### ✔ Brutalist Design System

- Hard borders
- Monochrome palettes
- Sharp UI
- Event colors mapping
- Iconography powered by lucide

---

## 🔗 **How ckBTC Integration Works**

1. User creates a vault
2. Backend generates ckBTC subaccount
3. UI shows full hex, copyable
4. User sends ckBTC → Ledger finalizes
5. Backend verifies → event created
6. Proof visible in TransactionProofCard
7. Vault balance updated via `sync_ckbtc_balance`

---

## 🔑 **How Threshold ECDSA Works**

Ironclad uses ICP’s **chain-key ECDSA**:

- Private key split across subnet
- User submits a message
- Canister requests signature via `request_btc_signature`
- Signature assembled from node shares
- UI displays hex + base64
- Downloadable `.sig`

**No private key ever exists in one place.**

---

## 🧪 **Development Setup**

### Install dependencies

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Visit: **[http://localhost:3000](http://localhost:3000)**

### Build production

```bash
npm run build
```

✔ 0 TypeScript errors
✔ All pages generated
✔ Stable build

---

## 🧷 **Environment Variables**

```bash
NEXT_PUBLIC_IC_HOST=https://ic0.app
NEXT_PUBLIC_CANISTER_ID_IRONCLAD_VAULT_BACKEND=<your-backend-id>
```

---

## 📦 **Scripts**

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build production output  |
| `npm run start` | Run production           |
| `npm run lint`  | Lint code                |

---

## 🛡 **Security Model**

- Vaults are non-custodial
- Users control identity (Internet Identity)
- Bitcoin locked via ckBTC ledger
- All signatures generated via threshold ECDSA
- Auto-reinvest uses on-chain strategy logic
- Marketplace requires vault unlock conditions

---

## 🏁 **Conclusion**

**IRONCLAD PROTOCOL** is institutional-grade DeFi infrastructure for Bitcoin with:

- Liquid vesting positions
- Zero-coupon bond marketplace
- Dead Man Switch inheritance protocol
- Cryptographic ownership proofs
- Threshold ECDSA signing
- Auto-Roll strategy system
- Zero `any`, fully typed
- Cypherpunk-grade security
- Production ready

Built for institutions.
Designed for sovereignty.
Secured by cryptography.

---
