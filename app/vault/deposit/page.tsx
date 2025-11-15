"use client";

import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import DepositForm from "./_components/DepositForm";
import DepositInfoPanel from "./_components/DepositInfoPanel";
import TransitionWrapper from "../../transition-wrapper";
import { useWallet } from "@/components/wallet/useWallet";

export default function DepositPage() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TransitionWrapper>
        <VaultHeader />

        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1">
            <div className="container mx-auto px-6 flex flex-col gap-8">
              <h1 className="heading-brutal text-4xl mb-12 text-center">
                INITIATE NEW VAULT
              </h1>

              {!isConnected ? (
                <div className="card-brutal p-8 text-center">
                  <h2 className="heading-brutal text-2xl mb-4">CONNECT YOUR WALLET</h2>
                  <p className="body-brutal text-lg text-gray-600">
                    Connect your wallet to create a new vault
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <DepositForm />
                  </div>

                  <div>
                    <DepositInfoPanel />
                  </div>
                </div>
              )}
            </div>
          </main>

          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
