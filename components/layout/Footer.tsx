'use client';

import { Github, Twitter, MessageCircle, Mail, Dot } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const protocolLinks = [
  { label: 'Bond Market', href: '/vault/marketplace' },
  { label: 'My Positions', href: '/vault' },
  { label: 'Analytics', href: '#' },
  { label: 'Protocol Status', href: '#' },
];

const resourcesLinks = [
  { label: 'Documentation', href: '#' },
  { label: 'Whitepaper', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Bug Bounty', href: '#' },
];

const legalLinks = [
  { label: 'Terms of Service', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Cookie Policy', href: '#' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12! md:mb-16!">
          {/* Column 1: Brand */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/ironclad-vault-logo.png"
                  alt="Ironclad Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="text-heading text-xl font-black text-white">IRONCLAD</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              Institutional-Grade Liquid Vesting & Inheritance Protocol for
              Bitcoin.
            </p>
          </div>

          {/* Column 2: Protocol */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-label font-bold text-zinc-300 uppercase tracking-wide text-xs">
              Protocol
            </h3>
            <nav className="flex flex-col space-y-3">
              {protocolLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-orange-500 transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-label font-bold text-zinc-300 uppercase tracking-wide text-xs">
              Resources
            </h3>
            <nav className="flex flex-col space-y-3">
              {resourcesLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-orange-500 transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-label font-bold text-zinc-300 uppercase tracking-wide text-xs">
              Legal
            </h3>
            <nav className="flex flex-col space-y-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-orange-500 transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Copyright */}
            <p className="text-xs text-zinc-400 font-medium">
              © {currentYear} Ironclad Protocol. All rights reserved.
            </p>

            {/* Right Side: Status Indicator & Social Icons */}
            <div className="flex items-center gap-6">
              {/* System Status */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>System Status: Operational</span>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-zinc-400 hover:text-orange-500 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-orange-500 transition-colors duration-200"
                  aria-label="Discord"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-orange-500 transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
