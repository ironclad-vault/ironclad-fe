/**
 * Vault Utilities
 * Helper functions untuk vault status, formatting, dan display
 */

import type { Vault, VaultStatus } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";

/**
 * Type untuk status vault dalam string format
 */
export type VaultStatusString = 
  | "PendingDeposit"
  | "ActiveLocked"
  | "Unlockable"
  | "Withdrawn"
  | "Unknown";

/**
 * Ekstrak status vault dari Vault object ke string format
 * IMPORTANT: Jika vault ActiveLocked tapi waktu lock_until sudah lewat,
 * akan return "Unlockable" (frontend override untuk testing/UX)
 * @param vault - Vault object dari backend
 * @returns Status vault dalam string format
 */
export function getVaultStatus(vault: Vault): VaultStatusString {
  // Check backend status first
  if ("Withdrawn" in vault.status) return "Withdrawn";
  if ("PendingDeposit" in vault.status) return "PendingDeposit";
  if ("Unlockable" in vault.status) return "Unlockable";
  
  // If ActiveLocked, check if time has expired
  if ("ActiveLocked" in vault.status) {
    const lockTimestamp = Number(vault.lock_until);
    const lockDate = new Date(lockTimestamp * 1000);
    const now = new Date();
    
    // If lock time has passed, treat as Unlockable (frontend override)
    if (now >= lockDate) {
      return "Unlockable";
    }
    
    return "ActiveLocked";
  }
  
  return "Unknown";
}

/**
 * Konversi status vault enum ke label profesional yang user-friendly
 * @param status - Status vault (bisa Vault object atau VaultStatus enum)
 * @returns Label profesional dalam bahasa Inggris
 */
export function getVaultStatusLabel(status: Vault | VaultStatus | VaultStatusString): string {
  // Handle jika input adalah Vault object
  if (typeof status === "object" && status !== null && "status" in status) {
    const vaultStatus = getVaultStatus(status as Vault);
    return mapStatusToLabel(vaultStatus);
  }
  
  // Handle jika input adalah VaultStatus enum
  if (typeof status === "object" && status !== null) {
    if ("ActiveLocked" in status) return "Locked";
    if ("Unlockable" in status) return "Ready to Unlock";
    if ("Withdrawn" in status) return "Withdrawn";
    if ("PendingDeposit" in status) return "Pending Deposit";
  }
  
  // Handle jika input adalah string
  if (typeof status === "string") {
    return mapStatusToLabel(status as VaultStatusString);
  }
  
  return "Unknown Status";
}

/**
 * Helper function untuk mapping status string ke label
 */
function mapStatusToLabel(status: VaultStatusString): string {
  switch (status) {
    case "ActiveLocked":
      return "Locked";
    case "Unlockable":
      return "Ready to Unlock";
    case "Withdrawn":
      return "Withdrawn";
    case "PendingDeposit":
      return "Pending Deposit";
    case "Unknown":
      return "Unknown Status";
    default:
      return "Unknown Status";
  }
}

/**
 * Get status color untuk styling (Tailwind classes)
 * @param status - Status vault (bisa Vault object atau string)
 * @returns Tailwind CSS classes untuk background, text, dan border
 */
export function getVaultStatusColor(status: Vault | VaultStatusString): string {
  const statusStr = typeof status === "string" ? status : getVaultStatus(status);
  
  switch (statusStr) {
    case "ActiveLocked":
      return "bg-blue-100 text-accent border-blue-300";
    case "Unlockable":
      return "bg-green-100 text-green-900 border-green-300";
    case "Withdrawn":
      return "bg-gray-100 text-gray-900 border-gray-300";
    case "PendingDeposit":
      return "bg-yellow-100 text-yellow-900 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-900 border-gray-300";
  }
}

/**
 * Format timestamp (Unix seconds) ke tanggal yang readable
 * @param timestamp - Unix timestamp dalam seconds
 * @returns Formatted date string
 */
export function formatVaultDate(timestamp: number | bigint): string {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format satoshi amount ke string dengan separator
 * @param sats - Amount dalam satoshi
 * @returns Formatted string dengan "sats" suffix
 */
export function formatSats(sats: bigint | number): string {
  const amount = typeof sats === "bigint" ? sats : BigInt(sats);
  return amount.toLocaleString() + " sats";
}

/**
 * Format satoshi amount ke BTC
 * @param sats - Amount dalam satoshi
 * @returns Formatted BTC string
 */
export function formatBTC(sats: bigint | number): string {
  const amount = typeof sats === "bigint" ? Number(sats) : sats;
  const btc = amount / 100_000_000;
  return btc.toFixed(8).replace(/\.?0+$/, "") + " BTC";
}

/**
 * Format BTC amount dengan "diminished decimals" untuk fintech UI
 * Memisahkan significant digits dari trailing decimals untuk styling terpisah
 * @param sats - Amount dalam satoshi
 * @returns Object dengan major (significant digits) dan minor (trailing decimals)
 * Example: 1.50000000 -> { major: "1.50", minor: "000000" }
 */
export function formatBTCWithDiminishedDecimals(sats: bigint | number): {
  major: string;
  minor: string;
  full: string;
} {
  const amount = typeof sats === "bigint" ? Number(sats) : sats;
  const btc = amount / 100_000_000;
  const fullStr = btc.toFixed(8);

  // Find where significant digits end
  const trimmed = fullStr.replace(/0+$/, "");

  if (trimmed.includes(".")) {
    const parts = trimmed.split(".");
    const major = trimmed;
    const minor = fullStr.slice(major.length);
    return {
      major,
      minor,
      full: fullStr,
    };
  }

  return {
    major: trimmed,
    minor: fullStr.slice(trimmed.length),
    full: fullStr,
  };
}

/**
 * Check apakah vault bisa di-unlock
 * Akan return true jika:
 * 1. Backend status = Unlockable, ATAU
 * 2. Backend status = ActiveLocked tapi lock_until sudah lewat
 * @param vault - Vault object
 * @returns true jika vault bisa di-unlock
 */
export function isVaultUnlockable(vault: Vault): boolean {
  const status = getVaultStatus(vault);
  return status === "Unlockable";
}

/**
 * Check apakah vault masih terkunci
 * @param vault - Vault object
 * @returns true jika vault masih locked
 */
export function isVaultLocked(vault: Vault): boolean {
  const status = getVaultStatus(vault);
  return status === "ActiveLocked";
}

/**
 * Check apakah vault pending deposit
 * @param vault - Vault object
 * @returns true jika vault pending deposit
 */
export function isVaultPendingDeposit(vault: Vault): boolean {
  const status = getVaultStatus(vault);
  return status === "PendingDeposit";
}

/**
 * Get time remaining until unlock dalam format readable
 * @param lockUntil - Unix timestamp lock until
 * @returns Object dengan days, hours, minutes, dan formatted string
 */
export function getTimeRemaining(lockUntil: number | bigint): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  const lockTimestamp = typeof lockUntil === "bigint" ? Number(lockUntil) : lockUntil;
  const lockDate = new Date(lockTimestamp * 1000);
  const now = new Date();
  const diff = lockDate.getTime() - now.getTime();
  
  const isExpired = diff <= 0;
  
  if (isExpired) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: "Ready to unlock!",
    };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted: `${days}d ${hours}h ${minutes}m remaining`,
  };
}
