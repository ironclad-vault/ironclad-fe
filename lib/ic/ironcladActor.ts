/**
 * Ironclad Vault Backend Actor
 * Creates anonymous actor instances for interacting with the Ironclad vault canister
 * 
 * Phase 1: All calls are anonymous (no wallet identity)
 * Internet Identity integration will be added in Phase 2
 */

import { Actor, HttpAgent, type ActorSubclass } from '@dfinity/agent';
import { idlFactory } from '@/declarations/ironclad_vault_backend';
import type { _SERVICE } from '@/declarations/ironclad_vault_backend/ironclad_vault_backend.did';
import { IC_CONFIG } from './config';

// Re-export types from generated declarations
export type { _SERVICE as IroncladService } from '@/declarations/ironclad_vault_backend/ironclad_vault_backend.did';
export type {
  Vault,
  VaultStatus,
  VaultEvent,
  AutoReinvestConfig,
  MarketListing,
  ListingStatus,
} from '@/declarations/ironclad_vault_backend/ironclad_vault_backend.did';

export type IroncladActor = ActorSubclass<_SERVICE>;

const IC_HOST = IC_CONFIG.host;
const IRONCLAD_CANISTER_ID = IC_CONFIG.ironcladCanisterId;

// Singleton agent promise to ensure we only create one agent
let agentPromise: Promise<HttpAgent> | null = null;

/**
 * Get or create the singleton HttpAgent
 * Root key is fetched for local development to enable certificate verification
 */
async function getAgent(): Promise<HttpAgent> {
  if (!agentPromise) {
    agentPromise = (async () => {
      const agent = new HttpAgent({ host: IC_HOST });

      const isLocalHost =
        IC_HOST.includes('127.0.0.1') || IC_HOST.includes('localhost');

      if (isLocalHost && process.env.NODE_ENV !== 'production') {
        // IMPORTANT: for local replica only, so certificate verification works
        await agent.fetchRootKey();
        console.info('[Ironclad Actor] Root key fetched for local replica');
      }

      return agent;
    })();
  }

  return agentPromise;
}

/**
 * Create an anonymous actor instance for the Ironclad Vault Backend canister
 * 
 * Phase 1: All calls are anonymous - no wallet identity is used
 * This ensures reliable canister communication in local dev without certificate issues
 * 
 * @returns Typed actor instance for making canister calls
 */
export async function createIroncladActor(): Promise<IroncladActor> {
  const agent = await getAgent();

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: IRONCLAD_CANISTER_ID,
  });
}

// Legacy compatibility
export { createIroncladActor as getIroncladActor };
