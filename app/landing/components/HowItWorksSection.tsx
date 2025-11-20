"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollReveal } from "@/components/ui/useScrollReveal";
import { Wallet, ArrowDown, Lock } from "lucide-react";
import "./HowItWorksSection.css";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "CONNECT",
    description:
      "Connect your Bitcoin wallet using Internet Identity for secure, decentralized access.",
    icon: Wallet,
    iconColor: "text-accent",
  },
  {
    number: "02",
    title: "DEPOSIT",
    description:
      "Transfer your Bitcoin to the vault address. Your funds are immediately secured on-chain.",
    icon: ArrowDown,
    iconColor: "text-accent",
  },
  {
    number: "03",
    title: "LOCK",
    description:
      "Set your time-lock parameters. Once deployed, the vault runs autonomously and cannot be altered.",
    icon: Lock,
    iconColor: "text-accent",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const stepRef = useScrollReveal({
    y: 60,
    opacity: 0,
    scale: 0.9,
    delay: index * 0.2,
  });
  const Icon = step.icon;

  return (
    <div ref={stepRef} className="relative group">
      {/* Desktop Card - Timeline handled by parent */}
      <div className="hidden md:block h-full">
        <div className="brutal-border border-2 bg-white p-8 text-center flex flex-col h-full hover:border-accent transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative hover-lift">
          <div className="absolute top-0 right-0 w-12 h-12 border-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Icon Container */}
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center brutal-border border-2 bg-accent group-hover:scale-110 transition-all duration-300 relative z-10">
            <Icon className={`w-12 h-12 ${step.iconColor} font-bold`} />
          </div>

          {/* Step Number */}
          <div className="heading-brutal text-5xl md:text-6xl mb-4 text-accent group-hover:scale-110 transition-transform duration-300 relative z-10">
            {step.number}
          </div>

          {/* Step Title */}
          <div className="heading-brutal text-2xl mb-4 group-hover:text-accent transition-colors duration-300 relative z-10">
            {step.title}
          </div>

          {/* Step Description */}
          <div className="body-brutal text-sm leading-relaxed flex-1 relative z-10 border-t-2 border-accent pt-4 mt-auto">
            {step.description}
          </div>
        </div>
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="md:hidden">
        <div className="relative flex">
          {/* Vertical Timeline Line (Left Side) */}
          <div className="flex flex-col items-center mr-6">
            {/* Node */}
            <div className="w-6 h-6 bg-accent border-4 border-white rounded-full brutal-border z-20 timeline-node" />

            {/* Connector Line to Next Step */}
            {index < steps.length - 1 && (
              <div className="w-1 h-24 bg-linear-to-b from-accent to-structure opacity-60 relative">
                <div className="absolute inset-0 bg-linear-to-b from-accent to-transparent opacity-60 animate-pulse" />
              </div>
            )}
          </div>

          {/* Card */}
          <div className="flex-1 brutal-border bg-white p-6 text-left flex flex-col hover:border-accent transition-all duration-300 hover:scale-102 pb-6 mb-4">
            {/* Icon Container */}
            <div className="w-14 h-14 mb-4 flex items-center justify-center brutal-border bg-background group-hover:scale-110 transition-transform duration-300">
              <Icon className={`w-7 h-7 ${step.iconColor}`} />
            </div>

            {/* Step Number */}
            <div className="heading-brutal text-3xl mb-2 text-accent">
              {step.number}
            </div>

            {/* Step Title */}
            <div className="heading-brutal text-lg mb-3 group-hover:text-accent transition-colors duration-300">
              {step.title}
            </div>

            {/* Step Description */}
            <div className="body-brutal text-sm leading-relaxed text-gray-700">
              {step.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useScrollReveal<HTMLDivElement>({ y: 30, delay: 0 });

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const sectionElement = sectionRef.current;
    const ctx = gsap.context(() => {
      // Animate main timeline path
      const mainPath = sectionElement.querySelector(".main-timeline-path");

      if (mainPath) {
        gsap.fromTo(
          mainPath,
          { strokeDashoffset: 1000 },
          {
            strokeDashoffset: 0,
            duration: 2.5,
            delay: 0.6,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: sectionElement,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Animate timeline nodes entrance - smooth and fluid
      const timelineNodes = sectionElement.querySelectorAll(".timeline-node");
      if (timelineNodes.length > 0) {
        gsap.fromTo(
          timelineNodes,
          { scale: 0.2, rotation: 360, opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.7,
            delay: 1,
            stagger: 0.2,
            ease: "elastic.out(1.1, 0.5)",
            scrollTrigger: {
              trigger: sectionElement,
              start: "top 75%",
              toggleActions: "play none none reverse",
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
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent opacity-5 rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent opacity-5 rounded-full" />
      </div>

      <div className="container mx-auto px-6 h-full relative z-10">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-20 brutal-border border-2 border-accent py-12 px-6">
          <h2 className="heading-brutal text-5xl md:text-7xl mb-4">
            HOW IT WORKS
          </h2>
          <p className="body-brutal text-lg max-w-3xl mx-auto text-gray-700">
            Three simple steps to secure your Bitcoin with Ironclad&apos;s
            time-based vault system.
          </p>
        </div>

        {/* Curvy Timeline Container */}
        <div className="relative">
          {/* Steps Timeline with Curvy Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 relative pt-8">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
