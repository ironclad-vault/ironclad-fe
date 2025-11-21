"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import { useVaults } from "@/hooks/ironclad/useVaults";
import { isVaultUnlockable } from "@/lib/vaultUtils";
import { previewWithdraw } from "@/lib/ironclad-service";
import TransitionButton from "@/components/navigation/TransitionButton";
import { ArrowDownRight } from "lucide-react";
import toast from "react-hot-toast";

export default function WithdrawVaultsMain() {
  const { isConnected } = useWallet();
  const { withdrawVault, loading: actionLoading } = useVaultActions();
  const {
    vaults,
    loading: vaultsLoading,
    error: vaultsError,
    refetch,
  } = useVaults();

  const withdrawableVaults = useMemo(
    () => vaults?.filter((vault) => isVaultUnlockable(vault)) || [],
    [vaults]
  );

  const [selectedVaultId, setSelectedVaultId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [previewAmount, setPreviewAmount] = useState<bigint | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVaultSelect = async (vaultId: string) => {
    setSelectedVaultId(vaultId);
    setWithdrawAmount("");
    setPreviewAmount(null);

    if (!vaultId) return;

    try {
      const preview = await previewWithdraw({
        vaultId: BigInt(vaultId),
      });
      setPreviewAmount(preview);
    } catch (err) {
      let message = "Failed to preview withdrawal amount";

      if (err instanceof Error) {
        // Check if error is about vault not being unlockable
        if (
          err.message.toLowerCase().includes("not unlockable") ||
          err.message.toLowerCase().includes("locked")
        ) {
          message =
            "This vault needs to be unlocked first. Please visit the vault details page to unlock it before withdrawing.";
        } else {
          message = err.message;
        }
      }

      toast.error(message, { duration: 5000 });

      // Reset selection if vault is not unlockable
      setSelectedVaultId("");
    }
  };

  const handleWithdrawClick = () => {
    if (!selectedVaultId) {
      toast.error("Please select a vault");
      return;
    }

    if (!withdrawAmount) {
      toast.error("Please enter an amount");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (previewAmount !== null) {
      const maxAmount = Number(previewAmount) / 100_000_000;
      if (amount > maxAmount) {
        toast.error(`Maximum available: ${maxAmount.toFixed(8)} BTC`);
        return;
      }
    }

    setShowConfirm(true);
  };

  const handleConfirmWithdraw = async () => {
    setShowConfirm(false);

    if (!selectedVaultId || !withdrawAmount) return;

    const amountSats = BigInt(
      Math.floor(parseFloat(withdrawAmount) * 100_000_000)
    );

    try {
      await toast.promise(withdrawVault(BigInt(selectedVaultId), amountSats), {
        loading: `Withdrawing ${withdrawAmount} BTC...`,
        success: `Successfully withdrawn ${withdrawAmount} BTC!`,
        error: "Withdrawal failed. Please try again.",
      });

      // Reset form and refetch vaults after successful withdrawal
      setSelectedVaultId("");
      setWithdrawAmount("");
      setPreviewAmount(null);
      refetch();
    } catch (err) {
      // Error already handled by toast.promise
      console.error("Withdraw error:", err);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6">
        <div className="card-pro p-8 text-center">
          <h2 className="text-heading text-3xl mb-4!">CONNECT YOUR WALLET</h2>
          <p className="text-body text-lg text-accent">
            Please connect your wallet to withdraw from vaults.
          </p>
        </div>
      </div>
    );
  }

  if (vaultsLoading) {
    return (
      <div className="container mx-auto px-6">
        <div className="card-pro p-8 text-center">
          <p className="text-body text-lg text-accent">
            Loading withdrawable vaults...
          </p>
        </div>
      </div>
    );
  }

  if (vaultsError) {
    return (
      <div className="container mx-auto px-6">
        <div className="card-pro border-red-500 p-8 bg-red-50">
          <h2 className="text-heading text-2xl text-red-900 mb-2!">ERROR</h2>
          <p className="text-body text-sm text-red-800">{vaultsError}</p>
        </div>
      </div>
    );
  }

  if (withdrawableVaults.length === 0) {
    return (
      <div className="container mx-auto px-6">
        <div className="card-pro p-8 text-center">
          <h2 className="text-heading text-3xl mb-4!">NO WITHDRAWABLE VAULTS</h2>
          <p className="text-body text-lg text-accent mb-8!">
            You don&apos;t have any vaults ready for withdrawal.
          </p>
          <div className="card-pro border-blue-400 p-6 bg-blue-50 mb-8!">
            <p className="text-body text-sm text-accent mb-2! font-bold">
              💡 <strong>Need to withdraw?</strong>
            </p>
            <p className="text-body text-sm text-accent">
              If you have locked vaults, visit <strong>My Vaults</strong> page
              to unlock them first. Once unlocked, they will appear here for
              withdrawal.
            </p>
          </div>
          <TransitionButton
            href="/vault"
            suppressTransition
            className="btn-pro accent px-8 py-4 text-lg font-bold hover-lift"
          >
            GO TO MY VAULTS
          </TransitionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 bg-background min-h-screen py-8">
      <div>
        {/* Main Withdraw Card */}
        <div className="card-pro p-8">
          <div className="flex items-center gap-3 mb-6! pb-4 border-b-2 border-accent">
            <ArrowDownRight className="text-accent w-8 h-8 font-bold" />
            <h1 className="text-heading text-4xl">WITHDRAW</h1>
          </div>

          <div className="space-y-6">
            {/* Vault Selection */}
            <div>
              <label className="text-body text-sm font-bold mb-3! block">
                SELECT VAULT
              </label>
              <select
                value={selectedVaultId}
                onChange={(e) => handleVaultSelect(e.target.value)}
                className="input-brutal w-full"
              >
                <option value="">-- Select a vault --</option>
                {withdrawableVaults.map((vault) => (
                  <option key={vault.id.toString()} value={vault.id.toString()}>
                    Vault #{vault.id.toString()} -{" "}
                    {(Number(vault.balance) / 100_000_000).toFixed(8)} BTC
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Amount */}
            {previewAmount !== null && (
              <div className="card-pro p-6 bg-blue-50 border-blue-300">
                <p className="text-body text-xs text-blue-600 font-bold mb-2!">
                  Available to Withdraw
                </p>
                <p className="text-heading text-3xl text-accent">
                  {(Number(previewAmount) / 100_000_000).toFixed(8)} BTC
                </p>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="text-body text-sm font-bold mb-3! block">
                AMOUNT (BTC)
              </label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00000000"
                className="input-brutal w-full"
                disabled={!selectedVaultId}
              />
              <p className="text-body text-xs text-gray-400 mt-2">
                Enter the amount you want to withdraw
              </p>
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdrawClick}
              disabled={!selectedVaultId || !withdrawAmount || actionLoading}
              className="btn-pro accent w-full py-4 text-lg font-bold hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "PROCESSING..." : "WITHDRAW"}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="card-pro p-8 mt-8 bg-gray-50">
          <h3 className="text-heading text-2xl mb-4!">WITHDRAWAL INFORMATION</h3>
          <p className="text-body text-sm text-accent mb-4!">
            Withdraw your funds from an unlocked vault. The amount will be sent
            to your connected wallet.
          </p>
          <ul className="text-body text-sm text-gray-400 space-y-2">
            <li>✓ Vault must be unlocked before withdrawal</li>
            <li>✓ Visit vault details page to unlock locked vaults</li>
            <li>✓ Check the available amount before withdrawing</li>
            <li>✓ Withdrawals are processed immediately</li>
            <li>✓ You can only withdraw the balance shown above</li>
          </ul>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card-pro bg-white p-8 max-w-md w-full">
              <h2 className="text-heading text-3xl mb-6!">CONFIRM WITHDRAWAL</h2>
              <div className="space-y-4 mb-8!">
                <div className="card-pro p-6 bg-gray-50">
                  <p className="text-body text-xs text-gray-400 mb-2! font-bold">
                    Amount
                  </p>
                  <p className="text-heading text-3xl">{withdrawAmount} BTC</p>
                </div>
                <p className="text-body text-sm text-gray-700">
                  Are you sure you want to withdraw {withdrawAmount} BTC from
                  this vault?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 btn-pro py-3 font-bold hover-lift"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmWithdraw}
                  className="flex-1 btn-pro accent py-3 font-bold hover-lift disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? "PROCESSING..." : "CONFIRM"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
