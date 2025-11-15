"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useAutoReinvest } from "@/hooks/ironclad/useAutoReinvest";
import { useVaults } from "@/hooks/ironclad/useVaults";

export default function AccessMain() {
  const { isConnected } = useWallet();
  const {
    configs,
    loading: configsLoading,
    error: configsError,
    schedule,
    cancel,
    execute,
  } = useAutoReinvest();
  const { vaults, loading: vaultsLoading } = useVaults();

  const [selectedVaultId, setSelectedVaultId] = useState<string>("");
  const [newLockDuration, setNewLockDuration] = useState<string>("2592000"); // 30 days default
  const [scheduling, setScheduling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSchedule = async () => {
    if (!selectedVaultId || !newLockDuration) {
      return; // Frontend validation handled by form
    }

    setScheduling(true);
    setSuccessMessage(null);
    try {
      const success = await schedule(
        BigInt(selectedVaultId),
        BigInt(newLockDuration)
      );
      if (success) {
        setSuccessMessage("Auto-reinvest scheduled successfully!");
        setSelectedVaultId("");
        setNewLockDuration("2592000");
      }
    } catch (err) {
      console.error("Schedule failed:", err);
    } finally {
      setScheduling(false);
    }
  };

  const handleCancel = async (vaultId: bigint) => {
    if (
      !confirm("Are you sure you want to cancel auto-reinvest for this vault?")
    ) {
      return;
    }

    await cancel(vaultId);
  };

  const handleExecute = async (vaultId: bigint) => {
    if (
      !confirm(
        "Are you sure you want to execute auto-reinvest for this vault now?"
      )
    ) {
      return;
    }

    await execute(vaultId);
  };

  if (!isConnected) {
    return (
      <div className="card-brutal p-8 text-center">
        <h2 className="heading-brutal text-2xl mb-4">CONNECT YOUR WALLET</h2>
        <p className="body-brutal text-lg text-gray-600">
          Please connect your wallet to manage auto-reinvest.
        </p>
      </div>
    );
  }

  if (configsLoading || vaultsLoading) {
    return (
      <div className="card-brutal p-8 text-center">
        <p className="body-brutal text-lg text-gray-600">
          Loading auto-reinvest configurations...
        </p>
      </div>
    );
  }

  if (configsError) {
    return (
      <div className="card-brutal p-8 bg-red-50 border-red-300">
        <h2 className="heading-brutal text-lg text-red-900 mb-2">ERROR</h2>
        <p className="body-brutal text-sm text-red-800">{configsError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Success Message */}
      {successMessage && (
        <div className="card-brutal p-4 bg-green-50 border-green-300">
          <p className="body-brutal font-bold text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Schedule New Auto-Reinvest */}
      <div className="card-brutal p-8">
        <h1 className="heading-brutal text-3xl mb-6">SCHEDULE AUTO-REINVEST</h1>

        <div className="space-y-4">
          <div>
            <label className="body-brutal text-sm font-bold mb-2 block">
              SELECT VAULT
            </label>
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="input-brutal"
            >
              <option value="">-- Select a vault --</option>
              {vaults.map((vault) => (
                <option key={vault.id.toString()} value={vault.id.toString()}>
                  Vault {vault.id.toString().slice(0, 8)} -{" "}
                  {Number(vault.balance) / 100_000_000} BTC
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="body-brutal text-sm font-bold mb-2 block">
              NEW LOCK DURATION
            </label>
            <select
              value={newLockDuration}
              onChange={(e) => setNewLockDuration(e.target.value)}
              className="input-brutal"
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
            className="button-brutal accent w-full"
          >
            {scheduling ? "SCHEDULING..." : "SCHEDULE AUTO-REINVEST"}
          </button>
        </div>
      </div>

      {/* Active Configurations */}
      <div className="card-brutal p-8">
        <h2 className="heading-brutal text-2xl mb-6">
          ACTIVE AUTO-REINVEST CONFIGS
        </h2>

        {configs.length === 0 ? (
          <p className="body-brutal text-gray-600">
            No active auto-reinvest configurations.
          </p>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <div
                key={config.vault_id.toString()}
                className="card-brutal p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="body-brutal font-bold">
                      Vault ID: {config.vault_id.toString()}
                    </p>
                    <p className="body-brutal text-sm text-gray-600">
                      New Lock Duration:{" "}
                      {Number(config.new_lock_duration) / 86400} days
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold border-2 border-black ${
                      config.enabled ? "bg-green-200" : "bg-gray-200"
                    }`}
                  >
                    {config.enabled ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExecute(config.vault_id)}
                    disabled={!config.enabled}
                    className="flex-1 button-brutal bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    EXECUTE NOW
                  </button>
                  <button
                    onClick={() => handleCancel(config.vault_id)}
                    className="flex-1 button-brutal bg-red-600 text-white hover:bg-red-700"
                  >
                    CANCEL
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
