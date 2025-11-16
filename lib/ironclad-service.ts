import {
  getIroncladActor,
  IroncladActor,
  Vault,
  VaultEvent,
  VaultStatus,
  AutoReinvestConfig,
  AutoReinvestPlanStatus,
  PlanStatusResponse,
  MarketListing,
  ListingStatus,
} from "./ic/ironcladActor";

// Define Result type locally (Candid pattern)
type Result<T> = { Ok: T } | { Err: string };

// Re-export Candid types for use in components
export type { Vault, VaultEvent };

// TypeScript DTO types (camelCase for frontend)
export type VaultStatusTS =
  | "PendingDeposit"
  | "ActiveLocked"
  | "Unlockable"
  | "Withdrawn";

export type ListingStatusTS = "Active" | "Cancelled" | "Filled";

export interface VaultDTO {
  id: bigint;
  owner: string;
  status: VaultStatusTS;
  balance: bigint;
  expectedDeposit: bigint;
  createdAt: number;
  updatedAt: number;
  lockUntil: number;
  btcAddress: string;
  btcDepositTxid: string | null;
  btcWithdrawTxid: string | null;
}

export interface VaultEventDTO {
  vaultId: bigint;
  action: string;
  timestamp: number;
  notes: string;
}

export interface AutoReinvestConfigDTO {
  vaultId: bigint;
  owner: string;
  newLockDuration: bigint;
  enabled: boolean;
  planStatus: "Active" | "Cancelled" | "Error" | "Paused";
  errorMessage: string | null;
  nextCycleTimestamp: number;
  executionCount: bigint;
  createdAt: number;
  updatedAt: number;
}

export interface PlanStatusResponseDTO {
  planStatus: "Active" | "Cancelled" | "Error" | "Paused";
  errorMessage: string | null;
  nextCycleTimestamp: number;
  executionCount: bigint;
}

export interface MarketListingDTO {
  id: bigint;
  vaultId: bigint;
  seller: string;
  buyer: string | null;
  priceSats: bigint;
  status: ListingStatusTS;
  createdAt: number;
  updatedAt: number;
}

// Mapping functions (snake_case Candid → camelCase TypeScript)
function mapVaultStatus(status: VaultStatus): VaultStatusTS {
  if ("PendingDeposit" in status) return "PendingDeposit";
  if ("ActiveLocked" in status) return "ActiveLocked";
  if ("Unlockable" in status) return "Unlockable";
  if ("Withdrawn" in status) return "Withdrawn";
  return "PendingDeposit"; // fallback
}

function mapListingStatus(status: ListingStatus): ListingStatusTS {
  if ("Active" in status) return "Active";
  if ("Cancelled" in status) return "Cancelled";
  if ("Filled" in status) return "Filled";
  return "Active"; // fallback
}

function mapAutoReinvestPlanStatus(raw: AutoReinvestPlanStatus | undefined | null): "Active" | "Cancelled" | "Error" | "Paused" {
  // Handle undefined/null (old backend data or not yet deployed)
  if (!raw) {
    console.warn("[mapAutoReinvestPlanStatus] Received undefined/null, defaulting to Active");
    return "Active";
  }
  
  // Handle Candid variant types
  if (typeof raw === 'object') {
    if ("Active" in raw) return "Active";
    if ("Cancelled" in raw) return "Cancelled";
    if ("Error" in raw) return "Error";
    if ("Paused" in raw) return "Paused";
  }
  
  return "Active"; // fallback
}

function mapVault(raw: Vault): VaultDTO {
  return {
    id: raw.id,
    owner: raw.owner.toString(),
    status: mapVaultStatus(raw.status),
    balance: raw.balance,
    expectedDeposit: raw.expected_deposit,
    createdAt: Number(raw.created_at),
    updatedAt: Number(raw.updated_at),
    lockUntil: Number(raw.lock_until),
    btcAddress: raw.btc_address,
    btcDepositTxid: raw.btc_deposit_txid.length > 0 ? raw.btc_deposit_txid[0]! : null,
    btcWithdrawTxid: raw.btc_withdraw_txid.length > 0 ? raw.btc_withdraw_txid[0]! : null,
  };
}

function mapVaultEvent(raw: VaultEvent): VaultEventDTO {
  return {
    vaultId: raw.vault_id,
    action: raw.action,
    timestamp: Number(raw.timestamp),
    notes: raw.notes,
  };
}

function mapConfig(raw: AutoReinvestConfig): AutoReinvestConfigDTO {
  // Safely access potentially missing fields (for backward compatibility)
  const rawAny = raw as any;
  
  return {
    vaultId: raw.vault_id,
    owner: raw.owner.toString(),
    newLockDuration: raw.new_lock_duration,
    enabled: raw.enabled,
    planStatus: mapAutoReinvestPlanStatus(rawAny.plan_status),
    errorMessage: rawAny.error_message && rawAny.error_message.length > 0 ? rawAny.error_message[0] : null,
    nextCycleTimestamp: rawAny.next_cycle_timestamp ? Number(rawAny.next_cycle_timestamp) : 0,
    executionCount: rawAny.execution_count ? rawAny.execution_count : BigInt(0),
    createdAt: Number(raw.created_at),
    updatedAt: Number(raw.updated_at),
  };
}

