/**
 * Internet Computer Configuration
 * Centralized configuration for IC network and canister IDs
 */

export const IC_CONFIG = {
  /**
   * IC network host URL
   * Local development: http://127.0.0.1:4943
   * Mainnet: https://ic0.app
   */
  host: process.env.NEXT_PUBLIC_IC_HOST ?? 'http://127.0.0.1:4943',

  /**
   * Ironclad Vault Backend Canister ID
   */
  ironcladCanisterId:
    process.env.NEXT_PUBLIC_IRONCLAD_VAULT_BACKEND_CANISTER_ID ??
    'u6s2n-gx777-77774-qaaba-cai',
} as const;
