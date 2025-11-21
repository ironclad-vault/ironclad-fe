"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import { useVaults } from "@/hooks/ironclad/useVaults";
import { isVaultUnlockable } from "@/lib/vaultUtils";
import { previewWithdraw } from "@/lib/ironclad-service";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import type { SignatureResponse } from "@/lib/ic/ironcladActor";
import TransitionButton from "@/components/navigation/TransitionButton";
import { ArrowDownRight, ShieldCheck, Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/toastUtils";

interface SecurityCheckState {
  step: "signing" | "verified";
  signature: SignatureResponse | null;
  message: string;
  loading: boolean;
  error: string | null;
}

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
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);
  const [securityState, setSecurityState] = useState<SecurityCheckState>({
    step: "signing",
    signature: null,
    message: "",
    loading: false,
    error: null,
  });

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
      setSelectedVaultId("");
    }
  };

  const handleWithdrawClick = () => {
    if (!selectedVaultId) {
      toast.error("Please select a position");
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

    // Open security check modal instead of confirmation modal
    setShowSecurityCheck(true);
    setSecurityState({
      step: "signing",
      signature: null,
      message: `Approve withdrawal of ${withdrawAmount} sats from Position #${selectedVaultId}`,
      loading: false,
      error: null,
    });
  };

  const handleSignApproval = async () => {
    setSecurityState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const messageBytes = new TextEncoder().encode(securityState.message);
      const result = await ironcladClient.btcSigning.requestSignature(
        BigInt(selectedVaultId),
        messageBytes
      );

      if ("Ok" in result) {
        setSecurityState((prev) => ({
          ...prev,
          step: "verified",
          signature: result.Ok,
          loading: false,
        }));
        toast.success("✅ Signature verified! Ready to withdraw.");
      } else {
        const errMsg = result.Err;
        setSecurityState((prev) => ({
          ...prev,
          loading: false,
          error: errMsg,
        }));
        toast.error(`Signature failed: ${errMsg}`);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setSecurityState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
      toast.error(`Signature request failed: ${msg}`);
      console.error("[WithdrawVaultsMain] Signature error:", err);
    }
  };

  const handleConfirmWithdraw = async () => {
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

      // Reset form and close modal
      setSelectedVaultId("");
      setWithdrawAmount("");
      setPreviewAmount(null);
      setShowSecurityCheck(false);
      setSecurityState({
        step: "signing",
        signature: null,
        message: "",
        loading: false,
        error: null,
      });
      refetch();
    } catch (err) {
      console.error("Withdraw error:", err);
    }
  };

  const truncateHex = (hex: string, maxLength: number = 24): string => {
    if (hex.length <= maxLength) return hex;
    const half = Math.floor(maxLength / 2);
    return hex.slice(0, half) + "..." + hex.slice(-half);
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
          <h2 className="text-heading text-3xl mb-4!">NO WITHDRAWABLE POSITIONS</h2>
          <p className="text-body text-lg text-accent mb-8!">
            No positions ready for withdrawal.
          </p>
          <div className="card-pro border-blue-400 p-6 bg-blue-50 mb-8!">
            <p className="text-body text-sm text-accent mb-2! font-bold">
              💡 <strong>Need to withdraw?</strong>
            </p>
            <p className="text-body text-sm text-accent">
              If you have locked positions, visit <strong>My Positions</strong> page
              to unlock them first. Once unlocked, they will appear here for
              withdrawal.
            </p>
          </div>
          <TransitionButton
            href="/vault"
            suppressTransition
            className="btn-pro accent px-8 py-4 text-lg font-bold hover-lift"
          >
            GO TO MY POSITIONS
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
                <option value="">-- Select a position --</option>
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
            Withdraw funds from an unlocked position. Amount transfers to your
            connected wallet.
          </p>
          <ul className="text-body text-sm text-gray-400 space-y-2">
            <li>✓ Position must be unlocked before withdrawal</li>
            <li>✓ Visit position details to unlock locked positions</li>
            <li>✓ Verify available amount before withdrawing</li>
            <li>✓ Withdrawals execute immediately on-chain</li>
            <li>✓ Withdrawal limited to available balance</li>
          </ul>
        </div>

        {/* Non-Custodial 2FA Security Check Modal */}
        {showSecurityCheck && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="card-pro bg-zinc-900 border-2 border-zinc-700 p-8 max-w-xl w-full rounded-lg">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6!">
                <Lock size={28} className="text-emerald-500" />
                <h2 className="heading-brutal text-2xl text-white">
                  TRANSACTION SECURITY CHECK
                </h2>
              </div>

              <p className="body-brutal text-sm text-zinc-300 mb-6!">
                Ironclad requires a cryptographic signature from the Vault&apos;s
                native Bitcoin key to authorize this withdrawal. This proves
                non-custodial ownership and prevents unauthorized access.
              </p>

              {/* Step Indicator */}
              <div className="mb-6! p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      securityState.step === "signing"
                        ? "bg-orange-500"
                        : "bg-emerald-500"
                    }`}
                  >
                    {securityState.step === "signing" ? "1" : "2"}
                  </div>
                  <div>
                    <p className="body-brutal text-xs text-zinc-400 font-bold uppercase">
                      Step {securityState.step === "signing" ? "1: Signing" : "2: Verified"}
                    </p>
                    <p className="body-brutal text-sm text-zinc-200">
                      {securityState.step === "signing"
                        ? "Generate threshold ECDSA signature"
                        : "Signature verified - ready to broadcast"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error State */}
              {securityState.error && (
                <div className="mb-6! p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="body-brutal text-sm text-red-900 font-bold">
                    ❌ Signature Failed
                  </p>
                  <p className="body-brutal text-xs text-red-800 mt-2">
                    {securityState.error}
                  </p>
                </div>
              )}

              {/* Signing Step */}
              {securityState.step === "signing" && (
                <div className="space-y-4 mb-6!">
                  <div className="card-pro p-4 bg-zinc-800 border border-zinc-700">
                    <p className="body-brutal text-xs text-zinc-400 font-bold uppercase mb-2!">
                      Withdrawal Amount
                    </p>
                    <p className="body-brutal text-lg text-white font-bold">
                      {withdrawAmount} BTC
                    </p>
                  </div>

                  <button
                    onClick={handleSignApproval}
                    disabled={securityState.loading}
                    className="w-full btn-pro accent py-4 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck size={20} />
                    {securityState.loading ? "GENERATING SIGNATURE..." : "SIGN APPROVAL REQUEST"}
                  </button>

                  {securityState.loading && (
                    <p className="text-center body-brutal text-sm text-zinc-400">
                      Generating Threshold Signature...
                    </p>
                  )}
                </div>
              )}

              {/* Verified Step */}
              {securityState.step === "verified" && securityState.signature && (
                <div className="space-y-4 mb-6!">
                  {/* Success Badge */}
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-lg flex items-center gap-3">
                    <CheckCircle size={32} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="body-brutal text-sm font-bold text-emerald-900">
                        SIGNATURE VERIFIED
                      </p>
                      <p className="body-brutal text-xs text-emerald-700">
                        Non-custodial ownership confirmed
                      </p>
                    </div>
                  </div>

                  {/* Signature Display */}
                  <div className="card-pro p-4 bg-zinc-800 border border-zinc-700">
                    <p className="body-brutal text-xs text-zinc-400 font-bold uppercase mb-2!">
                      Cryptographic Signature (Hex)
                    </p>
                    <code className="block body-brutal font-mono text-xs text-amber-400 break-all">
                      {truncateHex(
                        Buffer.from(securityState.signature.signature).toString(
                          "hex"
                        ),
                        48
                      )}
                    </code>
                  </div>

                  {/* Technical Details */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="card-pro p-3 bg-zinc-800 border border-zinc-700 text-center">
                      <p className="body-brutal text-xs text-zinc-400 font-bold">
                        CURVE
                      </p>
                      <p className="body-brutal text-sm text-white font-bold">
                        secp256k1
                      </p>
                    </div>
                    <div className="card-pro p-3 bg-zinc-800 border border-zinc-700 text-center">
                      <p className="body-brutal text-xs text-zinc-400 font-bold">
                        PROTOCOL
                      </p>
                      <p className="body-brutal text-sm text-white font-bold">
                        ICP ECDSA
                      </p>
                    </div>
                    <div className="card-pro p-3 bg-zinc-800 border border-zinc-700 text-center">
                      <p className="body-brutal text-xs text-zinc-400 font-bold">
                        STATUS
                      </p>
                      <p className="body-brutal text-sm text-emerald-400 font-bold">
                        APPROVED
                      </p>
                    </div>
                  </div>

                  {/* Broadcast Button */}
                  <button
                    onClick={handleConfirmWithdraw}
                    disabled={actionLoading}
                    className="w-full btn-pro accent py-4 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    <CheckCircle size={20} />
                    {actionLoading
                      ? "BROADCASTING..."
                      : "CONFIRM & BROADCAST WITHDRAWAL"}
                  </button>
                </div>
              )}

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowSecurityCheck(false);
                  setSecurityState({
                    step: "signing",
                    signature: null,
                    message: "",
                    loading: false,
                    error: null,
                  });
                }}
                disabled={securityState.loading || actionLoading}
                className="w-full button-brutal py-3 font-bold disabled:opacity-50"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
