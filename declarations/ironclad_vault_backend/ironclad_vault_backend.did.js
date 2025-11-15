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
    'updated_at' : IDL.Nat64,
    'balance' : IDL.Nat64,
    'btc_deposit_txid' : IDL.Opt(IDL.Text),
    'owner' : IDL.Principal,
    'btc_withdraw_txid' : IDL.Opt(IDL.Text),
    'created_at' : IDL.Nat64,
    'lock_until' : IDL.Nat64,
    'expected_deposit' : IDL.Nat64,
    'btc_address' : IDL.Text,
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
  const AutoReinvestConfig = IDL.Record({
    'updated_at' : IDL.Nat64,
    'owner' : IDL.Principal,
    'vault_id' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'enabled' : IDL.Bool,
    'new_lock_duration' : IDL.Nat64,
  });
  const VaultEvent = IDL.Record({
    'action' : IDL.Text,
    'vault_id' : IDL.Nat64,
    'notes' : IDL.Text,
    'timestamp' : IDL.Nat64,
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
    'create_listing' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Variant({ 'Ok' : MarketListing, 'Err' : IDL.Text })],
        [],
      ),
    'create_vault' : IDL.Func([IDL.Nat64, IDL.Nat64], [Vault], []),
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
    'get_my_auto_reinvest_configs' : IDL.Func(
        [],
        [IDL.Vec(AutoReinvestConfig)],
        ['query'],
      ),
    'get_my_listings' : IDL.Func([], [IDL.Vec(MarketListing)], ['query']),
    'get_my_vaults' : IDL.Func([], [IDL.Vec(Vault)], ['query']),
    'get_unlockable_vaults' : IDL.Func([], [IDL.Vec(Vault)], ['query']),
    'get_vault' : IDL.Func([IDL.Nat64], [IDL.Opt(Vault)], ['query']),
    'get_vault_events' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(VaultEvent)],
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
    'preview_withdraw' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        ['query'],
      ),
    'schedule_auto_reinvest' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Variant({ 'Ok' : AutoReinvestConfig, 'Err' : IDL.Text })],
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
