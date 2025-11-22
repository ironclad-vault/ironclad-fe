/**
 * Internet Computer Configuration
 * Centralized configuration for IC network and canister IDs
 */

const isLocalHost = (host: string): boolean => {
  return host.includes("127.0.0.1") || host.includes("localhost");
};

const DEFAULT_HOST = "http://127.0.0.1:4943";
// Default ID kalau env gak kebaca (fallback)
const DEFAULT_II_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai";
const DEFAULT_IRONCLAD_CANISTER_ID = "u6s2n-gx777-77774-qaaba-cai";

const host = process.env.NEXT_PUBLIC_IC_HOST ?? DEFAULT_HOST;
const isLocal = isLocalHost(host);

const useLocalTestMode = process.env.NEXT_PUBLIC_LOCAL_TEST_MODE === "true";

// Ambil ID dari Env atau Fallback
const iiCanisterId = process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID ?? DEFAULT_II_CANISTER_ID;
const ironcladCanisterId = process.env.NEXT_PUBLIC_IRONCLAD_CANISTER_ID ?? DEFAULT_IRONCLAD_CANISTER_ID;

// Logic URL yang BENAR:
// 1. Cek dulu apakah ada override URL eksplisit di .env (NEXT_PUBLIC_INTERNET_IDENTITY_URL)
// 2. Kalau gak ada & Local: Pakai format subdomain (http://<id>.localhost:4943)
// 3. Kalau Mainnet: Pakai identity.ic0.app
const getInternetIdentityUrl = () => {
  if (process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL) {
    return process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL;
  }

  if (isLocal && !useLocalTestMode) {
    // FIX: Gunakan subdomain .localhost, BUKAN query param
    return `http://${iiCanisterId}.localhost:4943`;
  }

  return "https://identity.ic0.app/#authorize";
};

export const IC_CONFIG = {
  host,
  isLocal,
  useLocalTestMode,
  
  ironcladCanisterId,
  
  // Panggil function di atas
  internetIdentityUrl: getInternetIdentityUrl(),
};