"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  useScrollReveal,
  useScrollRevealStagger,
} from "@/components/ui/useScrollReveal";
import { ArrowRight, Github, Twitter, MessageCircle } from "lucide-react";
import GlitchText from "@/components/ui/animated/GlitchText";
import Link from "next/link";
import Image from "next/image";
import TransitionButton from "@/components/navigation/TransitionButton";

export default function CommunitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useScrollReveal<HTMLDivElement>({ y: 60, delay: 0 });
  const taglineRef = useScrollReveal<HTMLDivElement>({ y: 40, delay: 0.3 });
  const ctaRef = useScrollReveal<HTMLDivElement>({
    y: 40,
    delay: 0.6,
    scale: 0.9,
  });
  const socialRef = useScrollRevealStagger<HTMLDivElement>(".social-link", {
    y: 30,
    opacity: 0,
    stagger: 0.1,
    delay: 0.9,
  });

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Logo entrance animation
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          {
            scale: 0,
            rotation: -180,
            opacity: 0,
          },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 2,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: logoRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Floating particles animation
      const section = sectionRef.current;
      if (section) {
        const particles = section.querySelectorAll(".particle");
        particles.forEach((particle, index) => {
          gsap.to(particle, {
            y: "random(-100, -200)",
            x: "random(-50, 50)",
            rotation: "random(-180, 180)",
            duration: "random(3, 6)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2,
          });
        });
      }

      // CTA button pulse effect
      const ctaButton = sectionRef.current?.querySelector(".cta-primary");
      if (ctaButton) {
        gsap.to(ctaButton, {
          boxShadow: "0 0 30px rgba(247, 147, 26, 0.3)",
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent opacity-10 rounded-full particle" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent opacity-8 rounded-full particle" />
        <div className="absolute bottom-20 left-32 w-40 h-40 bg-accent opacity-5 rounded-full particle" />
        <div className="absolute bottom-40 right-40 w-28 h-28 bg-accent opacity-12 rounded-full particle" />
        <div className="absolute top-60 left-60 w-20 h-20 bg-accent opacity-6 rounded-full particle" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col items-center justify-center w-full space-y-12">
          {/* Logo with animation */}
          <div className="w-full flex justify-center pt-16 md:pt-20">
            <div ref={logoRef} className="relative inline-block">
              {/* Logo Container */}
              <div className="w-40 h-40 md:w-48 md:h-48 brutal-border bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded brutal-border bg-accent opacity-20 absolute" />
                  <div className="text-4xl md:text-5xl font-black text-accent relative z-10">
                    <Image
                      src="/ironclad-vault-logo.png"
                      alt="Ironclad Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title with glitch effect */}
          <div ref={titleRef} className="w-full text-center">
            <GlitchText
              text="Ironclad"
              className="heading-brutal text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight"
              glitchIntensity="high"
              duration={3}
            />
          </div>

          {/* Tagline */}
          <div
            ref={taglineRef}
            className="w-full text-center max-w-3xl mx-auto"
          >
            <p className="body-brutal text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed px-4">
              Join the revolution in Bitcoin security. Build your digital
              fortress with
              <span className="text-accent font-bold">
                {" "}
                time-locked autonomy
              </span>
              and cryptographic proof.
            </p>
          </div>

          {/* Main CTA */}
          <div ref={ctaRef} className="w-full flex justify-center">
            <TransitionButton
              href="/vault"
              className="cta-primary button-brutal accent inline-flex items-center space-x-3 sm:space-x-4 text-base sm:text-lg md:text-xl px-6 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 hover:scale-105 transition-transform duration-300 whitespace-nowrap"
            >
              <span className="heading-brutal">LAUNCH VAULT</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </TransitionButton>
          </div>

          {/* Secondary CTA */}
          <div className="w-full text-center space-y-4">
            <p className="body-brutal text-xs sm:text-sm md:text-base text-gray-500">
              Curious? Explore how it works
            </p>
            <div>
              <a
                href="#how-it-works"
                className="button-brutal inline-block text-base sm:text-lg md:text-xl px-6 sm:px-8 py-3 sm:py-4 hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                EXPLORE
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div
            ref={socialRef}
            className="w-full flex justify-center gap-3 sm:gap-4 md:gap-6 pt-8 md:pt-12"
          >
            <a
              href="#"
              className="social-link brutal-border w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300 group shrink-0 hover:shadow-brutal"
              aria-label="Discord"
            >
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-900 group-hover:text-white transition-colors" />
            </a>
            <a
              href="#"
              className="social-link brutal-border w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300 group shrink-0 hover:shadow-brutal"
              aria-label="Twitter"
            >
              <Twitter className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-900 group-hover:text-white transition-colors" />
            </a>
            <a
              href="#"
              className="social-link brutal-border w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300 group shrink-0 hover:shadow-brutal"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-900 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />

      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(
              var(--color-structure) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, var(--color-structure) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
}
