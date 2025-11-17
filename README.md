# 🏰 **IRONCLAD VAULT**

## **Bitcoin Savings Vault with Auto-Reinvest Engine — Powered by ICP, ckBTC & Threshold ECDSA**

Brutalist UI • Real Bitcoin Integration • Fully Typed (0 `any`)
Production Ready • Secured

![IRONCLAD VAULT Logo](public/ironclad-vault-logo.png)

---

## 🚀 **Overview**

**IRONCLAD VAULT** is a non-custodial Bitcoin Savings Vault platform that enables users to:

- Deposit Bitcoin (via **ckBTC**) into vaults
- Enable the **Auto-Reinvest Engine** to compound returns
- Automatically grow a vault position through configured strategies
- Verify deposits and withdrawals using **Bitcoin transaction proofs**
- Sign Bitcoin messages using **threshold ECDSA**
- List and sell vaults via a decentralized **on-chain marketplace**

This project is built with production-grade principles using **Next.js** and **strict TypeScript**, with end-to-end integration across the entire vault lifecycle.

The mission is simple:
**Transform Bitcoin into a secure, automated, and programmable savings product.**

---

## 💎 **Key Features**

## 🔐 **1. Bitcoin Savings Vaults**

- Create vaults with deposit targets and configurable lock durations
- Deposit ckBTC and lock funds with real-time status
- Unlock and withdraw once the lock period ends
- Professional event history with icons, filters, and timeline

## 🔁 **2. Auto-Reinvest Engine**

- Enable/disable auto-reinvest
- Configurable parameters:

  - Frequency: hourly / daily
  - Percentage to reinvest
  - Minimum threshold to trigger reinvest

- Shows execution counts, next run timestamps, and plan status
- Supports manual and forced reinvest execution

## 🧾 **3. Bitcoin Transaction Proofs**

- Deposit & withdrawal proofs
- Proof card:

  - TxID (copyable)
  - Confirmations count
  - Status badges (Pending / Confirmed)
  - Error & loading states

- Real Bitcoin network data

## 🧠 **4. Threshold ECDSA (Advanced Mode)**

- Sign Bitcoin messages via the canister (threshold ECDSA)
- Output formats:

  - Hex signature
  - Base64 signature

- Copy and download `.sig` files
- Includes a technical explainer describing the curve, hash function, and key usage

## 🛒 **5. Vault Marketplace**

- List vaults for sale
- Buy vaults from other users
- Owner-aware UI, safe actions
- Unlock conditions required before listing

## 🛰️ **6. Network Mode Switching**

- Mock mode (free, safe for dev)
- ckBTC Mainnet mode (real Bitcoin, cycle costs)
- Warning banners + confirmation dialogs
- Controlled via settings page

## 🧩 **7. Fully Typed & Stable Architecture**

- Strict TypeScript (no loose typing)
- Strict DTOs, enums, and generated actor types
- Unified client via `ironcladClient`
- Comprehensive service layer

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

## 📁 **Folder Structure**

```text
├── app
│   ├── landing
│   ├── vault
│   │   ├── [id]
│   │   │   ├── _components
│   │   │   │   ├── VaultDetailMain.tsx
│   │   │   │   └── VaultDetailSection.tsx
│   │   │   └── page.tsx
│   │   ├── create-vault
│   │   ├── marketplace
│   │   ├── withdraw-vaults
│   │   ├── test
│   │   └── page.tsx
│   ├── settings
│   ├── dashboard
│   ├── vault-debug
│   └── layout.tsx
│
├── components
│   ├── layout
│   ├── navigation
│   ├── ui
│   └── wallet
│
├── hooks
│   ├── ironclad
│   └── useMyVaults.ts (removed)
│
├── lib
│   ├── ic
│   │   ├── config.ts
│   │   ├── ironcladActor.ts
│   │   └── ironcladClient.ts
│   ├── ironclad-service.ts
│   ├── toastUtils.ts
│   └── vaultUtils.ts
│
├── declarations
│   ├── ironclad_vault_backend
│   └── internet_identity
│
├── docs
│   ├── ICP_INTEGRATION_COMPLETE.md
│   ├── MODULE-*.md
│   ├── IMPLEMENTATION_STATUS.md
│   └── TESTING_CHECKLIST.md
```

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

## 📚 **Documentation**

All in `/docs`:

- **INTEGRATION_COMPLETE.md** — Integration summary and deployment checklist
- **IMPLEMENTATION_JOURNAL.md** — Development journal and changelog
- **PROJECT_SUMMARY.txt** — High-level summary, achievements, and impact

---

## 🏁 **Conclusion**

**IRONCLAD VAULT** is a full-stack Bitcoin savings product with:

- Time-locked ckBTC vaults
- Auto-reinvest system
- Live Bitcoin proofs
- Threshold ECDSA signing
- Marketplace trading
- Zero `any`, fully typed
- Brutalist pro-grade UI
- Production ready

Built with precision.
Designed for security.
Made for real users.

---
