"use client";

import { AnchorHTMLAttributes, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePageTransition } from "@/components/page/PageTransitionProvider";

interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export default function TransitionLink({
  href,
  onClick,
  children,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const { startTransition } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`Starting curtain reveal transition to ${href}`);
    startTransition();
    
    // Navigate when overlay has fully covered the screen
    setTimeout(() => {
      console.log(`Navigating to ${href}`);
      router.push(href);
    }, 1500); // After overlay slides in (1.5s)
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}