function mapPlanStatus(raw: PlanStatusResponse): PlanStatusResponseDTO {
  return {
    planStatus: mapAutoReinvestPlanStatus(raw.plan_status),
    errorMessage: raw.error_message.length > 0 ? raw.error_message[0]! : null,
    nextCycleTimestamp: Number(raw.next_cycle_timestamp),
    executionCount: raw.execution_count,
  };
}

function mapListing(raw: MarketListing): MarketListingDTO {
  return {
    id: raw.id,
    vaultId: raw.vault_id,
    seller: raw.seller.toString(),
    buyer: raw.buyer.length > 0 ? raw.buyer[0]!.toString() : null,
    priceSats: raw.price_sats,
    status: mapListingStatus(raw.status),
    createdAt: Number(raw.created_at),
    updatedAt: Number(raw.updated_at),
  };
}

// Result unwrapping helper
function unwrapResult<T>(result: Result<T>): T {
  if ("Ok" in result) {
    return result.Ok;
  } else {
    throw new Error(result.Err || "Unknown error");
  }
}

// Helper to get actor or throw error
async function getActorOrThrow(actor?: IroncladActor): Promise<IroncladActor> {
  if (actor) return actor;

  try {
    const actorInstance = await getIroncladActor();
    if (!actorInstance) {
      throw new Error("Failed to create actor - returned null or undefined");
    }
    return actorInstance;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Ironclad Service] Failed to create actor:", errorMsg);

    // Provide more helpful error messages based on error type
    if (errorMsg.includes("certificate") || errorMsg.includes("signature")) {
      const helpMsg =
        "Certificate verification failed. This typically means:\n" +
        "1. Local dfx replica is not running or not properly seeded\n" +
        "2. Internet Identity is not configured for localhost\n" +
        "3. Canister ID does not exist on the replica\n" +
        "Try: dfx start --background --clean && dfx deploy";
      console.error("[Ironclad Service]", helpMsg);
      throw new Error(`Certificate verification failed. ${helpMsg}`);
    }

    if (errorMsg.includes("canister")) {
      throw new Error(
        `Canister error: ${errorMsg}. Make sure the canister is deployed and the canister ID is correct.`
      );
    }

    throw new Error(`Failed to initialize Ironclad actor: ${errorMsg}`);
  }
}

// ============================================================================
// Vault Service Functions
// ============================================================================

/**
 * Create a new vault
 * NOTE: Returns plain Vault, NOT Result<Vault>
 */
export async function createVault({
  lockUntil,
  expectedDeposit,
  actor,
}: {
  lockUntil: number;
  expectedDeposit: bigint;
  actor?: IroncladActor;
}): Promise<VaultDTO> {
  const actorInstance = await getActorOrThrow(actor);
  const vault = await actorInstance.create_vault(BigInt(lockUntil), expectedDeposit);
  return mapVault(vault);
}

/**
 * Mock deposit to a vault (for testing)
 * NOTE: Returns Result<Vault>
 */
export async function mockDepositVault({
  vaultId,
  amount,
  actor,
}: {
  vaultId: bigint;
  amount: bigint;
  actor?: IroncladActor;
}): Promise<VaultDTO> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.mock_deposit_vault(vaultId, amount);
  return mapVault(unwrapResult(result));
}

/**
 * Get all vaults owned by the caller
 * NOTE: Returns plain Array<Vault>, NOT Result
 */
export async function getMyVaults(actor?: IroncladActor): Promise<VaultDTO[]> {
  const actorInstance = await getActorOrThrow(actor);
  const vaults = await actorInstance.get_my_vaults();
  return vaults.map(mapVault);
}

/**
 * Get a specific vault by ID
 * NOTE: Returns optional Vault ([] | [Vault]), NOT Result
 */
