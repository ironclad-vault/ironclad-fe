"use client";

import { useState } from "react";
import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import InfoBox from "@/app/vault/_components/InfoBox";
import TransitionWrapper from "../../transition-wrapper";

// Mock vault data (UNLOCKED)
const mockVaultData = {
  isLocked: false,
  balanceBTC: "0.50000000",
};

type WithdrawalStatus = "READY" | "IN_PROGRESS" | "CONFIRMED" | "ERROR";

// Withdrawal Form (Left Column)
function WithdrawalForm({
  isLocked,
  onStart,
  onStatusChange,
}: {
  isLocked: boolean;
  onStart: (destination: string) => void;
  onStatusChange: (status: WithdrawalStatus, txid?: string) => void;
}) {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleWithdrawal = async () => {
    if (!destinationAddress) return;
    setIsUnlocking(true);
    onStart(destinationAddress);

    // Simulate Threshold ECDSA signing (1.5s)
    await new Promise((res) => setTimeout(res, 1500));
    onStatusChange("IN_PROGRESS", "txid: b1c0-...-abcd");

    // Simulate network confirmation (3s)
    await new Promise((res) => setTimeout(res, 3000));
    onStatusChange("CONFIRMED");

    setIsUnlocking(false);
  };

  if (isLocked) {
    return (
      <div className="card-brutal">
        <h3 className="heading-brutal text-xl mb-4">WITHDRAWAL LOCKED</h3>
        <InfoBox title="VAULT IS LOCKED" value="TIME REMAINING: 12:34:56" />
      </div>
    );
  }

  return (
    <div className="card-brutal">
      <h3 className="heading-brutal text-xl mb-6">INITIATE WITHDRAWAL</h3>

      <div className="mb-6">
        <label className="body-brutal text-sm font-bold mb-2 block">
          DESTINATION BTC ADDRESS
        </label>
        <input
          type="text"
          className="input-brutal mono-brutal"
          placeholder="bc1..."
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
        />
      </div>

      <button
        className="button-brutal accent w-full"
        onClick={handleWithdrawal}
        disabled={isUnlocking || !destinationAddress}
      >
        {isUnlocking ? "SIGNING..." : "INITIATE WITHDRAWAL"}
      </button>

      <div className="mt-4">
        <InfoBox title="NOTICE">
          <p className="body-brutal">
            Ensure the destination address is a valid Bitcoin mainnet address.
            Transactions are final.
          </p>
        </InfoBox>
      </div>
    </div>
  );
}

// Withdrawal Status Panel (Right Column)
function WithdrawalStatusPanel({
  status,
  txid,
}: {
  status: WithdrawalStatus;
  txid?: string;
}) {
  return (
    <div className="space-y-8">
      <div className="card-brutal">
        <h3 className="heading-brutal text-xl mb-4">WITHDRAWAL STATUS</h3>
        <div className="heading-brutal text-2xl mb-2">{status}</div>
        {(status === "IN_PROGRESS" || status === "CONFIRMED") && (
          <div className="mt-4">
            <div className="body-brutal text-sm mb-1">Transaction ID</div>
            <div className="mono-brutal bg-(--color-bg-white) brutal-border p-3 text-sm break-all">
              {txid || "txid: b1c0-...-abcd"}
            </div>
            <div className="body-brutal mt-2">
              {status === "IN_PROGRESS" ? "BROADCASTING" : "CONFIRMED"}
            </div>
          </div>
        )}
      </div>

      <InfoBox title="ECDSA SIGNING PROCESS">
        <p className="body-brutal">
          The canister is coordinating a threshold ECDSA signature using
          distributed key shares. This ensures no single party controls the
          private key during transaction signing.
        </p>
      </InfoBox>
    </div>
  );
}

export default function WithdrawPage() {
  const principalId = "2vxsx-paeaaa-caaaa-aaaaa-q"; // mock principal id
  const [withdrawalStatus, setWithdrawalStatus] =
    useState<WithdrawalStatus>("READY");
  const [txid, setTxid] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen flex flex-col bg-(--color-bg-primary)">
      <TransitionWrapper>
        <VaultHeader currentPath="/vault/withdraw" principalId={principalId} />

        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1">
            <div className="container mx-auto px-6 flex flex-col gap-8">
              <h1 className="heading-brutal text-4xl text-center">
                SECURE WITHDRAWAL
              </h1>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <WithdrawalForm
                    isLocked={mockVaultData.isLocked}
                    onStart={() => setWithdrawalStatus("READY")}
                    onStatusChange={(status, newTxid) => {
                      setWithdrawalStatus(status);
                      if (newTxid) setTxid(newTxid);
                    }}
                  />
                </div>

                <div>
                  <WithdrawalStatusPanel
                    status={withdrawalStatus}
                    txid={txid}
                  />

                  <div className="mt-8">
                    <InfoBox
                      title="UNLOCKED BALANCE"
                      value={`${mockVaultData.balanceBTC} BTC`}
                      isMono
                    />
                  </div>
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
