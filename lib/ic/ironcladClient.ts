/**
 * Ironclad Client
 * High-level wrapper functions for Ironclad canister methods
 * 
 * Phase 1: All calls are anonymous - no identity parameter
 */

import { createIroncladActor } from './ironcladActor';
import type { Identity } from '@dfinity/agent';
import type { 
  Vault, 
  VaultEvent, 
  AutoReinvestConfig, 
  MarketListing,
  NetworkMode,
  CkbtcSyncResult,
  BitcoinTxProof,
  SignatureResponse,
} from './ironcladActor';

/**
 * Client wrapper for Ironclad Vault Backend
 * Provides typed, easy-to-use methods for canister operations
 */
export const ironcladClient = {
  /**
   * Vault Operations
   */
  vaults: {
    /** Get all vaults owned by the caller */
    async getMyVaults(identity?: Identity): Promise<ReadonlyArray<Vault>> {
      const actor = await createIroncladActor(identity);
      return actor.get_my_vaults();
    },

    /** Get a specific vault by ID */
    async getVault(vaultId: bigint, identity?: Identity): Promise<Vault | null> {
      const actor = await createIroncladActor(identity);
      const result = await actor.get_vault(vaultId);
      return result.length > 0 ? result[0]! : null;
    },

    /** Create a new vault */
    async create(
      lockUntil: bigint,
      expectedDeposit: bigint,
      identity?: Identity,
      beneficiary?: string
    ): Promise<Vault> {
      const actor = await createIroncladActor(identity);
      if (beneficiary) {
        console.info("[ironcladClient] Creating vault with beneficiary:", beneficiary);
      }
      return actor.create_vault(lockUntil, expectedDeposit);
    },

    /** Mock deposit to a vault (for testing) */
    async mockDeposit(
      vaultId: bigint,
      amount: bigint
    , identity?: Identity): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.mock_deposit_vault(vaultId, amount);
    },

    /** Get all unlockable vaults */
    async getUnlockable(identity?: Identity): Promise<ReadonlyArray<Vault>> {
      const actor = await createIroncladActor(identity);
      return actor.get_unlockable_vaults();
    },

    /** Get all withdrawable vaults */
    async getWithdrawable(identity?: Identity): Promise<ReadonlyArray<Vault>> {
      const actor = await createIroncladActor(identity);
      return actor.get_withdrawable_vaults();
    },

    /** Check if a vault is unlockable */
    async isUnlockable(
      vaultId: bigint
    , identity?: Identity): Promise<{ Ok: boolean } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.is_vault_unlockable(vaultId);
    },

    /** Unlock a vault */
    async unlock(
      vaultId: bigint
    , identity?: Identity): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.unlock_vault(vaultId);
    },

    /** Preview withdrawal amount */
    async previewWithdraw(
      vaultId: bigint
    , identity?: Identity): Promise<{ Ok: bigint } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.preview_withdraw(vaultId);
    },

    /** Withdraw from a vault */
    async withdraw(
      vaultId: bigint,
      amount: bigint
    , identity?: Identity): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.withdraw_vault(vaultId, amount);
    },

    /** Get event history for a vault */
    async getEvents(vaultId: bigint, identity?: Identity): Promise<ReadonlyArray<VaultEvent>> {
      const actor = await createIroncladActor(identity);
      return actor.get_vault_events(vaultId);
    },
  },

  /**
   * Auto-Reinvest Operations
   */
  autoReinvest: {
    /** Get all auto-reinvest configs for the caller */
    async getMyConfigs(identity?: Identity): Promise<ReadonlyArray<AutoReinvestConfig>> {
      const actor = await createIroncladActor(identity);
      return actor.get_my_auto_reinvest_configs();
    },

    /** Get auto-reinvest config for a specific vault */
    async getConfig(vaultId: bigint, identity?: Identity): Promise<AutoReinvestConfig | null> {
      const actor = await createIroncladActor(identity);
      const result = await actor.get_auto_reinvest_config(vaultId);
      return result.length > 0 ? result[0]! : null;
    },

    /** Schedule auto-reinvest for a vault */
    async schedule(
      vaultId: bigint,
      newLockDuration: bigint
    , identity?: Identity): Promise<{ Ok: AutoReinvestConfig } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.schedule_auto_reinvest(vaultId, newLockDuration);
    },

    /** Cancel auto-reinvest for a vault */
    async cancel(vaultId: bigint, identity?: Identity): Promise<{ Ok: null } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.cancel_auto_reinvest(vaultId);
    },

    /** Execute auto-reinvest manually */
    async execute(vaultId: bigint, identity?: Identity): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.execute_auto_reinvest(vaultId);
    },
  },

  /**
   * Marketplace Operations
   */
  marketplace: {
    /** Get all active listings */
    async getActiveListings(identity?: Identity): Promise<ReadonlyArray<MarketListing>> {
      const actor = await createIroncladActor(identity);
      return actor.get_active_listings();
    },

    /** Get caller's listings */
    async getMyListings(identity?: Identity): Promise<ReadonlyArray<MarketListing>> {
      const actor = await createIroncladActor(identity);
      return actor.get_my_listings();
    },

    /** Create a new listing */
    async create(
      vaultId: bigint,
      priceSats: bigint
    , identity?: Identity): Promise<{ Ok: MarketListing } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.create_listing(vaultId, priceSats);
    },

    /** Cancel a listing */
    async cancel(listingId: bigint, identity?: Identity): Promise<{ Ok: MarketListing } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.cancel_listing(listingId);
    },

    /** Buy a listing */
    async buy(listingId: bigint, identity?: Identity): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.buy_listing(listingId);
    },
  },

  /**
   * Network Mode Operations
   */
  network: {
    /** Get current network mode */
    async getMode(identity?: Identity): Promise<NetworkMode> {
      const actor = await createIroncladActor(identity);
      return actor.get_mode_query();
    },

    /** Set network mode to Mock */
    async setMock(identity?: Identity): Promise<void> {
      const actor = await createIroncladActor(identity);
      await actor.set_mode_mock();
    },

    /** Set network mode to ckBTC Mainnet */
    async setCkbtcMainnet(identity?: Identity): Promise<void> {
      const actor = await createIroncladActor(identity);
      await actor.set_mode_ckbtc_mainnet();
    },
  },

  /**
   * ckBTC Integration Operations
   */
  ckbtc: {
    /** Sync vault balance from ckBTC ledger */
    async syncVault(
      vaultId: bigint,
      identity?: Identity,
    ): Promise<{ Ok: CkbtcSyncResult } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.sync_vault_balance_from_ckbtc(vaultId);
    },
  },

  /**
   * Bitcoin Proof Operations
   */
  bitcoinProofs: {
    /** Get deposit proof for a vault */
    async getDepositProof(
      vaultId: bigint,
      identity?: Identity,
    ): Promise<{ Ok: BitcoinTxProof } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.get_deposit_proof(vaultId);
    },

    /** Get withdraw proof for a vault */
    async getWithdrawProof(
      vaultId: bigint,
      identity?: Identity,
    ): Promise<{ Ok: BitcoinTxProof } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.get_withdraw_proof(vaultId);
    },
  },

  /**
   * BTC Threshold Signing Operations
   */
  btcSigning: {
    /** Request BTC signature for a vault */
    async requestSignature(
      vaultId: bigint,
      message: Uint8Array,
      identity?: Identity,
    ): Promise<{ Ok: SignatureResponse } | { Err: string }> {
      const actor = await createIroncladActor(identity);
      return actor.request_btc_signature(vaultId, Array.from(message));
    },
  },
};