export async function getVault({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<VaultDTO | null> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.get_vault(vaultId);
  return result.length > 0 && result[0] !== undefined ? mapVault(result[0]) : null;
}

/**
 * Get all events for a specific vault
 * NOTE: Returns plain Array<VaultEvent>, NOT Result
 */
export async function getVaultEvents({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<VaultEventDTO[]> {
  const actorInstance = await getActorOrThrow(actor);
  const events = await actorInstance.get_vault_events(vaultId);
  return events.map(mapVaultEvent);
}

/**
 * Check if a vault is unlockable
 */
export async function isVaultUnlockable({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<boolean> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.is_vault_unlockable(vaultId);
  return unwrapResult(result);
}

/**
 * Unlock a vault
 * NOTE: Returns Result<Vault>
 */
export async function unlockVault({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<VaultDTO> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.unlock_vault(vaultId);
  return mapVault(unwrapResult(result));
}

/**
 * Preview withdrawal amount
 */
export async function previewWithdraw({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<bigint> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.preview_withdraw(vaultId);
  return unwrapResult(result);
}

/**
 * Withdraw from a vault
 * NOTE: Returns Result<Vault>
 */
export async function withdrawVault({
  vaultId,
  amount,
  actor,
}: {
  vaultId: bigint;
  amount: bigint;
  actor?: IroncladActor;
}): Promise<VaultDTO> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.withdraw_vault(vaultId, amount);
  return mapVault(unwrapResult(result));
}

/**
 * Get all withdrawable vaults
 * NOTE: Returns plain Array<Vault>, NOT Result
 */
export async function getWithdrawableVaults(actor?: IroncladActor): Promise<VaultDTO[]> {
  const actorInstance = await getActorOrThrow(actor);
  const vaults = await actorInstance.get_withdrawable_vaults();
  return vaults.map(mapVault);
}

// ============================================================================
// Auto-Reinvest Service Functions
// ============================================================================

/**
 * Schedule auto-reinvest for a vault
 * NOTE: Returns Result<null>
 */
export async function scheduleAutoReinvest({
  vaultId,
  newLockDuration,
  actor,
}: {
  vaultId: bigint;
  newLockDuration: bigint;
  actor?: IroncladActor;
}): Promise<void> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.schedule_auto_reinvest(vaultId, newLockDuration);
  unwrapResult(result);
}

/**
 * Cancel auto-reinvest for a vault
 * NOTE: Returns Result<null>
 */
export async function cancelAutoReinvest({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<void> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.cancel_auto_reinvest(vaultId);
  unwrapResult(result);
}

/**
 * Execute auto-reinvest for a vault
 * NOTE: Returns Result<Vault>
 */
export async function executeAutoReinvest({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<VaultDTO> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.execute_auto_reinvest(vaultId);
  return mapVault(unwrapResult(result));
}

/**
 * Get all auto-reinvest configs for the caller
 * NOTE: Returns plain Array<AutoReinvestConfig>, NOT Result
 */
export async function getMyAutoReinvestConfigs(
  actor?: IroncladActor
): Promise<AutoReinvestConfigDTO[]> {
  const actorInstance = await getActorOrThrow(actor);
  const configs = await actorInstance.get_my_auto_reinvest_configs();
  return configs.map(mapConfig);
}

/**
 * Get plan status for a specific vault
 * Uses get_plan_status backend method (lightweight query for polling)
 * Returns: PlanStatusResponseDTO with status, error, next_cycle, execution_count
 */
export async function getPlanStatus({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<PlanStatusResponseDTO> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.get_plan_status(vaultId);
  return mapPlanStatus(unwrapResult(result));
}

/**
 * Retry failed auto-reinvest plan
 * Resets plan from Error state back to Active
 * Returns: Updated AutoReinvestConfigDTO
 */
export async function retryFailedPlan({
  vaultId,
  actor,
}: {
  vaultId: bigint;
  actor?: IroncladActor;
}): Promise<AutoReinvestConfigDTO> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.retry_failed_plan(vaultId);
  return mapConfig(unwrapResult(result));
}

// ============================================================================
// Marketplace Service Functions
// ============================================================================

/**
 * Create a marketplace listing
 * NOTE: Returns Result<null>
 */
export async function createListing({
  vaultId,
  priceSats,
  actor,
}: {
  vaultId: bigint;
  priceSats: bigint;
  actor?: IroncladActor;
}): Promise<void> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.create_listing(vaultId, priceSats);
  unwrapResult(result);
}

/**
 * Cancel a marketplace listing
 * NOTE: Returns Result<null>
 */
export async function cancelListing({
  listingId,
  actor,
}: {
  listingId: bigint;
  actor?: IroncladActor;
}): Promise<void> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.cancel_listing(listingId);
  unwrapResult(result);
}

/**
 * Get all active marketplace listings
 * NOTE: Returns plain Array<MarketListing>, NOT Result
 */
export async function getActiveListings(actor?: IroncladActor): Promise<MarketListingDTO[]> {
  const actorInstance = await getActorOrThrow(actor);
  const listings = await actorInstance.get_active_listings();
  return listings.map(mapListing);
}

/**
 * Get all listings owned by the caller
 * NOTE: Returns plain Array<MarketListing>, NOT Result
 */
export async function getMyListings(actor?: IroncladActor): Promise<MarketListingDTO[]> {
  const actorInstance = await getActorOrThrow(actor);
  const listings = await actorInstance.get_my_listings();
  return listings.map(mapListing);
}

/**
 * Buy a marketplace listing
 * NOTE: Returns Result<null>
 */
export async function buyListing({
  listingId,
  actor,
}: {
  listingId: bigint;
  actor?: IroncladActor;
}): Promise<void> {
  const actorInstance = await getActorOrThrow(actor);
  const result = await actorInstance.buy_listing(listingId);
  unwrapResult(result);
}
