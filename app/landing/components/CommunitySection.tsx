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
      // Logo entrance animation - fluid elastic entrance
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          {
            scale: 0.3,
            rotation: -200,
            opacity: 0,
          },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 1.5,
            ease: "elastic.out(1.2, 0.4)",
            scrollTrigger: {
              trigger: logoRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Floating particles animation - smooth and continuous
      const section = sectionRef.current;
      if (section) {
        const particles = section.querySelectorAll(".particle");
        particles.forEach((particle, index) => {
          gsap.to(particle, {
            y: "random(-120, -220)",
            x: "random(-60, 60)",
            rotation: "random(-360, 360)",
            duration: "random(4, 8)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.25,
          });
        });
      }

      // CTA button pulse effect - smooth and subtle
      const ctaButton = sectionRef.current?.querySelector(".cta-primary");
      if (ctaButton) {
        gsap.to(ctaButton, {
          boxShadow: [
            "0 0 0px rgba(247, 147, 26, 0)",
            "0 0 25px rgba(247, 147, 26, 0.4)",
            "0 0 0px rgba(247, 147, 26, 0)",
          ],
          duration: 2.5,
          repeat: -1,
          ease: "sine.inOut",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden pb-32"
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
              <div className="w-48 h-48 md:w-56 md:h-56 border-4 border-accent rounded-lg bg-accent flex items-center justify-center hover:scale-110 transition-transform duration-500 overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-accent rounded-lg bg-black opacity-20 absolute" />
                  <div className="text-4xl md:text-5xl font-black text-black relative z-10">
                    <Image
                      src="/ironclad-vault-logo.png"
                      alt="Ironclad Logo"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title with glitch effect */}
          <div ref={titleRef} className="w-full text-center">
            <div className="border-4 border-accent rounded-lg bg-accent py-6 px-8 inline-block">
              <GlitchText
                text="Ironclad"
                className="text-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight text-black"
                glitchIntensity="high"
                duration={3}
              />
            </div>
          </div>

          {/* Tagline */}
          <div
            ref={taglineRef}
            className="w-full text-center max-w-3xl mx-auto card-pro py-8 px-6"
          >
            <p className="text-body text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed">
              Join the revolution in Bitcoin security. Build your digital
              fortress with
              <span className="text-heading text-accent font-bold">
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
              className="cta-primary btn-pro accent inline-flex items-center space-x-3 sm:space-x-4 text-base sm:text-lg md:text-xl px-6 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 hover-lift whitespace-nowrap font-bold"
            >
              <span className="text-heading">LAUNCH VAULT</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </TransitionButton>
          </div>

          {/* Secondary CTA */}
          <div className="w-full text-center space-y-4">
            <p className="body-brutal text-xs sm:text-sm md:text-base text-gray-600">
              Curious? Explore how it works
            </p>
            <div>
              <a
                href="#how-it-works"
                className="button-brutal inline-block text-base sm:text-lg md:text-xl px-6 sm:px-8 py-3 sm:py-4 hover-lift font-bold"
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
              className="social-link brutal-border border-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300 group shrink-0 hover-lift"
              aria-label="Discord"
            >
              <MessageCircle className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-gray-900 group-hover:text-white transition-colors font-bold" />
            </a>
            <a
              href="#"
              className="social-link brutal-border border-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300 group shrink-0 hover-lift"
              aria-label="Twitter"
            >
              <Twitter className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-gray-900 group-hover:text-white transition-colors font-bold" />
            </a>
            <a
              href="#"
              className="social-link brutal-border border-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300 group shrink-0 hover-lift"
              aria-label="GitHub"
            >
              <Github className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-gray-900 group-hover:text-white transition-colors font-bold" />
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
