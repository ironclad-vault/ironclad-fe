/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_IC_HOST: string;
    readonly NEXT_PUBLIC_IRONCLAD_VAULT_BACKEND_CANISTER_ID: string;
    // Internet Identity canister ID is not required in this app - we use mainnet identity provider
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}
