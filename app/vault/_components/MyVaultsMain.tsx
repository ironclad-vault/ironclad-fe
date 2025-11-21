"use client";

import { useState, useEffect } from "react";
import { useVaults } from "@/hooks/ironclad/useVaults";
import { useWallet } from "@/components/wallet/useWallet";
import { useAutoReinvest } from "@/hooks/ironclad/useAutoReinvest";
import TransitionButton from "@/components/navigation/TransitionButton";
import BTCAmount from "@/components/ui/BTCAmount";
import type { Vault } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";
import type { AutoReinvestConfigDTO } from "@/lib/ironclad-service";
import { Clock, Lock, Hourglass, Unlock, Timer } from "lucide-react";
import toast from "react-hot-toast";
import {
  getVaultStatus,
  getVaultStatusLabel,
  getVaultStatusColor,
  formatVaultDate,
  formatSats,
} from "@/lib/vaultUtils";
import { getErrorMessage } from "@/lib/toastUtils";
import { ironcladClient } from "@/lib/ic/ironcladClient";

function VaultCard({
  vault,
  onUnlockClick,
  autoReinvestConfig,
  nextCycleTimestamp,
}: {
  vault: Vault;
  onUnlockClick?: (vaultId: bigint) => void;
  autoReinvestConfig?: AutoReinvestConfigDTO;
  nextCycleTimestamp?: number;
}) {
  const status = getVaultStatus(vault);
  const statusLabel = getVaultStatusLabel(vault);
  const statusColor = getVaultStatusColor(vault);

  const lockUntilDate = new Date(Number(vault.lock_until) * 1000);
  const now = new Date();
  const isTimeExpired = now >= lockUntilDate;

  // Check if vault needs unlock button
  const needsUnlock = isTimeExpired && status === "ActiveLocked";

  // Calculate progress percentage for time-lock progress bar
  const calculateProgress = () => {
    // Assuming vault was created at lock_until - timeRemaining
    // For simplicity, we'll use lock_until as the end and estimate start as 2 weeks before
    const lockTimestamp = Number(vault.lock_until);
    const estStartTimestamp = lockTimestamp - (14 * 24 * 60 * 60); // Estimate 2 weeks before lock
    const currentTimestamp = now.getTime() / 1000;

    const totalDuration = lockTimestamp - estStartTimestamp;
    const elapsed = currentTimestamp - estStartTimestamp;
    const percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

    return percentage;
  };

  const progressPercentage = status === "ActiveLocked" ? calculateProgress() : 100;

  // Get badge color based on plan status
  const getAutoReinvestBadgeColor = (status: "Active" | "Cancelled" | "Error" | "Paused"): string => {
    switch (status) {
      case "Active":
        return "bg-blue-50 text-blue-700";
      case "Paused":
        return "bg-zinc-100 text-zinc-700";
      case "Error":
        return "bg-red-50 text-red-700";
      case "Cancelled":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  // Format next cycle timestamp to human-readable format
  const formatNextCycleTime = (timestamp: number): string => {
    if (!timestamp || timestamp === 0) return "Not scheduled";
    
    const targetDate = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Due now";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `in ${diffMinutes}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    return `in ${diffDays}d`;
  };

  // Calculate time remaining for locked vaults
  const getTimeRemaining = () => {
    const diff = lockUntilDate.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes };
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="card-pro relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h3 className="heading-brutal text-xl font-semibold">Vault #{vault.id.toString()}</h3>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-2 ${statusColor}`}
        >
          {status === "ActiveLocked" && (
            <span className="status-pulse status-dot bg-green-500"></span>
          )}
          {statusLabel}
        </span>
      </div>

      {/* Progress Bar */}
      {status === "ActiveLocked" && (
        <div className="progress-bar-container mb-4">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      )}

      {/* Auto-Reinvest Plan Badge */}
      {autoReinvestConfig && (
        <div className="mb-5 pb-4 border-b border-zinc-100">
          {autoReinvestConfig.planStatus === "Active" && (
            <div className={`px-3 py-2 text-xs font-semibold rounded-full ${getAutoReinvestBadgeColor("Active")}`}>
              <p className="flex items-center gap-1 mb-1">
                📅 Auto-Reinvest Active
              </p>
              <p className="text-xs opacity-75">Execution #{Number(autoReinvestConfig.executionCount)}</p>
              {nextCycleTimestamp && nextCycleTimestamp > 0 && (
                <p className="text-xs opacity-75">Next: {formatNextCycleTime(nextCycleTimestamp)}</p>
              )}
            </div>
          )}

          {autoReinvestConfig.planStatus === "Paused" && (
            <div className={`px-3 py-2 text-xs font-semibold rounded-full ${getAutoReinvestBadgeColor("Paused")}`}>
              <p className="flex items-center gap-1">⏸️ Auto-Reinvest Paused</p>
              <p className="text-xs opacity-75">Scheduled but waiting</p>
            </div>
          )}

          {autoReinvestConfig.planStatus === "Error" && (
            <div className={`px-3 py-2 text-xs font-semibold rounded-full ${getAutoReinvestBadgeColor("Error")}`}>
              <p className="flex items-center gap-1 mb-1">❌ Auto-Reinvest Error</p>
              {autoReinvestConfig.errorMessage && (
                <p className="text-xs opacity-75">Reason: {autoReinvestConfig.errorMessage}</p>
              )}
            </div>
          )}

          {autoReinvestConfig.planStatus === "Cancelled" && (
            <div className={`px-3 py-2 text-xs font-semibold rounded-full ${getAutoReinvestBadgeColor("Cancelled")}`}>
              <p className="flex items-center gap-1">🛑 Auto-Reinvest Cancelled</p>
              <p className="text-xs opacity-75">Plan ended</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 text-body text-sm mb-5">
        <div className="flex justify-between items-baseline">
          <span className="text-label">BALANCE</span>
          <BTCAmount sats={vault.balance} showLabel={true} className="text-right" />
        </div>

        {vault.expected_deposit && (
          <div className="flex justify-between items-baseline">
            <span className="text-label">EXPECTED DEPOSIT</span>
            <BTCAmount sats={vault.expected_deposit} showLabel={true} className="text-right" />
          </div>
        )}

        <div className="flex justify-between items-baseline">
          <span className="text-label">LOCK UNTIL</span>
          <span className="font-semibold text-right">
            {formatVaultDate(Number(vault.lock_until))}
          </span>
        </div>

        {status === "ActiveLocked" && timeRemaining && (
          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 flex flex-row items-center gap-1">
              <Timer className="w-4 h-4" /> {timeRemaining.days}d {timeRemaining.hours}h{" "}
              {timeRemaining.minutes}m remaining
            </p>
          </div>
        )}

        {needsUnlock && (
          <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-900">
              ✓ Ready to unlock - Click UNLOCK below
            </p>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-2">
          <span className="text-label">BTC ADDRESS</span>
          <span className="font-mono text-xs text-right">
            {vault.btc_address.slice(0, 12)}...
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t border-zinc-100">
        {/* Primary Actions */}
        <div className="flex gap-2">
          {status === "Unlockable" && (
            <TransitionButton
              href="/vault/withdraw-vaults"
              suppressTransition
              className="flex-1 button-brutal accent py-2 text-sm font-semibold"
            >
              WITHDRAW
            </TransitionButton>
          )}
          {status === "PendingDeposit" && (
            <TransitionButton
              href={`/vault/create-vault?vaultId=${vault.id.toString()}`}
              suppressTransition
              className="flex-1 button-brutal accent py-2 text-sm font-semibold"
            >
              COMPLETE
            </TransitionButton>
          )}
          {needsUnlock && onUnlockClick && (
            <button
              onClick={() => onUnlockClick(vault.id)}
              className="flex-1 button-brutal accent py-2 text-sm font-semibold"
            >
              UNLOCK
            </button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <TransitionButton
            href={`/vault/${vault.id.toString()}`}
            suppressTransition
            className="flex-1 button-brutal py-2 text-sm font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            DETAILS
          </TransitionButton>
        </div>
      </div>
    </div>
  );
}

export default function MyVaultsMain() {
  const { isConnected } = useWallet();
  const { isConnected: walletConnected, identity } = useWallet();
  const { vaults, loading, error, refetch } = useVaults();
  const { configs, nextCycles } = useAutoReinvest();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockingVaultId, setUnlockingVaultId] = useState<bigint | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Helper to find auto-reinvest config for a vault
  const getConfigForVault = (vaultId: bigint): AutoReinvestConfigDTO | undefined => {
    return configs.find(c => c.vaultId === vaultId);
  };

  // Filter vaults by status
  const activeVaults = vaults.filter(
    (v) => getVaultStatus(v) === "ActiveLocked"
  );
  const unlockableVaults = vaults.filter(
    (v) => getVaultStatus(v) === "Unlockable"
  );
  const pendingVaults = vaults.filter(
    (v) => getVaultStatus(v) === "PendingDeposit"
  );

  // Get vaults that need unlock (time expired but not backend unlocked)
  const needsUnlockVaults = activeVaults.filter((vault) => {
    const lockUntilDate = new Date(Number(vault.lock_until) * 1000);
    const now = new Date();
    return now >= lockUntilDate;
  });

  // Auto refresh with smart interval
  useEffect(() => {
    if (!autoRefresh) return;

    // Check if any vault will unlock soon (within 1 minute)
    const hasShortLockVault = activeVaults.some((vault) => {
      const lockUntilDate = new Date(Number(vault.lock_until) * 1000);
      const now = new Date();
      const diff = lockUntilDate.getTime() - now.getTime();
      return diff > 0 && diff <= 60000; // Within 1 minute
    });

    // Use faster polling (3 seconds) if vault unlocks soon, otherwise 30 seconds
    const refreshInterval = hasShortLockVault ? 3000 : 30000;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch, activeVaults]);

  const handleUnlock = async (vaultId: bigint) => {
    if (!walletConnected || !identity) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsUnlocking(true);
    setUnlockingVaultId(vaultId);

    try {
      const result = await toast.promise(
        ironcladClient.vaults.unlock(vaultId, identity),
        {
          loading: `Unlocking vault #${vaultId.toString()}...`,
          success: (res) => {
            if ("Err" in res) {
              throw new Error(res.Err);
            }
            return `Vault #${vaultId.toString()} unlocked successfully!`;
          },
          error: (err) => `Failed to unlock: ${getErrorMessage(err)}`,
        }
      );

      if ("Ok" in result) {
        // Refetch vaults after successful unlock
        setTimeout(() => {
          refetch();
        }, 1000);
      }
    } catch (error) {
      console.error("[handleUnlock] Error:", error);
    } finally {
      setIsUnlocking(false);
      setUnlockingVaultId(null);
    }
  };

  return (
    <div className="container mx-auto px-6">
      {/* Wallet Connection Check - Show First */}
      {!isConnected && (
        <div className="card-brutal brutal-border border-2 p-12 text-center">
          <h2 className="heading-brutal text-4xl mb-4">CONNECT YOUR WALLET</h2>
          <p className="body-brutal text-lg text-gray-700">
            Connect your wallet to view and manage your vaults
          </p>
        </div>
      )}

      {isConnected && (
        <>
          {/* Header - Only show when wallet is connected */}
          <div className="card-brutal brutal-border border-2 mb-8 p-8">
            <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-accent">
              <div>
                <h1 className="heading-brutal text-5xl mb-2">MY VAULTS</h1>
                <p className="body-brutal text-lg text-gray-700 font-semibold">
                  {vaults.length} {vaults.length === 1 ? "vault" : "vaults"} found
                </p>
              </div>
              <button
                onClick={refetch}
                disabled={loading}
                className="button-brutal px-6 py-3 font-bold border-2 hover-lift disabled:opacity-50"
              >
                {loading ? "REFRESHING..." : "REFRESH"}
              </button>
            </div>

            <TransitionButton
              href="/vault/create-vault"
              suppressTransition
              className="button-brutal accent w-full py-4 text-lg font-bold hover-lift"
            >
              + CREATE NEW VAULT
            </TransitionButton>

            {/* Auto-refresh toggle */}
            <div className="mt-6 flex items-center gap-3 border-t-2 border-accent pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="body-brutal text-sm font-semibold">Auto-refresh every 30s</span>
              </label>
              {activeVaults.some((v) => {
                const diff =
                  new Date(Number(v.lock_until) * 1000).getTime() -
                  new Date().getTime();
                return diff > 0 && diff <= 60000;
              }) &&
                autoRefresh && (
                  <span className="body-brutal text-xs text-orange-600 font-black">
                    ⚡ Fast polling (3s)
                  </span>
                )}
            </div>
          </div>
          {/* Loading State */}
          {loading && vaults.length === 0 && (
            <div className="card-brutal brutal-border border-2 p-8 text-center">
              <p className="body-brutal text-lg">Loading vaults...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="card-brutal brutal-border border-2 border-red-500 p-8 bg-red-50">
              <h3 className="heading-brutal text-2xl text-red-900 mb-2">
                ERROR
              </h3>
              <p className="body-brutal text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && vaults.length === 0 && !error && (
            <div className="card-brutal brutal-border border-2 p-12 text-center">
              <h2 className="heading-brutal text-4xl mb-4">NO VAULTS YET</h2>
              <p className="body-brutal text-lg text-gray-700 mb-8">
                Create your first vault to start securing your Bitcoin
              </p>
              <TransitionButton
                href="/vault/create-vault"
                suppressTransition
                className="button-brutal accent px-8 py-4 text-lg font-bold hover-lift"
              >
                CREATE VAULT
              </TransitionButton>
            </div>
          )}

          {/* Vaults Grid */}
          {!loading && vaults.length > 0 && (
            <>
              {/* Needs Unlock */}
              {needsUnlockVaults.length > 0 && (
                <div className="mb-12">
                  <h2 className="heading-brutal text-2xl mb-6 pb-4 border-b-2 border-accent flex items-center gap-3">
                    <Clock className="w-8 h-8 text-green-600" /> READY TO UNLOCK
                    ({needsUnlockVaults.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {needsUnlockVaults.map((vault) => (
                      <VaultCard
                        key={vault.id.toString()}
                        vault={vault}
                        onUnlockClick={
                          !isUnlocking || unlockingVaultId !== vault.id
                            ? handleUnlock
                            : undefined
                        }
                        autoReinvestConfig={getConfigForVault(vault.id)}
                        nextCycleTimestamp={nextCycles.get(vault.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unlockable Vaults */}
              {unlockableVaults.length > 0 && (
                <div className="mb-12">
                  <h2 className="heading-brutal text-2xl mb-6 pb-4 border-b-2 border-accent flex items-center gap-3">
                    <Unlock className="w-8 h-8 text-green-600" /> UNLOCKABLE (
                    {unlockableVaults.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unlockableVaults.map((vault) => (
                      <VaultCard
                        key={vault.id.toString()}
                        vault={vault}
                        autoReinvestConfig={getConfigForVault(vault.id)}
                        nextCycleTimestamp={nextCycles.get(vault.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Active Locked Vaults */}
              {activeVaults.length > needsUnlockVaults.length && (
                <div className="mb-12">
                  <h2 className="heading-brutal text-2xl mb-6 pb-4 border-b-2 border-accent flex items-center gap-3">
                    <Lock className="w-8 h-8" /> ACTIVE LOCKED (
                    {activeVaults.length - needsUnlockVaults.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeVaults
                      .filter((vault) => {
                        const lockUntilDate = new Date(
                          Number(vault.lock_until) * 1000
                        );
                        const now = new Date();
                        return now < lockUntilDate;
                      })
                      .map((vault) => (
                        <VaultCard
                          key={vault.id.toString()}
                          vault={vault}
                          autoReinvestConfig={getConfigForVault(vault.id)}
                          nextCycleTimestamp={nextCycles.get(vault.id)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Pending Deposits */}
              {pendingVaults.length > 0 && (
                <div className="mb-12">
                  <h2 className="heading-brutal text-2xl mb-6 pb-4 border-b-2 border-accent flex items-center gap-3">
                    <Hourglass className="w-8 h-8" /> PENDING DEPOSIT (
                    {pendingVaults.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingVaults.map((vault) => (
                      <VaultCard
                        key={vault.id.toString()}
                        vault={vault}
                        autoReinvestConfig={getConfigForVault(vault.id)}
                        nextCycleTimestamp={nextCycles.get(vault.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="card-brutal brutal-border border-2 p-8 mt-12">
                <h3 className="heading-brutal text-2xl mb-6 pb-4 border-b-2 border-accent">STATISTICS</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 body-brutal">
                  <div>
                    <p className="text-gray-600 text-sm">Total Vaults</p>
                    <p className="text-2xl font-bold">{vaults.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Need Unlock</p>
                    <p className="text-2xl font-bold text-green-600">
                      {needsUnlockVaults.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Unlockable</p>
                    <p className="text-2xl font-bold text-green-600">
                      {unlockableVaults.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Locked</p>
                    <p className="text-2xl font-bold">
                      {activeVaults.length - needsUnlockVaults.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-2xl font-bold">{pendingVaults.length}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
