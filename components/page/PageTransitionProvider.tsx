"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PageTransitionContextType {
  isTransitioning: boolean;
  startTransition: () => void;
  completeTransition: () => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(
  undefined
);

interface PageTransitionProviderProps {
  children: ReactNode;
}

export function PageTransitionProvider({ 
  children 
}: PageTransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = () => {
    console.log("PageTransitionProvider: Starting transition");
    setIsTransitioning(true);
  };

  const completeTransition = () => {
    console.log("PageTransitionProvider: Completing transition");
    setIsTransitioning(false);
  };

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        startTransition,
        completeTransition,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (context === undefined) {
    throw new Error(
      "usePageTransition must be used within a PageTransitionProvider"
    );
  }
  return context;
}