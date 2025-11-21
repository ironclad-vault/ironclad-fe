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
      "Access instant liquidity by selling your locked positions on the secondary market. Buyers earn yield through discounted Bitcoin.",
    icon: Zap,
    benefits: ["Instant liquidity", "Secondary market", "Discounted entry"],
  },
  {
    title: "LIQUID VESTING",
    description:
      "Time-lock your BTC to enforce holding discipline, but remain liquid via our bond marketplace. No more dead capital.",
    icon: Clock,
    benefits: ["Holding discipline", "Market liquidity", "Active capital"],
  },
  {
    title: "DEAD MAN SWITCH",
    description:
      "Native inheritance protocol. If you become inactive, ownership of your vaults automatically transfers to your designated beneficiary.",
    icon: Shield,
    benefits: [
      "Auto inheritance",
      "Beneficiary transfer",
      "Asset protection",
    ],
  },
  {
    title: "INTERNET COMPUTER",
    description:
      "Built on the most advanced blockchain platform with unlimited compute.",
    icon: Globe,
    benefits: ["Unlimited compute", "Bitcoin integration", "Web3 speed"],
  },
  {
    title: "ZERO TRUST",
    description:
      "No intermediaries or custodians. Direct smart contract interaction for full control.",
    icon: Zap,
    benefits: ["No intermediaries", "Direct control", "Self-custody"],
  },
  {
    title: "CENSORSHIP RESISTANT",
    description:
      "Deployed on a decentralized network that cannot be taken down or censored.",
    icon: Ban,
    benefits: ["Decentralized", "No censorship", "Immutable"],
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
      className="card-pro p-8 h-full flex flex-col hover:border-accent transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden hover-lift"
    >
      <div className="absolute top-0 right-0 w-16 h-16 border-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 w-20 h-20 bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 rounded-lg">
        <Icon className="w-10 h-10 text-white font-bold" />
      </div>

      <h3 className="relative z-10 text-heading text-2xl mb-3 text-foreground group-hover:text-accent transition-colors duration-300">
        {feature.title}
      </h3>

      <p className="relative z-10 text-body text-sm mb-6 leading-relaxed text-gray-800">
        {feature.description}
      </p>

      <div className="relative z-10 mt-auto border-t-2 border-accent pt-4">
        <div className="space-y-2">
          {feature.benefits.map((benefit, benefitIndex) => (
            <div
              key={benefitIndex}
              className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300"
              style={{ transitionDelay: `${benefitIndex * 50}ms` }}
            >
              <div className="w-2 h-2 bg-accent flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
              <span className="text-body text-xs font-bold text-gray-700 group-hover:text-accent transition-colors duration-300">
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
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 border-4 border-accent opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 border-4 border-accent opacity-5 pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16 card-pro border-accent py-12 px-6">
          <h2 className="text-heading text-5xl md:text-7xl mb-4">
            PROTOCOL FEATURES
          </h2>
          <p className="text-body text-lg max-w-3xl mx-auto text-zinc-600">
            DeFi-grade vesting and inheritance infrastructure for Bitcoin holders.
          </p>
        </div>

        {/* Feature Highlights */}
        <div
          ref={highlightsRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-20"
        >
          {[
            "TRUSTLESS",
            "AUTONOMOUS",
            "SECURE",
            "TRANSPARENT",
            "CENSORSHIP-RESISTANT",
            "BITCOIN-NATIVE",
          ].map((highlight, index) => (
            <div key={index} className="feature-highlight text-center group">
              <div className="px-4 py-3 bg-accent border border-accent rounded-lg group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-all duration-300 hover:scale-110 hover-lift">
                <span className="text-heading text-sm font-bold text-white group-hover:text-white transition-colors duration-300">
                  {highlight}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
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
