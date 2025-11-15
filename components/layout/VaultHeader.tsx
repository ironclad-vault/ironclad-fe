"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import TransitionButton from "@/components/navigation/TransitionButton";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

interface VaultHeaderProps {
  currentPath: string;
}

export default function VaultHeader({
  currentPath,
}: VaultHeaderProps) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const isLinkActive = (href: string) => href === currentPath;

  // Control animation state when menu closes
  const handleMenuToggle = () => {
    if (open) {
      setAnimating(true);
      setTimeout(() => {
        setOpen(false);
        setAnimating(false);
      }, 300);
    } else {
      setOpen(true);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && !(event.target as HTMLElement).closest("header")) {
        handleMenuToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const activeLinkClass =
    "body-brutal text-sm border-b-2 border-accent font-bold text-accent";
  const baseLinkClass =
    "body-brutal text-sm hover:text-accent transition-colors";

  return (
    <header className="fixed top-0 left-0 right-0 bg-(--color-bg-white) brutal-border-b z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <TransitionButton 
            href="/"
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-accent brutal-border flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/ironclad-vault-logo.png"
                  alt="Ironclad Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="heading-brutal text-xl group-hover:text-accent transition-colors duration-300">
              IRONCLAD
            </div>
          </TransitionButton>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <TransitionButton
              href="/vault"
              suppressTransition
              className={
                isLinkActive("/vault") ? activeLinkClass : baseLinkClass
              }
            >
              STATUS
            </TransitionButton>
            <TransitionButton
              href="/vault/deposit"
              suppressTransition
              className={
                isLinkActive("/vault/deposit") ? activeLinkClass : baseLinkClass
              }
            >
              DEPOSIT
            </TransitionButton>
            <TransitionButton
              href="/vault/withdraw"
              suppressTransition
              className={
                isLinkActive("/vault/withdraw")
                  ? activeLinkClass
                  : baseLinkClass
              }
            >
              WITHDRAW
            </TransitionButton>
            <TransitionButton
              href="/vault/history"
              suppressTransition
              className={
                isLinkActive("/vault/history") ? activeLinkClass : baseLinkClass
              }
            >
              HISTORY
            </TransitionButton>
            <TransitionButton
              href="/vault/access"
              suppressTransition
              className={
                isLinkActive("/vault/access") ? activeLinkClass : baseLinkClass
              }
            >
              ACCESS
            </TransitionButton>
          </nav>

          {/* Connect Wallet Button (desktop) */}
          <div className="hidden md:block">
            <ConnectWalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden button-brutal p-2"
            onClick={handleMenuToggle}
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`block h-1 w-full bg-current transition-all duration-300 origin-top-left ${
                  open ? "rotate-45 translate-x-0" : ""
                }`}
              ></span>
              <span
                className={`block h-1 w-full bg-current transition-all duration-300 ${
                  open ? "opacity-0 translate-x-4" : ""
                }`}
              ></span>
              <span
                className={`block h-1 w-full bg-current transition-all duration-300 origin-bottom-left ${
                  open ? "-rotate-45 -translate-y-1" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {(open || animating) && (
        <div
          className={`md:hidden bg-(--color-bg-white) brutal-border-t brutal-border-b overflow-hidden transition-all duration-300 ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`container mx-auto px-6 py-4 space-y-4 transform transition-all duration-300 ${
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex flex-col space-y-3">
              <TransitionButton
                href="/vault"
                suppressTransition
                className={
                  isLinkActive("/vault") ? activeLinkClass : baseLinkClass
                }
                onClick={handleMenuToggle}
              >
                STATUS
              </TransitionButton>
              <TransitionButton
                href="/vault/deposit"
                suppressTransition
                className={
                  isLinkActive("/vault/deposit")
                    ? activeLinkClass
                    : baseLinkClass
                }
                onClick={handleMenuToggle}
              >
                DEPOSIT
              </TransitionButton>
              <TransitionButton
                href="/vault/withdraw"
                suppressTransition
                className={
                  isLinkActive("/vault/withdraw")
                    ? activeLinkClass
                    : baseLinkClass
                }
                onClick={handleMenuToggle}
              >
                WITHDRAW
              </TransitionButton>
              <TransitionButton
                href="/vault/history"
                suppressTransition
                className={
                  isLinkActive("/vault/history")
                    ? activeLinkClass
                    : baseLinkClass
                }
                onClick={handleMenuToggle}
              >
                HISTORY
              </TransitionButton>
              <TransitionButton
                href="/vault/access"
                suppressTransition
                className={
                  isLinkActive("/vault/access")
                    ? activeLinkClass
                    : baseLinkClass
                }
                onClick={handleMenuToggle}
              >
                ACCESS
              </TransitionButton>
            </div>
            {/* Connect Wallet Button (mobile) */}
            <div className="pt-2">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
