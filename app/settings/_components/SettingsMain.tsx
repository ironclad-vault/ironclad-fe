"use client";

import React from "react";
import { useNetworkMode } from "@/hooks/ironclad/useNetworkMode";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import VaultHeader from "@/components/layout/VaultHeader";

/**
 * Settings Page
 * Configure network mode and other system settings
 */
export default function SettingsMain() {
  const { mode, loading, error, switchToMock, switchToCkbtc } =
    useNetworkMode();

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
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vaults
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 brutal-border border-2 border-accent py-8 px-6">
        <h1 className="heading-brutal text-5xl mb-2">SETTINGS</h1>
        <p className="body-brutal text-gray-700">
          Configure Ironclad Vault system settings and network mode
        </p>
      </div>

      {/* Network Mode Section */}
      <div className="space-y-8">
        <div className="card-brutal brutal-border border-2 p-8">
          <h2 className="heading-brutal text-3xl mb-6 pb-4 border-b-2 border-accent">NETWORK MODE</h2>
          <p className="body-brutal text-gray-600 mb-6">
            Choose between Mock mode (for testing) and ckBTC Mainnet mode (real
            blockchain operations).
          </p>

          {loading && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="body-brutal text-sm text-gray-600">
                Loading network mode...
              </p>
            </div>
          )}

          {error && (
            <div className="card-brutal brutal-border border-2 border-red-500 p-6 bg-red-50 mb-4">
              <p className="body-brutal text-sm text-red-900 font-semibold">
                Error loading network mode: {error}
              </p>
            </div>
          )}

          {/* Current Mode Display */}
          {mode && (
            <div className="card-brutal brutal-border border-2 p-8 mb-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="body-brutal text-sm text-gray-600 uppercase font-bold mb-1">
                    Current Mode
                  </p>
                  <p className="heading-brutal text-xl">
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
              className={`card-brutal brutal-border border-2 p-8 ${
                isMockMode ? "bg-yellow-50 border-yellow-400" : "bg-white hover-lift"
              }`}
            >
              <h3 className="heading-brutal text-2xl mb-4">MOCK MODE</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="body-brutal text-sm text-gray-700">
                    Safe for testing and development
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="body-brutal text-sm text-gray-700">
                    No real blockchain calls
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="body-brutal text-sm text-gray-700">
                    Simulated ckBTC operations
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <p className="body-brutal text-sm text-gray-700">
                    Cannot sync real ckBTC balances
                  </p>
                </div>
              </div>
              <button
                onClick={handleSwitchToMock}
                disabled={loading || !!isMockMode}
                className="button-brutal w-full py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMockMode ? "ACTIVE" : "SWITCH TO MOCK"}
              </button>
            </div>

            {/* ckBTC Mainnet Mode */}
            <div
              className={`card-brutal p-6 ${
                isCkbtcMode ? "bg-green-50 border-green-300" : "bg-white"
              }`}
            >
              <h3 className="heading-brutal text-lg mb-3">CKBTC MAINNET</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="body-brutal text-sm text-gray-700">
                    Real ckBTC testnet integration
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="body-brutal text-sm text-gray-700">
                    Sync balances from ledger
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="body-brutal text-sm text-gray-700">
                    Real ECDSA threshold signatures
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">⚠</span>
                  <p className="body-brutal text-sm text-gray-700">
                    Use only with testnet funds
                  </p>
                </div>
              </div>
              <button
                onClick={handleSwitchToCkbtc}
                disabled={loading || !!isCkbtcMode}
                className="button-brutal accent w-full py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCkbtcMode ? "ACTIVE" : "SWITCH TO CKBTC"}
              </button>
            </div>
          </div>

          {/* Warning Banner for ckBTC Mode */}
          {isCkbtcMode && (
            <div className="card-brutal p-6 bg-orange-50 border-orange-300 mt-6">
              <div className="flex gap-3">
                <div>
                  <h4 className="heading-brutal text-sm font-bold text-orange-900 mb-2! flex flex-row items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />
                    IMPORTANT: TESTNET MODE ACTIVE
                  </h4>
                  <div className="space-y-2 body-brutal text-sm text-orange-900">
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

        {/* Additional Settings Placeholder */}
        <div className="card-brutal p-8 bg-gray-50">
          <h2 className="heading-brutal text-2xl mb-4">ADDITIONAL SETTINGS</h2>
          <p className="body-brutal text-gray-600">
            More configuration options coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
