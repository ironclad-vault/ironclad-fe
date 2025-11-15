# Ironclad Vault - Testing Checklist (Testnet)

_For manual QA testing on testnet network_

## Prerequisites
- [ ] Connect wallet (ICP/II authentication working)
- [ ] Have test BTC balance available
- [ ] Connected to testnet (not local)
- [ ] Dev server running (`npm run dev`)
- [ ] Console opened (F12 for debugging)

## Module 1: Basic Vault Setup

### Vault Creation
- [ ] Navigate to `/vault` page
- [ ] Click "CREATE VAULT" button
- [ ] Enter valid BTC address
- [ ] Submit form
- [ ] Verify vault created and appears in list
- [ ] Check vault details (ID, balance, status)

### Vault Status Display
- [ ] View vault status (PendingDeposit, ActiveLocked, etc)
- [ ] Check balance display (in BTC)
- [ ] Verify lock_until timestamp displays correctly
- [ ] Check created_at and updated_at timestamps

## Module 2: Timelock & Unlock

### Deposit & Lock
- [ ] Go to DEPOSIT tab
- [ ] Select vault
- [ ] Enter deposit amount
- [ ] Select lock duration (days)
- [ ] Submit deposit
- [ ] Verify balance updated
- [ ] Verify status changed to ActiveLocked
- [ ] Check lock_until timestamp

### Manual Unlock
- [ ] Wait for lock duration to pass (or check testnet time)
- [ ] Go to ACCESS tab
- [ ] Find locked vault
- [ ] Click "UNLOCK" button
- [ ] Verify status changed to Unlockable
- [ ] Check transaction confirmed

## Module 3: Withdraw Flow

### Withdraw Process
- [ ] Navigate to WITHDRAW tab
- [ ] Select unlocked/withdrawable vault
- [ ] Verify available amount displays
- [ ] Enter withdraw amount
- [ ] Click WITHDRAW button
- [ ] Confirm in dialog
- [ ] Monitor processing state
- [ ] Verify success message
- [ ] Check balance updated on vault
- [ ] Verify transaction in backend logs

### Validation Tests
- [ ] Try withdrawing more than available (should error)
- [ ] Try withdraw with 0 amount (should error)
- [ ] Try withdraw without selecting vault (should error)
- [ ] Try withdraw amount with many decimals (should work)

## Module 4: Auto-Reinvest

### Create Auto-Reinvest Schedule
- [ ] Go to ACCESS tab
- [ ] Select vault
- [ ] Click "ENABLE AUTO-REINVEST"
- [ ] Set new lock duration
- [ ] Submit
- [ ] Verify schedule created
- [ ] Check status in "My Schedules"

### Auto-Reinvest Status
- [ ] View auto-reinvest configuration details
- [ ] Check enabled flag
- [ ] Verify new lock duration set
- [ ] Check created_at timestamp

### Cancel Auto-Reinvest
- [ ] Click "CANCEL" on active schedule
- [ ] Confirm cancellation
- [ ] Verify schedule removed from list
- [ ] Check status updated in backend

## Module 5: Marketplace

### Create Listing
- [ ] Go to MARKETPLACE → CREATE tab
- [ ] Select vault from dropdown
- [ ] Enter price in BTC
- [ ] Submit listing
- [ ] Verify success message
- [ ] Navigate to MY LISTINGS
- [ ] Check listing appears with status "ACTIVE"
- [ ] Verify price and vault details show correctly

### Browse & Browse Listings
- [ ] Go to MARKETPLACE → BROWSE tab
- [ ] Verify all active listings display
- [ ] Check listing details (ID, vault balance, price, seller)
- [ ] Verify listing count updates

### Buy Listing
- [ ] Select a listing to purchase
- [ ] Click "BUY NOW" button
- [ ] Confirm purchase in dialog
- [ ] Monitor processing state
- [ ] Verify success message
- [ ] Navigate to vaults to verify new vault added
- [ ] Check vault ownership transferred

### Cancel Listing
- [ ] Create a new listing
- [ ] Go to MY LISTINGS
- [ ] Click "CANCEL LISTING"
- [ ] Confirm cancellation
- [ ] Verify status changed to "CANCELLED"
- [ ] Verify button disabled
- [ ] Check listing removed from BROWSE tab

### Edge Cases
- [ ] Try buying own listing (should disable button)
- [ ] Try buying with insufficient funds (should error)
- [ ] Create multiple listings (should all appear)
- [ ] Buy listing while it has auto-reinvest (schedule should cancel)

## Navigation & UI

### Header Navigation
- [ ] Logo links to home
- [ ] All menu items link to correct pages:
  - [ ] STATUS → /vault
  - [ ] DEPOSIT → /vault/deposit
  - [ ] WITHDRAW → /vault/withdraw
  - [ ] HISTORY → /vault/history
  - [ ] ACCESS → /vault/access
  - [ ] MARKETPLACE → /vault/marketplace
- [ ] Connect/Disconnect wallet button works
- [ ] Menu items update on route change

### Page Transitions
- [ ] Smooth page transitions when navigating
- [ ] No console errors during navigation
- [ ] Page content loads correctly after transition

### Responsive Design
- [ ] Desktop view (> 768px) displays properly
- [ ] Tablet view (768px) adjusts layout
- [ ] Mobile view (< 768px) shows stacked layout
- [ ] All buttons and forms accessible on mobile

## Error Handling

### Backend Integration
- [ ] Error messages display when backend calls fail
- [ ] Loading states show during async operations
- [ ] Success messages appear after successful operations
- [ ] Wallet disconnect handled gracefully
- [ ] Reconnect wallet works after disconnect

### Form Validation
- [ ] Required fields show error when empty
- [ ] Invalid amounts rejected
- [ ] Negative amounts rejected
- [ ] Non-numeric inputs rejected
- [ ] BTC address validation works

## Performance

### Load Times
- [ ] Page loads in < 3 seconds
- [ ] No console errors or warnings
- [ ] Images load properly
- [ ] No layout shift during load

### State Management
- [ ] State persists correctly during navigation
- [ ] Wallet state updates properly
- [ ] Multiple concurrent operations handled
- [ ] No memory leaks in console

## Final Checklist

- [ ] All modules functional (1-5)
- [ ] All navigation working
- [ ] All error handling correct
- [ ] Responsive design working
- [ ] No console errors
- [ ] Build passes without warnings
- [ ] Ready for mainnet deployment

---

**Notes for Tester:**
- Document any bugs with screenshots
- Include console errors if encountered
- Note gas fees used for operations
- Verify transaction hashes on block explorer
- Test with multiple wallets if possible

**Completion Date:** ___________
**Tester Name:** ___________
**Status:** ⏳ Pending / ✅ Passed / ❌ Failed
