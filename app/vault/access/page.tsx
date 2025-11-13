"use client";

import { useState } from "react";
import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import InfoBox from "@/app/vault/_components/InfoBox";
import TransitionWrapper from "../../transition-wrapper";

// Mock Authentication Data
const mockAuthData = {
  principalId: "2vxsx-paeaaa-caaaa-aaaaa-q",
  userId: "user_7f42a9e1c3b6d850",
  walletType: "Internet Identity",
  isLoggedIn: true,
};

// AccessControlPanel Component (Right Column)
function AccessControlPanel({
  principalId,
  userId,
  walletType,
  isLoggedIn,
}: {
  principalId: string;
  userId: string;
  walletType: string;
  isLoggedIn: boolean;
}) {
  const [authStatus, setAuthStatus] = useState(isLoggedIn);

  const handleDisconnect = () => {
    // In a real app, this would disconnect the wallet
    setAuthStatus(false);
    setTimeout(() => {
      // Simulate redirect to login
      alert("Redirecting to login page...");
      setAuthStatus(true); // Reset for demo
    }, 1000);
  };

  const handleReconnect = () => {
    // In a real app, this would prompt to reconnect wallet
    alert("Reconnecting with same wallet...");
  };

  const handleChangeWallet = () => {
    // In a real app, this would allow switching wallets
    alert("Opening wallet selection...");
  };

  return (
    <div className="space-y-8">
      {/* Authentication Details */}
      <div className="space-y-6">
        <InfoBox title="PRINCIPAL ID" value={principalId} isMono />

        <InfoBox title="CONNECTED WALLET" value={walletType} />

        <InfoBox title="CANISTER USER ID" value={userId} isMono />

        <InfoBox title="AUTH STATUS">
          <div
            className={
              authStatus ? "status-brutal unlocked" : "status-brutal locked"
            }
          >
            {authStatus ? "CONNECTED" : "DISCONNECTED"}
          </div>
        </InfoBox>
      </div>

      {/* Action Buttons */}
      <div>
        <h3 className="heading-brutal text-lg mb-4">CONTROLS</h3>
        <div className="space-y-4">
          <button
            className="button-brutal accent w-full"
            onClick={handleDisconnect}
            disabled={!authStatus}
          >
            DISCONNECT
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              className="button-brutal"
              onClick={handleReconnect}
              disabled={authStatus}
            >
              RECONNECT
            </button>

            <button className="button-brutal" onClick={handleChangeWallet}>
              CHANGE WALLET
            </button>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <InfoBox title="SECURITY NOTE">
        <p className="body-brutal">
          Your Principal ID is immutable and is permanently linked to all vaults
          created under this identity. Never share your Principal ID with
          untrusted parties.
        </p>
      </InfoBox>
    </div>
  );
}

export default function AccessPage() {
  const principalId = "2vxsx-paeaaa-caaaa-aaaaa-q"; // mock principal id

  return (
    <div className="min-h-screen flex flex-col bg-(--color-bg-primary)">
      <TransitionWrapper>
        <VaultHeader currentPath="/vault/access" principalId={principalId} />

        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1 flex flex-col gap-8">
            <div className="container mx-auto px-6 flex flex-col gap-8">
              <h1 className="heading-brutal text-4xl text-center">
                ACCESS CONTROL
              </h1>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Main Identity Information */}
                <div>
                  <h2 className="heading-brutal text-xl mb-4">
                    IDENTITY INFORMATION
                  </h2>

                  <div className="space-y-6">
                    <InfoBox title="NETWORK">
                      <p className="body-brutal">
                        Internet Computer Blockchain
                      </p>
                    </InfoBox>

                    <InfoBox title="WALLET COMPATIBILITY">
                      <p className="body-brutal">
                        Supports: Internet Identity, Plug Wallet, NFID
                      </p>
                    </InfoBox>

                    <InfoBox title="VAULT COUNT">
                      <p className="body-brutal">
                        3 vaults associated with this identity
                      </p>
                    </InfoBox>

                    <InfoBox title="LAST LOGIN">
                      <p className="body-brutal">Today at 2:45 PM UTC</p>
                    </InfoBox>
                  </div>
                </div>

                {/* Right Column - AccessControlPanel */}
                <div>
                  <h2 className="heading-brutal text-xl mb-4">
                    WALLET ACCESS PANEL
                  </h2>
                  <AccessControlPanel
                    principalId={mockAuthData.principalId}
                    userId={mockAuthData.userId}
                    walletType={mockAuthData.walletType}
                    isLoggedIn={mockAuthData.isLoggedIn}
                  />
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
