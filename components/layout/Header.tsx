"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import TransitionButton from "@/components/navigation/TransitionButton";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white brutal-border-b border-2 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-accent brutal-border border-2 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300 hover-lift">
                <Image
                  src="/ironclad-vault-logo.png"
                  alt="Ironclad Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="heading-brutal text-2xl group-hover:text-accent transition-colors duration-300">
              IRONCLAD
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#how-it-works"
              className="body-brutal text-sm font-bold hover:text-accent transition-colors duration-300 hover:border-b-2 hover:border-accent pb-1"
            >
              HOW IT WORKS
            </Link>
            <Link
              href="#testimonials"
              className="body-brutal text-sm font-bold hover:text-accent transition-colors duration-300 hover:border-b-2 hover:border-accent pb-1"
            >
              TESTIMONIALS
            </Link>
          </nav>

          {/* CTA Button */}
          <TransitionButton
            href="/vault"
            className="button-brutal accent flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-3 font-bold hover-lift"
          >
            <span className="hidden sm:inline">LAUNCH APP</span>
            <span className="sm:hidden">LAUNCH</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </TransitionButton>
        </div>
      </div>
    </header>
  );
}
