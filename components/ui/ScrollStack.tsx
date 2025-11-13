'use client'

import { useLayoutEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollUpdateEvent {
  progress: number
}

interface ScrollStackProps {
  children: ReactNode[]
  stackGap?: number
  scrollDuration?: number
  className?: string
  onCardChange?: (index: number) => void
}

export default function ScrollStack({
  children,
  stackGap = 12,
  scrollDuration = 2000,
  className = '',
  onCardChange
}: ScrollStackProps) {
  const pinRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (!pinRef.current || !containerRef.current) return

    const pinElement = pinRef.current
    const cards = cardsRef.current.filter((card): card is HTMLDivElement => card !== null)
    if (cards.length === 0) return

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger)

    // Set initial states - cards spread out
    cards.forEach((card, index) => {
      gsap.set(card, {
        y: 800 + index * 40,
        scale: 0.95,
        opacity: 0.8,
        rotation: 0
      })
    })

    // Create timeline with ScrollTrigger for stacking animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: pinElement,
        start: "top top",
        end: `+=${scrollDuration}`,
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self: ScrollUpdateEvent) => {
          const progress = self.progress
          const currentCardIndex = Math.floor(progress * cards.length)

          if (onCardChange && currentCardIndex >= 0 && currentCardIndex < cards.length) {
            onCardChange(currentCardIndex)
          }
        }
      }
    })

    // Animate each card to stack position
    cards.forEach((card, index) => {
      timeline.to(
        card,
        {
          y: index * stackGap,
          scale: 1 - (index * 0.02),
          opacity: 1,
          rotation: (index % 2 === 0 ? 1 : -1) * (index + 1) * 0.5,
          ease: "power2.inOut",
          duration: 0.8
        },
        index * 0.15
      )
    })

    return () => {
      timeline.kill()
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === pinElement) {
          trigger.kill()
        }
      })
    }
  }, [children.length, stackGap, scrollDuration, onCardChange])

  return (
    <div ref={pinRef} className={`scroll-stack-pin ${className}`}>
      <div className="relative mx-auto max-w-4xl">
        {/* Cards Container */}
        <div ref={containerRef} className="relative">
          {children.map((child, index) => (
            <div
              key={index}
              ref={(el: HTMLDivElement | null) => { cardsRef.current[index] = el }}
              className="card-brutal absolute left-0 right-0 mx-auto"
              style={{
                width: "90%",
                maxWidth: "800px",
                minHeight: "400px",
                zIndex: children.length - index,
                transformOrigin: "center center",
                backfaceVisibility: "hidden"
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}