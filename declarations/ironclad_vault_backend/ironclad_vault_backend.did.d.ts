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
export interface PlanStatusResponse {
  'next_cycle_timestamp' : bigint,
  'error_message' : [] | [string],
  'plan_status' : AutoReinvestPlanStatus,
  'execution_count' : bigint,
}
export interface Vault {
  'id' : bigint,
  'status' : VaultStatus,
  'updated_at' : bigint,
  'balance' : bigint,
  'btc_deposit_txid' : [] | [string],
  'owner' : Principal,
  'btc_withdraw_txid' : [] | [string],
  'created_at' : bigint,
  'lock_until' : bigint,
  'expected_deposit' : bigint,
  'btc_address' : string,
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
  'create_listing' : ActorMethod<
    [bigint, bigint],
    { 'Ok' : MarketListing } |
      { 'Err' : string }
  >,
  'create_vault' : ActorMethod<[bigint, bigint], Vault>,
  'execute_auto_reinvest' : ActorMethod<
    [bigint],
    { 'Ok' : Vault } |
      { 'Err' : string }
  >,
  'get_active_listings' : ActorMethod<[], Array<MarketListing>>,
  'get_auto_reinvest_config' : ActorMethod<[bigint], [] | [AutoReinvestConfig]>,
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
  'preview_withdraw' : ActorMethod<
    [bigint],
    { 'Ok' : bigint } |
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
  'unlock_vault' : ActorMethod<[bigint], { 'Ok' : Vault } | { 'Err' : string }>,
  'withdraw_vault' : ActorMethod<
    [bigint, bigint],
    { 'Ok' : Vault } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
