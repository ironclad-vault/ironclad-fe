"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import { useVaults } from "@/hooks/ironclad/useVaults";
import { getVaultStatus } from "@/lib/vaultUtils";

function CreateVaultFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vaultIdParam = searchParams.get("vaultId");
  const { createVault, mockDeposit, loading, error } = useVaultActions();
  const { vaults, refetch: refetchVaults } = useVaults();

  const [lockDuration, setLockDuration] = useState<string>("6");
  const [durationUnit, setDurationUnit] = useState<"months" | "seconds">(
    "months"
  );
  const [depositAmount, setDepositAmount] = useState<string>("100000");
  const [createdVault, setCreatedVault] = useState<{
    vaultId: bigint;
    expectedDeposit: bigint;
  } | null>(null);

  // Compute existing vault and mode from URL params
  const { existingVault, mode } = useMemo(() => {
    if (vaultIdParam) {
      const vaultId = BigInt(vaultIdParam);
      const vault = vaults.find((v) => v.id === vaultId);

      if (vault && getVaultStatus(vault) === "PendingDeposit") {
        return {
          existingVault: vault,
          mode: "complete" as const,
        };
      }
    }
    return {
      existingVault: null,
      mode: "create" as const,
    };
  }, [vaultIdParam, vaults]);

  // Set initial state for complete mode
  useEffect(() => {
    if (mode === "complete" && existingVault && !createdVault) {
      setDepositAmount(existingVault.expected_deposit.toString());
      setCreatedVault({
        vaultId: existingVault.id,
        expectedDeposit: existingVault.expected_deposit,
      });
    }
  }, [mode, existingVault, createdVault]);

  const handleCreateVault = async () => {
    const lockValue = parseInt(lockDuration);
    let lockUntil: number;

    if (durationUnit === "seconds") {
      // For testing: lock duration in seconds
      lockUntil = Math.floor(Date.now() / 1000) + lockValue;
    } else {
      // Normal: lock duration in months
      lockUntil = Math.floor(Date.now() / 1000) + lockValue * 30 * 24 * 60 * 60;
    }

    const expectedDeposit = BigInt(depositAmount);

    const vault = await createVault(lockUntil, expectedDeposit);
    if (vault) {
      setCreatedVault({
        vaultId: vault.id,
        expectedDeposit: vault.expected_deposit || expectedDeposit,
      });
    }
  };

  const handleMockDeposit = async () => {
    if (!createdVault) return;

    const amount = BigInt(depositAmount);
    const vault = await mockDeposit(createdVault.vaultId, amount);

    if (vault) {
      await refetchVaults();

      setTimeout(() => {
        router.push("/vault");
      }, 1500);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString("id-ID");
  };

  return (
    <div className="card-brutal p-8 flex flex-col gap-6">
      <h3 className="heading-brutal text-3xl">
        {mode === "complete" ? "COMPLETE DEPOSIT" : "CREATE NEW VAULT"}
      </h3>

      {mode === "complete" && existingVault && (
        <div className="bg-blue-50 border-2 border-blue-300 p-4">
          <p className="heading-brutal text-sm text-blue-900 mb-2">
            VAULT #{existingVault.id.toString()}
          </p>
          <div className="body-brutal text-sm text-blue-800 space-y-1">
            <p>
              Status: <span className="font-bold">Pending Deposit</span>
            </p>
            <p>
              Expected:{" "}
              <span className="font-bold">
                {existingVault.expected_deposit.toLocaleString()} sats
              </span>
            </p>
            <p>
              Lock Until:{" "}
              <span className="font-bold">
                {formatDate(existingVault.lock_until)}
              </span>
            </p>
            <p>
              BTC Address:{" "}
              <span className="font-mono text-xs">
                {existingVault.btc_address}
              </span>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-2 border-red-500 p-4">
          <p className="body-brutal font-bold text-red-800">ERROR: {error}</p>
        </div>
      )}

      {!createdVault && mode === "create" ? (
        <>
          <div className="mb-6">
            <label className="body-brutal text-sm font-bold mb-2 block">
              LOCK DURATION
            </label>
            <select
              className="input-brutal"
              value={`${lockDuration}:${durationUnit}`}
              onChange={(e) => {
                const [duration, unit] = e.target.value.split(":");
                setLockDuration(duration);
                setDurationUnit(unit as "months" | "seconds");
              }}
              disabled={loading}
            >
              <option value="3:seconds">🧪 3 SECONDS (TESTING)</option>
              <option value="1:months">1 MONTH</option>
              <option value="3:months">3 MONTHS</option>
              <option value="6:months">6 MONTHS</option>
              <option value="12:months">1 YEAR</option>
              <option value="24:months">2 YEARS</option>
              <option value="60:months">5 YEARS</option>
            </select>
            {durationUnit === "seconds" && (
              <p className="body-brutal text-xs text-orange-600 mt-1 font-bold">
                ⚠️ TESTING MODE: Vault will unlock in {lockDuration} seconds
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="body-brutal text-sm font-bold mb-2 block">
              DEPOSIT AMOUNT (SATS)
            </label>
            <input
              type="number"
              className="input-brutal"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={loading}
              min="1"
              step="1"
            />
            <p className="body-brutal text-xs text-gray-600 mt-1">
              {(parseInt(depositAmount) / 100000000).toFixed(8)} BTC
            </p>
          </div>

          <button
            className="button-brutal accent w-full"
            onClick={handleCreateVault}
            disabled={loading}
          >
            {loading ? "CREATING..." : "CREATE VAULT"}
          </button>
        </>
      ) : createdVault ? (
        <div className="mt-6">
          {mode === "create" && (
            <div className="mb-4">
              <label className="body-brutal text-sm font-bold mb-2 block">
                VAULT CREATED
              </label>
              <div className="bg-green-100 border-2 border-green-500 p-4">
                <p className="body-brutal font-bold text-green-800 mb-2">
                  ✓ Vault ID: {createdVault.vaultId.toString()}
                </p>
                <p className="body-brutal text-sm text-green-700">
                  Expected Deposit: {createdVault.expectedDeposit.toString()}{" "}
                  sats
                </p>
              </div>
            </div>
          )}

          {mode === "complete" && (
            <div className="mb-4">
              <label className="body-brutal text-sm font-bold mb-2 block">
                DEPOSIT AMOUNT (SATS)
              </label>
              <input
                type="number"
                className="input-brutal"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={loading}
                min="1"
                step="1"
              />
              <p className="body-brutal text-xs text-gray-600 mt-1">
                {(parseInt(depositAmount || "0") / 100000000).toFixed(8)} BTC
              </p>
              <p className="body-brutal text-xs text-blue-600 mt-1">
                Expected: {createdVault.expectedDeposit.toLocaleString()} sats
              </p>
            </div>
          )}

          <button
            className="button-brutal w-full mb-4 bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleMockDeposit}
            disabled={loading || parseInt(depositAmount || "0") <= 0}
          >
            {loading
              ? "DEPOSITING..."
              : mode === "complete"
              ? "COMPLETE DEPOSIT"
              : "MOCK DEPOSIT (DEV ONLY)"}
          </button>

          {mode === "create" && (
            <>
              <div className="bg-yellow-100 border-2 border-yellow-500 p-4">
                <p className="body-brutal font-bold text-yellow-800 mb-2">
                  DEVELOPMENT MODE
                </p>
                <p className="body-brutal text-sm text-yellow-700">
                  In production, you would send Bitcoin to a generated address.
                  For development, click &apos;Mock Deposit&apos; above to
                  simulate the deposit.
                </p>
              </div>

              <div className="mt-4 bg-red-100 border-2 border-red-500 p-4">
                <p className="body-brutal font-bold text-red-800">
                  PRODUCTION WARNING: SEND BTC ONLY. DO NOT SEND CKBTC OR OTHER
                  ASSETS.
                </p>
              </div>
            </>
          )}

          {mode === "complete" && existingVault && (
            <div className="bg-yellow-100 border-2 border-yellow-500 p-4">
              <p className="body-brutal font-bold text-yellow-800 mb-2">
                📍 DEPOSIT INSTRUCTIONS
              </p>
              <div className="body-brutal text-sm text-yellow-700 space-y-2">
                <p>
                  1. Send exactly{" "}
                  <span className="font-bold">
                    {createdVault.expectedDeposit.toLocaleString()} sats
                  </span>{" "}
                  to:
                </p>
                <p className="font-mono text-xs bg-white p-2 border border-yellow-300 break-all">
                  {existingVault.btc_address}
                </p>
                <p>2. Wait for blockchain confirmation</p>
                <p>
                  3. Vault status will change to{" "}
                  <span className="font-bold">Locked</span>
                </p>
                <p className="text-xs mt-2 text-yellow-600">
                  ⚠️ For development: Use &quot;COMPLETE DEPOSIT&quot; button
                  above to simulate
                </p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function CreateVaultForm() {
  return (
    <Suspense
      fallback={<div className="card-brutal p-8 text-center">Loading...</div>}
    >
      <CreateVaultFormContent />
    </Suspense>
  );
}
