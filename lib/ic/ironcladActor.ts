/**
 * Ironclad Vault Backend Actor
 * Local dev: always anonymous (no II signature to local replica)
 * Remote (non-local): can use signed Identity (for real testnet/mainnet later)
 */

import { Actor, type Identity } from "@dfinity/agent";
import { idlFactory } from "@/declarations/ironclad_vault_backend";
import type { _SERVICE } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";
import { IC_CONFIG } from "./config";
import { getAgent } from "./agent";

export type { _SERVICE as IroncladService } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";
export type {
  Vault,
  VaultStatus,
  VaultEvent,
  AutoReinvestConfig,
  AutoReinvestPlanStatus,
  PlanStatusResponse,
  MarketListing,
  ListingStatus,
  NetworkMode,
  CkbtcSyncResult,
  BitcoinTxProof,
  SignatureResponse,
} from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";

export type IroncladActor = ActorSubclass<_SERVICE>;
import { type ActorSubclass } from "@dfinity/agent";

const IRONCLAD_CANISTER_ID = IC_CONFIG.ironcladCanisterId;

/**
 * Main factory: Creates or reuses an agent for the Ironclad Actor.
 * Uses a singleton agent to share root key status across the app.
 */
export async function createIroncladActor(
  identity?: Identity,
): Promise<IroncladActor> {
  // Get the singleton agent (handles root key fetching automatically)
  const agent = await getAgent(identity);

  if (identity) {
    console.info(
      "[Ironclad Actor] Using SIGNED agent with identity:",
      identity.getPrincipal().toString()
    );
  } else {
    console.debug("[Ironclad Actor] Using agent (potentially anonymous or cached identity)");
  }

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: IRONCLAD_CANISTER_ID,
  });
}

// Legacy compatibility
export { createIroncladActor as getIroncladActor };
