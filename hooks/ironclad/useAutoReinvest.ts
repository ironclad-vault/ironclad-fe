"use client";

import { useState, useEffect, useCallback } from "react";
import type { Vault } from "@/lib/ic/ironcladActor";
import type { AutoReinvestConfigDTO } from "@/lib/ironclad-service";
import { 
  getMyAutoReinvestConfigs,
  getPlanStatus, 
  retryFailedPlan,
  scheduleAutoReinvest,
  cancelAutoReinvest,
  executeAutoReinvest,
} from "@/lib/ironclad-service";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/toastUtils";

type PlanStatus = "Active" | "Cancelled" | "Error" | "Paused";

/**
 * Hook for managing auto-reinvest configurations with multi-cycle support
 * Tracks plan status (Active, Cancelled, Error), next cycles, and execution count
 */
export function useAutoReinvest() {
  const [configs, setConfigs] = useState<readonly AutoReinvestConfigDTO[]>([]);
  const [planStatuses, setPlanStatuses] = useState<Map<bigint, PlanStatus>>(new Map());
  const [nextCycles, setNextCycles] = useState<Map<bigint, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyAutoReinvestConfigs();
      setConfigs(data);
      
      // Update plan statuses and next cycles from configs
      const newStatuses = new Map<bigint, PlanStatus>();
      const newCycles = new Map<bigint, number>();
      
      data.forEach(config => {
        newStatuses.set(config.vaultId, config.planStatus);
        newCycles.set(config.vaultId, config.nextCycleTimestamp);
      });
      
      setPlanStatuses(newStatuses);
      setNextCycles(newCycles);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Failed:", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll plan status every 10 seconds if there are active plans
  useEffect(() => {
    if (configs.length === 0) return;

    const activePlans = configs.filter(c => c.planStatus === "Active");
    if (activePlans.length === 0) return;

    const interval = setInterval(async () => {
      try {
        // Poll all active plans
        const statusUpdates = await Promise.all(
          activePlans.map(config => getPlanStatus({ vaultId: config.vaultId }))
        );

        // Update states with new data
        const newStatuses = new Map(planStatuses);
        const newCycles = new Map(nextCycles);
        
        statusUpdates.forEach((status, idx) => {
          const vaultId = activePlans[idx]!.vaultId;
          newStatuses.set(vaultId, status.planStatus);
          newCycles.set(vaultId, status.nextCycleTimestamp);
        });
        
        setPlanStatuses(newStatuses);
        setNextCycles(newCycles);
        
        // Refresh configs if any status changed to Error
        const hasNewErrors = statusUpdates.some((s, idx) => 
          s.planStatus === "Error" && activePlans[idx]!.planStatus !== "Error"
        );
        if (hasNewErrors) {
          fetchConfigs();
        }
      } catch (err) {
        console.error("[useAutoReinvest] Polling error:", err);
      }
    }, 10000); // 10 second interval

    return () => clearInterval(interval);
  }, [configs, planStatuses, nextCycles, fetchConfigs]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const schedule = async (
    vaultId: bigint,
    newLockDuration: bigint
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await toast.promise(
        scheduleAutoReinvest({ vaultId, newLockDuration }),
        {
          loading: 'Scheduling auto-reinvest plan...',
          success: 'Auto-reinvest plan scheduled successfully!',
          error: (err) => `Failed to schedule: ${getErrorMessage(err)}`,
        }
      );
      
      await fetchConfigs();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Schedule failed:", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (vaultId: bigint): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await toast.promise(
        cancelAutoReinvest({ vaultId }),
        {
          loading: 'Cancelling auto-reinvest plan...',
          success: 'Auto-reinvest plan cancelled successfully!',
          error: (err) => `Failed to cancel: ${getErrorMessage(err)}`,
        }
      );
      
      await fetchConfigs();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Cancel failed:", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const execute = async (vaultId: bigint): Promise<Vault | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await toast.promise(
        executeAutoReinvest({ vaultId }),
        {
          loading: 'Executing auto-reinvest plan...',
          success: 'Plan executed successfully! Next cycle scheduled.',
          error: (err) => `Execution failed: ${getErrorMessage(err)}`,
        }
      );
      
      await fetchConfigs();
      return result as unknown as Vault | null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Execute failed:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // NEW: Retry failed plan
  const retryPlan = async (vaultId: bigint): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await toast.promise(
        retryFailedPlan({ vaultId }),
        {
          loading: 'Retrying auto-reinvest plan...',
          success: 'Plan retry successful! Next cycle scheduled.',
          error: (err) => `Failed to retry: ${getErrorMessage(err)}`,
        }
      );
      
      await fetchConfigs();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("[useAutoReinvest] Retry failed:", msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    configs,
    planStatuses,
    nextCycles,
    loading,
    error,
    refetch: fetchConfigs,
    schedule,
    cancel,
    execute,
    retryPlan,
  };
}
