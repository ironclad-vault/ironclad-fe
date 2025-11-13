"use client";

import { useRef } from "react";
import {
  useScrollReveal,
  useScrollRevealStagger,
} from "@/components/ui/useScrollReveal";
import { Shield, Clock, Zap, Globe, Lock, Ban } from "lucide-react";

const features = [
  {
    title: "NATIVE BITCOIN",
    description:
      "Pure Bitcoin integration with no bridges. Your BTC remains on-chain, secured by proof-of-work.",
    icon: Shield,
    benefits: ["No bridges", "No wrapped tokens", "On-chain security"],
  },
  {
    title: "TIME-LOCK AUTONOMY",
    description:
      "Vaults run autonomously on Internet Computer. Time-locks cannot be modified.",
    icon: Clock,
    benefits: ["Autonomous execution", "Unmodifiable locks", "Trustless"],
  },
  {
    title: "BRUTALIST SECURITY",
    description:
      "Transparent audited contracts with minimal attack surface and maximum security.",
    icon: Lock,
    benefits: [
      "Minimal attack surface",
      "Audited contracts",
      "Transparent code",
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
      className="brutal-border bg-(--color-bg-white) p-8 h-full flex flex-col hover:border-accent transition-all duration-500 group hover:scale-105 hover:-translate-y-2 relative overflow-hidden"
    >
      {/* Background gradient for better contrast */}
      <div className="absolute inset-0 bg-linear-to-br from-white via-(--color-bg-white) to-gray-50 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon with enhanced animation */}
      <div className="relative z-10 w-16 h-16 bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 brutal-border">
        <Icon className="w-8 h-8 text-white drop-shadow-sm" />
      </div>

      <h3 className="relative z-10 heading-brutal text-xl mb-4 text-foreground font-black group-hover:text-accent transition-colors duration-300">
        {feature.title}
      </h3>

      <p className="relative z-10 body-brutal text-sm mb-6 leading-relaxed text-gray-800 font-medium">
        {feature.description}
      </p>

      <div className="relative z-10 mt-auto">
        <div className="space-y-3">
          {feature.benefits.map((benefit, benefitIndex) => (
            <div
              key={benefitIndex}
              className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300"
              style={{ transitionDelay: `${benefitIndex * 50}ms` }}
            >
              <div className="w-3 h-3 bg-accent rounded-full shrink-0 group-hover:scale-150 transition-transform duration-300 shadow-sm" />
              <span className="body-brutal text-xs uppercase tracking-wider text-gray-700 font-semibold group-hover:text-accent transition-colors duration-300">
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
      className="py-24 bg-(--color-bg-white) relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-structure opacity-10 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-20">
          <h2 className="heading-brutal text-4xl md:text-6xl mb-6">
            WHY IRONCLAD?
          </h2>
          <p className="body-brutal text-lg max-w-3xl mx-auto text-(--color-text-secondary)">
            Built on decentralization, security, and autonomy. Next-generation
            Bitcoin custody solutions.
          </p>
        </div>

        {/* Feature Highlights */}
        <div
          ref={highlightsRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-20"
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
              <div className="brutal-border px-4 py-2 bg-structure group-hover:bg-accent group-hover:border-accent transition-all duration-300 hover:scale-110">
                <span className="heading-brutal text-xs text-accent group-hover:text-foreground transition-colors duration-300">
                  {highlight}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href="#testimonials"
            className="button-brutal accent inline-block text-lg px-8 py-4 hover:scale-110 hover:-translate-y-1 transition-all duration-300"
          >
            SEE WHAT USERS SAY
          </a>
        </div>
      </div>
    </section>
  );
}
