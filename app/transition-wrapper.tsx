"use client";

import { PageTransitionProvider } from "@/components/page/PageTransitionProvider";
import PageTransition from "@/components/page/PageTransition";
import { usePageTransition } from "@/components/page/PageTransitionProvider";

function PageTransitionWithAnimation({ children }: { children: React.ReactNode }) {
  const { isTransitioning, completeTransition } = usePageTransition();

  return (
    <PageTransition
      isTransitioning={isTransitioning}
      onTransitionComplete={completeTransition}
    >
      {children}
    </PageTransition>
  );
}

export default function TransitionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PageTransitionProvider>
      <PageTransitionWithAnimation>
        {children}
      </PageTransitionWithAnimation>
    </PageTransitionProvider>
  );
}
