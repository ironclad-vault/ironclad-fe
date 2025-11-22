"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVaultActions } from "@/hooks/ironclad/useVaultActions";
import { useVaults } from "@/hooks/ironclad/useVaults";
import { useWallet } from "@/components/wallet/useWallet";
import { useNetworkMode } from "@/hooks/ironclad/useNetworkMode";
import { useCkbtcSync } from "@/hooks/ironclad/useCkbtcSync";
import { useUserBalance } from "@/hooks/ironclad/useUserBalance";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { getVaultStatus } from "@/lib/vaultUtils";
import { IC_CONFIG } from "@/lib/ic/config";
import type { VaultDTO } from "@/lib/ironclad-service";
import toast from "react-hot-toast";
import { 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  MapPin, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Globe,
  Beaker
} from "lucide-react";

function CreateVaultFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vaultIdParam = searchParams.get("vaultId");
  const { createVault, realDeposit, mockDeposit, loading, error } = useVaultActions();
  const { vaults, refetch: refetchVaults } = useVaults();
  const { isConnected } = useWallet();
  const { mode: networkMode } = useNetworkMode();
  const { refetch: refetchBalance } = useUserBalance();

  // Determine if we're in CkBTC mode
  const isCkbtcMode = networkMode && "CkBTCMainnet" in networkMode;
  const isMockMode = !isCkbtcMode;

  const [lockDuration, setLockDuration] = useState<string>("6");
  const [durationUnit, setDurationUnit] = useState<"months" | "seconds">(
    "months"
  );
  const [depositAmount, setDepositAmount] = useState<string>("100000");
  const [beneficiary, setBeneficiary] = useState<string>("");
  const [willMessage, setWillMessage] = useState<string>("");
  const [createdVault, setCreatedVault] = useState<VaultDTO | null>(null);

  // Use CkBTC sync hook when vault is created
  const {
    loading: syncLoading,
    error: syncError,
    sync: syncCkbtcBalance,
  } = useCkbtcSync(createdVault?.id ?? BigInt(0));

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
      // Convert Vault to VaultDTO-like object for display (inline to avoid dependency issues)
      let ckbtcSubaccountHex: string | null = null;
      if (existingVault.ckbtc_subaccount && existingVault.ckbtc_subaccount.length > 0) {
        const subData = existingVault.ckbtc_subaccount[0];
        if (subData) {
          const bytes = subData instanceof Uint8Array ? subData : new Uint8Array(subData as unknown as ArrayBuffer);
          ckbtcSubaccountHex = "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        }
      }
      const vaultDTO: VaultDTO = {
        id: existingVault.id,
        owner: existingVault.owner.toString(),
        status: existingVault.status as unknown as VaultDTO['status'],
        balance: existingVault.balance,
        expectedDeposit: existingVault.expected_deposit,
        createdAt: Number(existingVault.created_at),
        updatedAt: Number(existingVault.updated_at),
        lockUntil: Number(existingVault.lock_until),
        btcAddress: existingVault.btc_address,
        btcDepositTxid: existingVault.btc_deposit_txid?.[0] ?? null,
        btcWithdrawTxid: existingVault.btc_withdraw_txid?.[0] ?? null,
        ckbtcSubaccountHex,
        beneficiary: existingVault.beneficiary?.[0]?.toString() ?? null,
        lastKeepAlive: Number(existingVault.last_keep_alive),
        inheritanceTimeout: Number(existingVault.inheritance_timeout),
        encryptedNote: existingVault.encrypted_note?.[0] ?? null,
      };
      setCreatedVault(vaultDTO);
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

    const vault = await createVault(
      lockUntil,
      expectedDeposit,
      beneficiary || undefined,
      willMessage || undefined
    );
    if (vault) {
      setCreatedVault(vault); // createVault returns VaultDTO which is already DTO type
    }
  };

  const handleMockDeposit = async () => {
    if (!createdVault) return;

    const amount = BigInt(depositAmount);
    const vault = await mockDeposit(createdVault.id, amount);

    if (vault) {
      await refetchVaults();

      setTimeout(() => {
        router.push("/vault");
      }, 1500);
    }
  };

  /**
   * NEW: Handle real ICRC-1 deposit
   * Executes actual blockchain transfer to vault canister
   */
  const handleRealDeposit = async () => {
    if (!createdVault) return;

    const amount = BigInt(depositAmount);
    
    // DEBUG: Log vault subaccount before conversion
    console.log("[CreateVaultForm] Vault ID:", createdVault.id.toString());
    console.log("[CreateVaultForm] ckbtcSubaccountHex:", createdVault.ckbtcSubaccountHex);
    
    // CRITICAL: Convert vault subaccount from hex string to Uint8Array
    let vaultSubaccount: Uint8Array | undefined;
    if (createdVault.ckbtcSubaccountHex) {
      // Convert hex string (e.g., "0x1234...") to Uint8Array
      const hexStr = createdVault.ckbtcSubaccountHex.replace(/^0x/, '');
      const bytes = new Uint8Array(hexStr.length / 2);
      for (let i = 0; i < hexStr.length; i += 2) {
        bytes[i / 2] = parseInt(hexStr.substr(i, 2), 16);
      }
      vaultSubaccount = bytes;
      console.log("[CreateVaultForm] Converted subaccount bytes:", Array.from(vaultSubaccount));
    } else {
      console.warn("[CreateVaultForm] WARNING: No ckbtcSubaccountHex found!");
    }
    
    console.log("[CreateVaultForm] Calling realDeposit with:", {
      vaultId: createdVault.id.toString(),
      amount: amount.toString(),
      hasSubaccount: !!vaultSubaccount,
    });
    
    const result = await realDeposit(createdVault.id, amount, vaultSubaccount);

    if (result.success) {
      // Refresh user balance after transfer
      await refetchBalance();
      
      // NOTE: Sync is now done automatically in realDeposit hook
      // No need to call syncCkbtcBalance manually

      // Refresh vaults list to show updated status
      await refetchVaults();

      setTimeout(() => {
        router.push("/vault");
      }, 1500);
    } else {
      // Deposit failed
      console.error("[CreateVaultForm] Deposit failed:", result.error);
      toast.error(`Deposit failed: ${result.error}`);
    }
  };

  const handleSyncCkbtcBalance = async () => {
    if (!createdVault) return;

    await syncCkbtcBalance();

    // Check if sync was successful (no error)
    if (!syncError) {
      await refetchVaults();
      setTimeout(() => {
        router.push("/vault");
      }, 1500);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // Could add a toast notification here
  };

  // Get ckBTC subaccount hex from VaultDTO
  const getCkbtcSubaccountHex = (vault: VaultDTO | null): string | null => {
    if (!vault) return null;
    return vault.ckbtcSubaccountHex ?? null;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString("id-ID");
  };

  // Show wallet connection message if not connected
  if (!isConnected) {
    return (
      <div className="card-pro p-12 text-center">
        <h2 className="text-heading text-4xl mb-4!">CONNECT YOUR WALLET</h2>
        <p className="text-body text-lg text-accent">
          Connect your wallet to create a new vault
        </p>
      </div>
    );
  }

  return (
    <div className="card-pro p-8 flex flex-col gap-8">
      {/* User Balance Display - NEW */}
      <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-6">
        <WalletBalance showRefresh={true} />
      </div>

      <h3 className="text-heading text-4xl">
        {mode === "complete" ? "COMPLETE DEPOSIT" : "MINT BOND POSITION"}
      </h3>

      {mode === "complete" && existingVault && (
        <div className="rounded-lg border-2 border-blue-400 bg-blue-50 p-6">
          <p className="text-heading text-sm text-accent mb-3!">
            POSITION #{existingVault.id.toString()}
          </p>
          <div className="text-body text-sm text-accent space-y-1">
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
        <div className="rounded-lg border-2 border-red-500 bg-red-50 p-6">
          <p className="text-body font-bold text-red-800 text-lg">
            ERROR: {error}
          </p>
        </div>
      )}

      {!createdVault && mode === "create" ? (
        <>
          <div className="mb-6!">
            <label className="text-body text-sm font-bold mb-2! block">
              VESTING DURATION
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
              <option value="3:seconds">⚗ 3 SECONDS (TESTING)</option>
              <option value="1:months">1 MONTH</option>
              <option value="3:months">3 MONTHS</option>
              <option value="6:months">6 MONTHS</option>
              <option value="12:months">1 YEAR</option>
              <option value="24:months">2 YEARS</option>
              <option value="60:months">5 YEARS</option>
            </select>
            {durationUnit === "seconds" && (
              <p className="text-body text-xs text-orange-600 mt-1 font-bold flex items-center gap-1">
                <AlertCircle size={14} />
                TESTING MODE: Position unlocks in {lockDuration} seconds
              </p>
            )}
          </div>

          <div className="mb-6!">
            <label className="text-body text-sm font-bold mb-2! block">
              BENEFICIARY (OPTIONAL)
            </label>
            <input
              type="text"
              className="input-brutal bg-[#09090B] border-zinc-800 text-white"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="Enter Principal ID (e.g. 2vxsx-fae...)"
              disabled={loading}
            />
            <p className="text-body text-xs text-gray-400 mt-1">
              Principal ID for Dead Man Switch inheritance protocol.
            </p>
          </div>

          <div className="mb-6!">
            <label className="text-body text-sm font-bold mb-2! block">
              DIGITAL WILL MESSAGE (OPTIONAL)
            </label>
            <textarea
              className="input-brutal bg-[#09090B] border-zinc-800 text-white min-h-[120px] resize-y"
              value={willMessage}
              onChange={(e) => setWillMessage(e.target.value)}
              placeholder="Enter a message to be revealed after inheritance timeout..."
              disabled={loading}
              rows={5}
            />
            <p className="text-body text-xs text-gray-400 mt-1">
              Encrypted message revealed only after Dead Man Switch activation
              or to designated beneficiary.
            </p>
          </div>

          <div className="mb-6!">
            <label className="text-body text-sm font-bold mb-2! block">
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
            <p className="text-body text-xs text-gray-400 mt-1">
              {(parseInt(depositAmount) / 100000000).toFixed(8)} BTC
            </p>
          </div>

          <button
            className="btn-pro accent w-full py-4 text-lg font-bold hover-lift"
            onClick={handleCreateVault}
            disabled={loading}
          >
            {loading ? "MINTING..." : "MINT BOND POSITION"}
          </button>
        </>
      ) : createdVault ? (
        <div className="mt-6">
          {mode === "create" && (
            <div className="mb-4!">
              <label className="text-body text-sm font-bold mb-2! block">
                BOND POSITION MINTED
              </label>
              <div className="rounded-lg border-2 border-green-400 bg-green-50 p-6">
                <p className="text-body font-bold text-green-800 mb-2! text-lg">
                  ✓ Position ID: {createdVault.id.toString()}
                </p>
                <p className="text-body text-sm text-green-700">
                  Expected Deposit: {createdVault.expectedDeposit.toString()} sats
                </p>
              </div>
            </div>
          )}

          {/* CONDITIONAL DEPOSIT UI BASED ON NETWORK MODE */}
          {isMockMode ? (
            // MOCK MODE: Manual deposit amount input
            <>
              {mode === "complete" && (
                <div className="mb-4!">
                  <label className="text-body text-sm font-bold mb-2! block">
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
                  <p className="text-body text-xs text-gray-400 mt-1">
                    {(parseInt(depositAmount || "0") / 100000000).toFixed(8)}{" "}
                    BTC
                  </p>
                  <p className="text-body text-xs text-blue-600 mt-1">
                    Expected: {createdVault.expectedDeposit.toLocaleString()}{" "}
                    sats
                  </p>
                </div>
              )}

              <button
                className="btn-pro w-full mb-4! bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleMockDeposit}
                disabled={loading || parseInt(depositAmount || "0") <= 0}
              >
                {loading
                  ? "DEPOSITING..."
                  : mode === "complete"
                  ? "COMPLETE DEPOSIT"
                  : "MOCK DEPOSIT (DEV ONLY)"}
              </button>
            </>
          ) : (
            // CKBTC MODE: Real deposit with ICRC-1 transfer
            <>
              {mode === "complete" && (
                <div className="mb-4!">
                  <label className="text-body text-sm font-bold mb-2! block">
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
                  <p className="text-body text-xs text-gray-400 mt-1">
                    {(parseInt(depositAmount || "0") / 100000000).toFixed(8)}{" "}
                    BTC
                  </p>
                  <p className="text-body text-xs text-blue-600 mt-1">
                    Expected: {createdVault.expectedDeposit.toLocaleString()}{" "}
                    sats
                  </p>
                </div>
              )}

              {/* REAL DEPOSIT BUTTON - NEW */}
              <button
                className="btn-pro w-full mb-4! bg-green-600 text-white hover:bg-green-700 font-bold"
                onClick={handleRealDeposit}
                disabled={loading || parseInt(depositAmount || "0") <= 0}
              >
                {loading
                  ? "PROCESSING TRANSACTION..."
                  : mode === "complete"
                  ? "💰 DEPOSIT CKBTC (REAL TRANSACTION)"
                  : "💰 DEPOSIT CKBTC NOW"}
              </button>

              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg mb-4">
                <p className="text-body text-sm text-yellow-800 font-bold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  REAL BLOCKCHAIN TRANSACTION
                </p>
                <p className="text-body text-xs text-yellow-700 mt-2">
                  Clicking the button above will execute a real ICRC-1 transfer on the Internet Computer. 
                  Your wallet balance will decrease by the amount + 10 e8s network fee.
                </p>
              </div>

              {/* Address display for manual transfer (alternative method) */}
              {(() => {
                const ckbtcSubaccountHex = getCkbtcSubaccountHex(createdVault);
                const canisterId = IC_CONFIG.ironcladCanisterId;
                
                return (
                  <div className="mb-6!">
                    <label className="text-body text-sm font-bold mb-2! flex items-center gap-2 text-blue-600">
                      <MapPin className="w-5 h-5" />
                      DEPOSIT INSTRUCTIONS (ckTESTBTC / ICP NETWORK)
                    </label>

                    {ckbtcSubaccountHex ? (
                      <div className="space-y-4">
                        {/* Canister ID Display */}
                        <div>
                          <label className="text-body text-xs font-bold mb-1 block text-zinc-600">
                            DESTINATION CANISTER ID:
                          </label>
                          <div className="relative">
                            <div className="input-brutal font-mono text-sm break-all pr-12 bg-[#09090B] border-zinc-800 text-white">
                              {canisterId}
                            </div>
                            <button
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-800 rounded"
                              onClick={() => handleCopyAddress(canisterId)}
                              title="Copy canister ID"
                            >
                              <Copy size={18} className="text-zinc-400" />
                            </button>
                          </div>
                        </div>

                        {/* Subaccount Display */}
                        <div>
                          <label className="text-body text-xs font-bold mb-1 block text-zinc-600">
                            VAULT SUBACCOUNT (HEX):
                          </label>
                          <div className="relative">
                            <div className="input-brutal font-mono text-xs break-all pr-12 bg-[#09090B] border-zinc-800 text-white">
                              {ckbtcSubaccountHex}
                            </div>
                            <button
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-800 rounded"
                              onClick={() => handleCopyAddress(ckbtcSubaccountHex)}
                              title="Copy subaccount"
                            >
                              <Copy size={18} className="text-zinc-400" />
                            </button>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-lg">
                          <p className="text-body text-sm text-blue-800 font-bold mb-2">
                            HOW TO DEPOSIT ckTESTBTC:
                          </p>
                          <ol className="text-body text-sm text-blue-700 space-y-2 list-decimal list-inside">
                            <li>
                              Open your ICP wallet (NNS, Plug, or any ICRC-1 compatible wallet)
                            </li>
                            <li>
                              Send{" "}
                              <span className="font-bold">
                                {(
                                  Number(createdVault.expectedDeposit) /
                                  100000000
                                ).toFixed(8)}{" "}
                                ckTESTBTC
                              </span>{" "}
                              to:
                              <div className="ml-6 mt-1 space-y-1">
                                <div className="text-xs">
                                  <span className="font-bold">Canister:</span> {canisterId}
                                </div>
                                <div className="text-xs">
                                  <span className="font-bold">Subaccount:</span> {ckbtcSubaccountHex}
                                </div>
                              </div>
                            </li>
                            <li>
                              Wait for ICP network confirmation (~2-5 seconds)
                            </li>
                            <li>
                              Click &quot;Sync Balance&quot; below to verify the deposit
                            </li>
                          </ol>
                        </div>

                        {/* Expected Deposit Info */}
                        <div className="bg-zinc-100 border-2 border-zinc-400 p-3 rounded-lg">
                          <p className="text-body text-xs text-zinc-600">
                            Expected Deposit:{" "}
                            <span className="font-bold">
                              {createdVault.expectedDeposit.toLocaleString()}{" "}
                              sats
                            </span>{" "}
                            ={" "}
                            <span className="font-bold">
                              {(
                                Number(createdVault.expectedDeposit) /
                                100000000
                              ).toFixed(8)}{" "}
                              ckTESTBTC
                            </span>
                          </p>
                        </div>

                        {/* Technical Note */}
                        <div className="bg-purple-50 border border-purple-300 p-3 rounded-lg">
                          <p className="text-body text-xs text-purple-700 flex items-start gap-2">
                            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                            <span><span className="font-bold">SELF-CUSTODY:</span>{" "}
                            Funds are sent to the Ironclad Vault canister (not your wallet).</span>
                            The canister holds the funds in trust until unlock time.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
                        <p className="text-body text-sm text-yellow-800 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          No ckBTC subaccount found. This vault may not
                          support ckBTC deposits yet.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Sync Balance Button */}
              <button
                className="btn-pro w-full mb-4! bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                onClick={handleSyncCkbtcBalance}
                disabled={syncLoading || !getCkbtcSubaccountHex(createdVault)}
              >
                <RefreshCw
                  size={18}
                  className={syncLoading ? "animate-spin" : ""}
                />
                {syncLoading
                  ? "SCANNING LEDGER..."
                  : "SYNC BALANCE FROM LEDGER"}
              </button>

              {/* Sync Error Display */}
              {syncError && (
                <div className="bg-red-50 border-2 border-red-400 p-4 rounded-lg mb-4">
                  <p className="text-body text-sm text-red-800 font-bold">
                    SYNC ERROR: {syncError}
                  </p>
                  {syncError.includes("not found") && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-900">
                      <p className="font-bold mb-1 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Solution for local development:
                      </p>
                      <p className="mb-2">The ckBTC ledger canister is not available locally. You have two options:</p>
                      <ol className="list-decimal ml-5 space-y-1">
                        <li><strong>Switch to Mock Mode:</strong> Go to Settings and click &quot;SWITCH TO MOCK&quot; to test without the real ledger</li>
                        <li><strong>Deploy to testnet:</strong> Deploy your canister to ICP testnet where the real ckTESTBTC ledger is available</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* WARNING MESSAGES - CONDITIONAL BASED ON NETWORK MODE */}

          {mode === "create" && isMockMode && (
            <>
              <div className="bg-yellow-100 border-2 border-yellow-500 p-4">
                <p className="text-body font-bold text-yellow-800 mb-2! flex items-center gap-2">
                  <Beaker className="w-5 h-5" />
                  DEVELOPMENT MODE - MOCK DEPOSITS
                </p>
                <p className="text-body text-sm text-yellow-700">
                  In production, you would send Bitcoin to a generated address.
                  For development, click &apos;Mock Deposit&apos; above to
                  simulate the deposit.
                </p>
              </div>

              <div className="mt-4 bg-red-100 border-2 border-red-500 p-4">
                <p className="text-body font-bold text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  PRODUCTION WARNING: SEND BTC ONLY. DO NOT SEND CKBTC OR
                  OTHER ASSETS.
                </p>
              </div>
            </>
          )}

          {mode === "create" && isCkbtcMode && (
            <>
              <div className="bg-blue-100 border-2 border-blue-500 p-4">
                <p className="text-body font-bold text-blue-800 mb-2! flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  MAINNET MODE - REAL DEPOSITS
                </p>
                <p className="text-body text-sm text-blue-700">
                  You are in <span className="font-bold">CkBTC Mainnet</span>{" "}
                  mode. Send real ckBTC to the address shown above on the ICP
                  network.
                </p>
              </div>

              <div className="mt-4 bg-green-100 border-2 border-green-500 p-4">
                <p className="text-body font-bold text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  PRODUCTION: SEND CKBTC ON ICP NETWORK
                </p>
                <p className="text-body text-sm text-green-700 mt-1">
                  Only send ckBTC tokens. Do not send native BTC or other
                  assets.
                </p>
              </div>
            </>
          )}

          {mode === "complete" && existingVault && isMockMode && (
            <div className="bg-yellow-100 border-2 border-yellow-500 p-4">
              <p className="text-body font-bold text-yellow-800 mb-2!">
                📍 MOCK DEPOSIT INSTRUCTIONS
              </p>
              <div className="text-body text-sm text-yellow-700 space-y-2">
                <p>
                  1. Enter amount in sats (Expected:{" "}
                  <span className="font-bold">
                    {createdVault.expectedDeposit.toLocaleString()} sats
                  </span>
                  )
                </p>
                <p>2. Click &quot;COMPLETE DEPOSIT&quot; to simulate</p>
                <p>
                  3. Vault status will change to{" "}
                  <span className="font-bold">Locked</span>
                </p>
                <div className="mt-2 pt-2 border-t border-yellow-400">
                  <p className="text-xs text-yellow-600 font-bold">
                    BTC Address (for reference):
                  </p>
                  <p className="font-mono text-xs bg-white p-2 border border-yellow-300 break-all mt-1">
                    {existingVault.btc_address}
                  </p>
                  <p className="text-xs mt-1 text-yellow-600">
                    ⚠️ In production, you would send real BTC to this address.
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode === "complete" && existingVault && isCkbtcMode && (
            <div className="bg-blue-100 border-2 border-blue-500 p-4">
              <p className="text-body font-bold text-blue-800 mb-2!">
                📍 CKBTC DEPOSIT STATUS
              </p>
              <div className="text-body text-sm text-blue-700 space-y-2">
                <p>
                  1. ckBTC sent to the subaccount address will be detected
                  automatically
                </p>
                <p>
                  2. Click &quot;Sync Balance&quot; to check for incoming
                  transfers
                </p>
                <p>
                  3. Once deposit is confirmed, vault status will change to{" "}
                  <span className="font-bold">Locked</span>
                </p>
                <div className="mt-2 pt-2 border-t border-blue-400">
                  <p className="text-xs text-blue-600">
                    Expected: {createdVault.expectedDeposit.toLocaleString()}{" "}
                    sats ={" "}
                    {(
                      Number(createdVault.expectedDeposit) / 100000000
                    ).toFixed(8)}{" "}
                    ckBTC
                  </p>
                </div>
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
      fallback={<div className="card-pro p-8 text-center">Loading...</div>}
    >
      <CreateVaultFormContent />
    </Suspense>
  );
}
