"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/components/wallet/useWallet";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import { getWithdrawableVaults, previewWithdraw } from "@/lib/ironclad-service";
import type { VaultDTO } from "@/lib/ironclad-service";

export default function WithdrawMain() {
  const router = useRouter();
  const { isConnected, principal } = useWallet();
  const { withdrawVault, loading: withdrawing } = useVaultActions();

  const [vaults, setVaults] = useState<VaultDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVaultId, setSelectedVaultId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [previewAmount, setPreviewAmount] = useState<bigint | null>(null);

  useEffect(() => {
    if (!isConnected || !principal) {
      setLoading(false);
      return;
    }

    const fetchVaults = async () => {
      try {
        setLoading(true);
        setError(null);
        const withdrawableVaults = await getWithdrawableVaults();
        setVaults(withdrawableVaults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch vaults");
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, [isConnected, principal]);

  useEffect(() => {
    if (!selectedVaultId) {
      setPreviewAmount(null);
      return;
    }

    const fetchPreview = async () => {
      try {
        const preview = await previewWithdraw({ vaultId: BigInt(selectedVaultId) });
        setPreviewAmount(preview);
      } catch (err) {
        console.error("Preview failed:", err);
        setPreviewAmount(null);
      }
    };

    fetchPreview();
  }, [selectedVaultId]);

  const handleWithdraw = async () => {
    if (!selectedVaultId || !withdrawAmount) {
      alert("Please select a vault and enter an amount");
      return;
    }

    const amountSats = BigInt(Math.floor(parseFloat(withdrawAmount) * 100_000_000));

    const result = await withdrawVault(BigInt(selectedVaultId), amountSats);
    if (result) {
      alert("Withdrawal successful!");
      router.push("/vault");
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to withdraw from vaults.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <p className="text-gray-600">Loading withdrawable vaults...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4">No Withdrawable Vaults</h2>
          <p className="text-gray-600">You don&apos;t have any vaults ready for withdrawal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="border-2 border-black p-8 bg-white">
        <h1 className="text-3xl font-bold mb-6">Withdraw from Vault</h1>

        <div className="space-y-6">
          {/* Vault Selection */}
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

          {/* Preview Amount */}
          {previewAmount !== null && (
            <div className="border-2 border-black p-4 bg-gray-50">
              <p className="text-sm font-bold mb-1">Available to Withdraw</p>
              <p className="text-2xl font-bold">
                {Number(previewAmount) / 100_000_000} BTC
              </p>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-bold mb-2">Amount (BTC)</label>
            <input
              type="number"
              step="0.00000001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00000000"
              className="w-full border-2 border-black px-4 py-2"
              disabled={!selectedVaultId}
            />
          </div>

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={!selectedVaultId || !withdrawAmount || withdrawing}
            className="w-full bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {withdrawing ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}
