/**
 * Test Identity Generator for Local Development
 * 
 * Generates deterministic identities from seed phrases for testing
 * without requiring Internet Identity deployment
 */

import { Ed25519KeyIdentity } from "@dfinity/identity";

/**
 * Generate a deterministic test identity from a seed
 * Each seed produces a unique, reproducible identity
 */
export function generateTestIdentity(seed: string): Ed25519KeyIdentity {
  // Create a simple hash from seed string
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  
  // Create a 32-byte seed for Ed25519
  const seedBytes = new Uint8Array(32);
  for (let i = 0; i < data.length; i++) {
    seedBytes[i % 32] ^= data[i];
  }
  
  // Generate identity from seed
  return Ed25519KeyIdentity.generate(seedBytes);
}

/**
 * Pre-defined test identities for local development
 */
export const TEST_IDENTITIES = {
  alice: generateTestIdentity("alice-test-user-1"),
  bob: generateTestIdentity("bob-test-user-2"),
  charlie: generateTestIdentity("charlie-test-user-3"),
};

/**
 * Get test identity info for display
 */
export function getTestIdentityInfo(identity: Ed25519KeyIdentity) {
  const principal = identity.getPrincipal();
  return {
    principal: principal.toString(),
    shortPrincipal: principal.toString().slice(0, 8) + "..." + principal.toString().slice(-5),
  };
}

/**
 * Get current test identity from localStorage
 */
export function getCurrentTestIdentity(): Ed25519KeyIdentity | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem("ironclad_test_identity_seed");
  if (!stored) return null;
  
  return generateTestIdentity(stored);
}

/**
 * Set current test identity in localStorage
 */
export function setCurrentTestIdentity(seed: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ironclad_test_identity_seed", seed);
}

/**
 * Clear current test identity
 */
export function clearCurrentTestIdentity(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ironclad_test_identity_seed");
}
