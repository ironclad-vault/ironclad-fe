'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollReveal } from '@/components/ui/useScrollReveal';
import { Wallet, Lock, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: 1,
    title: 'Connect Identity',
    description:
      'Secure login via Internet Identity. No seed phrases, fully non-custodial.',
    icon: Wallet,
  },
  {
    number: 2,
    title: 'Mint Bond Position',
    description:
      'Deposit ckBTC to create a time-locked vault. This mints your liquid vesting position.',
    icon: Lock,
  },
  {
    number: 3,
    title: 'Earn or Trade',
    description:
      'Hold to maturity for full value, or sell your position on the bond market for instant liquidity.',
    icon: TrendingUp,
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const stepRef = useScrollReveal({
    y: 40,
    opacity: 0,
    scale: 0.95,
    delay: index * 0.15,
  });
  const Icon = step.icon;

  return (
    <div ref={stepRef} className="relative group">
      {/* Card */}
      <div className="relative bg-white ring-1 ring-zinc-200 rounded-2xl p-8 h-full shadow-sm hover:shadow-md hover:ring-zinc-300 transition-all duration-300 hover:-translate-y-1">
        {/* Step Indicator Badge */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <div className="flex flex-col items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
            <span className="text-xs font-bold text-white mt-0.5">{step.number}</span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-zinc-900 mb-3">
            {step.title}
          </h3>

          <p className="text-sm text-zinc-500 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Hover Accent Line */}
        <div className="absolute bottom-0 left-0 h-1 w-0 bg-orange-500 rounded-full group-hover:w-full transition-all duration-300" />
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useScrollReveal<HTMLDivElement>({ y: 30, delay: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate connecting line
      const connectingLine = sectionRef.current?.querySelector('.connecting-line');
      if (connectingLine) {
        gsap.fromTo(
          connectingLine,
          { scaleX: 0, transformOrigin: 'left' },
          {
            scaleX: 1,
            duration: 1.2,
            delay: 0.4,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Stagger card animations
      const cards = containerRef.current?.querySelectorAll('[role="article"]');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.2,
            ease: 'cubic.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
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
      id="how-it-works"
      className="py-24 bg-zinc-950 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-heading text-5xl md:text-7xl mb-4 text-white">
            How It Works
          </h2>
          <p className="text-body text-lg max-w-3xl mx-auto text-zinc-400">
            Three simple steps to secure your Bitcoin with Ironclad&apos;s liquid vesting protocol.
          </p>
        </div>

        {/* Steps Pipeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-zinc-200 via-orange-500 to-zinc-200 connecting-line" />

          {/* Cards Grid */}
          <div
            ref={containerRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative pt-12"
          >
            {steps.map((step, index) => (
              <div key={index} role="article">
                <StepCard step={step} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 pt-8 border-t border-zinc-200">
          <p className="text-sm text-zinc-500 mb-6 font-medium">
            Ready to get started?
          </p>
          <a
            href="/vault"
            className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-black transition-colors duration-200"
          >
            Access Protocol
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
