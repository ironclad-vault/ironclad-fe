"use client";

import { useState, useCallback, useEffect } from "react";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import { useWallet } from "@/components/wallet/useWallet";
import type { NetworkMode } from "@/lib/ic/ironcladActor";

export function useNetworkMode() {
  const { identity } = useWallet();
  const [mode, setMode] = useState<NetworkMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const current = await ironcladClient.network.getMode(identity ?? undefined);
      setMode(current);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [identity]);

  const switchToMock = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await ironcladClient.network.setMock(identity ?? undefined);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [identity, refresh]);

  const switchToCkbtc = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await ironcladClient.network.setCkbtcMainnet(identity ?? undefined);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [identity, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    mode,
    loading,
    error,
    refresh,
    switchToMock,
    switchToCkbtc,
  };
}
