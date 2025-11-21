"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import TransitionButton from "@/components/navigation/TransitionButton";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md border-b border-zinc-800 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-orange-500 border border-orange-500 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/ironclad-vault-logo.png"
                  alt="Ironclad Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="heading-brutal text-2xl text-white group-hover:text-orange-500 transition-colors duration-300">
              IRONCLAD
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#how-it-works"
              className="text-body text-sm font-bold text-zinc-300 hover:text-orange-500 transition-colors duration-300 hover:border-b-2 hover:border-orange-500 pb-1"
            >
              HOW IT WORKS
            </Link>
            <Link
              href="#testimonials"
              className="text-body text-sm font-bold text-zinc-300 hover:text-orange-500 transition-colors duration-300 hover:border-b-2 hover:border-orange-500 pb-1"
            >
              TESTIMONIALS
            </Link>
          </nav>

          {/* CTA Button */}
          <TransitionButton
            href="/vault"
            className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 font-black bg-orange-500 text-black hover:bg-orange-600 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50"
          >
            <span className="hidden sm:inline">TERMINAL</span>
            <span className="sm:hidden">TERM</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </TransitionButton>
        </div>
      </div>
    </header>
  );
}
