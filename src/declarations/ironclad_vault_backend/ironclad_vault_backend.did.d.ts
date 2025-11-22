import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AutoReinvestConfig {
  'next_cycle_timestamp' : bigint,
  'updated_at' : bigint,
  'owner' : Principal,
  'error_message' : [] | [string],
  'vault_id' : bigint,
  'created_at' : bigint,
  'plan_status' : AutoReinvestPlanStatus,
  'execution_count' : bigint,
  'enabled' : boolean,
  'new_lock_duration' : bigint,
}
export type AutoReinvestPlanStatus = { 'Error' : null } |
  { 'Paused' : null } |
  { 'Active' : null } |
  { 'Cancelled' : null };
export interface BitcoinTxProof {
  'confirmations' : number,
  'txid' : string,
  'confirmed' : boolean,
}
export interface CkbtcSyncResult {
  'synced_balance' : bigint,
  'vault' : Vault,
  'mode' : NetworkMode,
}
export type ListingStatus = { 'Active' : null } |
  { 'Filled' : null } |
  { 'Cancelled' : null };
export interface MarketListing {
  'id' : bigint,
  'status' : ListingStatus,
  'updated_at' : bigint,
  'vault_id' : bigint,
  'created_at' : bigint,
  'seller' : Principal,
  'buyer' : [] | [Principal],
  'price_sats' : bigint,
}
export type NetworkMode = { 'Mock' : null } |
  { 'CkBTCMainnet' : null };
export interface PlanStatusResponse {
  'next_cycle_timestamp' : bigint,
  'error_message' : [] | [string],
  'plan_status' : AutoReinvestPlanStatus,
  'execution_count' : bigint,
}
export interface SignatureResponse {
  'signature' : Uint8Array | number[],
  'message' : Uint8Array | number[],
}
export interface Vault {
  'id' : bigint,
  'status' : VaultStatus,
  /**
   * NEW: designated heir
   */
  'last_keep_alive' : bigint,
  /**
   * NEW: seconds of inactivity before claim
   */
  'encrypted_note' : [] | [string],
  'updated_at' : bigint,
  'balance' : bigint,
  'btc_deposit_txid' : [] | [string],
  'owner' : Principal,
  'beneficiary' : [] | [Principal],
  'btc_withdraw_txid' : [] | [string],
  /**
   * NEW: Digital Will encrypted message (hex-encoded)
   */
  'created_at' : bigint,
  /**
   * NEW: timestamp of last owner activity
   */
  'inheritance_timeout' : bigint,
  'lock_until' : bigint,
  'expected_deposit' : bigint,
  'btc_address' : string,
  'ckbtc_subaccount' : [] | [Uint8Array | number[]],
}
export interface VaultEvent {
  'action' : string,
  'vault_id' : bigint,
  'notes' : string,
  'timestamp' : bigint,
}
export type VaultStatus = { 'Unlockable' : null } |
  { 'Withdrawn' : null } |
  { 'ActiveLocked' : null } |
  { 'PendingDeposit' : null };
export interface _SERVICE {
  'buy_listing' : ActorMethod<[bigint], { 'Ok' : Vault } | { 'Err' : string }>,
  'cancel_auto_reinvest' : ActorMethod<
    [bigint],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'cancel_listing' : ActorMethod<
    [bigint],
    { 'Ok' : MarketListing } |
      { 'Err' : string }
  >,
  'claim_inheritance' : ActorMethod<
    [bigint],
    { 'Ok' : Vault } |
      { 'Err' : string }
  >,
  'create_listing' : ActorMethod<
    [bigint, bigint],
    { 'Ok' : MarketListing } |
      { 'Err' : string }
  >,
  'create_vault' : ActorMethod<
    [bigint, bigint, [] | [Principal], [] | [string], [] | [string]],
    Vault
  >,
  'execute_auto_reinvest' : ActorMethod<
    [bigint],
    { 'Ok' : Vault } |
      { 'Err' : string }
  >,
  'get_active_listings' : ActorMethod<[], Array<MarketListing>>,
  'get_auto_reinvest_config' : ActorMethod<[bigint], [] | [AutoReinvestConfig]>,
  'get_deposit_proof' : ActorMethod<
    [bigint],
    { 'Ok' : BitcoinTxProof } |
      { 'Err' : string }
  >,
  'get_digital_will_key' : ActorMethod<
    [bigint],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'get_mode_query' : ActorMethod<[], NetworkMode>,
  'get_my_auto_reinvest_configs' : ActorMethod<[], Array<AutoReinvestConfig>>,
  'get_my_listings' : ActorMethod<[], Array<MarketListing>>,
  'get_my_vaults' : ActorMethod<[], Array<Vault>>,
  'get_plan_status' : ActorMethod<
    [bigint],
    { 'Ok' : PlanStatusResponse } |
      { 'Err' : string }
  >,
  'get_unlockable_vaults' : ActorMethod<[], Array<Vault>>,
  'get_vault' : ActorMethod<[bigint], [] | [Vault]>,
  'get_vault_events' : ActorMethod<[bigint], Array<VaultEvent>>,
  'get_withdraw_proof' : ActorMethod<
    [bigint],
    { 'Ok' : BitcoinTxProof } |
      { 'Err' : string }
  >,
  'get_withdrawable_vaults' : ActorMethod<[], Array<Vault>>,
  'is_vault_unlockable' : ActorMethod<
    [bigint],
    { 'Ok' : boolean } |
      { 'Err' : string }
  >,
  'mock_deposit_vault' : ActorMethod<
    [bigint, bigint],
    { 'Ok' : Vault } |
      { 'Err' : string }
  >,
  'ping_alive' : ActorMethod<[bigint], { 'Ok' : Vault } | { 'Err' : string }>,
  'preview_withdraw' : ActorMethod<
    [bigint],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'request_btc_signature' : ActorMethod<
    [bigint, Uint8Array | number[]],
    { 'Ok' : SignatureResponse } |
      { 'Err' : string }
  >,
  'retry_failed_plan' : ActorMethod<
    [bigint],
    { 'Ok' : AutoReinvestConfig } |
      { 'Err' : string }
  >,
  'schedule_auto_reinvest' : ActorMethod<
    [bigint, bigint],
    { 'Ok' : AutoReinvestConfig } |
      { 'Err' : string }
  >,
  'set_mode_ckbtc_mainnet' : ActorMethod<[], undefined>,
  'set_mode_mock' : ActorMethod<[], undefined>,
  'sync_vault_balance_from_ckbtc' : ActorMethod<
    [bigint],
    { 'Ok' : CkbtcSyncResult } |
      { 'Err' : string }
  >,
  'unlock_vault' : ActorMethod<[bigint], { 'Ok' : Vault } | { 'Err' : string }>,
  'withdraw_vault' : ActorMethod<
    [bigint, bigint],
    { 'Ok' : Vault } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
