# Quick Testing: 3 Second Vault Unlock

## TL;DR
Testing withdraw flow sekarang bisa dilakukan dalam 3 detik dengan opsi testing khusus.

## Quick Steps

1. **Create** → Buka `/vault/deposit` → Pilih "🧪 3 SECONDS (TESTING)" → Create vault
2. **Deposit** → Klik "MOCK DEPOSIT (DEV ONLY)" 
3. **Wait** → 3 detik (auto-refresh akan detect)
4. **Unlock** → Buka `/vault/timelock` → Klik "UNLOCK VAULT"
5. **Withdraw** → Buka `/vault/withdraw` → Masukkan address → Withdraw

## Features

### DepositForm
- Opsi "🧪 3 SECONDS (TESTING)" di dropdown pertama
- Warning orange saat testing mode aktif
- Support both seconds (testing) dan months (production)

### TimelockMain  
- Smart polling: 30s normal, 3s fast mode
- Fast mode aktif saat vault unlock < 1 menit
- Visual indicator "🧪 Fast polling active"

## Backend Note
Pastikan backend menerima lock duration dalam **seconds** (Unix timestamp).

Formula: `lockUntil = Math.floor(Date.now() / 1000) + 3`

## Testing Checklist
- [ ] Vault created dengan 3s lock
- [ ] Mock deposit berhasil
- [ ] Status "Locked" → "Ready to Unlock" dalam 3s
- [ ] Fast polling (3s interval) aktif
- [ ] Unlock berhasil dengan toast notification
- [ ] Withdraw berhasil
- [ ] Status final "Withdrawn"
