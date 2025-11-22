import { HttpAgent, type Identity } from "@dfinity/agent";
import { IC_CONFIG } from "./config";

/**
 * Singleton agent instance
 * We keep one instance to share the root key fetch state across the app
 */
let agentInstance: HttpAgent | null = null;
let isRootKeyFetched = false;
let currentIdentityPrincipal: string | null = null;

/**
 * Get the singleton HttpAgent
 * If an identity is provided, it updates the agent's identity.
 * It ensures fetchRootKey is called exactly once for local development.
 */
export async function getAgent(identity?: Identity): Promise<HttpAgent> {
  const host = IC_CONFIG.host;
  const isLocal = IC_CONFIG.isLocal;

  // If no agent exists, create one
  if (!agentInstance) {
    agentInstance = new HttpAgent({
      host,
      identity,
    });
    console.log("[Agent] 🆕 Created new HttpAgent instance");
  } else if (identity) {
    // If agent exists and we have a new identity, replace it
    const newPrincipal = identity.getPrincipal().toString();
    if (currentIdentityPrincipal !== newPrincipal) {
      agentInstance.replaceIdentity(identity);
      currentIdentityPrincipal = newPrincipal;
      console.log("[Agent] 🆔 Updated agent identity to:", newPrincipal);
    }
  }

  // Fetch root key for local development if not yet fetched
  // We check 'isRootKeyFetched' to prevent race conditions and multiple fetches
  if (isLocal && !isRootKeyFetched) {
    // We use a lock/flag mechanism. If multiple calls happen, they might still race 
    // on the *check*, but HttpAgent.fetchRootKey is idempotent-ish (it fetches).
    // However, to be safe and efficient, we can await it.
    try {
      await agentInstance.fetchRootKey();
      isRootKeyFetched = true;
      console.info("[Agent] 🔑 Root key fetched and cached for local replica");
    } catch (error) {
      console.error("[Agent] ❌ Failed to fetch root key:", error);
      // We don't set isRootKeyFetched to true so it retries next time
      throw error;
    }
  }

  return agentInstance;
}

/**
 * Reset the agent (e.g. on logout)
 */
export function resetAgent() {
  agentInstance = null;
  isRootKeyFetched = false;
  currentIdentityPrincipal = null;
  console.log("[Agent] ♻️ Agent reset");
}
