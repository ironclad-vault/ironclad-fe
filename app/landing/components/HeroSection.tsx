"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RotatingText from "@/components/ui/RotatingText";
import ScrollFloat from "@/components/ui/ScrollFloat";
import TransitionButton from "@/components/navigation/TransitionButton";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotatingWords = ["YIELD", "LIQUIDITY", "INHERITANCE", "CONTROL"];

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ delay: 0.1 });

      // Hero words - smooth entrance with optimized easing
      timeline.fromTo(
        ".hero-word",
        { y: 50, opacity: 0, scale: 0.92, transformOrigin: "center bottom" },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          stagger: { amount: 0.3, from: "start" },
          ease: "expo.out",
        },
        0
      );

      // Rotating text - smooth elastic entrance
      timeline.fromTo(
        ".hero-rotating-text",
        { y: 40, scale: 0.75, opacity: 0, transformOrigin: "center bottom" },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: "elastic.out(1, 0.5)",
        },
        0.2
      );

      // Subcontent - fluid fade and slide combination
      timeline.fromTo(
        ".hero-subcontent",
        { opacity: 0, y: 40, scale: 0.95, transformOrigin: "center top" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: "cubic.out",
        },
        0.5
      );

      // Add subtle continuous float animation
      gsap.to(".hero-rotating-text", {
        y: 8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-black pt-20 relative overflow-hidden"
    >
      {/* Subtle glow effect from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none">
        <ScrollFloat
          text="BITCOIN"
          speed={0.3}
          className="absolute top-20 left-10 opacity-5"
        />
        <ScrollFloat
          text="TIMELOCK"
          speed={0.4}
          className="absolute bottom-20 right-10 opacity-5"
        />
        <div className="absolute top-0 right-0 w-96 h-96 border-4 border-orange-500 opacity-5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 border-4 border-orange-500 opacity-5 pointer-events-none" />
      </div>

      <div className="text-center max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center gap-8 mb-8">
            <h1 className="text-heading text-7xl md:text-8xl lg:text-9xl mx-auto text-center leading-tight text-white font-black uppercase tracking-wide">
              <span className="hero-word inline-block">THE FIRST LIQUID</span>
              <br />
              <span className="hero-word inline-block">VESTING PROTOCOL</span>
              <br />
              <span className="hero-word inline-block text-orange-500">ON BITCOIN</span>
            </h1>

            <div className="hero-rotating-text w-full flex justify-center">
              <div className="px-3 py-1 border-2 border-orange-500 rounded transform -rotate-12 inline-block">
                <span className="text-heading text-lg md:text-xl text-orange-500 font-black uppercase tracking-widest">
                  YIELD
                </span>
              </div>
            </div>
          </div>

          <div className="hero-subcontent flex flex-col gap-12 max-w-3xl mx-auto">
            <p className="text-body text-base md:text-lg leading-relaxed text-zinc-300 max-w-2xl mx-auto font-light">
              Charting the first <span className="text-orange-500 font-semibold">liquid vesting protocol</span> on <span className="text-orange-500 font-semibold">Bitcoin</span>. Enumerate vesting protocols, evaluate risks, and enable <span className="text-orange-500 font-semibold">decentralized retention</span> based on Bitcoin.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <TransitionButton
                href="/vault"
                className="flex items-center space-x-2 text-base md:text-lg px-8 md:px-10 py-3 md:py-4 font-bold bg-orange-500 text-black hover:bg-orange-600 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95"
              >
                <span>ACCESS PROTOCOL</span>
                <ArrowRight className="w-5 h-5" />
              </TransitionButton>

              <Link
                href="#how-it-works"
                className="flex items-center space-x-2 text-base md:text-lg px-8 md:px-10 py-3 md:py-4 font-bold border-2 border-white/40 text-white hover:border-white hover:bg-white/10 rounded-md transition-all duration-200"
              >
                <span>LEARN MORE</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
