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

    startTransition();

    // Navigate when overlay has fully covered the screen (0.6s)
    setTimeout(() => {
      router.push(href);
    }, 600);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
