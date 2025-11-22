"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { AuthClient } from "@dfinity/auth-client";
// identity type imported above
import { Principal } from "@dfinity/principal";

/**
 * Wallet Provider - Supports multiple authentication methods
 *
 * - Internet Identity (ii): Production authentication
 * - Test Mode (test): Local development with deterministic test identities
 */

export type WalletType = "ii" | "plug" | "nfid" | "test" | null;

interface WalletContextType {
  isConnected: boolean;
  principal: Principal | null;
  principalText: string | null;
  walletType: WalletType;
  isInitializing: boolean;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  identity?: Identity | null;
}
import type { Identity } from "@dfinity/agent";

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
  const [identity, setIdentity] = useState<Identity | null>(null);

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
        const savedWalletType = localStorage.getItem(
          WALLET_TYPE_KEY
        ) as WalletType;
        const savedPrincipal = localStorage.getItem(PRINCIPAL_KEY);

        if (!savedWalletType || !savedPrincipal) {
          setIsInitializing(false);
          return;
        }

        // If test mode is enabled and we have old II session, clear it
        const { IC_CONFIG } = await import("@/lib/ic/config");
        if (IC_CONFIG.useLocalTestMode && savedWalletType === "ii") {
          console.log("[Wallet] Test mode enabled, clearing old II session");
          localStorage.removeItem(WALLET_TYPE_KEY);
          localStorage.removeItem(PRINCIPAL_KEY);
          await authClient.logout();
          setIsInitializing(false);
          return;
        }

        if (savedWalletType === "test") {
          // Restore test mode session
          const testSeed = localStorage.getItem("ironclad_test_identity_seed");
          if (testSeed) {
            const { generateTestIdentity } = await import("@/lib/ic/testIdentity");
            const testIdentity = generateTestIdentity(testSeed);
            const principal = testIdentity.getPrincipal();

            setIsConnected(true);
            setPrincipal(principal);
            setPrincipalText(principal.toString());
            setWalletType("test");
            setIdentity(testIdentity);
            console.log("[Wallet] Test session restored:", principal.toString());
          } else {
            // Test seed missing, clear session
            localStorage.removeItem(WALLET_TYPE_KEY);
            localStorage.removeItem(PRINCIPAL_KEY);
          }
        } else if (savedWalletType === "ii") {
          const isAuthenticated = await authClient.isAuthenticated();
          if (isAuthenticated) {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();

            setIsConnected(true);
            setPrincipal(principal);
            setPrincipalText(principal.toString());
            setWalletType("ii");

            // expose identity for signed canister calls
            setIdentity(identity);
            console.log("[Wallet] II session restored");
          } else {
            // Session expired, clear storage
            localStorage.removeItem(WALLET_TYPE_KEY);
            localStorage.removeItem(PRINCIPAL_KEY);
          }
        }
      } catch (error) {
        console.error("[Wallet] Failed to restore session:", error);
        localStorage.removeItem(WALLET_TYPE_KEY);
        localStorage.removeItem(PRINCIPAL_KEY);
        localStorage.removeItem("ironclad_test_identity_seed");
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, [authClient]);

  const connect = useCallback(
    async (type: WalletType) => {
      if (!type) throw new Error("Wallet type is required");

            // expose identity for signed canister calls
            setIdentity(identity);

      try {
        console.log("[Wallet] Connecting to:", type);

        if (type === "test") {
          // Test mode for local development - no Internet Identity needed
          const { generateTestIdentity } = await import("@/lib/ic/testIdentity");
          
          // Generate a unique test identity per browser session
          const testSeed = Date.now().toString() + Math.random().toString();
          const testIdentity = generateTestIdentity(testSeed);
          const principal = testIdentity.getPrincipal();

          setIsConnected(true);
          setPrincipal(principal);
          setPrincipalText(principal.toString());
          setWalletType("test");
          setIdentity(testIdentity);

          localStorage.setItem(WALLET_TYPE_KEY, "test");
          localStorage.setItem(PRINCIPAL_KEY, principal.toString());
          localStorage.setItem("ironclad_test_identity_seed", testSeed);

          console.log("[Wallet] Test mode connected:", principal.toString());
          return;
        }

        if (type === "ii") {
          if (!authClient) throw new Error("AuthClient not initialized");

          // Internet Identity login - use config to determine correct provider
          const { IC_CONFIG } = await import("@/lib/ic/config");
          const identityProvider = IC_CONFIG.internetIdentityUrl;

          console.log("[Wallet] Using Identity Provider:", identityProvider);
          console.log("[Wallet] Environment:", IC_CONFIG.isLocal ? "LOCAL" : "REMOTE");

          // Use Promise wrapper to handle async properly
          return new Promise<void>((resolve, reject) => {
            authClient.login({
              identityProvider,
              maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
              // For local development, ensure we're using the correct redirect origin
              derivationOrigin: IC_CONFIG.isLocal ? undefined : window.location.origin,
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
                  // expose identity for signed canister calls
                  setIdentity(identity);

                  localStorage.setItem(WALLET_TYPE_KEY, "ii");
                  localStorage.setItem(PRINCIPAL_KEY, principal.toString());

                  console.log(
                    "[Wallet] II connected (UI only):",
                    principal.toString()
                  );
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
    [authClient, setIdentity, identity]
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
      setIdentity(null);

      localStorage.removeItem(WALLET_TYPE_KEY);
      localStorage.removeItem(PRINCIPAL_KEY);
      localStorage.removeItem("ironclad_test_identity_seed");

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
    identity,
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
