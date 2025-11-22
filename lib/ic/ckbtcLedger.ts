/**
 * ckBTC Ledger Service - ICRC-1 Integration
 * 
 * This service provides real blockchain integration with the local ICRC-1 ledger
 * that mimics ckBTC for development and testing.
 * 
 * CRITICAL: Replaces all mock data with real canister calls.
 */

import { Actor, type Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { getAgent } from "./agent";
import { idlFactory } from "./ckbtc_ledger.idl";

// ============================================================================
// ICRC-1 STANDARD TYPES
// ============================================================================

// TypeScript interface for our code
export interface Account {
  owner: Principal;
  subaccount?: Uint8Array;
}

// Candid-compatible type (what actually gets sent)
type CandidAccount = {
  owner: Principal;
  subaccount: [] | [Uint8Array];
};

export interface TransferArgs {
  from_subaccount?: Uint8Array;
  to: Account;
  amount: bigint;
  fee?: bigint;
  memo?: Uint8Array;
  created_at_time?: bigint;
}

// Candid-compatible type (what actually gets sent)
type CandidTransferArgs = {
  from_subaccount: [] | [Uint8Array];
  to: CandidAccount;
  amount: bigint;
  fee: [] | [bigint];
  memo: [] | [Uint8Array];
  created_at_time: [] | [bigint];
};

export interface TransferResult {
  Ok?: bigint; // Transaction index
  Err?: TransferError;
}

export type TransferError =
  | { BadFee: { expected_fee: bigint } }
  | { BadBurn: { min_burn_amount: bigint } }
  | { InsufficientFunds: { balance: bigint } }
  | { TooOld: null }
  | { CreatedInFuture: { ledger_time: bigint } }
  | { Duplicate: { duplicate_of: bigint } }
  | { TemporarilyUnavailable: null }
  | { GenericError: { error_code: bigint; message: string } };

// ============================================================================
// ICRC-1 LEDGER ACTOR INTERFACE
// ============================================================================

interface ICRC1Ledger {
  icrc1_balance_of: (account: CandidAccount) => Promise<bigint>;
  icrc1_transfer: (args: CandidTransferArgs) => Promise<TransferResult>;
  icrc1_metadata: () => Promise<Array<[string, { Text: string } | { Nat: bigint }]>>;
  icrc1_name: () => Promise<string>;
  icrc1_symbol: () => Promise<string>;
  icrc1_decimals: () => Promise<number>;
  icrc1_fee: () => Promise<bigint>;
  icrc1_total_supply: () => Promise<bigint>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CKBTC_LEDGER_ID = process.env.NEXT_PUBLIC_CKBTC_LEDGER_ID || "mxzaz-hqaaa-aaaar-qaada-cai";

// ============================================================================
// ACTOR CREATION
// ============================================================================

async function createCkbtcLedgerActor(identity?: Identity): Promise<ICRC1Ledger> {
  const agent = await getAgent(identity);
  
  const actor = Actor.createActor<ICRC1Ledger>(idlFactory, {
    agent,
    canisterId: CKBTC_LEDGER_ID,
  });

  console.info("[ckBTC Ledger] Actor created for canister:", CKBTC_LEDGER_ID);
  
  return actor;
}

// ============================================================================
// PUBLIC API - REPLACES ALL MOCK FUNCTIONS
// ============================================================================

/**
 * Get ckBTC balance for a principal
 * @param owner Principal to check balance for
 * @param subaccount Optional subaccount (default: null)
 * @param identity Optional identity for authenticated calls
 * @returns Balance in e8s (satoshis)
 * 
 * REPLACES: Any mock balance functions
 */
export async function getCkbtcBalance(
  owner: Principal,
  subaccount?: Uint8Array,
  identity?: Identity
): Promise<bigint> {
  try {
    const actor = await createCkbtcLedgerActor(identity);
    
    // CRITICAL: Convert to Candid optional format ([] or [value])
    const account: CandidAccount = {
      owner,
      subaccount: subaccount ? [subaccount] : [],
    };

    const balance = await actor.icrc1_balance_of(account);
    
    console.info(
      "[ckBTC Ledger] Balance for",
      owner.toString(),
      ":",
      balance.toString(),
      "e8s"
    );
    
    return balance;
  } catch (error) {
    // Enhanced error handling for common issues
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    if (errorMsg.includes("Canister") && errorMsg.includes("not found")) {
      console.error(
        "[ckBTC Ledger] ❌ Canister not found:",
        CKBTC_LEDGER_ID,
        "\n💡 Solution: Run deployment script:",
        "\n   cd ironclad_vault && ./scripts/deploy_local_ckbtc.sh"
      );
      throw new Error(
        `ckBTC Ledger not deployed. Run: ./scripts/deploy_local_ckbtc.sh`
      );
    }
    
    console.error("[ckBTC Ledger] Failed to get balance:", error);
    throw error;
  }
}

/**
 * Transfer ckBTC to another account
 * @param to Destination account
 * @param amount Amount in e8s (satoshis)
 * @param identity Identity for signing the transaction
 * @returns Transaction index on success
 * 
 * REPLACES: Any mock transfer functions
 */
export async function transferCkbtc(
  to: Account,
  amount: bigint,
  identity: Identity
): Promise<bigint> {
  try {
    const actor = await createCkbtcLedgerActor(identity);
    
    // Convert 'to' account to Candid format
    const candidTo: CandidAccount = {
      owner: to.owner,
      subaccount: to.subaccount ? [to.subaccount] : [],
    };

    // CRITICAL DEBUG: Log what we're transferring to
    console.log("[ckBTC Ledger] Transfer details:", {
      to_owner: to.owner.toString(),
      to_subaccount: to.subaccount ? Array.from(to.subaccount).map(b => b.toString(16).padStart(2, '0')).join('') : "NONE (MAIN ACCOUNT)",
      subaccount_is_set: !!to.subaccount,
      candid_subaccount_format: candidTo.subaccount,
      amount: amount.toString(),
    });
    
    // CRITICAL: Convert to Candid optional format ([] or [value])
    const args: CandidTransferArgs = {
      to: candidTo,
      amount,
      fee: [], // Empty array = use default fee
      memo: [],
      created_at_time: [],
      from_subaccount: [],
    };

    const result = await actor.icrc1_transfer(args);
    
    if ("Ok" in result) {
      const txIndex = result.Ok!;
      console.info(
        "[ckBTC Ledger] Transfer successful. TX index:",
        txIndex.toString()
      );
      return txIndex;
    } else {
      const error = result.Err!;
      console.error("[ckBTC Ledger] Transfer failed:", error);
      throw new Error(`Transfer failed: ${JSON.stringify(error)}`);
    }
  } catch (error) {
    console.error("[ckBTC Ledger] Transfer error:", error);
    throw error;
  }
}

/**
 * Get ledger metadata
 * @param identity Optional identity
 * @returns Array of metadata entries
 */
export async function getCkbtcMetadata(
  identity?: Identity
): Promise<Array<[string, { Text: string } | { Nat: bigint }]>> {
  try {
    const actor = await createCkbtcLedgerActor(identity);
    const metadata = await actor.icrc1_metadata();
    
    console.info("[ckBTC Ledger] Metadata:", metadata);
    
    return metadata;
  } catch (error) {
    console.error("[ckBTC Ledger] Failed to get metadata:", error);
    throw error;
  }
}

/**
 * Get token symbol (should return "ckBTC")
 * @param identity Optional identity
 * @returns Token symbol
 */
export async function getCkbtcSymbol(identity?: Identity): Promise<string> {
  try {
    const actor = await createCkbtcLedgerActor(identity);
    const symbol = await actor.icrc1_symbol();
    
    console.info("[ckBTC Ledger] Symbol:", symbol);
    
    return symbol;
  } catch (error) {
    console.error("[ckBTC Ledger] Failed to get symbol:", error);
    throw error;
  }
}

/**
 * Get token name (should return "Chain Key Bitcoin")
 * @param identity Optional identity
 * @returns Token name
 */
export async function getCkbtcName(identity?: Identity): Promise<string> {
  try {
    const actor = await createCkbtcLedgerActor(identity);
    const name = await actor.icrc1_name();
    
    console.info("[ckBTC Ledger] Name:", name);
    
    return name;
  } catch (error) {
    console.error("[ckBTC Ledger] Failed to get name:", error);
    throw error;
  }
}

/**
 * Get token decimals (should return 8 for ckBTC)
 * @param identity Optional identity
 * @returns Number of decimals
 */
export async function getCkbtcDecimals(identity?: Identity): Promise<number> {
  try {
    const actor = await createCkbtcLedgerActor(identity);
    const decimals = await actor.icrc1_decimals();
    
    console.info("[ckBTC Ledger] Decimals:", decimals);
    
    return decimals;
  } catch (error) {
    console.error("[ckBTC Ledger] Failed to get decimals:", error);
    throw error;
  }
}

/**
 * Get transfer fee (should return 10 e8s)
 * @param identity Optional identity
 * @returns Fee in e8s
 */
export async function getCkbtcFee(identity?: Identity): Promise<bigint> {
  try {
    const actor = await createCkbtcLedgerActor(identity);
    const fee = await actor.icrc1_fee();
    
    console.info("[ckBTC Ledger] Fee:", fee.toString(), "e8s");
    
    return fee;
  } catch (error) {
    console.error("[ckBTC Ledger] Failed to get fee:", error);
    throw error;
  }
}

/**
 * Get total supply
 * @param identity Optional identity
 * @returns Total supply in e8s
 */
export async function getCkbtcTotalSupply(identity?: Identity): Promise<bigint> {
  try {
    const actor = await createCkbtcLedgerActor(identity);
    const supply = await actor.icrc1_total_supply();
    
    console.info("[ckBTC Ledger] Total Supply:", supply.toString(), "e8s");
    
    return supply;
  } catch (error) {
    console.error("[ckBTC Ledger] Failed to get total supply:", error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert e8s (satoshis) to BTC for display
 * @param e8s Amount in e8s
 * @returns Amount in BTC as string
 */
export function e8sToBtc(e8s: bigint): string {
  const btc = Number(e8s) / 100_000_000;
  return btc.toFixed(8);
}

/**
 * Convert BTC to e8s (satoshis) for transactions
 * @param btc Amount in BTC
 * @returns Amount in e8s
 */
export function btcToE8s(btc: number): bigint {
  return BigInt(Math.round(btc * 100_000_000));
}

/**
 * Format balance for display
 * @param e8s Balance in e8s
 * @param decimals Number of decimal places to show
 * @returns Formatted string with symbol
 */
export function formatCkbtcBalance(e8s: bigint, decimals: number = 8): string {
  const btc = e8sToBtc(e8s);
  return `${parseFloat(btc).toFixed(decimals)} ckBTC`;
}
