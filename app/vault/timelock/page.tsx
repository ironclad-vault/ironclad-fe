"use client";

import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import TransitionWrapper from "../../transition-wrapper";
import { TimelockMain } from "./_components/TimelockMain";

export default function TimelockPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TransitionWrapper>
        <VaultHeader />

        {/* Main Content */}
        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1 flex flex-col gap-8">
            <TimelockMain />
          </main>
          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
