"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import type { Vault } from "@/lib/ic/ironcladActor";

/**
 * Hook for managing vaults
 * Phase 1: Uses anonymous canister calls (no wallet identity)
 */
export function useVaults() {
  const { identity } = useWallet();
  const [vaults, setVaults] = useState<readonly Vault[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ironcladClient.vaults.getMyVaults(identity ?? undefined);
      setVaults(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaults] Failed:", msg);
    } finally {
      setLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  return {
    vaults,
    loading,
    error,
    refetch: fetchVaults,
  };
}
