/**
 * WalletBalance Component
 * Displays user's real ckBTC balance from the local ledger
 */

"use client";

import { useUserBalance } from "@/hooks/ironclad/useUserBalance";
import { e8sToBtc } from "@/lib/ic/ckbtcLedger";
import { RefreshCw } from "lucide-react";

interface WalletBalanceProps {
  className?: string;
  showRefresh?: boolean;
}

export function WalletBalance({ 
  className = "", 
  showRefresh = true 
}: WalletBalanceProps) {
  const { balance, loading, error, refetch } = useUserBalance();

  if (loading && balance === null) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm text-zinc-400">Loading balance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-500 ${className}`}>
        <span className="text-sm">Error loading balance</span>
        {showRefresh && (
          <button
            onClick={refetch}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (balance === null) {
    return (
      <div className={`text-sm text-zinc-400 ${className}`}>
        Connect wallet to see balance
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex flex-col">
        <span className="text-xs text-zinc-400 uppercase tracking-wide">
          Available Balance
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">
            {parseFloat(e8sToBtc(balance)).toFixed(4)}
          </span>
          <span className="text-sm text-zinc-400">ckBTC</span>
        </div>
      </div>
      
      {showRefresh && (
        <button
          onClick={refetch}
          disabled={loading}
          className="p-2 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw 
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} 
          />
        </button>
      )}
    </div>
  );
}
