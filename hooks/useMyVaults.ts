/**
 * useMyVaults Hook
 * Fetch all vaults owned by the current user
 * For smoke testing ICP connection
 */

'use client';

import { useEffect, useState } from 'react';
import { ironcladClient } from '@/lib/ic/ironcladClient';
import type { Vault } from '@/lib/ic/ironcladActor';

interface UseMyVaultsReturn {
  data: ReadonlyArray<Vault> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch vaults for the current user
 * Uses anonymous identity by default (no wallet connection required)
 */
export function useMyVaults(): UseMyVaultsReturn {
  const [data, setData] = useState<ReadonlyArray<Vault> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVaults = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ironcladClient.vaults.getMyVaults();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await ironcladClient.vaults.getMyVaults();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error, refetch: fetchVaults };
}
