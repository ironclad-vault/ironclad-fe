/**
 * Ironclad Vault Backend Actor
 * Local dev: always anonymous (no II signature to local replica)
 * Remote (non-local): can use signed Identity (for real testnet/mainnet later)
 */

import {
  Actor,
  HttpAgent,
  type ActorSubclass,
  type Identity,
} from "@dfinity/agent";
import { idlFactory } from "@/declarations/ironclad_vault_backend";
import type { _SERVICE } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";
import { IC_CONFIG } from "./config";

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
} from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";

export type IroncladActor = ActorSubclass<_SERVICE>;

const IC_HOST = IC_CONFIG.host;
const IRONCLAD_CANISTER_ID = IC_CONFIG.ironcladCanisterId;

// singleton anonymous agent (dipakai di local & fallback remote)
let agentPromise: Promise<HttpAgent> | null = null;

function isLocalHost(host: string): boolean {
  return (
    host.includes("127.0.0.1") ||
    host.includes("localhost")
  );
}

/**
 * Anonymous agent (no identity), dengan root key untuk local replica.
 */
async function getAnonymousAgent(): Promise<HttpAgent> {
  if (!agentPromise) {
    agentPromise = (async () => {
      const agent = new HttpAgent({ host: IC_HOST });

      if (isLocalHost(IC_HOST) && process.env.NODE_ENV !== "production") {
        await agent.fetchRootKey();
        console.info("[Ironclad Actor] 🔑 Root key fetched for local replica");
      }

      console.info(
        "[Ironclad Actor] Using anonymous agent for host:",
        IC_HOST,
      );

      return agent;
    })();
  }

  return agentPromise;
}

/**
 * Main factory: local → selalu anonymous.
 * Remote → signed kalau identity ada, anonymous kalau nggak.
 */
export async function createIroncladActor(
  identity?: Identity,
): Promise<IroncladActor> {
  const isLocal = isLocalHost(IC_HOST);

  let agent: HttpAgent;

  if (isLocal) {
    // LOCAL DEV: JANGAN pakai identity sama sekali
    agent = await getAnonymousAgent();
  } else if (identity) {
    // REMOTE + signed
    agent = new HttpAgent({ host: IC_HOST, identity });
    console.info(
      "[Ironclad Actor] Using SIGNED agent for remote host:",
      IC_HOST,
    );
  } else {
    // REMOTE tanpa identity → anonymous
    agent = await getAnonymousAgent();
    console.info(
      "[Ironclad Actor] Using anonymous agent for remote host:",
      IC_HOST,
    );
  }

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: IRONCLAD_CANISTER_ID,
  });
}

// Legacy compatibility
export { createIroncladActor as getIroncladActor };
