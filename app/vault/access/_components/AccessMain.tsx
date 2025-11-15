"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useAutoReinvest } from "@/hooks/ironclad/useAutoReinvest";
import { useVaults } from "@/hooks/ironclad/useVaults";

export default function AccessMain() {
  const { isConnected } = useWallet();
  const { configs, loading: configsLoading, error: configsError, schedule, cancel, execute } = useAutoReinvest();
  const { vaults, loading: vaultsLoading } = useVaults();

  const [selectedVaultId, setSelectedVaultId] = useState<string>("");
  const [newLockDuration, setNewLockDuration] = useState<string>("2592000"); // 30 days default
  const [scheduling, setScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!selectedVaultId || !newLockDuration) {
      alert("Please select a vault and lock duration");
      return;
    }

    setScheduling(true);
    try {
      await schedule(BigInt(selectedVaultId), BigInt(newLockDuration));
      alert("Auto-reinvest scheduled successfully!");
      setSelectedVaultId("");
      setNewLockDuration("2592000");
    } catch (err) {
      console.error("Schedule failed:", err);
    } finally {
      setScheduling(false);
    }
  };

  const handleCancel = async (vaultId: bigint) => {
    if (!confirm("Are you sure you want to cancel auto-reinvest for this vault?")) {
      return;
    }

    await cancel(vaultId);
  };

  const handleExecute = async (vaultId: bigint) => {
    if (!confirm("Are you sure you want to execute auto-reinvest for this vault now?")) {
      return;
    }

    await execute(vaultId);
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to manage auto-reinvest.</p>
        </div>
      </div>
    );
  }

  if (configsLoading || vaultsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <p className="text-gray-600">Loading auto-reinvest configurations...</p>
        </div>
      </div>
    );
  }

  if (configsError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{configsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Schedule New Auto-Reinvest */}
      <div className="border-2 border-black p-8 bg-white">
        <h1 className="text-3xl font-bold mb-6">Schedule Auto-Reinvest</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Select Vault</label>
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full border-2 border-black px-4 py-2 bg-white"
            >
              <option value="">-- Select a vault --</option>
              {vaults.map((vault) => (
                <option key={vault.id.toString()} value={vault.id.toString()}>
                  Vault {vault.id.toString().slice(0, 8)} - {Number(vault.balance) / 100_000_000} BTC
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">New Lock Duration</label>
            <select
              value={newLockDuration}
              onChange={(e) => setNewLockDuration(e.target.value)}
              className="w-full border-2 border-black px-4 py-2 bg-white"
            >
              <option value="2592000">30 days (2.5% APY)</option>
              <option value="7776000">90 days (5% APY)</option>
              <option value="15552000">180 days (7.5% APY)</option>
              <option value="31536000">365 days (10% APY)</option>
            </select>
          </div>

          <button
            onClick={handleSchedule}
            disabled={!selectedVaultId || scheduling}
            className="w-full bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {scheduling ? "Scheduling..." : "Schedule Auto-Reinvest"}
          </button>
        </div>
      </div>

      {/* Active Configurations */}
      <div className="border-2 border-black p-8 bg-white">
        <h2 className="text-2xl font-bold mb-6">Active Auto-Reinvest Configs</h2>

        {configs.length === 0 ? (
          <p className="text-gray-600">No active auto-reinvest configurations.</p>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <div key={config.vaultId.toString()} className="border-2 border-black p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">Vault ID: {config.vaultId.toString()}</p>
                    <p className="text-sm text-gray-600">
                      New Lock Duration: {Number(config.newLockDuration) / 86400} days
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold border-2 border-black ${
                    config.enabled ? "bg-green-200" : "bg-gray-200"
                  }`}>
                    {config.enabled ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExecute(config.vaultId)}
                    disabled={!config.enabled}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 font-bold border-2 border-black hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Execute Now
                  </button>
                  <button
                    onClick={() => handleCancel(config.vaultId)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 font-bold border-2 border-black hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
