/**
 * Vault Debug Page
 * ICP Bitcoin integration testing panel
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useNetworkMode } from "@/hooks/ironclad/useNetworkMode";
import { useCkbtcSync } from "@/hooks/ironclad/useCkbtcSync";
import { useVaults } from "@/hooks/ironclad/useVaults";

export default function VaultDebugPage() {
  const {
    mode,
    loading: modeLoading,
    error: modeError,
    switchToMock,
    switchToCkbtc,
  } = useNetworkMode();

  const { vaults, loading: vaultsLoading } = useVaults();
  const [vaultIdInput, setVaultIdInput] = useState("0");
  const vaultId = BigInt(vaultIdInput || "0");

  const {
    sync,
    loading: syncLoading,
    error: syncError,
    lastResult,
  } = useCkbtcSync(vaultId);

  // Auto-set first vault ID if available
  useEffect(() => {
    if (vaults && vaults.length > 0 && vaultIdInput === "0") {
      setVaultIdInput(vaults[0]!.id.toString());
    }
  }, [vaults, vaultIdInput]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Ironclad / ICP Debug Panel</h1>

      <section className="border border-slate-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Network Mode</h2>
        <p className="text-sm text-slate-300">
          Current mode:{" "}
          <span className="font-mono text-emerald-400">
            {mode
              ? "Mock" in mode
                ? "Mock"
                : "CkBTCMainnet" in mode
                ? "CkBTCMainnet"
                : JSON.stringify(mode)
              : modeLoading
              ? "Loading..."
              : "Unknown"}
          </span>
        </p>
        {modeError && (
          <p className="text-xs text-red-400 whitespace-pre-wrap">
            {modeError}
          </p>
        )}
        <div className="flex gap-3 mt-2">
          <button
            onClick={switchToMock}
            disabled={modeLoading}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sm disabled:opacity-50"
          >
            Use Mock
          </button>
          <button
            onClick={switchToCkbtc}
            disabled={modeLoading}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50"
          >
            Use ckBTC Mainnet
          </button>
        </div>
      </section>

      <section className="border border-slate-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">Your Vaults</h2>
        {vaultsLoading ? (
          <p className="text-sm text-slate-400">Loading vaults...</p>
        ) : vaults && vaults.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-300">
              Found {vaults.length} vault{vaults.length !== 1 ? 's' : ''}:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {vaults.map((vault) => (
                <button
                  key={vault.id.toString()}
                  onClick={() => setVaultIdInput(vault.id.toString())}
                  className={`text-left p-3 rounded border ${
                    vaultIdInput === vault.id.toString()
                      ? 'border-emerald-500 bg-emerald-950'
                      : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-400">Vault ID</p>
                      <p className="font-mono text-sm">{vault.id.toString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Balance</p>
                      <p className="font-mono text-sm">{vault.balance.toString()} sats</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <p className="text-xs">{Object.keys(vault.status)[0]}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded p-3">
            <p className="text-sm text-yellow-400">⚠️ No vaults found</p>
            <p className="text-xs text-yellow-300 mt-1">
              Create a vault first at <Link href="/vault" className="underline">/vault</Link>
            </p>
          </div>
        )}
      </section>

      <section className="border border-slate-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold">ckBTC Sync (by Vault ID)</h2>
        <div className="flex items-center gap-3">
          <input
            value={vaultIdInput}
            onChange={(e) => setVaultIdInput(e.target.value.replace(/[^0-9]/g, ""))}
            className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-sm font-mono w-28"
            placeholder="0"
          />
          <button
            onClick={sync}
            disabled={syncLoading || !vaultIdInput || vaultIdInput === "0"}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncLoading ? "Syncing..." : "Sync from ckBTC"}
          </button>
        </div>
        {!vaultIdInput || vaultIdInput === "0" ? (
          <p className="text-xs text-yellow-400">⚠️ Select a vault from above or enter a valid vault ID</p>
        ) : null}
        {syncError && (
          <div className="bg-red-900/20 border border-red-700 rounded p-3">
            <p className="text-xs text-red-400 font-bold">Error:</p>
            <p className="text-xs text-red-300 mt-1">{syncError}</p>
            {syncError.includes("not found") && (
              <p className="text-xs text-red-200 mt-2">
                💡 Tip: Vault ID {vaultIdInput} does not exist or you do not own it
              </p>
            )}
          </div>
        )}
        {lastResult && (
          <div className="space-y-2">
            <p className="text-sm text-emerald-400 font-bold">✓ Sync successful!</p>
            <pre className="text-xs bg-slate-900 rounded p-3 overflow-x-auto">
              {JSON.stringify(lastResult, (_, value) => 
                typeof value === 'bigint' ? value.toString() : value
              , 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
