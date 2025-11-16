"use client";

import { useState, useCallback } from "react";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import { useWallet } from "@/components/wallet/useWallet";
import type { CkbtcSyncResult } from "@/lib/ic/ironcladActor";

type ResultType = { Ok: CkbtcSyncResult } | { Err: string };

export function useCkbtcSync(vaultId: bigint) {
  const { identity } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CkbtcSyncResult | null>(null);

  const sync = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: ResultType = await ironcladClient.ckbtc.syncVault(
        vaultId,
        identity ?? undefined,
      );

      if ("Err" in res) {
        setError(res.Err);
        setLastResult(null);
      } else {
        setLastResult(res.Ok);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLastResult(null);
    } finally {
      setLoading(false);
    }
  }, [vaultId, identity]);

  return {
    loading,
    error,
    lastResult,
    sync,
  };
}
