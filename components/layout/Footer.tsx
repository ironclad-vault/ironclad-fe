'use client';

import { Github, Twitter, MessageCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background text-white overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent opacity-3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-accent via-orange-400 to-accent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-16">
            {/* Brand section */}
            <div className="flex flex-col space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-accent">IRONCLAD</h3>
                <p className="text-accent text-sm md:text-base leading-relaxed max-w-xs font-bold">
                  Bitcoin security reimagined. Time-locked autonomy powered by smart contracts.
                </p>
              </div>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 border-2 border-accent rounded-lg flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-300 hover-lift group"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 border-2 border-accent rounded-lg flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-300 hover-lift group"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 border-2 border-accent rounded-lg flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-300 hover-lift group"
                  aria-label="Discord"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 border-2 border-accent rounded-lg flex items-center justify-center hover:bg-accent hover:text-black transition-all duration-300 hover-lift group"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-white">EXPLORE</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#how-it-works" className="text-accent hover:text-white transition-colors duration-300 font-bold">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-accent hover:text-white transition-colors duration-300 font-bold">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-accent hover:text-white transition-colors duration-300 font-bold">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="/vault" className="text-accent hover:text-white transition-colors duration-300 font-bold">
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>

            {/* Info Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-white">RESOURCES</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-accent hover:text-white transition-colors duration-300 font-bold">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-accent hover:text-white transition-colors duration-300 font-bold">
                    Security Audit
                  </a>
                </li>
                <li>
                  <a href="#" className="text-accent hover:text-white transition-colors duration-300 font-bold">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-accent hover:text-white transition-colors duration-300 font-bold">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-12" />

          {/* Bottom section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-heading text-lg md:text-xl font-black">
                BUILT ON THE INTERNET COMPUTER | IRONCLAD
              </p>
              <p className="text-gray-200 text-sm md:text-base max-w-2xl font-medium">
                Decentralized Bitcoin custody powered by autonomous smart contracts. Your fortress, your rules, your Bitcoin.
              </p>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8 border-t border-gray-800">
              <p className="text-gray-300 text-xs md:text-sm font-medium">
                © {currentYear} Ironclad. Built with cryptographic proof.
              </p>
              <div className="flex gap-6 text-gray-300 text-xs md:text-sm">
                <a href="#" className="hover:text-accent transition-colors duration-300 font-medium">
                  Status
                </a>
                <a href="#" className="hover:text-accent transition-colors duration-300 font-medium">
                  Roadmap
                </a>
                <a href="#" className="hover:text-accent transition-colors duration-300 font-medium">
                  Community
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-1 bg-gradient-to-r from-accent via-orange-400 to-accent" />
      </div>
    </footer>
  );
}
