/**
 * Ironclad Client
 * High-level wrapper functions for Ironclad canister methods
 * 
 * Phase 1: All calls are anonymous - no identity parameter
 */

import { createIroncladActor } from './ironcladActor';
import type { Vault, VaultEvent, AutoReinvestConfig, MarketListing } from './ironcladActor';

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
    async getMyVaults(): Promise<ReadonlyArray<Vault>> {
      const actor = await createIroncladActor();
      return actor.get_my_vaults();
    },

    /** Get a specific vault by ID */
    async getVault(vaultId: bigint): Promise<Vault | null> {
      const actor = await createIroncladActor();
      const result = await actor.get_vault(vaultId);
      return result.length > 0 ? result[0]! : null;
    },

    /** Create a new vault */
    async create(
      lockUntil: bigint,
      expectedDeposit: bigint
    ): Promise<Vault> {
      const actor = await createIroncladActor();
      return actor.create_vault(lockUntil, expectedDeposit);
    },

    /** Mock deposit to a vault (for testing) */
    async mockDeposit(
      vaultId: bigint,
      amount: bigint
    ): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.mock_deposit_vault(vaultId, amount);
    },

    /** Get all unlockable vaults */
    async getUnlockable(): Promise<ReadonlyArray<Vault>> {
      const actor = await createIroncladActor();
      return actor.get_unlockable_vaults();
    },

    /** Get all withdrawable vaults */
    async getWithdrawable(): Promise<ReadonlyArray<Vault>> {
      const actor = await createIroncladActor();
      return actor.get_withdrawable_vaults();
    },

    /** Check if a vault is unlockable */
    async isUnlockable(
      vaultId: bigint
    ): Promise<{ Ok: boolean } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.is_vault_unlockable(vaultId);
    },

    /** Unlock a vault */
    async unlock(
      vaultId: bigint
    ): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.unlock_vault(vaultId);
    },

    /** Preview withdrawal amount */
    async previewWithdraw(
      vaultId: bigint
    ): Promise<{ Ok: bigint } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.preview_withdraw(vaultId);
    },

    /** Withdraw from a vault */
    async withdraw(
      vaultId: bigint,
      amount: bigint
    ): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.withdraw_vault(vaultId, amount);
    },

    /** Get event history for a vault */
    async getEvents(vaultId: bigint): Promise<ReadonlyArray<VaultEvent>> {
      const actor = await createIroncladActor();
      return actor.get_vault_events(vaultId);
    },
  },

  /**
   * Auto-Reinvest Operations
   */
  autoReinvest: {
    /** Get all auto-reinvest configs for the caller */
    async getMyConfigs(): Promise<ReadonlyArray<AutoReinvestConfig>> {
      const actor = await createIroncladActor();
      return actor.get_my_auto_reinvest_configs();
    },

    /** Get auto-reinvest config for a specific vault */
    async getConfig(vaultId: bigint): Promise<AutoReinvestConfig | null> {
      const actor = await createIroncladActor();
      const result = await actor.get_auto_reinvest_config(vaultId);
      return result.length > 0 ? result[0]! : null;
    },

    /** Schedule auto-reinvest for a vault */
    async schedule(
      vaultId: bigint,
      newLockDuration: bigint
    ): Promise<{ Ok: AutoReinvestConfig } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.schedule_auto_reinvest(vaultId, newLockDuration);
    },

    /** Cancel auto-reinvest for a vault */
    async cancel(vaultId: bigint): Promise<{ Ok: null } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.cancel_auto_reinvest(vaultId);
    },

    /** Execute auto-reinvest manually */
    async execute(vaultId: bigint): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.execute_auto_reinvest(vaultId);
    },
  },

  /**
   * Marketplace Operations
   */
  marketplace: {
    /** Get all active listings */
    async getActiveListings(): Promise<ReadonlyArray<MarketListing>> {
      const actor = await createIroncladActor();
      return actor.get_active_listings();
    },

    /** Get caller's listings */
    async getMyListings(): Promise<ReadonlyArray<MarketListing>> {
      const actor = await createIroncladActor();
      return actor.get_my_listings();
    },

    /** Create a new listing */
    async create(
      vaultId: bigint,
      priceSats: bigint
    ): Promise<{ Ok: MarketListing } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.create_listing(vaultId, priceSats);
    },

    /** Cancel a listing */
    async cancel(listingId: bigint): Promise<{ Ok: MarketListing } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.cancel_listing(listingId);
    },

    /** Buy a listing */
    async buy(listingId: bigint): Promise<{ Ok: Vault } | { Err: string }> {
      const actor = await createIroncladActor();
      return actor.buy_listing(listingId);
    },
  },
};
