"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

/**
 * Wallet Provider - Phase 1: UI-only wallet state management
 * 
 * This provider manages wallet connection UI state (connected/disconnected, principal display)
 * but does NOT influence canister calls. All ICP calls go through ironcladClient directly
 * using anonymous actors.
 * 
 * Phase 2 will integrate wallet identity into canister calls.
 */

export type WalletType = "ii" | "plug" | "nfid" | null;

interface WalletContextType {
  isConnected: boolean;
  principal: Principal | null;
  principalText: string | null;
  walletType: WalletType;
  isInitializing: boolean;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_TYPE_KEY = "ironclad_wallet_type";
const PRINCIPAL_KEY = "ironclad_principal";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [principalText, setPrincipalText] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  // Initialize AuthClient on mount
  useEffect(() => {
    const initAuthClient = async () => {
      try {
        const client = await AuthClient.create({
          idleOptions: {
            disableIdle: true,
          },
        });
        setAuthClient(client);
      } catch (error) {
        console.error("[Wallet] Failed to initialize AuthClient:", error);
      }
    };
    initAuthClient();
  }, []);

  // Restore session on mount
  useEffect(() => {
    if (!authClient) return;

    const restoreSession = async () => {
      try {
        const savedWalletType = localStorage.getItem(WALLET_TYPE_KEY) as WalletType;
        const savedPrincipal = localStorage.getItem(PRINCIPAL_KEY);

        if (!savedWalletType || !savedPrincipal) {
          setIsInitializing(false);
          return;
        }

        console.log("[Wallet] Restoring session:", { savedWalletType, savedPrincipal });

        if (savedWalletType === "ii") {
          const isAuthenticated = await authClient.isAuthenticated();
          if (isAuthenticated) {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();

            setIsConnected(true);
            setPrincipal(principal);
            setPrincipalText(principal.toString());
            setWalletType("ii");
            console.log("[Wallet] II session restored (UI only)");
          } else {
            // Session expired, clear storage
            localStorage.removeItem(WALLET_TYPE_KEY);
            localStorage.removeItem(PRINCIPAL_KEY);
          }
        }
        // Note: Plug wallet session restore can be added in Phase 2
      } catch (error) {
        console.error("[Wallet] Failed to restore session:", error);
        localStorage.removeItem(WALLET_TYPE_KEY);
        localStorage.removeItem(PRINCIPAL_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, [authClient]);

  const connect = useCallback(
    async (type: WalletType) => {
      if (!type) throw new Error("Wallet type is required");

      try {
        console.log("[Wallet] Connecting to:", type);

        if (type === "ii") {
          if (!authClient) throw new Error("AuthClient not initialized");

          // Internet Identity login
          const isLocalHost =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

          const identityProvider = isLocalHost
            ? "http://127.0.0.1:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
            : "https://identity.ic0.app";

          // Use Promise wrapper to handle async properly
          return new Promise<void>((resolve, reject) => {
            authClient.login({
              identityProvider,
              maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
              // Try popup first, fallback to redirect if blocked
              windowOpenerFeatures: 
                "toolbar=0,location=0,menubar=0,width=500,height=600,left=100,top=100",
              onSuccess: async () => {
                try {
                  const identity = authClient.getIdentity();
                  const principal = identity.getPrincipal();

                  setIsConnected(true);
                  setPrincipal(principal);
                  setPrincipalText(principal.toString());
                  setWalletType("ii");

                  localStorage.setItem(WALLET_TYPE_KEY, "ii");
                  localStorage.setItem(PRINCIPAL_KEY, principal.toString());

                  console.log("[Wallet] II connected (UI only):", principal.toString());
                  resolve();
                } catch (error) {
                  reject(error);
                }
              },
              onError: (error) => {
                console.error("[Wallet] II login failed:", error);
                reject(error);
              },
            });
          });
        } else if (type === "plug") {
          // Plug wallet support can be added in Phase 2
          throw new Error("Plug wallet not supported in Phase 1");
        } else {
          throw new Error(`Unsupported wallet type: ${type}`);
        }
      } catch (error) {
        console.error("[Wallet] Connection failed:", error);
        throw error;
      }
    },
    [authClient]
  );

  const disconnect = useCallback(async () => {
    try {
      console.log("[Wallet] Disconnecting");

      if (walletType === "ii" && authClient) {
        await authClient.logout();
      }

      setIsConnected(false);
      setPrincipal(null);
      setPrincipalText(null);
      setWalletType(null);

      localStorage.removeItem(WALLET_TYPE_KEY);
      localStorage.removeItem(PRINCIPAL_KEY);

      console.log("[Wallet] Disconnected");
    } catch (error) {
      console.error("[Wallet] Disconnect failed:", error);
      throw error;
    }
  }, [walletType, authClient]);

  const value: WalletContextType = {
    isConnected,
    principal,
    principalText,
    walletType,
    isInitializing,
    connect,
    disconnect,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
