'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollReveal } from '@/components/ui/useScrollReveal';
import { Lock, Zap, Bitcoin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  detail?: string;
  live?: boolean;
}

const stats: StatItem[] = [
  {
    label: 'Total Value Locked',
    value: '12.5',
    detail: 'BTC',
    icon: Lock,
  },
  {
    label: 'Active Positions',
    value: '1,240',
    icon: Zap,
  },
  {
    label: 'BTC Price',
    value: '$98,420',
    icon: Bitcoin,
    live: true,
  },
];

function StatMetric({ stat, index }: { stat: StatItem; index: number }) {
  const Icon = stat.icon;

  return (
    <div className="flex flex-col items-start md:items-center justify-center py-6 md:py-8 px-4 md:px-6">
      {/* Label with Icon */}
      <div className="flex items-center gap-2 mb-3!">
        <Icon className="w-4 h-4 text-zinc-400" />
        <span className="text-label text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {stat.label}
        </span>
        {stat.live && (
          <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-emerald-50 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-700 font-medium">Live</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">
          {stat.value}
        </span>
        {stat.detail && (
          <span className="text-sm font-medium text-zinc-400">
            {stat.detail}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProtocolStatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate container entrance
      gsap.fromTo(
        containerRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'cubic.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stagger numbers count-up animation
      const numbers = containerRef.current?.querySelectorAll('[data-stat-value]');
      if (numbers && numbers.length > 0) {
        numbers.forEach((element, index) => {
          const finalValue = element.textContent || '0';
          
          gsap.to(
            { value: 0 },
            {
              value: parseFloat(finalValue.replace(/[^0-9.]/g, '')) || 0,
              duration: 2,
              delay: 0.2 + index * 0.1,
              ease: 'power2.out',
              onUpdate: function () {
                if (finalValue.includes('$')) {
                  element.textContent = '$' + Math.round(this.targets()[0].value).toLocaleString();
                } else if (finalValue.includes(',')) {
                  element.textContent = Math.round(this.targets()[0].value).toLocaleString();
                } else {
                  element.textContent = this.targets()[0].value.toFixed(1);
                }
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 bg-background relative overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500 opacity-3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500 opacity-2 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Glass Card Container */}
        <div
          ref={containerRef}
          className="bg-zinc-900/80 backdrop-blur-md ring-1 ring-zinc-800 shadow-lg shadow-orange-500/10 rounded-2xl overflow-hidden"
        >
          {/* Desktop: Divided Grid Layout */}
          <div className="hidden md:grid md:grid-cols-3 divide-x divide-zinc-800">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-full">
                  <StatMetric stat={stat} index={index} />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Stacked Layout */}
          <div className="md:hidden divide-y divide-zinc-800">
            {stats.map((stat, index) => (
              <StatMetric key={index} stat={stat} index={index} />
            ))}
          </div>
        </div>

        {/* Decorative Bottom Border */}
        <div className="mt-6 h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent rounded-full" />
      </div>

      <style jsx>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </section>
  );
}
