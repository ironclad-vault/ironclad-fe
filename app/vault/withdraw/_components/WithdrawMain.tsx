"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/components/wallet/useWallet";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import { getWithdrawableVaults, previewWithdraw } from "@/lib/ironclad-service";
import type { VaultDTO } from "@/lib/ironclad-service";
import InfoBox from "@/app/vault/_components/InfoBox";
import { ArrowDownRight, AlertCircle, CheckCircle } from "lucide-react";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleWithdrawClick = () => {
    setValidationError(null);

    if (!selectedVaultId) {
      setValidationError("Please select a vault");
      return;
    }

    if (!withdrawAmount) {
      setValidationError("Please enter an amount");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationError("Please enter a valid amount");
      return;
    }

    if (previewAmount !== null) {
      const maxAmount = Number(previewAmount) / 100_000_000;
      if (amount > maxAmount) {
        setValidationError(`Maximum available: ${maxAmount.toFixed(8)} BTC`);
        return;
      }
    }

    setShowConfirm(true);
  };

  const handleConfirmWithdraw = async () => {
    setShowConfirm(false);
    setSuccessMessage(null);
    setValidationError(null);

    if (!selectedVaultId || !withdrawAmount) return;

    const amountSats = BigInt(
      Math.floor(parseFloat(withdrawAmount) * 100_000_000)
    );

    try {
      const result = await withdrawVault(BigInt(selectedVaultId), amountSats);
      if (result) {
        setSuccessMessage(
          `Successfully withdrawn ${withdrawAmount} BTC! Redirecting...`
        );
        setTimeout(() => {
          router.push("/vault");
        }, 2000);
      }
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Withdrawal failed"
      );
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
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="card-brutal p-6 bg-green-50 border-green-300">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
            <div>
              <p className="heading-brutal text-green-900 mb-1">SUCCESS</p>
              <p className="body-brutal text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="card-brutal p-6 bg-red-50 border-red-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-1" size={20} />
            <div>
              <p className="heading-brutal text-red-900 mb-1">ERROR</p>
              <p className="body-brutal text-red-800">{validationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Withdraw Card */}
      <div className="card-brutal p-8">
        <div className="flex items-center gap-3 mb-6">
          <ArrowDownRight className="text-accent" size={28} />
          <h1 className="heading-brutal text-3xl">WITHDRAW</h1>
        </div>

        <div className="space-y-6">
          {/* Vault Selection */}
          <div>
            <label className="body-brutal text-sm font-bold mb-3 block">
              SELECT VAULT
            </label>
            <select
              value={selectedVaultId}
              onChange={(e) => {
                setSelectedVaultId(e.target.value);
                setValidationError(null);
              }}
              className="input-brutal w-full"
            >
              <option value="">-- Select a vault --</option>
              {vaults.map((vault) => (
                <option key={vault.id.toString()} value={vault.id.toString()}>
                  Vault {vault.id.toString().slice(0, 8)} -{" "}
                  {(Number(vault.balance) / 100_000_000).toFixed(8)} BTC
                </option>
              ))}
            </select>
          </div>

          {/* Preview Amount */}
          {previewAmount !== null && (
            <div className="card-brutal p-6 bg-blue-50 border-blue-300">
              <p className="body-brutal text-xs text-blue-600 uppercase font-bold mb-2">
                Available to Withdraw
              </p>
              <p className="heading-brutal text-3xl text-blue-900">
                {(Number(previewAmount) / 100_000_000).toFixed(8)} BTC
              </p>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="body-brutal text-sm font-bold mb-3 block">
              AMOUNT (BTC)
            </label>
            <input
              type="number"
              step="0.00000001"
              min="0"
              value={withdrawAmount}
              onChange={(e) => {
                setWithdrawAmount(e.target.value);
                setValidationError(null);
              }}
              placeholder="0.00000000"
              className="input-brutal w-full"
              disabled={!selectedVaultId}
            />
            <p className="body-brutal text-xs text-gray-600 mt-2">
              Enter the amount you want to withdraw
            </p>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={handleWithdrawClick}
            disabled={!selectedVaultId || !withdrawAmount || withdrawing}
            className="button-brutal accent w-full py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawing ? "PROCESSING..." : "WITHDRAW"}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <InfoBox title="WITHDRAWAL INFORMATION">
        <p className="body-brutal mb-3">
          Withdraw your funds from an unlocked or withdrawable vault. The amount
          will be sent to your connected wallet.
        </p>
        <ul className="body-brutal text-sm text-gray-600 space-y-2">
          <li>• Ensure the vault is in a withdrawable state</li>
          <li>• Check the available amount before withdrawing</li>
          <li>• Withdrawals are processed immediately</li>
          <li>• You can only withdraw the balance shown above</li>
        </ul>
      </InfoBox>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-brutal bg-white p-8 max-w-md w-full">
            <h2 className="heading-brutal text-2xl mb-4">CONFIRM WITHDRAWAL</h2>
            <div className="space-y-4 mb-6">
              <div className="card-brutal p-4 bg-gray-50">
                <p className="body-brutal text-xs text-gray-600 uppercase mb-1">
                  Amount
                </p>
                <p className="heading-brutal text-2xl">
                  {withdrawAmount} BTC
                </p>
              </div>
              <p className="body-brutal text-sm">
                Are you sure you want to withdraw {withdrawAmount} BTC from this
                vault?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 button-brutal py-2 bg-gray-300 text-gray-900 hover:bg-gray-400"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmWithdraw}
                className="flex-1 button-brutal py-2 bg-green-600 text-white hover:bg-green-700"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
