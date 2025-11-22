/**
 * Internet Computer Configuration
 * Centralized configuration for IC network and canister IDs
 */

const isLocalHost = (host: string): boolean => {
  return host.includes("127.0.0.1") || host.includes("localhost");
};

const DEFAULT_HOST = "http://127.0.0.1:4943";
const DEFAULT_CANISTER_ID = "uxrrr-q7777-77774-qaaaq-cai";

const host = process.env.NEXT_PUBLIC_IC_HOST ?? DEFAULT_HOST;
const isLocal = isLocalHost(host);

// For local development, we can use either:
// 1. LOCAL_TEST_MODE: Generate deterministic test identities (no II needed)
// 2. INTERNET_IDENTITY: Use real II (requires proper II deployment)
const useLocalTestMode = process.env.NEXT_PUBLIC_LOCAL_TEST_MODE === "true";

export const IC_CONFIG = {
  host,
  isLocal,
  useLocalTestMode,
  
  ironcladCanisterId:
    process.env.NEXT_PUBLIC_IRONCLAD_CANISTER_ID ?? DEFAULT_CANISTER_ID,
  
  // Internet Identity configuration
  // Local test mode: Skip II entirely, use test identities
  // Local with II: use local II canister (requires proper deployment)
  // Remote: use mainnet II
  internetIdentityUrl: isLocal && !useLocalTestMode
    ? `http://127.0.0.1:4943?canisterId=${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID ?? "rdmx6-jaaaa-aaaaa-aaadq-cai"}`
    : "https://identity.ic0.app/#authorize",
};
