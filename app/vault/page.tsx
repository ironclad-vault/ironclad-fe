"use client";

import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import TransitionWrapper from "../transition-wrapper";
import { useVaults } from "@/hooks/ironclad/useVaults";
import { useWallet } from "@/components/wallet/useWallet";
import { VaultStatusTS } from "@/lib/ironclad-service";
import type { Vault } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";
import TransitionButton from "@/components/navigation/TransitionButton";
import { Hourglass, Lock } from "lucide-react";

function VaultCard({ vault }: { vault: Vault }) {
  // Convert VaultStatus to VaultStatusTS
  const getVaultStatus = (vault: Vault): VaultStatusTS => {
    if ("ActiveLocked" in vault.status) return "ActiveLocked";
    if ("Unlockable" in vault.status) return "Unlockable";
    if ("Withdrawn" in vault.status) return "Withdrawn";
    if ("PendingDeposit" in vault.status) return "PendingDeposit";
    return "PendingDeposit"; // fallback
  };

  const getStatusColor = (status: VaultStatusTS) => {
    switch (status) {
      case "ActiveLocked":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "Unlockable":
        return "bg-green-100 text-green-900 border-green-300";
      case "Withdrawn":
        return "bg-gray-100 text-gray-900 border-gray-300";
      default:
        return "bg-yellow-100 text-yellow-900 border-yellow-300";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatSats = (sats: bigint) => {
    return sats.toLocaleString() + " sats";
  };

  return (
    <div className="card-brutal p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="heading-brutal text-xl">VAULT #{vault.id.toString()}</h3>
        <span
          className={`px-3 py-1 text-xs font-bold border-2 rounded ${getStatusColor(
            getVaultStatus(vault)
          )}`}
        >
          {getVaultStatus(vault)}
        </span>
      </div>

      <div className="space-y-3 body-brutal text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Balance:</span>
          <span className="font-bold">{formatSats(vault.balance)}</span>
        </div>

        {vault.expected_deposit && (
          <div className="flex justify-between">
            <span className="text-gray-600">Expected Deposit:</span>
            <span className="font-bold">
              {formatSats(vault.expected_deposit)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Lock Until:</span>
          <span className="font-bold">
            {formatDate(Number(vault.lock_until))}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">BTC Address:</span>
          <span className="font-mono text-xs">
            {vault.btc_address.slice(0, 12)}...
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {getVaultStatus(vault) === "Unlockable" && (
          <TransitionButton
            href="/vault/withdraw"
            suppressTransition
            className="flex-1 button-brutal py-2 text-sm bg-green-600 text-white hover:bg-green-700"
          >
            WITHDRAW
          </TransitionButton>
        )}
        {getVaultStatus(vault) === "PendingDeposit" && (
          <TransitionButton
            href="/vault/deposit"
            suppressTransition
            className="flex-1 button-brutal py-2 text-sm bg-blue-600 text-white hover:bg-blue-700"
          >
            COMPLETE DEPOSIT
          </TransitionButton>
        )}
        <TransitionButton
          href={`/vault/history?vaultId=${vault.id.toString()}`}
          suppressTransition
          className="flex-1 button-brutal py-2 text-sm border-2 border-gray-300 hover:bg-gray-50"
        >
          VIEW HISTORY
        </TransitionButton>
      </div>
    </div>
  );
}

export default function VaultPage() {
  const { isConnected } = useWallet();
  const { vaults, loading, error, refetch } = useVaults();

  // Helper function to get status string for filtering
  const getVaultStatusStr = (vault: Vault): string => {
    if ("ActiveLocked" in vault.status) return "ActiveLocked";
    if ("Unlockable" in vault.status) return "Unlockable";
    if ("Withdrawn" in vault.status) return "Withdrawn";
    if ("PendingDeposit" in vault.status) return "PendingDeposit";
    return "PendingDeposit";
  };

  // Filter vaults by status
  const activeVaults = vaults.filter(
    (v) => getVaultStatusStr(v) === "ActiveLocked"
  );
  const unlockableVaults = vaults.filter(
    (v) => getVaultStatusStr(v) === "Unlockable"
  );
  const pendingVaults = vaults.filter(
    (v) => getVaultStatusStr(v) === "PendingDeposit"
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TransitionWrapper>
        <VaultHeader />

        {/* Main Content */}
        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1 flex flex-col gap-8">
            <div className="container mx-auto px-6">
              {/* Wallet Connection Check */}
              {!isConnected ? (
                <div className="card-brutal p-8 text-center">
                  <h2 className="heading-brutal text-2xl mb-4">
                    CONNECT YOUR WALLET
                  </h2>
                  <p className="body-brutal text-lg text-gray-600 mb-6">
                    Connect your wallet to view and manage your vaults
                  </p>
                  <p className="body-brutal text-sm text-gray-500">
                    Click &quot;Connect Wallet&quot; in the header above
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="card-brutal mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h1 className="heading-brutal text-3xl mb-2">
                          YOUR VAULTS
                        </h1>
                        <p className="body-brutal text-lg text-gray-600">
                          {vaults.length}{" "}
                          {vaults.length === 1 ? "vault" : "vaults"} found
                        </p>
                      </div>
                      <button
                        onClick={refetch}
                        disabled={loading}
                        className="button-brutal px-4 py-2 border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {loading ? "REFRESHING..." : "REFRESH"}
                      </button>
                    </div>

                    <TransitionButton
                      href="/vault/deposit"
                      suppressTransition
                      className="button-brutal w-full py-3 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      + CREATE NEW VAULT
                    </TransitionButton>
                  </div>

                  {/* Loading State */}
                  {loading && vaults.length === 0 && (
                    <div className="card-brutal p-8 text-center">
                      <p className="body-brutal text-lg">Loading vaults...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="card-brutal p-6 bg-red-50 border-red-300">
                      <h3 className="heading-brutal text-lg text-red-900 mb-2">
                        ERROR
                      </h3>
                      <p className="body-brutal text-sm text-red-800">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && vaults.length === 0 && !error && (
                    <div className="card-brutal p-8 text-center">
                      <h2 className="heading-brutal text-2xl mb-4">
                        NO VAULTS YET
                      </h2>
                      <p className="body-brutal text-lg text-gray-600 mb-6">
                        Create your first vault to start securing your Bitcoin
                      </p>
                      <TransitionButton
                        href="/vault/deposit"
                        suppressTransition
                        className="button-brutal px-6 py-3 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        CREATE VAULT
                      </TransitionButton>
                    </div>
                  )}

                  {/* Vaults Grid */}
                  {!loading && vaults.length > 0 && (
                    <>
                      {/* Unlockable Vaults */}
                      {unlockableVaults.length > 0 && (
                        <div className="mb-8">
                          <h2 className="heading-brutal text-xl mb-4">
                            ⚡ UNLOCKABLE ({unlockableVaults.length})
                          </h2>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {unlockableVaults.map((vault) => (
                              <VaultCard
                                key={vault.id.toString()}
                                vault={vault}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Locked Vaults */}
                      {activeVaults.length > 0 && (
                        <div className="mb-8 flex flex-col gap-3">
                          <h2 className="heading-brutal text-xl flex flex-row gap-2 justify-start items-center mb-4">
                            <Lock className="inline-block" /> ACTIVE LOCKED (
                            {activeVaults.length})
                          </h2>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeVaults.map((vault) => (
                              <VaultCard
                                key={vault.id.toString()}
                                vault={vault}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pending Deposits */}
                      {pendingVaults.length > 0 && (
                        <div className="mb-8 flex flex-col gap-3">
                          <h2 className="heading-brutal text-xl flex flex-row gap-2 justify-start items-center mb-4">
                            <Hourglass className="inline-block" /> PENDING
                            DEPOSIT ({pendingVaults.length})
                          </h2>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingVaults.map((vault) => (
                              <VaultCard
                                key={vault.id.toString()}
                                vault={vault}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Stats */}
                      <div className="card-brutal p-6">
                        <h3 className="heading-brutal text-lg mb-4">
                          STATISTICS
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 body-brutal">
                          <div>
                            <p className="text-gray-600 text-sm">
                              Total Vaults
                            </p>
                            <p className="text-2xl font-bold">
                              {vaults.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">
                              Active Locked
                            </p>
                            <p className="text-2xl font-bold">
                              {activeVaults.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Unlockable</p>
                            <p className="text-2xl font-bold text-green-600">
                              {unlockableVaults.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Pending</p>
                            <p className="text-2xl font-bold">
                              {pendingVaults.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </main>
          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
