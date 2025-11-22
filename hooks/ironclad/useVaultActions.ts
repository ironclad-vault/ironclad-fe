"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { createVault as createVaultService, type VaultDTO } from "@/lib/ironclad-service";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import { transferCkbtc } from "@/lib/ic/ckbtcLedger";
import { IC_CONFIG } from "@/lib/ic/config";
import { Principal } from "@dfinity/principal";
import type { Vault, CkbtcSyncResult } from "@/lib/ic/ironcladActor";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/toastUtils";

/**
 * Hook for vault actions (create, deposit, unlock, withdraw)
 * UPDATED: Uses real ICRC-1 transfers instead of mock deposits
 */
export function useVaultActions() {
  const { identity } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateVault = async (
    lockUntil: number,
    expectedDeposit: bigint,
    beneficiary?: string,
    willMessage?: string
  ): Promise<VaultDTO | null> => {
    setLoading(true);
    setError(null);

    try {
      // Use the service layer which handles encryption
      const vaultDTO = await toast.promise(
        createVaultService({
          lockUntil,
          expectedDeposit,
          beneficiary,
          willMessage,
          identity: identity ?? undefined, // Pass identity from wallet
        }),
        {
          loading: "Creating vault...",
          success: "Bond position minted successfully!",
          error: (err) => `Failed to create vault: ${getErrorMessage(err)}`,
        }
      );
      
      // Return the VaultDTO directly - it already has ckbtcSubaccountHex
      return vaultDTO;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaultActions] Create failed:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * REAL DEPOSIT: Execute actual ICRC-1 transfer to vault backend canister
   * CRITICAL: Must transfer to backend canister + vault subaccount, not main account!
   * This replaces the old mockDeposit function
   */
  const handleRealDeposit = async (
    vaultId: bigint,
    amount: bigint,
    vaultSubaccount?: Uint8Array // CRITICAL: Vault subaccount (from ckbtc_subaccount field)
  ): Promise<{ success: boolean; txIndex?: bigint; error?: string; syncResult?: CkbtcSyncResult }> => {
    setLoading(true);
    setError(null);

    if (!identity) {
      const msg = "Identity required for deposit";
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    try {
      // Step 1: Execute ICRC-1 transfer to the backend canister + vault subaccount
      const backendCanisterId = IC_CONFIG.ironcladCanisterId;
      const backendPrincipal = Principal.fromText(backendCanisterId);

      console.info(
        `[useVaultActions] Transferring ${amount} e8s to vault ${vaultId.toString()} (subaccount: ${vaultSubaccount ? 'set' : 'not set'})`
      );

      // CRITICAL FIX: Transfer to backend + vault subaccount
      // Backend checks balance at canister_self() + vault.ckbtc_subaccount
      const txIndex = await toast.promise(
        transferCkbtc(
          {
            owner: backendPrincipal,
            subaccount: vaultSubaccount, // CRITICAL: Vault subaccount for self-custody
          },
          amount,
          identity
        ),
        {
          loading: "Transferring ckBTC to vault...",
          success: "Transfer successful! Confirming deposit...",
          error: (err) => `Transfer failed: ${getErrorMessage(err)}`,
        }
      );

      console.info(`[useVaultActions] Transfer successful. TX Index: ${txIndex}`);

      // Step 2: Call backend to sync vault balance from ledger
      console.info(`[useVaultActions] Syncing vault balance from ledger...`);
      
      const syncResult = await toast.promise(
        ironcladClient.ckbtc.syncVault(vaultId, identity),
        {
          loading: "Confirming deposit on blockchain...",
          success: "Deposit confirmed! Vault updated.",
          error: (err) => `Sync failed: ${getErrorMessage(err)}`,
        }
      );

      if ("Err" in syncResult) {
        throw new Error(syncResult.Err);
      }

      console.info(
        `[useVaultActions] Vault synced successfully:`,
        syncResult.Ok
      );

      return { success: true, txIndex, syncResult: syncResult.Ok };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useVaultActions] Real deposit failed:", msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * LEGACY: Keep mock deposit for backward compatibility
   * @deprecated Use handleRealDeposit for real blockchain transactions
   */
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
    realDeposit: handleRealDeposit, // NEW: Real ICRC-1 deposits
    mockDeposit: handleMockDeposit, // LEGACY: Keep for backward compatibility
    unlockVault: handleUnlockVault,
    withdrawVault: handleWithdrawVault,
    pingAlive: handlePingAlive,
    claimInheritance: handleClaimInheritance,
    loading,
    error,
  };
}
