"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";

export default function DepositForm() {
  const router = useRouter();
  const { createVault, mockDeposit, loading, error } = useVaultActions();
  
  const [lockDuration, setLockDuration] = useState<string>("6");
  const [depositAmount, setDepositAmount] = useState<string>("100000");
  const [createdVault, setCreatedVault] = useState<{
    vaultId: bigint;
    expectedDeposit: bigint;
  } | null>(null);

  const handleCreateVault = async () => {
    const lockMonths = parseInt(lockDuration);
    const lockUntil = Math.floor(Date.now() / 1000) + lockMonths * 30 * 24 * 60 * 60; // months to seconds
    const expectedDeposit = BigInt(depositAmount);

    const vault = await createVault(lockUntil, expectedDeposit);
    if (vault) {
      setCreatedVault({
        vaultId: vault.id,
        expectedDeposit: vault.expectedDeposit || expectedDeposit,
      });
    }
  };

  const handleMockDeposit = async () => {
    if (!createdVault) return;

    const vault = await mockDeposit(createdVault.vaultId, createdVault.expectedDeposit);
    if (vault) {
      // Redirect to dashboard after successful deposit
      router.push("/vault");
    }
  };

  return (
    <div className="card-brutal flex flex-col gap-8">
      <h3 className="heading-brutal text-xl">CREATE NEW VAULT</h3>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 p-4">
          <p className="body-brutal font-bold text-red-800">ERROR: {error}</p>
        </div>
      )}

      {!createdVault ? (
        <>
          <div className="mb-6">
            <label className="body-brutal text-sm font-bold mb-2 block">
              LOCK DURATION (MONTHS)
            </label>
            <select
              className="input-brutal"
              value={lockDuration}
              onChange={(e) => setLockDuration(e.target.value)}
              disabled={loading}
            >
              <option value="1">1 MONTH</option>
              <option value="3">3 MONTHS</option>
              <option value="6">6 MONTHS</option>
              <option value="12">1 YEAR</option>
              <option value="24">2 YEARS</option>
              <option value="60">5 YEARS</option>
            </select>
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
      ) : (
        <div className="mt-6">
          <div className="mb-4">
            <label className="body-brutal text-sm font-bold mb-2 block">
              VAULT CREATED
            </label>
            <div className="bg-green-100 border-2 border-green-500 p-4">
              <p className="body-brutal font-bold text-green-800 mb-2">
                ✓ Vault ID: {createdVault.vaultId.toString()}
              </p>
              <p className="body-brutal text-sm text-green-700">
                Expected Deposit: {createdVault.expectedDeposit.toString()} sats
              </p>
            </div>
          </div>

          <button
            className="button-brutal w-full mb-4 bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleMockDeposit}
            disabled={loading}
          >
            {loading ? "DEPOSITING..." : "MOCK DEPOSIT (DEV ONLY)"}
          </button>

          <div className="bg-yellow-100 border-2 border-yellow-500 p-4">
            <p className="body-brutal font-bold text-yellow-800 mb-2">
              DEVELOPMENT MODE
            </p>
            <p className="body-brutal text-sm text-yellow-700">
              In production, you would send Bitcoin to a generated address. For
              development, click "Mock Deposit" above to simulate the deposit.
            </p>
          </div>

          <div className="mt-4 bg-red-100 border-2 border-red-500 p-4">
            <p className="body-brutal font-bold text-red-800">
              PRODUCTION WARNING: SEND BTC ONLY. DO NOT SEND CKBTC OR OTHER
              ASSETS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
