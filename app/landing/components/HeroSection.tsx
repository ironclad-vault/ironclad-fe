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
  const rotatingWords = ["SECURITY", "AUTONOMY", "FREEDOM", "TRUST"];

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
      className="min-h-screen flex items-center justify-center bg-background pt-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <ScrollFloat
          text="BITCOIN"
          speed={0.3}
          className="absolute top-20 left-10 opacity-10"
        />
        <ScrollFloat
          text="TIMELOCK"
          speed={0.4}
          className="absolute bottom-20 right-10 opacity-10"
        />
        <div className="absolute top-0 right-0 w-96 h-96 border-4 border-accent opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 border-4 border-accent opacity-10 pointer-events-none" />
      </div>

      <div className="text-center max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center gap-8 mb-8">
            <h1 className="text-heading text-5xl md:text-7xl lg:text-8xl mx-auto text-center leading-tight">
              <span className="hero-word inline-block">LOCK YOUR</span>
              <br />
              <span className="hero-word inline-block">BTC WITH</span>
            </h1>

            <div className="hero-rotating-text w-full flex justify-center">
              <div className="px-8 py-4 md:px-12 md:py-5 bg-accent border border-accent rounded-lg">
                <RotatingText
                  words={rotatingWords}
                  duration={2500}
                  className="text-heading text-4xl md:text-5xl lg:text-6xl text-center text-white font-bold"
                  splitText="LOCK YOUR BTC WITH"
                />
              </div>
            </div>

            <h2 className="text-heading text-4xl md:text-6xl lg:text-7xl mx-auto text-center leading-tight">
              <span className="hero-word inline-block">SECURE YOUR</span>
              <br />
              <span className="hero-word inline-block">VAULT</span>
            </h2>
          </div>

          <div className="hero-subcontent flex flex-col gap-12 max-w-4xl mx-auto">
            <div className="border border-zinc-200 bg-zinc-50 px-6 md:px-8 py-6 md:py-8 rounded-lg">
              <p className="text-body text-lg md:text-xl leading-relaxed">
                Experience{" "}
                <span className="text-heading text-accent font-bold">
                  time-locked security
                </span>
                <br />{" "}
                <span className="text-heading text-accent font-bold">
                  trustless autonomy
                </span>
                , and{" "}
                <span className="text-heading text-accent font-bold">
                  professional protection
                </span>{" "}
                for your digital assets.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <TransitionButton
                href="/vault"
                className="btn-pro accent flex items-center space-x-2 text-lg px-10 py-6 hover:lift font-bold"
              >
                <span>LOCK YOUR ASSETS</span>
                <ArrowRight className="w-5 h-5" />
              </TransitionButton>

              <Link
                href="#how-it-works"
                className="button-brutal flex items-center space-x-2 text-lg px-10 py-6 hover-lift font-bold"
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
