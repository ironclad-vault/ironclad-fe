"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

export default function VaultHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const menuItems = [
    { href: "/vault", label: "STATUS" },
    { href: "/vault/deposit", label: "DEPOSIT" },
    { href: "/vault/withdraw", label: "WITHDRAW" },
    { href: "/vault/history", label: "HISTORY" },
    { href: "/vault/access", label: "ACCESS" },
    { href: "/vault/marketplace", label: "MARKETPLACE" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-(--color-bg-white) brutal-border-b z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
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
          </Link>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Navbar menu horizontal */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="heading-brutal text-sm px-1 py-0 text-black hover:underline hover:text-accent transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}
              <div className="px-2 py-1 text-sm brutal-border inline-block">
                <ConnectWalletButton />
              </div>
          </nav>

          {/* Mobile menu: tampilkan menu vertikal minimalis */}
          <nav className="md:hidden flex flex-col gap-2 mt-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="heading-brutal text-sm px-1 py-2 text-black hover:underline hover:text-accent transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}
              <div className="px-2 py-1 text-sm brutal-border inline-block">
                <ConnectWalletButton />
              </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
