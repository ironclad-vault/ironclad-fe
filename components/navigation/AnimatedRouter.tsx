"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnimatedRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Route changed successfully
  }, [pathname]);

  return <>{children}</>;
}
