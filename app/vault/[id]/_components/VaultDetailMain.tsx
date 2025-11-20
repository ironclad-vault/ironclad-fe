"use client";

import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import VaultDetailMain from "./VaultDetailSection";
import { Suspense } from "react";

export default function VaultDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: vaultId } = params;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <VaultHeader />

      <section className="flex flex-col items-stretch min-h-screen">
        <main className="pt-24 pb-16 flex-1">
          <div className="container mx-auto px-6">
            <Suspense
              fallback={
                <div className="card-brutal brutal-border border-2 p-8">
                  <p className="body-brutal text-lg">Loading vault details...</p>
                </div>
              }
            >
              <VaultDetailMain vaultId={vaultId} />
            </Suspense>
          </div>
        </main>

        <Footer />
      </section>
    </div>
  );
}
