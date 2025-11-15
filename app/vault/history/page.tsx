"use client";

import { Suspense } from "react";
import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import HistoryMain from "./_components/HistoryMain";
import TransitionWrapper from "../../transition-wrapper";

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TransitionWrapper>
        <VaultHeader currentPath="/vault/history" />

        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1">
            <div className="container mx-auto px-6">
              <Suspense fallback={<div className="card-brutal p-8"><p className="text-gray-600">Loading...</p></div>}>
                <HistoryMain />
              </Suspense>
            </div>
          </main>

          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
