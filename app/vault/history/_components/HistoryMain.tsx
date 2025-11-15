"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/components/wallet/useWallet";
import { getVaultEvents } from "@/lib/ironclad-service";
import type { VaultEventDTO } from "@/lib/ironclad-service";

export default function HistoryMain() {
  const searchParams = useSearchParams();
  const vaultId = searchParams.get("vaultId");
  const { isConnected } = useWallet();

  const [events, setEvents] = useState<VaultEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !vaultId) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const vaultEvents = await getVaultEvents({ vaultId: BigInt(vaultId) });
        setEvents(vaultEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isConnected, vaultId]);

  const formatEventType = (action: string): string => {
    switch (action) {
      case "VaultCreated":
        return "🏗️ Vault Created";
      case "DepositInitiated":
        return "⬇️ Deposit Initiated";
      case "DepositConfirmed":
        return "✅ Deposit Confirmed";
      case "UnlockInitiated":
        return "🔓 Unlock Initiated";
      case "UnlockCompleted":
        return "✨ Unlock Completed";
      case "WithdrawalInitiated":
        return "⬆️ Withdrawal Initiated";
      case "WithdrawalCompleted":
        return "💰 Withdrawal Completed";
      case "AutoReinvestScheduled":
        return "🔄 Auto-Reinvest Scheduled";
      case "AutoReinvestCancelled":
        return "❌ Auto-Reinvest Cancelled";
      case "AutoReinvestExecuted":
        return "🚀 Auto-Reinvest Executed";
      case "ListingCreated":
        return "📢 Listing Created";
      case "ListingCancelled":
        return "🚫 Listing Cancelled";
      case "ListingPurchased":
        return "💎 Listing Purchased";
      default:
        return action;
    }
  };

  const getEventColor = (action: string): string => {
    switch (action) {
      case "VaultCreated":
      case "DepositConfirmed":
      case "UnlockCompleted":
      case "WithdrawalCompleted":
      case "AutoReinvestExecuted":
      case "ListingPurchased":
        return "border-green-500 bg-green-50";
      case "DepositInitiated":
      case "UnlockInitiated":
      case "WithdrawalInitiated":
      case "AutoReinvestScheduled":
      case "ListingCreated":
        return "border-blue-500 bg-blue-50";
      case "AutoReinvestCancelled":
      case "ListingCancelled":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  if (!isConnected) {
    return (
      <div className="card-brutal p-8 text-center">
        <h2 className="heading-brutal text-2xl mb-4">CONNECT YOUR WALLET</h2>
        <p className="body-brutal text-lg text-gray-600">
          Please connect your wallet to view vault history.
        </p>
      </div>
    );
  }

  if (!vaultId) {
    return (
      <div className="card-brutal p-8 text-center">
        <h2 className="heading-brutal text-2xl mb-4">NO VAULT SELECTED</h2>
        <p className="body-brutal text-lg text-gray-600">
          Please select a vault to view its history.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-brutal p-8 text-center">
        <p className="body-brutal text-lg text-gray-600">
          Loading vault history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-brutal p-8 bg-red-50 border-red-300">
        <h2 className="heading-brutal text-lg text-red-900 mb-2">ERROR</h2>
        <p className="body-brutal text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="card-brutal p-8 mx-auto w-full">
      <h1 className="heading-brutal text-3xl mb-2">VAULT HISTORY</h1>
      <p className="body-brutal text-sm text-gray-600 mb-6">
        Vault ID: {vaultId}
      </p>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="body-brutal text-gray-600 mb-4">
            No events found for this vault.
          </p>
          <p className="body-brutal text-sm text-gray-500">
            Events will appear here once you start using the vault.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center body-brutal text-sm font-bold mb-4 pb-2 border-b-2 border-black">
            <span>EVENT</span>
            <span className="text-right">DATE & TIME</span>
          </div>
          {events.map((event, index) => (
            <div
              key={index}
              className={`card-brutal p-4 transition-all ${getEventColor(
                event.action
              )}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="heading-brutal text-lg">
                  {formatEventType(event.action)}
                </span>
                <span className="body-brutal text-sm text-gray-600 text-right">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 body-brutal text-sm">
                <div>
                  <span className="font-semibold">ACTION TYPE:</span>
                  <span className="ml-2 font-mono text-xs bg-white px-2 py-1 border border-gray-300">
                    {event.action}
                  </span>
                </div>
                {event.notes !== null && event.notes !== "" && (
                  <div className="md:col-span-2">
                    <span className="font-semibold">NOTES:</span>
                    <p className="mt-1 text-xs bg-white p-2 border border-gray-300 rounded">
                      {event.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
