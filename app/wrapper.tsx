"use client";

import { PageTransitionProvider } from "@/components/page/PageTransitionProvider";
import { WalletProvider } from "@/components/wallet/WalletProvider";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <PageTransitionProvider>{children}</PageTransitionProvider>
    </WalletProvider>
  );
}