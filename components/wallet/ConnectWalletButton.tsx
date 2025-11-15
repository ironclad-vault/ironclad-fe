"use client";

import React, { useState } from "react";
import { useWallet, WalletType } from "./WalletProvider";

export function ConnectWalletButton() {
  const { isConnected, principalText, walletType, isInitializing, connect, disconnect } =
    useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (type: WalletType) => {
    if (!type) return;

    setIsConnecting(true);
    setError(null);

    try {
      await connect(type);
      setIsModalOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error("[ConnectWalletButton] Connection failed:", errorMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("[ConnectWalletButton] Disconnect failed:", err);
    }
  };

  const truncatePrincipal = (principal: string) => {
    if (principal.length <= 16) return principal;
    return `${principal.slice(0, 8)}...${principal.slice(-8)}`;
  };

  if (isInitializing) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
      >
        Initializing...
      </button>
    );
  }

  if (isConnected && principalText) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-sm font-mono text-blue-900">
            {truncatePrincipal(principalText)}
          </span>
          {walletType && (
            <span className="ml-2 text-xs text-blue-600 uppercase">{walletType}</span>
          )}
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        Connect Wallet
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isConnecting}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              {/* Internet Identity */}
              <button
                onClick={() => handleConnect("ii")}
                disabled={isConnecting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">II</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Internet Identity</h3>
                    <p className="text-sm text-gray-600">Official ICP identity</p>
                  </div>
                </div>
              </button>

              {/* Plug Wallet */}
              <button
                onClick={() => handleConnect("plug")}
                disabled={isConnecting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔌</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Plug Wallet</h3>
                    <p className="text-sm text-gray-600">Browser extension wallet</p>
                  </div>
                </div>
              </button>

              {/* NFID - Coming Soon */}
              <button
                disabled
                className="w-full p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🆔</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">NFID</h3>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </div>
                </div>
              </button>
            </div>

            {isConnecting && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Connecting...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
