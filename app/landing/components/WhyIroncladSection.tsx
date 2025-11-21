"use client";

import { useRef } from "react";
import {
  useScrollReveal,
  useScrollRevealStagger,
} from "@/components/ui/useScrollReveal";
import { Shield, Clock, Zap, Globe, Lock, Ban } from "lucide-react";

const features = [
  {
    title: "ZERO-COUPON BONDS",
    description:
      "Convert time-locked positions into tradeable bonds. Sellers access instant liquidity. Buyers acquire discounted Bitcoin with guaranteed maturity value.",
    icon: Zap,
    benefits: ["Instant liquidity", "Discounted Bitcoin", "Guaranteed maturity"],
  },
  {
    title: "LIQUID VESTING",
    description:
      "Enforce holding discipline through time-locks while maintaining liquidity via the bond marketplace. Dead capital becomes active capital.",
    icon: Clock,
    benefits: ["Time-lock discipline", "Market liquidity", "Active capital"],
  },
  {
    title: "DEAD MAN SWITCH",
    description:
      "Automated inheritance protocol. 180-day inactivity timeout triggers beneficiary transfer. Proof of Life verification resets the timer.",
    icon: Shield,
    benefits: [
      "180-day timeout",
      "Auto-transfer",
      "Proof of Life",
    ],
  },
  {
    title: "THRESHOLD CRYPTOGRAPHY",
    description:
      "Built on Internet Computer Protocol with unlimited compute and native Bitcoin integration via threshold ECDSA signatures.",
    icon: Globe,
    benefits: ["Threshold ECDSA", "Bitcoin integration", "ICP infrastructure"],
  },
  {
    title: "NON-CUSTODIAL",
    description:
      "Zero intermediaries. Direct smart contract interaction. You maintain complete sovereignty over your Bitcoin at all times.",
    icon: Zap,
    benefits: ["No intermediaries", "Full sovereignty", "Self-custody"],
  },
  {
    title: "CENSORSHIP RESISTANT",
    description:
      "Deployed on decentralized infrastructure. Protocol cannot be taken down, censored, or modified by any single party.",
    icon: Ban,
    benefits: ["Decentralized", "Immutable", "Unstoppable"],
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const cardRef = useScrollReveal({
    y: 30,
    opacity: 0,
    scale: 1,
    delay: index * 0.2,
  });
  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      className="card-pro p-8 h-full flex flex-col hover:border-orange-500 transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden hover-lift"
    >
      <div className="absolute top-0 right-0 w-16 h-16 border-2 border-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 w-20 h-20 bg-orange-500 flex items-center justify-center mb-6! group-hover:scale-110 transition-all duration-300 rounded-lg">
        <Icon className="w-10 h-10 text-white font-bold" />
      </div>

      <h3 className="relative z-10 text-heading text-2xl mb-3! text-white group-hover:text-orange-500 transition-colors duration-300">
        {feature.title}
      </h3>

      <p className="relative z-10 text-body text-sm mb-6! leading-relaxed text-zinc-400">
        {feature.description}
      </p>

      <div className="relative z-10 mt-auto border-t-2 border-orange-500 pt-4">
        <div className="space-y-2">
          {feature.benefits.map((benefit, benefitIndex) => (
            <div
              key={benefitIndex}
              className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300"
              style={{ transitionDelay: `${benefitIndex * 50}ms` }}
            >
              <div className="w-2 h-2 bg-orange-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
              <span className="text-body text-xs font-bold text-zinc-300 group-hover:text-orange-500 transition-colors duration-300">
                {benefit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WhyIroncladSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useScrollReveal<HTMLDivElement>({ y: 50, delay: 0 });
  const highlightsRef = useScrollRevealStagger(".feature-highlight", {
    y: 40,
    opacity: 0,
    scale: 0.8,
    stagger: 0.1,
    delay: 0.3,
  });

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-zinc-950 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 border-4 border-orange-500 opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 border-4 border-orange-500 opacity-5 pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16! card-pro border-orange-500 py-12 px-6">
          <h2 className="text-heading text-5xl md:text-7xl mb-4! text-white">
            PROTOCOL ARCHITECTURE
          </h2>
          <p className="text-body text-lg max-w-3xl mx-auto text-zinc-400">
            Institutional-grade infrastructure for liquid vesting and
            cryptographic inheritance.
          </p>
        </div>

        {/* Feature Highlights */}
        <div
          ref={highlightsRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-20!"
        >
          {[
            "LIQUID VESTING",
            "INHERITANCE",
            "ZERO-COUPON",
            "THRESHOLD-ECDSA",
            "NON-CUSTODIAL",
            "CYPHERPUNK",
          ].map((highlight, index) => (
            <div key={index} className="feature-highlight text-center group">
              <div className="px-4 py-3 bg-orange-500 border border-orange-500 rounded-lg group-hover:bg-zinc-800 group-hover:border-zinc-700 transition-all duration-300 hover:scale-110 hover-lift">
                <span className="text-heading text-sm font-bold text-white group-hover:text-white transition-colors duration-300">
                  {highlight}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20!">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href="#testimonials"
            className="button-brutal accent inline-block text-lg px-10 py-5 hover-lift font-bold"
          >
            SEE WHAT USERS SAY
          </a>
        </div>
      </div>
    </section>
  );
}
