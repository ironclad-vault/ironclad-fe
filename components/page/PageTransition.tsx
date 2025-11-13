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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only run animations after component has mounted
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !overlayRef.current) return;

    const overlay = overlayRef.current;

    if (isTransitioning) {
      console.log("Starting curtain reveal transition");
      
      // Set overlay to cover the screen from left to right
      gsap.fromTo(
        overlay,
        {
          x: "-100%",
        },
        {
          x: "0%",
          duration: 1.5,
          ease: "power2.inOut",
          onComplete: () => {
            console.log("Overlay fully covered screen");
            // Start revealing after a brief pause
            setTimeout(() => {
              gsap.to(overlay, {
                x: "100%",
                duration: 1.5,
                ease: "power2.inOut",
                onComplete: () => {
                  console.log("Curtain reveal complete");
                  onTransitionComplete();
                },
              });
            }, 300); // Brief pause at fully covered state
          },
        }
      );
    } else {
      // Reset overlay to initial state
      gsap.set(overlay, {
        x: "-100%",
      });
    }
  }, [isTransitioning, isReady, onTransitionComplete]);

  return (
    <div className="relative overflow-hidden">
      {/* Page content */}
      <div className="relative">{children}</div>

      {/* Curtain overlay element */}
      <div
        ref={overlayRef}
        className="fixed top-0 left-0 w-full h-full bg-accent z-50"
        style={{
          visibility: isReady ? "visible" : "hidden",
        }}
      />
    </div>
  );
}