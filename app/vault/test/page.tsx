"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useVaults } from "@/hooks/ironclad/useVaults";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import { useAutoReinvest } from "@/hooks/ironclad/useAutoReinvest";
import { useMarketplace } from "@/hooks/ironclad/useMarketplace";
import VaultHeader from "@/components/layout/VaultHeader";
import TransitionWrapper from "../../transition-wrapper";
import { RootKeyWarning } from "@/components/wallet/RootKeyWarning";

export default function TestPage() {
  const { isConnected, principal, walletType } = useWallet();
  const {
    vaults,
    loading: vaultsLoading,
    error: vaultsError,
    refetch,
  } = useVaults();

  const {
    createVault,
    mockDeposit,
    loading: actionLoading,
    error: actionError,
  } = useVaultActions();

  const {
    configs,
    schedule,
    cancel: cancelReinvest,
    loading: autoReinvestLoading,
    error: autoReinvestError,
  } = useAutoReinvest();

  const {
    listings,
    createListing,
    loading: marketplaceLoading,
    error: marketplaceError,
  } = useMarketplace();

  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [lockDays, setLockDays] = useState(7);
  const [depositAmount, setDepositAmount] = useState(100000);

  const addResult = (test: string, result: string) => {
    setTestResults((prev) => ({ ...prev, [test]: result }));
  };

  const testCreateVault = async () => {
    try {
      const result = await createVault(lockDays, BigInt(depositAmount));
      if (result) {
        addResult(
          "createVault",
          `✅ Success: Vault ID ${result.id.toString()}`
        );
        refetch();
      } else {
        addResult("createVault", `❌ Failed: No vault returned`);
      }
    } catch (err) {
      addResult("createVault", `❌ Error: ${err}`);
    }
  };

  const testMockDeposit = async (vaultId: bigint, amount: bigint) => {
    try {
      const result = await mockDeposit(vaultId, amount);
      if (result) {
        addResult(
          "mockDeposit",
          `✅ Success: Deposited ${amount} sats to vault ${vaultId}`
        );
        refetch();
      } else {
        addResult("mockDeposit", `❌ Failed: No result returned`);
      }
    } catch (err) {
      addResult("mockDeposit", `❌ Error: ${err}`);
    }
  };

  const testScheduleReinvest = async (
    vaultId: bigint,
    lockDuration: bigint
  ) => {
    try {
      const result = await schedule(vaultId, lockDuration);
      addResult(
        "scheduleReinvest",
        result ? `✅ Scheduled for vault ${vaultId}` : `❌ Failed`
      );
    } catch (err) {
      addResult("scheduleReinvest", `❌ Error: ${err}`);
    }
  };

  const testCreateListing = async (vaultId: bigint, price: bigint) => {
    try {
      const result = await createListing(vaultId, price);
      addResult(
        "createListing",
        result ? `✅ Listing created for vault ${vaultId}` : `❌ Failed`
      );
    } catch (err) {
      addResult("createListing", `❌ Error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <RootKeyWarning />
      <TransitionWrapper>
        <VaultHeader />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-6xl">
            <h1 className="heading-brutal text-4xl mb-8">
              🧪 FEATURE TESTING DASHBOARD
            </h1>

            {/* Connection Status */}
            <div className="card-brutal mb-6 p-6">
              <h2 className="heading-brutal text-2xl mb-4">
                CONNECTION STATUS
              </h2>
              <div className="grid grid-cols-2 gap-4 body-brutal">
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p
                    className={`text-lg font-bold ${
                      isConnected ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isConnected ? "✅ Connected" : "❌ Not Connected"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Wallet Type:</p>
                  <p className="text-lg font-bold">{walletType || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Principal:</p>
                  <p className="text-sm font-mono">
                    {principal?.toString() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Actor:</p>
                  <p className="text-lg font-bold">
                    Anonymous (Phase 1)
                  </p>
                </div>
              </div>
            </div>

            {!isConnected ? (
              <div className="card-brutal p-8 text-center">
                <p className="body-brutal text-lg">
                  Please connect your wallet to test features
                </p>
              </div>
            ) : (
              <>
                {/* Vaults Overview */}
                <div className="card-brutal mb-6 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="heading-brutal text-2xl">YOUR VAULTS</h2>
                    <button
                      onClick={refetch}
                      disabled={vaultsLoading}
                      className="button-brutal px-4 py-2 text-sm"
                    >
                      {vaultsLoading ? "Loading..." : "Refresh"}
                    </button>
                  </div>
                  {vaultsError && (
                    <p className="text-red-600 mb-2">{vaultsError}</p>
                  )}
                  <div className="body-brutal">
                    <p className="mb-2">Total Vaults: {vaults.length}</p>
                    {vaults.length > 0 && (
                      <div className="space-y-2">
                        {vaults.map((vault) => (
                          <div
                            key={vault.id.toString()}
                            className="p-3 bg-gray-50 border border-gray-200 rounded"
                          >
                            <p className="font-bold">
                              Vault #{vault.id.toString()}
                            </p>
                            <p className="text-sm">Status: {vault.status.toString()}</p>
                            <p className="text-sm">
                              Balance: {vault.balance.toString()} sats
                            </p>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() =>
                                  testMockDeposit(vault.id, BigInt(50000))
                                }
                                className="button-brutal px-3 py-1 text-xs bg-blue-600 text-white"
                              >
                                Mock Deposit (50k sats)
                              </button>
                              <button
                                onClick={() =>
                                  testScheduleReinvest(
                                    vault.id,
                                    BigInt(7 * 24 * 3600)
                                  )
                                }
                                className="button-brutal px-3 py-1 text-xs bg-green-600 text-white"
                              >
                                Schedule Reinvest (7d)
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Create Vault Test */}
                <div className="card-brutal mb-6 p-6">
                  <h2 className="heading-brutal text-2xl mb-4">
                    🔐 TEST CREATE VAULT
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block body-brutal mb-2">
                        Lock Days:
                      </label>
                      <input
                        type="number"
                        value={lockDays}
                        onChange={(e) => setLockDays(Number(e.target.value))}
                        className="w-full p-2 border-2 border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block body-brutal mb-2">
                        Expected Deposit (sats):
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) =>
                          setDepositAmount(Number(e.target.value))
                        }
                        className="w-full p-2 border-2 border-gray-300"
                      />
                    </div>
                    <button
                      onClick={testCreateVault}
                      disabled={actionLoading}
                      className="button-brutal w-full py-2 bg-blue-600 text-white"
                    >
                      {actionLoading ? "Creating..." : "Create Vault"}
                    </button>
                    {actionError && (
                      <p className="text-red-600 text-sm">{actionError}</p>
                    )}
                  </div>
                </div>

                {/* Auto-Reinvest Test */}
                <div className="card-brutal mb-6 p-6">
                  <h2 className="heading-brutal text-2xl mb-4">
                    ♻️ AUTO-REINVEST CONFIGS
                  </h2>
                  <div className="body-brutal mb-4">
                    {autoReinvestLoading && <p>Loading configs...</p>}
                    {autoReinvestError && (
                      <p className="text-red-600">{autoReinvestError}</p>
                    )}
                    <p className="mb-2">Active Configs: {configs.length}</p>
                    {configs.length > 0 && (
                      <div className="space-y-2">
                        {configs.map((config) => (
                          <div
                            key={config.vault_id.toString()}
                            className="p-3 bg-gray-50 border border-gray-200 rounded"
                          >
                            <p className="font-bold">
                              Vault #{config.vault_id.toString()}
                            </p>
                            <p className="text-sm">
                              Enabled: {config.enabled ? "✅" : "❌"}
                            </p>
                            <p className="text-sm">
                              New Lock Duration:{" "}
                              {config.new_lock_duration.toString()}s
                            </p>
                              <button
                                onClick={() => cancelReinvest(config.vault_id)}
                                className="button-brutal mt-2 px-3 py-1 text-xs bg-red-600 text-white"
                              >
                                Cancel
                              </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="body-brutal text-sm text-gray-600">
                    Use the &ldquo;Schedule Reinvest&rdquo; button on individual
                    vaults above
                  </p>
                </div>

                {/* Marketplace Test */}
                <div className="card-brutal mb-6 p-6">
                  <h2 className="heading-brutal text-2xl mb-4">
                    🏪 TEST MARKETPLACE
                  </h2>
                  <div className="body-brutal mb-4">
                    {marketplaceLoading && <p>Loading listings...</p>}
                    {marketplaceError && (
                      <p className="text-red-600">{marketplaceError}</p>
                    )}
                    <p>Active Listings: {listings.length}</p>
                    {listings.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {listings.map((listing) => (
                          <div
                            key={listing.id.toString()}
                            className="p-3 bg-gray-50 border border-gray-200 rounded"
                          >
                            <p className="font-bold">
                              Listing #{listing.id.toString()}
                            </p>
                            <p className="text-sm">
                              Vault: #{listing.vault_id.toString()}
                            </p>
                            <p className="text-sm">
                              Price: {listing.price_sats.toString()} sats
                            </p>
                            <p className="text-sm">Seller: {listing.seller.toString()}</p>
                            <p className="text-sm">Status: {listing.status.toString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {vaults.length > 0 && (
                    <button
                      onClick={() =>
                        testCreateListing(vaults[0].id, BigInt(1000000))
                      }
                      className="button-brutal w-full py-2 bg-purple-600 text-white"
                    >
                      Create Test Listing (First Vault, 1M sats)
                    </button>
                  )}
                </div>

                {/* Test Results */}
                <div className="card-brutal p-6">
                  <h2 className="heading-brutal text-2xl mb-4">
                    📊 TEST RESULTS
                  </h2>
                  <div className="body-brutal space-y-2">
                    {Object.keys(testResults).length === 0 ? (
                      <p className="text-gray-600">No tests run yet</p>
                    ) : (
                      Object.entries(testResults).map(([test, result]) => (
                        <div
                          key={test}
                          className="p-3 bg-gray-50 border border-gray-200 rounded"
                        >
                          <p className="font-bold">{test}:</p>
                          <p className="text-sm">{result}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {Object.keys(testResults).length > 0 && (
                    <button
                      onClick={() => setTestResults({})}
                      className="button-brutal mt-4 px-4 py-2 text-sm"
                    >
                      Clear Results
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </TransitionWrapper>
    </div>
  );
}
