"use client";

import React, { useState } from "react";
import { useNetworkMode } from "@/hooks/ironclad/useNetworkMode";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { useWallet } from "@/components/wallet/useWallet";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import VaultHeader from "@/components/layout/VaultHeader";

/**
 * Settings Page
 * Configure network mode and other system settings
 */
export default function SettingsMain() {
  const { mode, loading, error, switchToMock, switchToCkbtc } =
    useNetworkMode();
  useWallet();
  const { pingAlive, loading: actionLoading } = useVaultActions();
  const [nextCheckDate, setNextCheckDate] = useState<string>("");

  React.useEffect(() => {
    setNextCheckDate(
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()
    );
  }, []);

  const handleSwitchToMock = async () => {
    try {
      await switchToMock();
      toast.success("Switched to Mock mode");
    } catch (err) {
      toast.error(`Failed to switch mode: ${err}`);
    }
  };

  const handleSwitchToCkbtc = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will enable real ckBTC testnet ledger calls. " +
          "Only use with test funds. Continue?"
      )
    ) {
      return;
    }

    try {
      await switchToCkbtc();
      toast.success("Switched to ckBTC Mainnet mode");
    } catch (err) {
      toast.error(`Failed to switch mode: ${err}`);
    }
  };

  const isMockMode = mode && "Mock" in mode;
  const isCkbtcMode = mode && "CkBTCMainnet" in mode;

  return (
    <div className="container mx-auto px-6 py-8 pt-24">
      <VaultHeader />
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/vault"
          className="flex items-center gap-2 text-accent hover:text-orange-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vaults
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 card-pro border-accent py-8 px-6">
        <h1 className="text-heading text-5xl mb-2">SETTINGS</h1>
        <p className="text-body text-white">
          Configure Ironclad Vault system settings and network mode
        </p>
      </div>

      {/* Network Mode Section */}
      <div className="space-y-8">
        <div className="card-pro p-8">
          <h2 className="text-heading text-3xl mb-6 pb-4 border-b-2 border-accent">
            NETWORK MODE
          </h2>
          <p className="text-body text-white mb-6">
            Choose between Mock mode (for testing) and ckBTC Mainnet mode (real
            blockchain operations).
          </p>

          {loading && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-body text-sm text-white">
                Loading network mode...
              </p>
            </div>
          )}

          {error && (
            <div className="card-pro border-red-500 p-6 bg-red-50 mb-4">
              <p className="text-body text-sm text-red-900 font-semibold">
                Error loading network mode: {error}
              </p>
            </div>
          )}

          {/* Current Mode Display */}
          {mode && (
            <div className="card-pro p-8 mb-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body text-sm text-white font-bold mb-1">
                    Current Mode
                  </p>
                  <p className="text-heading text-xl text-white">
                    {isMockMode ? "MOCK" : "CKBTC MAINNET"}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg font-bold ${
                    isMockMode
                      ? "bg-yellow-100 text-yellow-900"
                      : "bg-green-100 text-green-900"
                  }`}
                >
                  {isMockMode ? (
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      TESTING
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mode Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mock Mode */}
            <div
              className={`card-pro p-8 ${
                isMockMode
                  ? "bg-yellow-50 border-yellow-400"
                  : "bg-white hover-lift"
              }`}
            >
              <h3 className="text-heading text-2xl mb-4">MOCK MODE</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-body text-sm text-gray-300">
                    Safe for testing and development
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-body text-sm text-gray-300">
                    No real blockchain calls
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-body text-sm text-gray-300">
                    Simulated ckBTC operations
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <p className="text-body text-sm text-gray-300">
                    Cannot sync real ckBTC balances
                  </p>
                </div>
              </div>
              <button
                onClick={handleSwitchToMock}
                disabled={loading || !!isMockMode}
                className={`btn-pro w-full py-4 font-bold text-lg ${
                  isMockMode ? "bg-blue-600" : ""
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isMockMode ? "ACTIVE" : "SWITCH TO MOCK"}
              </button>
            </div>

            {/* ckBTC Mainnet Mode */}
            <div
              className={`card-pro p-8 ${
                isCkbtcMode
                  ? "bg-green-50 border-green-400"
                  : "bg-white hover-lift"
              }`}
            >
              <h3 className="text-heading text-2xl mb-4">CKBTC MAINNET</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-body text-sm text-gray-300">
                    Real ckBTC testnet integration
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-body text-sm text-gray-300">
                    Sync balances from ledger
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-body text-sm text-gray-300">
                    Real ECDSA threshold signatures
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">⚠</span>
                  <p className="text-body text-sm text-gray-300">
                    Use only with testnet funds
                  </p>
                </div>
              </div>
              <button
                onClick={handleSwitchToCkbtc}
                disabled={loading || !!isCkbtcMode}
                className={`btn-pro ${
                  isCkbtcMode ? "accent" : ""
                } w-full py-4 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCkbtcMode ? "ACTIVE" : "SWITCH TO CKBTC"}
              </button>
            </div>
          </div>

          {/* Warning Banner for ckBTC Mode */}
          {isCkbtcMode && (
            <div className="card-pro border-orange-400 p-8 bg-orange-50 mt-8">
              <div className="flex gap-3">
                <div>
                  <h4 className="text-heading text-sm font-bold text-orange-900 mb-2 flex flex-row items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />
                    IMPORTANT: TESTNET MODE ACTIVE
                  </h4>
                  <div className="space-y-2 text-body text-sm text-orange-900">
                    <p>
                      You are currently using{" "}
                      <strong>ckBTC Mainnet mode</strong> with real blockchain
                      operations.
                    </p>
                    <p>
                      • All ckBTC sync operations will query the actual ckBTC
                      testnet ledger
                    </p>
                    <p>
                      • ECDSA signatures will use real threshold signing (~30
                      billion cycles)
                    </p>
                    <p>
                      • Only use with testnet/test funds - DO NOT use real
                      Bitcoin or mainnet assets
                    </p>
                    <p>
                      • For production deployment, ensure proper key management
                      (key_1 vs test_key_1)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inheritance Protocol Section */}
        <div className="card-pro p-8">
          <h2 className="heading-brutal text-3xl mb-6 pb-4 border-b-2 border-accent">
            INHERITANCE PROTOCOL
          </h2>

          <div className="space-y-6">
            {/* Status Row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label mb-2">DEAD MAN SWITCH STATUS</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-heading text-lg">ACTIVE</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-label mb-2">INACTIVITY TIMEOUT</p>
                <p className="heading-brutal text-lg text-emerald-600">
                  180 DAYS
                </p>
              </div>
            </div>

            {/* Info Rows */}
            <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 space-y-3 bg-opacity-10 border-opacity-20">
              <div>
                <p className="text-label mb-1">NEXT CHECK</p>
                <p className="text-body text-sm text-gray-300">
                  {nextCheckDate}
                </p>
              </div>
              <div>
                <p className="text-label mb-1">
                  BENEFICIARY CLAIM AVAILABLE IN
                </p>
                <p className="text-body text-sm text-gray-300">
                  180 Days (Default)
                </p>
              </div>
            </div>

            {/* Ping Button */}
            <button
              onClick={() => pingAlive()}
              disabled={actionLoading}
              className="btn-pro w-full py-4 font-bold text-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5" />
              {actionLoading ? "SENDING PING..." : "PROOF OF LIFE (PING)"}
            </button>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-body text-sm text-blue-900">
                <strong>How It Works:</strong> Click &quot;Proof of Life&quot;
                regularly to prove you&apos;re alive and reset the 180-day
                timer. If the timer expires, your designated beneficiary can
                claim your vault.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Settings Placeholder */}
        <div className="card-pro p-8 bg-gray-50">
          <h2 className="text-heading text-3xl mb-4">ADDITIONAL SETTINGS</h2>
          <p className="text-body text-gray-300">
            More configuration options coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
