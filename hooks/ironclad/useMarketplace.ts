"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import type { MarketListing } from "@/lib/ic/ironcladActor";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/toastUtils";

/**
 * Hook for managing marketplace listings
 * Phase 1: Uses anonymous canister calls (no wallet identity)
 */
export function useMarketplace() {
  const [listings, setListings] = useState<readonly MarketListing[]>([]);
  const [myListings, setMyListings] = useState<readonly MarketListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { identity } = useWallet();

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [allListings, ownListings] = await Promise.all([
        ironcladClient.marketplace.getActiveListings(identity ?? undefined),
        ironcladClient.marketplace.getMyListings(identity ?? undefined),
      ]);
      setListings(allListings);
      setMyListings(ownListings);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useMarketplace] Failed:", msg);
    } finally {
      setLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const create = async (vaultId: bigint, priceSats: bigint): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await toast.promise(
        ironcladClient.marketplace.create(vaultId, priceSats, identity ?? undefined),
        {
          loading: 'Creating marketplace listing...',
          success: (res) => {
            if ("Err" in res) {
              throw new Error(res.Err);
            }
            return 'Listing created successfully!';
          },
          error: (err) => `Failed to create listing: ${getErrorMessage(err)}`,
        }
      );
      
      if ("Err" in result) {
        setError(result.Err);
        return false;
      }
      await fetchListings();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useMarketplace] Create failed:", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (listingId: bigint): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await toast.promise(
        ironcladClient.marketplace.cancel(listingId, identity ?? undefined),
        {
          loading: 'Cancelling listing...',
          success: (res) => {
            if ("Err" in res) {
              throw new Error(res.Err);
            }
            return 'Listing cancelled successfully!';
          },
          error: (err) => `Failed to cancel listing: ${getErrorMessage(err)}`,
        }
      );
      
      if ("Err" in result) {
        setError(result.Err);
        return false;
      }
      await fetchListings();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useMarketplace] Cancel failed:", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buy = async (listingId: bigint): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await toast.promise(
        ironcladClient.marketplace.buy(listingId, identity ?? undefined),
        {
          loading: 'Purchasing vault...',
          success: (res) => {
            if ("Err" in res) {
              throw new Error(res.Err);
            }
            return 'Vault purchased successfully!';
          },
          error: (err) => `Purchase failed: ${getErrorMessage(err)}`,
        }
      );
      
      if ("Err" in result) {
        setError(result.Err);
        return false;
      }
      await fetchListings();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useMarketplace] Buy failed:", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    listings,
    myListings,
    loading,
    error,
    refetch: fetchListings,
    createListing: create,
    cancelListing: cancel,
    buyListing: buy,
  };
}
