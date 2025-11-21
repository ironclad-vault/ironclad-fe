"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import type { Vault } from "@/lib/ic/ironcladActor";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/toastUtils";

/**
 * Hook for vault actions (create, deposit, unlock, withdraw)
 * Phase 1: Uses anonymous canister calls (no wallet identity)
 */
export function useVaultActions() {
  const { identity } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateVault = async (
    lockUntil: number,
    expectedDeposit: bigint,
    beneficiary?: string
  ): Promise<Vault | null> => {
    setLoading(true);
    setError(null);

    try {
      const vault = await toast.promise(
        ironcladClient.vaults.create(
          BigInt(lockUntil),
          expectedDeposit,
          identity ?? undefined,
          beneficiary
        ),
        {
          loading: "Creating vault...",
          success: "Vault created successfully!",
          error: (err) => `Failed to create vault: ${getErrorMessage(err)}`,
        }
      );
      return vault;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaultActions] Create failed:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleMockDeposit = async (
    vaultId: bigint,
    amount: bigint
  ): Promise<Vault | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await toast.promise(
        ironcladClient.vaults.mockDeposit(
          vaultId,
          amount,
          identity ?? undefined
        ),
        {
          loading: "Processing deposit...",
          success: (res) => {
            if ("Err" in res) {
              throw new Error(res.Err);
            }
            return "Deposit successful!";
          },
          error: (err) => `Deposit failed: ${getErrorMessage(err)}`,
        }
      );

      if ("Err" in result) {
        setError(result.Err);
        return null;
      }
      return result.Ok;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaultActions] Mock deposit failed:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockVault = async (vaultId: bigint): Promise<Vault | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await toast.promise(
        ironcladClient.vaults.unlock(vaultId, identity ?? undefined),
        {
          loading: "Unlocking vault...",
          success: (res) => {
            if ("Err" in res) {
              throw new Error(res.Err);
            }
            return "Vault unlocked successfully!";
          },
          error: (err) => `Unlock failed: ${getErrorMessage(err)}`,
        }
      );

      if ("Err" in result) {
        setError(result.Err);
        return null;
      }
      return result.Ok;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaultActions] Unlock failed:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawVault = async (
    vaultId: bigint,
    amount: bigint
  ): Promise<Vault | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await ironcladClient.vaults.withdraw(
        vaultId,
        amount,
        identity ?? undefined
      );

      if ("Err" in result) {
        const errMsg = result.Err;
        setError(errMsg);
        throw new Error(errMsg);
      }
      return result.Ok;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaultActions] Withdraw failed:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePingAlive = async (
    vaultId: bigint
  ): Promise<{ Ok: Vault } | { Err: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await toast.promise(
        ironcladClient.vaults.pingAlive(vaultId, identity ?? undefined),
        {
          loading: "Sending proof of life...",
          success: "Proof of life confirmed!",
          error: (err) => `Ping failed: ${getErrorMessage(err)}`,
        }
      );
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaultActions] Ping failed:", msg);
      return { Err: msg };
    } finally {
      setLoading(false);
    }
  };

  const handleClaimInheritance = async (
    vaultId: bigint
  ): Promise<Vault | null> => {
    setLoading(true);
    setError(null);

    try {
      const vault = await toast.promise(
        ironcladClient.vaults.claimInheritance(vaultId, identity ?? undefined),
        {
          loading: "Claiming inheritance...",
          success: "Inheritance claimed successfully!",
          error: (err) => `Claim failed: ${getErrorMessage(err)}`,
        }
      );
      return vault;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaultActions] Claim inheritance failed:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createVault: handleCreateVault,
    mockDeposit: handleMockDeposit,
    unlockVault: handleUnlockVault,
    withdrawVault: handleWithdrawVault,
    pingAlive: handlePingAlive,
    claimInheritance: handleClaimInheritance,
    loading,
    error,
  };
}
