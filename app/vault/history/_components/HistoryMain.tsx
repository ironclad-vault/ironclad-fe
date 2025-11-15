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
    return action;
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to view vault history.</p>
        </div>
      </div>
    );
  }

  if (!vaultId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4">No Vault Selected</h2>
          <p className="text-gray-600">Please select a vault to view its history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <p className="text-gray-600">Loading vault history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="border-2 border-black p-8 bg-white">
        <h1 className="text-3xl font-bold mb-6">Vault History</h1>
        <p className="text-sm text-gray-600 mb-6">Vault ID: {vaultId}</p>

        {events.length === 0 ? (
          <p className="text-gray-600">No events found for this vault.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="border-2 border-black p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg">
                    {formatEventType(event.action)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                <span>Action: <span className="font-bold">{event.action}</span></span>
              </p>
              {event.notes && (
                <p className="text-xs text-gray-500 mt-1">{event.notes}</p>
              )}

                {event.notes !== null && (
                  <p className="text-sm text-gray-600">
                    Notes: {event.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
