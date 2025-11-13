"use client";

import { PageTransitionProvider } from "@/components/page/PageTransitionProvider";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return <PageTransitionProvider>{children}</PageTransitionProvider>;
}