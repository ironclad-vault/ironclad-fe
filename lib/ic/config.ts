/**
 * Internet Computer Configuration
 * Centralized configuration for IC network and canister IDs
 */

export const IC_CONFIG = {
  host: process.env.NEXT_PUBLIC_IC_HOST ?? "http://127.0.0.1:4943",

  ironcladCanisterId:
    process.env.NEXT_PUBLIC_IRONCLAD_VAULT_BACKEND_CANISTER_ID ?? "hitam",
};
