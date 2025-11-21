"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Enhanced testimonials data
const testimonials = [
  {
    name: "Alex Thompson",
    role: "Bitcoin Maximalist",
    content:
      "Ironclad has completely changed how I secure my Bitcoin. The time-locked autonomous system gives me peace of mind knowing my assets are truly untouchable until the specified date.",
  },
  {
    name: "Sarah Chen",
    role: "Crypto Investor",
    content:
      "The brutalist security approach is exactly what the Bitcoin ecosystem needs. No complex loopholes, just pure cryptographic security with time-based releases that cannot be tampered with.",
  },
  {
    name: "Marcus Rodriguez",
    role: "DeFi Developer",
    content:
      "Building on Internet Computer ensures true autonomy. Once deployed, the vault runs independently without any single point of failure. This is the future of Bitcoin custody.",
  },
  {
    name: "Emily Watson",
    role: "Digital Security Expert",
    content:
      "The transparent, audited smart contracts with minimal attack surface provide security guarantees that traditional custodians simply cannot match.",
  },
  {
    name: "David Kim",
    role: "Long-term Bitcoin Holder",
    content:
      "Finally, a solution that respects the 'not your keys, not your crypto' principle while providing institutional-grade security for long-term hodling.",
  },
];

export default function TestimonialStackSection() {
  const pinRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!pinRef.current || !sectionRef.current || !containerRef.current) return;

    const cards = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(".testimonial-card")
    );
    if (!cards.length) return;

    const initialOffsetY = 800;
    const finalStackGap = 15;
    const scrollDuration = 2000;
    const cardRotations = [2, -1.5, 3, -2.5, 1.5];
    const pinRefElement = pinRef.current;

    // Set initial states
    cards.reverse().forEach((card, index) => {
      gsap.set(card, {
        y: initialOffsetY + index * 40,
        opacity: 0.8,
        scale: 0.95,
        rotate: 0,
      });
    });

    // Create timeline with ScrollTrigger - smooth scrub animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: pinRefElement,
        start: "top top",
        end: `+=${scrollDuration}`,
        scrub: 0.8,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      },
    });

    // Animate each card to form a stack with fluid easing
    cards.forEach((card, index) => {
      timeline.to(
        card,
        {
          y: index * finalStackGap,
          rotate: cardRotations[index % cardRotations.length],
          scale: 1,
          opacity: 1,
          ease: "cubic.inOut",
        },
        index * 0.12
      );
    });

    // Cleanup function
    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === pinRefElement) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section id="testimonials" className="py-20 bg-(--color-bg-white)">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 card-pro border-accent py-12 px-6">
          <h2 className="text-heading text-5xl md:text-7xl mb-4">
            TRUSTED BY USERS
          </h2>
          <p className="text-body text-lg max-w-3xl mx-auto text-zinc-600">
            Real experiences from Bitcoin enthusiasts, developers, and security
            experts who have secured their assets with Ironclad.
          </p>
        </div>

        {/* Pin Wrapper for stacking animation */}
        <div ref={pinRef} className="relative">
          {/* Stack Section */}
          <div
            ref={sectionRef}
            className="relative mx-auto max-w-5xl overflow-hidden"
            style={{ height: "100vh" }}
          >
            {/* Base Card - Bottom card in the stack */}
            <div
              className="testimonial-card absolute card-pro bg-structure p-12 md:p-16 flex flex-col justify-center items-center text-center"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "95%",
                maxWidth: "1000px",
                minHeight: "450px",
                zIndex: 0,
                transformOrigin: "center center",
                backfaceVisibility: "hidden",
              }}
            >
              <blockquote className="text-heading text-2xl md:text-4xl leading-tight mb-10">
                &ldquo;{testimonials[testimonials.length - 1].content}&rdquo;
              </blockquote>
              <div className="mt-auto border-t-2 border-accent pt-6 w-full">
                <h3 className="text-heading text-2xl md:text-3xl mb-2">
                  {testimonials[testimonials.length - 1].name}
                </h3>
                <p className="text-body text-sm tracking-wider text-accent font-bold">
                  {testimonials[testimonials.length - 1].role}
                </p>
              </div>
            </div>

            {/* Cards Container */}
            <div
              ref={containerRef}
              className="relative w-full h-full flex items-center justify-center"
            >
              {testimonials.slice(0, -1).map((testimonial, index) => (
                <div
                  key={index}
                  className="testimonial-card absolute card-pro bg-white p-12 md:p-16 flex flex-col justify-center items-center text-center hover-lift"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "95%",
                    maxWidth: "1000px",
                    minHeight: "450px",
                    zIndex: testimonials.length - index,
                    transformOrigin: "center center",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <blockquote className="text-heading text-2xl md:text-4xl leading-tight mb-10">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>
                  <div className="mt-auto border-t-2 border-accent pt-6 w-full">
                    <h3 className="text-heading text-2xl md:text-3xl mb-2">
                      {testimonial.name}
                    </h3>
                    <p className="text-body text-sm tracking-wider text-accent font-bold">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
