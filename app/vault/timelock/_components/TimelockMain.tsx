"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import { useVaults } from "@/hooks/ironclad/useVaults";
import { Clock, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import type { Vault } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";

function getVaultStatus(vault: Vault): string {
  if ("ActiveLocked" in vault.status) return "ActiveLocked";
  if ("Unlockable" in vault.status) return "Unlockable";
  if ("Withdrawn" in vault.status) return "Withdrawn";
  if ("PendingDeposit" in vault.status) return "PendingDeposit";
  return "Unknown";
}

function UnlockableVaultCard({
  vault,
  onUnlock,
  isUnlocking,
}: {
  vault: Vault;
  onUnlock: (vaultId: bigint) => Promise<void>;
  isUnlocking: boolean;
}) {
  const lockUntilDate = new Date(Number(vault.lock_until) * 1000);
  const now = new Date();
  const isExpired = now >= lockUntilDate;

  const formatDate = (date: Date) => {
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const timeRemaining = () => {
    if (!isExpired) {
      const diff = lockUntilDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${days}d ${hours}h ${minutes}m remaining`;
    }
    return "Ready to unlock!";
  };

  return (
    <div className="card-brutal p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="heading-brutal text-xl mb-1">VAULT #{vault.id.toString()}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Lock Until: {formatDate(lockUntilDate)}
          </p>
        </div>
        {isExpired ? (
          <span className="px-3 py-1 text-xs font-bold border-2 border-green-300 bg-green-100 text-green-900 rounded">
            READY
          </span>
        ) : (
          <span className="px-3 py-1 text-xs font-bold border-2 border-blue-300 bg-blue-100 text-blue-900 rounded">
            COUNTING DOWN
          </span>
        )}
      </div>

      <div className="space-y-3 body-brutal text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Balance:</span>
          <span className="font-bold">{vault.balance.toLocaleString()} sats</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Expected Deposit:</span>
          <span className="font-bold">
            {vault.expected_deposit.toLocaleString()} sats
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="font-bold">{getVaultStatus(vault)}</span>
        </div>

        <div
          className={`p-3 rounded border-2 text-sm font-bold text-center ${
            isExpired
              ? "bg-green-50 border-green-300 text-green-900"
              : "bg-blue-50 border-blue-300 text-blue-900"
          }`}
        >
          {timeRemaining()}
        </div>
      </div>

      <button
        onClick={() => onUnlock(vault.id)}
        disabled={!isExpired || isUnlocking}
        className={`w-full button-brutal py-3 font-bold transition ${
          isExpired && !isUnlocking
            ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isUnlocking ? "UNLOCKING..." : isExpired ? "UNLOCK VAULT" : "LOCKED - WAITING..."}
      </button>
    </div>
  );
}

export function TimelockMain() {
  const { isConnected, identity } = useWallet();
  const { vaults, refetch } = useVaults();
  const [unlockableVaults, setUnlockableVaults] = useState<Vault[]>([]);
  const [activeLockedVaults, setActiveLockedVaults] = useState<Vault[]>([]);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockingVaultId, setUnlockingVaultId] = useState<bigint | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter vaults
  useEffect(() => {
    const unlockable: Vault[] = [];
    const activeLocked: Vault[] = [];

    vaults.forEach((vault) => {
      const status = getVaultStatus(vault);
      if (status === "Unlockable") {
        unlockable.push(vault);
      } else if (status === "ActiveLocked") {
        activeLocked.push(vault);
      }
    });

    setUnlockableVaults(unlockable);
    setActiveLockedVaults(activeLocked);
  }, [vaults]);

  // Auto refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const handleUnlock = async (vaultId: bigint) => {
    if (!isConnected || !identity) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    setIsUnlocking(true);
    setUnlockingVaultId(vaultId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await ironcladClient.vaults.unlock(vaultId, identity);

      if ("Ok" in result) {
        setSuccessMessage(
          `Vault #${vaultId.toString()} unlocked successfully! Ready for withdrawal.`
        );
        // Refetch vaults after successful unlock
        setTimeout(() => {
          refetch();
        }, 1000);
      } else if ("Err" in result) {
        setErrorMessage(`Failed to unlock: ${result.Err}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMessage(`Error: ${msg}`);
      console.error("[handleUnlock] Error:", error);
    } finally {
      setIsUnlocking(false);
      setUnlockingVaultId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="card-brutal p-8 text-center">
          <h2 className="heading-brutal text-2xl mb-4">CONNECT YOUR WALLET</h2>
          <p className="body-brutal text-lg text-gray-600 mb-6">
            Connect your wallet to manage vault timelocks
          </p>
        </div>
      </div>
    );
  }

  const totalVaults = unlockableVaults.length + activeLockedVaults.length;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="card-brutal mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="heading-brutal text-3xl mb-2">TIMELOCK MANAGEMENT</h1>
            <p className="body-brutal text-lg text-gray-600">
              Manage vault timelocks and unlock when ready
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="button-brutal px-4 py-2 border-2 border-gray-300 hover:bg-gray-50"
          >
            REFRESH
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="body-brutal text-sm">Auto-refresh every 30s</span>
          </label>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="card-brutal p-4 mb-6 bg-green-50 border-2 border-green-300 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="heading-brutal text-lg text-green-900">SUCCESS</h3>
            <p className="body-brutal text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="card-brutal p-4 mb-6 bg-red-50 border-2 border-red-300 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="heading-brutal text-lg text-red-900">ERROR</h3>
            <p className="body-brutal text-red-800">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {totalVaults > 0 && (
        <div className="card-brutal p-6 mb-8">
          <h2 className="heading-brutal text-lg mb-4">OVERVIEW</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 body-brutal">
            <div>
              <p className="text-gray-600 text-sm">Total Vaults</p>
              <p className="text-2xl font-bold">{totalVaults}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Ready to Unlock</p>
              <p className="text-2xl font-bold text-green-600">{unlockableVaults.length}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Still Locked</p>
              <p className="text-2xl font-bold text-blue-600">{activeLockedVaults.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalVaults === 0 && (
        <div className="card-brutal p-8 text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="heading-brutal text-2xl mb-4">NO LOCKED VAULTS</h2>
          <p className="body-brutal text-lg text-gray-600">
            You have no active locked vaults to manage
          </p>
        </div>
      )}

      {/* Unlockable Vaults */}
      {unlockableVaults.length > 0 && (
        <div className="mb-8">
          <h2 className="heading-brutal text-xl mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" /> READY TO UNLOCK ({unlockableVaults.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockableVaults.map((vault) => (
              <UnlockableVaultCard
                key={vault.id.toString()}
                vault={vault}
                onUnlock={handleUnlock}
                isUnlocking={isUnlocking && unlockingVaultId === vault.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Locked Vaults */}
      {activeLockedVaults.length > 0 && (
        <div className="mb-8">
          <h2 className="heading-brutal text-xl mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" /> COUNTING DOWN ({activeLockedVaults.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeLockedVaults.map((vault) => {
              const lockUntilDate = new Date(Number(vault.lock_until) * 1000);
              const now = new Date();
              const isExpired = now >= lockUntilDate;
              const diff = lockUntilDate.getTime() - now.getTime();
              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
              const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <div key={vault.id.toString()} className="card-brutal p-6">
                  <h3 className="heading-brutal text-xl mb-2">
                    VAULT #{vault.id.toString()}
                  </h3>
                  <div className="space-y-3 body-brutal text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-bold">
                        {vault.balance.toLocaleString()} sats
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Remaining:</span>
                      <span className="font-bold text-blue-600">
                        {days}d {hours}h {minutes}m
                      </span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border-2 border-blue-200 text-center">
                      <p className="text-xs text-blue-600">
                        Unlock in ~{days} day{days !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
