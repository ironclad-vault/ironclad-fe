"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePageTransition } from "@/components/page/PageTransitionProvider";

interface TransitionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: ReactNode;
  suppressTransition?: boolean;
}

export default function TransitionButton({
  href,
  onClick,
  children,
  suppressTransition = false,
  ...props
}: TransitionButtonProps) {
  const router = useRouter();
  const { startTransition } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      e.preventDefault();
      e.stopPropagation();

      if (suppressTransition) {
        // Direct navigation without transition
        router.push(href);
      } else {
        startTransition();

        // Navigate when overlay has fully covered the screen (0.6s)
        // This ensures smooth page swap while hidden
        setTimeout(() => {
          router.push(href);
        }, 600);
      }
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
