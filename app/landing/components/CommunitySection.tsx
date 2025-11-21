'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useScrollReveal,
  useScrollRevealStagger,
} from '@/components/ui/useScrollReveal';
import { ArrowRight, Github, Twitter, MessageCircle, Mail } from 'lucide-react';
import GlitchText from '@/components/ui/animated/GlitchText';
import Image from 'next/image';
import TransitionButton from '@/components/navigation/TransitionButton';

gsap.registerPlugin(ScrollTrigger);

export default function CommunitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useScrollReveal<HTMLDivElement>({ y: 40, opacity: 0, delay: 0 });
  const titleRef = useScrollReveal<HTMLDivElement>({ y: 40, delay: 0.1 });
  const descRef = useScrollReveal<HTMLDivElement>({ y: 40, delay: 0.2 });
  const ctaRef = useScrollReveal<HTMLDivElement>({ y: 40, delay: 0.3 });
  const socialRef = useScrollRevealStagger<HTMLDivElement>('.social-link', {
    y: 20,
    opacity: 0,
    stagger: 0.08,
    delay: 0.4,
  });

  useLayoutEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Smooth scale entrance for logo - no rotation
      const logo = logoRef.current;
      if (logo) {
        gsap.fromTo(
          logo,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: logo,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-zinc-950 border-t border-zinc-800 relative overflow-hidden"
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 opacity-3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500 opacity-2 rounded-full blur-3xl" />
      </div>

      <div
        ref={contentRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center mb-16">
          {/* Left: Logo & Title */}
          <div className="flex flex-col items-center md:items-start space-y-8">
            {/* Logo */}
            <div ref={logoRef} className="relative">
              <div className="w-40 h-40 md:w-48 md:h-48 bg-zinc-800 rounded-2xl flex items-center justify-center ring-1 ring-orange-500 shadow-lg">
                <Image
                  src="/ironclad-vault-logo.png"
                  alt="Ironclad Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Title */}
            <div ref={titleRef} className="space-y-4">
              <h2 className="text-heading text-4xl md:text-5xl font-black text-white">
                Ironclad Protocol
              </h2>
              <div className="h-1 w-16 bg-orange-500 rounded-full" />
            </div>
          </div>

          {/* Right: Description & CTA */}
          <div ref={descRef} className="flex flex-col space-y-8">
            <div className="space-y-4">
              <p className="text-body text-lg text-zinc-600 leading-relaxed">
                The first liquid vesting protocol on Bitcoin. Trade time-locked positions, enforce discipline, and secure your legacy with on-chain inheritance.
              </p>

              <ul className="space-y-3 text-sm text-zinc-600">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold mt-1">•</span>
                  <span>Non-custodial vaults with time-lock discipline</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold mt-1">•</span>
                  <span>Trade positions as zero-coupon bonds on secondary market</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold mt-1">•</span>
                  <span>Automatic inheritance transfer protocol</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 pt-4">
              <TransitionButton
                href="/vault"
                className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-lg px-8 py-3 font-semibold hover:bg-orange-600 transition-colors duration-200 whitespace-nowrap"
              >
                <span>Access Protocol</span>
                <ArrowRight className="w-4 h-4" />
              </TransitionButton>

              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 bg-zinc-900 text-white border-2 border-orange-500 rounded-lg px-8 py-3 font-semibold hover:bg-orange-500 hover:text-black transition-colors duration-200 whitespace-nowrap"
              >
                <span>Learn More</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 my-12 md:my-16" />

        {/* Community Section */}
        <div className="text-center space-y-8">
          <div>
            <h3 className="text-heading text-2xl md:text-3xl font-bold text-zinc-900 mb-2">
              Join the Protocol
            </h3>
            <p className="text-body text-zinc-600">
              Connect with the community and stay updated on the latest developments.
            </p>
          </div>

          {/* Social Links - Professional Grid with Orange Accents */}
          <div
            ref={socialRef}
            className="flex justify-center gap-4 flex-wrap"
          >
            <a
              href="#"
              className="social-link w-12 h-12 bg-zinc-900 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all duration-200 group"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
            <a
              href="#"
              className="social-link w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
              aria-label="Discord"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </a>
            <a
              href="#"
              className="social-link w-12 h-12 bg-zinc-900 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all duration-200 group"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-white" />
            </a>
            <a
              href="#"
              className="social-link w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
