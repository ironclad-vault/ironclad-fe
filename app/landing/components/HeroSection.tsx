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
      // Hero words - subtle slide-up with no rotation
      gsap.fromTo(
        ".hero-word",
        { y: 40, opacity: 0, scale: 0.95, transformOrigin: "center bottom" },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.0,
          stagger: 0.1,
          ease: "power2.out",
        }
      );

      // Rotating text - smooth scale entrance
      gsap.fromTo(
        ".hero-rotating-text",
        { y: 30, scale: 0.8, opacity: 0, transformOrigin: "center bottom" },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.2,
          delay: 0.3,
          ease: "back.out(1.1)",
        }
      );

      // Subcontent - clean fade-in from bottom
      gsap.fromTo(
        ".hero-subcontent",
        { opacity: 0, y: 30, transformOrigin: "center bottom" },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.6,
          ease: "power1.out",
        }
      );
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
      </div>

      <div className="text-center max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col items-center gap-6">
            <h1 className="heading-brutal text-4xl md:text-6xl mx-auto text-center">
              <span className="hero-word inline-block">LOCK YOUR</span>
              <span className="hero-word inline-block mx-3">BTC WITH</span>
            </h1>

            <div className="hero-rotating-text w-full flex justify-center">
              <RotatingText
                words={rotatingWords}
                duration={2500}
                className="text-5xl md:text-7xl text-center inline-block min-w-[200px] md:min-w-[300px]"
                splitText="LOCK YOUR BTC WITH"
              />
            </div>

            <h2 className="heading-brutal text-4xl md:text-6xl mx-auto text-center">
              <span className="hero-word inline-block">SECURE YOUR</span>
              <span className="hero-word inline-block mx-3">VAULT</span>
            </h2>
          </div>

          <div className="hero-subcontent flex flex-col gap-12 max-w-4xl mx-auto">
            <p className="body-brutal text-xl md:text-2xl leading-relaxed">
              Experience{" "}
              <span className="heading-brutal text-accent">
                time-locked security
              </span>
              <br />{" "}
              <span className="heading-brutal text-accent">
                trustless autonomy
              </span>
              , and{" "}
              <span className="heading-brutal text-accent">
                brutalist protection
              </span>{" "}
              for your digital assets.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <TransitionButton
                href="/vault"
                className="button-brutal accent flex items-center space-x-2 text-lg px-10 py-6"
              >
                <span>LOCK YOUR ASSETS</span>
                <ArrowRight className="w-4 h-4" />
              </TransitionButton>

              <Link
                href="#how-it-works"
                className="button-brutal flex items-center space-x-2 text-lg px-10 py-6"
              >
                <span>LEARN MORE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
