"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { getCkbtcBalance } from "@/lib/ic/ckbtcLedger";
import { Principal } from "@dfinity/principal";

/**
 * Hook to fetch user's real ckBTC balance from the local ledger
 */
export function useUserBalance() {
  const { principal, identity, isConnected } = useWallet();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!principal || !isConnected) {
      setBalance(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userPrincipal = typeof principal === "string" 
        ? Principal.fromText(principal) 
        : principal;

      // Don't pass undefined for subaccount, let getCkbtcBalance handle it
      const bal = await getCkbtcBalance(
        userPrincipal,
        undefined, // Will be converted to [] in getCkbtcBalance
        identity ?? undefined
      );
      
      setBalance(bal);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      console.error("[useUserBalance] Failed to fetch balance:", msg);
    } finally {
      setLoading(false);
    }
  }, [principal, identity, isConnected]);

  // Auto-fetch on mount and when principal changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
