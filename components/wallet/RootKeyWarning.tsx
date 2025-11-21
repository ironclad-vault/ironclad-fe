"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { AlertTriangle } from "lucide-react";

export function RootKeyWarning() {
  const { isConnected, disconnect } = useWallet();
  const [dismissed, setDismissed] = useState(false);

  // Check if user needs to reconnect (has old session without root key)
  const needsReconnect = useMemo(() => {
    if (typeof window === "undefined") return false;
    const rootKeyFixed = localStorage.getItem("ironclad_root_key_fixed");
    return isConnected && !rootKeyFixed && !dismissed;
  }, [isConnected, dismissed]);

  const handleReconnect = async () => {
    // Mark as fixed before disconnecting
    localStorage.setItem("ironclad_root_key_fixed", "true");
    setDismissed(true);
    await disconnect();
  };

  const handleDismiss = () => {
    localStorage.setItem("ironclad_root_key_fixed", "true");
    setDismissed(true);
  };

  if (!needsReconnect || dismissed) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4">
      <div className="bg-yellow-50 border-4 border-yellow-400 rounded-lg p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <AlertTriangle size={40} className="text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-xl text-yellow-900 mb-2!">
              Certificate Fix Required
            </h3>
            <p className="text-yellow-800 mb-4!">
              We&apos;ve fixed the certificate verification issue. To apply the
              fix, please disconnect and reconnect your wallet.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReconnect}
                className="px-4 py-2 bg-yellow-600 text-white font-bold rounded hover:bg-yellow-700 transition-colors"
              >
                Disconnect & Reconnect
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 border-2 border-yellow-600 text-yellow-900 font-bold rounded hover:bg-yellow-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
