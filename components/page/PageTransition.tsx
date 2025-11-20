"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface PageTransitionProps {
  children: React.ReactNode;
  isTransitioning: boolean;
  onTransitionComplete: () => void;
}

export default function PageTransition({
  children,
  isTransitioning,
  onTransitionComplete,
}: PageTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (isTransitioning) {
      // Kill any existing animation
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Create a timeline for smooth, choreographed animation
      const tl = gsap.timeline({
        onComplete: onTransitionComplete,
      });

      // Overlay slides in from left - first half of transition
      tl.fromTo(
        overlay,
        {
          x: "-100%",
          visibility: "visible",
        },
        {
          x: "0%",
          duration: 0.6,
          ease: "cubic.inOut",
        },
        0
      );

      // Content fades out during overlay transition
      tl.to(
        content,
        {
          opacity: 0.7,
          duration: 0.6,
          ease: "cubic.inOut",
        },
        0
      );

      // Brief hold at full coverage
      tl.to(overlay, {
        x: "0%",
        duration: 0.15,
      });

      // Overlay slides out to right - second half of transition
      tl.to(
        overlay,
        {
          x: "100%",
          duration: 0.6,
          ease: "cubic.inOut",
        }
      );

      // Content fades back in
      tl.to(
        content,
        {
          opacity: 1,
          duration: 0.4,
          ease: "cubic.out",
        },
        "-=0.3"
      );

      timelineRef.current = tl;
    } else {
      // Reset state when not transitioning
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      gsap.set(overlay, {
        x: "-100%",
        visibility: "hidden",
      });

      gsap.set(content, {
        opacity: 1,
      });
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isTransitioning, onTransitionComplete]);

  return (
    <div className="relative overflow-hidden">
      {/* Page content */}
      <div ref={contentRef} className="relative">
        {children}
      </div>

      {/* Curtain overlay element */}
      <div
        ref={overlayRef}
        className="fixed top-0 left-0 w-full h-full bg-accent z-50"
        style={{
          visibility: "hidden",
        }}
      />
    </div>
  );
}
