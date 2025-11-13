"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePageTransition } from "@/components/page/PageTransitionProvider";

interface TransitionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: ReactNode;
}

export default function TransitionButton({
  href,
  onClick,
  children,
  ...props
}: TransitionButtonProps) {
  const router = useRouter();
  const { startTransition } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log(`Starting curtain reveal transition to ${href}`);
      startTransition();
      
      // Navigate when overlay has fully covered the screen
      setTimeout(() => {
        console.log(`Navigating to ${href}`);
        router.push(href);
      }, 1500); // After overlay slides in (1.5s)
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}