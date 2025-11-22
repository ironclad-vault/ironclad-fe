export const idlFactory = ({ IDL }) => {
  const VaultStatus = IDL.Variant({
    'Unlockable' : IDL.Null,
    'Withdrawn' : IDL.Null,
    'ActiveLocked' : IDL.Null,
    'PendingDeposit' : IDL.Null,
  });
  const Vault = IDL.Record({
    'id' : IDL.Nat64,
    'status' : VaultStatus,
    'last_keep_alive' : IDL.Nat64,
    'encrypted_note' : IDL.Opt(IDL.Text),
    'updated_at' : IDL.Nat64,
    'balance' : IDL.Nat64,
    'btc_deposit_txid' : IDL.Opt(IDL.Text),
    'owner' : IDL.Principal,
    'beneficiary' : IDL.Opt(IDL.Principal),
    'btc_withdraw_txid' : IDL.Opt(IDL.Text),
    'created_at' : IDL.Nat64,
    'inheritance_timeout' : IDL.Nat64,
    'lock_until' : IDL.Nat64,
    'expected_deposit' : IDL.Nat64,
    'btc_address' : IDL.Text,
    'ckbtc_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const ListingStatus = IDL.Variant({
    'Active' : IDL.Null,
    'Filled' : IDL.Null,
    'Cancelled' : IDL.Null,
  });
  const MarketListing = IDL.Record({
    'id' : IDL.Nat64,
    'status' : ListingStatus,
    'updated_at' : IDL.Nat64,
    'vault_id' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'seller' : IDL.Principal,
    'buyer' : IDL.Opt(IDL.Principal),
    'price_sats' : IDL.Nat64,
  });
  const AutoReinvestPlanStatus = IDL.Variant({
    'Error' : IDL.Null,
    'Paused' : IDL.Null,
    'Active' : IDL.Null,
    'Cancelled' : IDL.Null,
  });
  const AutoReinvestConfig = IDL.Record({
    'next_cycle_timestamp' : IDL.Nat64,
    'updated_at' : IDL.Nat64,
    'owner' : IDL.Principal,
    'error_message' : IDL.Opt(IDL.Text),
    'vault_id' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'plan_status' : AutoReinvestPlanStatus,
    'execution_count' : IDL.Nat64,
    'enabled' : IDL.Bool,
    'new_lock_duration' : IDL.Nat64,
  });
  const BitcoinTxProof = IDL.Record({
    'confirmations' : IDL.Nat32,
    'txid' : IDL.Text,
    'confirmed' : IDL.Bool,
  });
  const NetworkMode = IDL.Variant({
    'Mock' : IDL.Null,
    'CkBTCMainnet' : IDL.Null,
  });
  const PlanStatusResponse = IDL.Record({
    'next_cycle_timestamp' : IDL.Nat64,
    'error_message' : IDL.Opt(IDL.Text),
    'plan_status' : AutoReinvestPlanStatus,
    'execution_count' : IDL.Nat64,
  });
  const VaultEvent = IDL.Record({
    'action' : IDL.Text,
    'vault_id' : IDL.Nat64,
    'notes' : IDL.Text,
    'timestamp' : IDL.Nat64,
  });
  const SignatureResponse = IDL.Record({
    'signature' : IDL.Vec(IDL.Nat8),
    'message' : IDL.Vec(IDL.Nat8),
  });
  const CkbtcSyncResult = IDL.Record({
    'synced_balance' : IDL.Nat64,
    'vault' : Vault,
    'mode' : NetworkMode,
  });
  return IDL.Service({
    'buy_listing' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : Vault, 'Err' : IDL.Text })],
        [],
      ),
    'cancel_auto_reinvest' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'cancel_listing' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : MarketListing, 'Err' : IDL.Text })],
        [],
      ),
    'claim_inheritance' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : Vault, 'Err' : IDL.Text })],
        [],
      ),
    'create_listing' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Variant({ 'Ok' : MarketListing, 'Err' : IDL.Text })],
        [],
      ),
    'create_vault' : IDL.Func(
        [
          IDL.Nat64,
          IDL.Nat64,
          IDL.Opt(IDL.Principal),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
        ],
        [Vault],
        [],
      ),
    'execute_auto_reinvest' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : Vault, 'Err' : IDL.Text })],
        [],
      ),
    'get_active_listings' : IDL.Func([], [IDL.Vec(MarketListing)], ['query']),
    'get_auto_reinvest_config' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(AutoReinvestConfig)],
        ['query'],
      ),
    'get_deposit_proof' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : BitcoinTxProof, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_digital_will_key' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'get_mode_query' : IDL.Func([], [NetworkMode], ['query']),
    'get_my_auto_reinvest_configs' : IDL.Func(
        [],
        [IDL.Vec(AutoReinvestConfig)],
        ['query'],
      ),
    'get_my_listings' : IDL.Func([], [IDL.Vec(MarketListing)], ['query']),
    'get_my_vaults' : IDL.Func([], [IDL.Vec(Vault)], ['query']),
    'get_plan_status' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : PlanStatusResponse, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_unlockable_vaults' : IDL.Func([], [IDL.Vec(Vault)], ['query']),
    'get_vault' : IDL.Func([IDL.Nat64], [IDL.Opt(Vault)], ['query']),
    'get_vault_events' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(VaultEvent)],
        ['query'],
      ),
    'get_withdraw_proof' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : BitcoinTxProof, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_withdrawable_vaults' : IDL.Func([], [IDL.Vec(Vault)], ['query']),
    'is_vault_unlockable' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text })],
        ['query'],
      ),
    'mock_deposit_vault' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Variant({ 'Ok' : Vault, 'Err' : IDL.Text })],
        [],
      ),
    'ping_alive' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : Vault, 'Err' : IDL.Text })],
        [],
      ),
    'preview_withdraw' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        ['query'],
      ),
    'request_btc_signature' : IDL.Func(
        [IDL.Nat64, IDL.Vec(IDL.Nat8)],
        [IDL.Variant({ 'Ok' : SignatureResponse, 'Err' : IDL.Text })],
        [],
      ),
    'retry_failed_plan' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : AutoReinvestConfig, 'Err' : IDL.Text })],
        [],
      ),
    'schedule_auto_reinvest' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Variant({ 'Ok' : AutoReinvestConfig, 'Err' : IDL.Text })],
        [],
      ),
    'set_mode_ckbtc_mainnet' : IDL.Func([], [], []),
    'set_mode_mock' : IDL.Func([], [], []),
    'sync_vault_balance_from_ckbtc' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : CkbtcSyncResult, 'Err' : IDL.Text })],
        [],
      ),
    'unlock_vault' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : Vault, 'Err' : IDL.Text })],
        [],
      ),
    'withdraw_vault' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Variant({ 'Ok' : Vault, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
