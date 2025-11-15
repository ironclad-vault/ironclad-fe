"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import type { AutoReinvestConfig, Vault } from "@/lib/ic/ironcladActor";

/**
 * Hook for managing auto-reinvest configurations
 * Phase 1: Uses anonymous canister calls (no wallet identity)
 */
export function useAutoReinvest() {
  const { identity } = useWallet();
  const [configs, setConfigs] = useState<readonly AutoReinvestConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ironcladClient.autoReinvest.getMyConfigs(identity ?? undefined);
      setConfigs(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Failed:", msg);
    } finally {
      setLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const schedule = async (
    vaultId: bigint,
    newLockDuration: bigint
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await ironcladClient.autoReinvest.schedule(vaultId, newLockDuration, identity ?? undefined);
      if ("Err" in result) {
        setError(result.Err);
        return false;
      }
      await fetchConfigs();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Schedule failed:", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (vaultId: bigint): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await ironcladClient.autoReinvest.cancel(vaultId, identity ?? undefined);
      if ("Err" in result) {
        setError(result.Err);
        return false;
      }
      await fetchConfigs();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Cancel failed:", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const execute = async (vaultId: bigint): Promise<Vault | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await ironcladClient.autoReinvest.execute(vaultId, identity ?? undefined);
      if ("Err" in result) {
        setError(result.Err);
        return null;
      }
      await fetchConfigs();
      return result.Ok;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Execute failed:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    configs,
    loading,
    error,
    refetch: fetchConfigs,
    schedule,
    cancel,
    execute,
  };
}
