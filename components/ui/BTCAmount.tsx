/**
 * BTCAmount Component
 * Renders BTC amounts with "diminished decimals" style
 * Major digits (bold) + Minor decimals (light gray)
 */

import { formatBTCWithDiminishedDecimals } from "@/lib/vaultUtils";

interface BTCAmountProps {
  sats: bigint | number;
  showLabel?: boolean;
  className?: string;
}

export default function BTCAmount({
  sats,
  showLabel = true,
  className = "",
}: BTCAmountProps) {
  const formatted = formatBTCWithDiminishedDecimals(sats);

  return (
    <div className={`flex items-baseline gap-0.5 ${className}`}>
      <span className="btc-amount-major">{formatted.major}</span>
      {formatted.minor && (
        <span className="btc-amount-minor">{formatted.minor}</span>
      )}
      {showLabel && <span className="text-xs ml-1 text-zinc-500">BTC</span>}
    </div>
  );
}
