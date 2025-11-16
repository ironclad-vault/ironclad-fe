"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { getVault, getVaultEvents } from "@/lib/ironclad-service";
import type { VaultDTO, VaultEventDTO } from "@/lib/ironclad-service";
import { formatVaultDate, formatSats } from "@/lib/vaultUtils";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import { useAutoReinvest } from "@/hooks/ironclad/useAutoReinvest";
import { TransactionProofCard } from "@/components/ui/TransactionProofCard";
import { AdvancedActionsSection } from "./AdvancedActionsSection";
import {
  ArrowLeft,
  FileWarning,
  Timer,
  Plus,
  Lock,
  Unlock,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface VaultDetailMainProps {
  vaultId: string;
}

const getVaultStatusString = (vault: VaultDTO): string => {
  if (vault.status === "Withdrawn") return "Withdrawn";
  if (vault.status === "PendingDeposit") return "PendingDeposit";
  if (vault.status === "Unlockable") return "Unlockable";
  if (vault.status === "ActiveLocked") {
    const lockDate = new Date(vault.lockUntil * 1000);
    const now = new Date();
    if (now >= lockDate) return "Unlockable";
    return "ActiveLocked";
  }
  return "Unknown";
};

const formatStatusLabel = (vault: VaultDTO): string => {
  if (vault.status === "Withdrawn") return "Withdrawn";
  if (vault.status === "PendingDeposit") return "Pending Deposit";
  if (vault.status === "Unlockable") return "Ready to Unlock";
  if (vault.status === "ActiveLocked") {
    const lockDate = new Date(vault.lockUntil * 1000);
    const now = new Date();
    if (now >= lockDate) return "Ready to Unlock";
    return "Locked";
  }
  return "Unknown";
};

const getStatusColor = (vault: VaultDTO): string => {
  const status = getVaultStatusString(vault);
  if (status === "Withdrawn")
    return "bg-gray-100 text-gray-900 border-gray-300";
  if (status === "PendingDeposit")
    return "bg-yellow-100 text-yellow-900 border-yellow-300";
  if (status === "Unlockable")
    return "bg-green-100 text-green-900 border-green-300";
  if (status === "ActiveLocked")
    return "bg-blue-100 text-blue-900 border-blue-300";
  return "bg-gray-100 text-gray-900 border-gray-300";
};

export default function VaultDetailMain({ vaultId }: VaultDetailMainProps) {
  const { isConnected } = useWallet();
  const { unlockVault, loading: actionLoading } = useVaultActions();
  const {
    configs,
    loading: autoReinvestLoading,
    schedule,
    cancel,
    execute,
    retryPlan,
  } = useAutoReinvest();
  const [vault, setVault] = useState<VaultDTO | null>(null);
  const [events, setEvents] = useState<VaultEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "config" | "advanced"
  >("overview");
  const [newLockDuration, setNewLockDuration] = useState<string>("2592000"); // 30 days default
  const [eventFilter, setEventFilter] = useState<string>("all"); // Event filter state

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !vaultId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const id = BigInt(vaultId);

        const vaultData = await getVault({ vaultId: id });
        if (!vaultData) {
          setError("Vault not found");
          setLoading(false);
          return;
        }
        setVault(vaultData);

        const vaultEvents = await getVaultEvents({ vaultId: id });
        setEvents(vaultEvents);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to fetch vault details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, vaultId]);

  const handleUnlock = async () => {
    if (!vault) return;

    try {
      await unlockVault(BigInt(vault.id));
      toast.success("Vault unlocked successfully!");

      const updatedVault = await getVault({ vaultId: BigInt(vault.id) });
      if (updatedVault) {
        setVault(updatedVault);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to unlock vault";
      toast.error(msg);
    }
  };

  const handleScheduleAutoReinvest = async () => {
    if (!vault || !newLockDuration) return;

    await schedule(BigInt(vault.id), BigInt(newLockDuration));
  };

  const handleCancelAutoReinvest = async () => {
    if (!vault) return;

    if (
      !confirm("Are you sure you want to cancel auto-reinvest for this vault?")
    ) {
      return;
    }

    const success = await cancel(BigInt(vault.id));
    if (success) {
      // toast already handled by useAutoReinvest hook
      // configs will be refetched automatically by the hook
    }
  };

  const handleExecuteAutoReinvest = async () => {
    if (!vault) return;

    if (
      !confirm(
        "Are you sure you want to execute auto-reinvest for this vault now?"
      )
    ) {
      return;
    }

    const result = await execute(BigInt(vault.id));
    if (result) {
      const updatedVault = await getVault({ vaultId: BigInt(vault.id) });
      if (updatedVault) {
        setVault(updatedVault);
      }
    }
  };

  const handleRetryPlan = async () => {
    if (!vault) return;

    if (
      !confirm(
        "Are you sure you want to retry the auto-reinvest plan for this vault?"
      )
    ) {
      return;
    }

    const success = await retryPlan(BigInt(vault.id));
    if (success) {
      // configs will be refetched automatically by the hook
      const updatedVault = await getVault({ vaultId: BigInt(vault.id) });
      if (updatedVault) {
        setVault(updatedVault);
      }
    }
  };

  // Find auto-reinvest config for current vault
  const currentConfig = configs.find(
    (config) => config.vaultId.toString() === vaultId
  );

  if (!isConnected) {
    return (
      <div className="space-y-8 mx-auto container px-6">
        <div className="card-brutal p-8 text-center">
          <h2 className="heading-brutal text-2xl mb-4">CONNECT YOUR WALLET</h2>
          <p className="body-brutal text-lg text-gray-600">
            Please connect your wallet to view vault details.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 mx-auto container px-6">
        <div className="card-brutal p-8 text-center">
          <p className="body-brutal text-lg text-gray-600">
            Loading vault details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !vault) {
    return (
      <div className="space-y-8 mx-auto container px-6">
        <div className="card-brutal p-8 bg-red-50 border-red-300">
          <h2 className="heading-brutal text-lg text-red-900 mb-2">ERROR</h2>
          <p className="body-brutal text-sm text-red-800">
            {error || "Vault not found"}
          </p>
          <Link
            href="/vault"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Back to Vaults
          </Link>
        </div>
      </div>
    );
  }

  const status = getVaultStatusString(vault);
  const statusLabel = formatStatusLabel(vault);
  const statusColor = getStatusColor(vault);
  const lockUntilDate = new Date(vault.lockUntil * 1000);
  const now = new Date();
  const isTimeExpired = now >= lockUntilDate;
  const needsUnlock = isTimeExpired && vault.status === "ActiveLocked";

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
    <div className="container mx-auto px-6">
      <div className="mb-6">
        <Link
          href="/vault"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Vaults
        </Link>
      </div>

      <div className="space-y-6">
        <div className="card-brutal p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="heading-brutal text-4xl mb-2">
                VAULT #{vault.id.toString()}
              </h1>
              <p className="body-brutal text-gray-600">
                Owner: {vault.owner.slice(0, 12)}...
              </p>
            </div>
            <span
              className={`px-4 py-2 text-sm font-bold border-2 rounded ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-brutal p-4 bg-gray-50">
              <p className="body-brutal text-xs text-gray-600 uppercase font-bold mb-1">
                Balance
              </p>
              <p className="heading-brutal text-2xl">
                {formatSats(vault.balance)}
              </p>
            </div>
            <div className="card-brutal p-4 bg-gray-50">
              <p className="body-brutal text-xs text-gray-600 uppercase font-bold mb-1">
                Lock Until
              </p>
              <p className="heading-brutal text-lg">
                {formatVaultDate(vault.lockUntil)}
              </p>
            </div>
            <div className="card-brutal p-4 bg-gray-50">
              <p className="body-brutal text-xs text-gray-600 uppercase font-bold mb-1">
                Status
              </p>
              <p className="heading-brutal text-lg">{statusLabel}</p>
            </div>
          </div>

          {status === "ActiveLocked" && timeRemaining && (
            <div className="mt-4 bg-blue-50 p-4 rounded border-2 border-blue-200">
              <p className="body-brutal text-sm text-blue-900 font-bold flex flex-row items-center gap-1">
                <Timer /> {timeRemaining.days}d {timeRemaining.hours}h{" "}
                {timeRemaining.minutes}m remaining until unlock
              </p>
            </div>
          )}

          {needsUnlock && (
            <button
              onClick={handleUnlock}
              disabled={actionLoading}
              className="mt-4 button-brutal accent w-full py-3 font-bold disabled:opacity-50"
            >
              {actionLoading ? "UNLOCKING..." : "UNLOCK VAULT"}
            </button>
          )}
        </div>

        <div className="card-brutal p-0 overflow-hidden">
          <div className="flex border-b-2 border-black">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-6 py-4 font-bold heading-brutal border-r-2 border-black transition-colors ${
                activeTab === "overview"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-6 py-4 font-bold heading-brutal border-r-2 border-black transition-colors ${
                activeTab === "history"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              HISTORY
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`flex-1 px-6 py-4 font-bold heading-brutal border-r-2 border-black transition-colors ${
                activeTab === "config"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              AUTO-REINVEST
            </button>
            <button
              onClick={() => setActiveTab("advanced")}
              className={`flex-1 px-6 py-4 font-bold heading-brutal transition-colors ${
                activeTab === "advanced"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              ADVANCED
            </button>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="heading-brutal text-lg mb-4!">
                    VAULT INFORMATION
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="body-brutal text-gray-600">
                        Vault ID:
                      </span>
                      <span className="body-brutal font-bold">
                        {vault.id.toString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="body-brutal text-gray-600">Owner:</span>
                      <span className="body-brutal font-mono text-sm">
                        {vault.owner}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="body-brutal text-gray-600">Status:</span>
                      <span className="body-brutal font-bold">
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="body-brutal text-gray-600">
                        Balance:
                      </span>
                      <span className="body-brutal font-bold">
                        {formatSats(vault.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="body-brutal text-gray-600">
                        Expected Deposit:
                      </span>
                      <span className="body-brutal font-bold">
                        {formatSats(vault.expectedDeposit)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="body-brutal text-gray-600">
                        Lock Until:
                      </span>
                      <span className="body-brutal font-bold">
                        {formatVaultDate(vault.lockUntil)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="body-brutal text-gray-600">
                        BTC Address:
                      </span>
                      <span className="body-brutal font-mono text-sm">
                        {vault.btcAddress}
                      </span>
                    </div>
                    {vault.ckbtcSubaccountHex && (
                      <div className="border-b pb-4">
                        <span className="body-brutal text-gray-600 block mb-2">
                          ckBTC Subaccount:
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="body-brutal font-mono text-xs bg-gray-100 p-2 rounded flex-1 overflow-x-auto">
                            {vault.ckbtcSubaccountHex}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                vault.ckbtcSubaccountHex!
                              );
                              toast.success("ckBTC subaccount copied!");
                            }}
                            className="button-brutal py-2 px-3 text-xs whitespace-nowrap"
                            title="Copy to clipboard"
                          >
                            COPY
                          </button>
                        </div>
                        <p className="body-brutal text-xs text-gray-500 mt-1">
                          Send ckBTC to this subaccount to fund the vault
                        </p>
                      </div>
                    )}
                    {vault.btcDepositTxid && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="body-brutal text-gray-600">
                          Deposit TXID:
                        </span>
                        <span className="body-brutal font-mono text-xs">
                          {vault.btcDepositTxid.slice(0, 20)}...
                        </span>
                      </div>
                    )}
                    {vault.btcWithdrawTxid && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="body-brutal text-gray-600">
                          Withdraw TXID:
                        </span>
                        <span className="body-brutal font-mono text-xs">
                          {vault.btcWithdrawTxid.slice(0, 20)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bitcoin Transaction Proofs */}
                <div>
                  <h3 className="heading-brutal text-lg mb-4!">
                    TRANSACTION PROOFS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TransactionProofCard
                      vaultId={BigInt(vault.id)}
                      proofType="deposit"
                    />
                    <TransactionProofCard
                      vaultId={BigInt(vault.id)}
                      proofType="withdraw"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="heading-brutal text-lg">VAULT HISTORY</h3>

                  {/* Event Filter */}
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="input-brutal text-sm px-3 py-2"
                  >
                    <option value="all">All Events</option>
                    <option value="VAULT_CREATED">Created</option>
                    <option value="DEPOSITED">Deposited</option>
                    <option value="LOCKED">Locked</option>
                    <option value="UNLOCK_READY">Unlocked</option>
                    <option value="WITHDRAW_REQUESTED">Withdrawn</option>
                    <option value="AUTO_REINVEST">Auto-Reinvest</option>
                    <option value="VAULT_LISTED">Marketplace</option>
                  </select>
                </div>

                {events.length === 0 ? (
                  <div className="card-brutal p-8 text-center bg-gray-50">
                    <p className="body-brutal text-gray-600">No events yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events
                      .filter(
                        (event) =>
                          eventFilter === "all" ||
                          event.action.includes(eventFilter)
                      )
                      .map((event, idx) => {
                        // Determine icon and color based on action type
                        const getEventIcon = (action: string) => {
                          if (action.includes("CREATE"))
                            return <Plus className="w-5 h-5" />;
                          if (action.includes("DEPOSITED"))
                            return <Plus className="w-5 h-5" />;
                          if (action.includes("LOCKED"))
                            return <Lock className="w-5 h-5" />;
                          if (action.includes("UNLOCK"))
                            return <Unlock className="w-5 h-5" />;
                          if (action.includes("WITHDRAW"))
                            return <TrendingUp className="w-5 h-5" />;
                          if (action.includes("AUTO_REINVEST"))
                            return <TrendingUp className="w-5 h-5" />;
                          if (
                            action.includes("VAULT_LISTED") ||
                            action.includes("VAULT_SOLD")
                          )
                            return <ShoppingCart className="w-5 h-5" />;
                          if (
                            action.includes("ERROR") ||
                            action.includes("FAILED")
                          )
                            return <AlertCircle className="w-5 h-5" />;
                          return <CheckCircle className="w-5 h-5" />;
                        };

                        const getEventColor = (action: string) => {
                          if (action.includes("CREATE"))
                            return "border-green-500 bg-green-50";
                          if (action.includes("DEPOSITED"))
                            return "border-blue-500 bg-blue-50";
                          if (action.includes("LOCKED"))
                            return "border-purple-500 bg-purple-50";
                          if (action.includes("UNLOCK"))
                            return "border-green-500 bg-green-50";
                          if (action.includes("WITHDRAW"))
                            return "border-orange-500 bg-orange-50";
                          if (action.includes("AUTO_REINVEST"))
                            return "border-blue-500 bg-blue-50";
                          if (
                            action.includes("VAULT_LISTED") ||
                            action.includes("VAULT_SOLD")
                          )
                            return "border-indigo-500 bg-indigo-50";
                          if (
                            action.includes("ERROR") ||
                            action.includes("FAILED")
                          )
                            return "border-red-500 bg-red-50";
                          return "border-gray-500 bg-gray-50";
                        };

                        // Calculate relative time
                        const getRelativeTime = (timestamp: number) => {
                          const now = Math.floor(Date.now() / 1000);
                          const diff = now - timestamp;
                          if (diff < 60) return `${diff}s ago`;
                          if (diff < 3600)
                            return `${Math.floor(diff / 60)}m ago`;
                          if (diff < 86400)
                            return `${Math.floor(diff / 3600)}h ago`;
                          return `${Math.floor(diff / 86400)}d ago`;
                        };

                        return (
                          <div
                            key={idx}
                            className={`card-brutal p-4 border-l-4 ${getEventColor(
                              event.action
                            )}`}
                          >
                            <div className="flex gap-4">
                              <div className="shrink-0">
                                {getEventIcon(event.action)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="body-brutal font-bold">
                                    {event.action.replace(/_/g, " ")}
                                  </p>
                                  <div className="text-right">
                                    <p className="body-brutal text-xs text-gray-600">
                                      {getRelativeTime(event.timestamp)}
                                    </p>
                                    <p className="body-brutal text-xs text-gray-500">
                                      {formatVaultDate(event.timestamp)}
                                    </p>
                                  </div>
                                </div>
                                {event.notes && (
                                  <p className="body-brutal text-sm text-gray-700">
                                    {event.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "config" && (
              <div className="space-y-6 flex flex-col gap-3">
                <h3 className="heading-brutal text-lg mb-4">
                  AUTO-REINVEST PLAN
                </h3>

                {getVaultStatusString(vault) === "Withdrawn" ? (
                  <div className="card-brutal p-6 bg-red-50 border-red-300">
                    <p className="body-brutal text-sm text-red-800 flex flex-row items-center gap-1">
                      <FileWarning /> Auto-reinvest cannot be configured for
                      withdrawn vaults.
                    </p>
                  </div>
                ) : status !== "Unlockable" ? (
                  <div className="card-brutal p-6 bg-yellow-50 border-yellow-300">
                    <p className="body-brutal text-sm text-yellow-800 flex flex-row items-center gap-1">
                      <FileWarning /> Vault must be unlocked to configure
                      auto-reinvest plan.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Current Plan Status Display */}
                    {currentConfig ? (
                      <div
                        className={`card-brutal p-6 ${
                          currentConfig.planStatus === "Active"
                            ? "bg-blue-50 border-blue-300"
                            : currentConfig.planStatus === "Cancelled"
                            ? "bg-gray-50 border-gray-300"
                            : currentConfig.planStatus === "Error"
                            ? "bg-red-50 border-red-300"
                            : "bg-yellow-50 border-yellow-300"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="heading-brutal text-sm mb-2">
                              {currentConfig.planStatus === "Active"
                                ? "📅 ACTIVE PLAN"
                                : currentConfig.planStatus === "Error"
                                ? "⚠️ PLAN ERROR"
                                : "🔒 PLAN " +
                                  currentConfig.planStatus.toUpperCase()}
                            </p>
                            <p className="body-brutal text-sm text-gray-700 mb-1">
                              Lock Duration:{" "}
                              {Number(currentConfig.newLockDuration) / 86400}{" "}
                              days
                            </p>
                            {currentConfig.executionCount > 0 && (
                              <p className="body-brutal text-xs text-gray-600">
                                ✓ {currentConfig.executionCount.toString()}{" "}
                                cycle
                                {Number(currentConfig.executionCount) !== 1
                                  ? "s"
                                  : ""}{" "}
                                completed
                              </p>
                            )}
                            {currentConfig.planStatus === "Active" &&
                              currentConfig.nextCycleTimestamp > 0 && (
                                <p className="body-brutal text-xs text-blue-800 mt-1">
                                  Next cycle:{" "}
                                  {new Date(
                                    currentConfig.nextCycleTimestamp * 1000
                                  ).toLocaleString()}
                                </p>
                              )}
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-bold border-2 border-black ${
                              currentConfig.planStatus === "Active"
                                ? "bg-green-200"
                                : currentConfig.planStatus === "Cancelled"
                                ? "bg-gray-200"
                                : currentConfig.planStatus === "Error"
                                ? "bg-red-200"
                                : "bg-yellow-200"
                            }`}
                          >
                            {currentConfig.planStatus.toUpperCase()}
                          </span>
                        </div>

                        {/* Error Message */}
                        {currentConfig.planStatus === "Error" &&
                          currentConfig.errorMessage && (
                            <div className="bg-red-100 border-l-4 border-red-500 p-3 mb-4">
                              <p className="body-brutal text-xs text-red-900 font-bold">
                                Error Details:
                              </p>
                              <p className="body-brutal text-xs text-red-800 mt-1">
                                {currentConfig.errorMessage}
                              </p>
                            </div>
                          )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {/* EXECUTE NOW - only if Active */}
                          {currentConfig.planStatus === "Active" && (
                            <button
                              onClick={handleExecuteAutoReinvest}
                              disabled={autoReinvestLoading}
                              className="flex-1 button-brutal py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {autoReinvestLoading
                                ? "PROCESSING..."
                                : "EXECUTE NOW"}
                            </button>
                          )}

                          {/* CANCEL - only if Active */}
                          {currentConfig.planStatus === "Active" && (
                            <button
                              onClick={handleCancelAutoReinvest}
                              disabled={autoReinvestLoading}
                              className="flex-1 button-brutal py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {autoReinvestLoading ? "PROCESSING..." : "CANCEL"}
                            </button>
                          )}

                          {/* RETRY - only if Error */}
                          {currentConfig.planStatus === "Error" && (
                            <>
                              <button
                                onClick={handleRetryPlan}
                                disabled={autoReinvestLoading}
                                className="flex-1 button-brutal py-2 bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                {autoReinvestLoading
                                  ? "RETRYING..."
                                  : "RETRY PLAN"}
                              </button>
                              <button
                                onClick={handleCancelAutoReinvest}
                                disabled={autoReinvestLoading}
                                className="flex-1 button-brutal py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                CANCEL
                              </button>
                            </>
                          )}

                          {/* RE-SCHEDULE - if Cancelled or Error */}
                          {(currentConfig.planStatus === "Cancelled" ||
                            currentConfig.planStatus === "Error") && (
                            <button
                              onClick={() => {
                                setNewLockDuration("2592000");
                                handleScheduleAutoReinvest();
                              }}
                              disabled={autoReinvestLoading}
                              className="flex-1 button-brutal py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {autoReinvestLoading
                                ? "SCHEDULING..."
                                : "RE-SCHEDULE"}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="card-brutal p-6 bg-gray-50 border-gray-300">
                        <p className="body-brutal text-sm text-gray-700 font-bold mb-2 flex items-center">
                          <Calendar className="w-5 h-5 inline-block mr-2" /> NO
                          PLAN YET
                        </p>
                        <p className="body-brutal text-sm text-gray-600">
                          Create a plan below to enable automatic multi-cycle
                          reinvestment.
                        </p>
                      </div>
                    )}

                    {/* Schedule/Update Plan Form */}
                    <div className="card-brutal p-6">
                      <h4 className="heading-brutal text-md mb-4">
                        {currentConfig &&
                        currentConfig.planStatus !== "Error" &&
                        currentConfig.planStatus !== "Cancelled"
                          ? "UPDATE PLAN"
                          : "CREATE AUTO-REINVEST PLAN"}
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="body-brutal text-sm font-bold mb-2 block">
                            LOCK DURATION FOR EACH CYCLE
                          </label>
                          <select
                            value={newLockDuration}
                            onChange={(e) => setNewLockDuration(e.target.value)}
                            className="input-brutal w-full"
                            disabled={autoReinvestLoading}
                          >
                            <option value="2592000">
                              30 days (2.5% APY) - Quick Cycles
                            </option>
                            <option value="7776000">
                              90 days (5% APY) - Balanced
                            </option>
                            <option value="15552000">
                              180 days (7.5% APY) - Long Term
                            </option>
                            <option value="31536000">
                              365 days (10% APY) - Maximum Gains
                            </option>
                          </select>
                        </div>

                        <button
                          onClick={handleScheduleAutoReinvest}
                          disabled={autoReinvestLoading}
                          className="button-brutal accent w-full py-3 font-bold disabled:opacity-50"
                        >
                          {autoReinvestLoading
                            ? "PROCESSING..."
                            : currentConfig &&
                              currentConfig.planStatus !== "Error" &&
                              currentConfig.planStatus !== "Cancelled"
                            ? "UPDATE PLAN"
                            : "SCHEDULE PLAN"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "advanced" && (
              <AdvancedActionsSection vaultId={BigInt(vault.id)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
