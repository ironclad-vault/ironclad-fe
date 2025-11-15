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
        const preview = await previewWithdraw({
          vaultId: BigInt(selectedVaultId),
        });
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

    const amountSats = BigInt(
      Math.floor(parseFloat(withdrawAmount) * 100_000_000)
    );

    const result = await withdrawVault(BigInt(selectedVaultId), amountSats);
    if (result) {
      alert("Withdrawal successful!");
      router.push("/vault");
    }
  };

  if (!isConnected) {
    return (
      <div className="card-brutal p-8 text-center">
        <h2 className="heading-brutal text-2xl mb-4">CONNECT YOUR WALLET</h2>
        <p className="body-brutal text-lg text-gray-600">
          Please connect your wallet to withdraw from vaults.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-brutal p-8 text-center">
        <p className="body-brutal text-lg text-gray-600">Loading withdrawable vaults...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-brutal p-8 bg-red-50 border-red-300">
        <h2 className="heading-brutal text-lg text-red-900 mb-2">ERROR</h2>
        <p className="body-brutal text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="card-brutal p-8 text-center">
        <h2 className="heading-brutal text-2xl mb-4">NO WITHDRAWABLE VAULTS</h2>
        <p className="body-brutal text-lg text-gray-600">
          You don&apos;t have any vaults ready for withdrawal.
        </p>
      </div>
    );
  }

  return (
    <div className="card-brutal p-8 max-w-2xl">
      <h1 className="heading-brutal text-3xl mb-6">WITHDRAW FROM VAULT</h1>

      <div className="space-y-6">
        {/* Vault Selection */}
        <div>
          <label className="body-brutal text-sm font-bold mb-2 block">SELECT VAULT</label>
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

        {/* Preview Amount */}
        {previewAmount !== null && (
          <div className="card-brutal p-4 bg-green-50 border-green-300">
            <p className="body-brutal text-sm font-bold mb-1">AVAILABLE TO WITHDRAW</p>
            <p className="text-2xl font-bold">
              {Number(previewAmount) / 100_000_000} BTC
            </p>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="body-brutal text-sm font-bold mb-2 block">AMOUNT (BTC)</label>
          <input
            type="number"
            step="0.00000001"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="0.00000000"
            className="input-brutal"
            disabled={!selectedVaultId}
          />
        </div>

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={!selectedVaultId || !withdrawAmount || withdrawing}
          className="button-brutal accent w-full"
        >
          {withdrawing ? "PROCESSING..." : "WITHDRAW"}
        </button>
      </div>
    </div>
  );
}
