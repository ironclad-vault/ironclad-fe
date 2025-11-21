'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface GlitchTextProps {
  text: string
  className?: string
  glitchIntensity?: 'low' | 'medium' | 'high'
  duration?: number
  trigger?: boolean
}

export default function GlitchText({
  text,
  className = '',
  glitchIntensity = 'medium',
  duration = 2,
  trigger = true
}: GlitchTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const glitchLayersRef = useRef<(HTMLSpanElement | null)[]>([])

  useLayoutEffect(() => {
    if (!containerRef.current || !trigger) return

    const ctx = gsap.context(() => {
      const container = containerRef.current
      const textEl = textRef.current
      const glitchLayers = glitchLayersRef.current.filter(Boolean) as HTMLSpanElement[]

      if (!container || !textEl || glitchLayers.length === 0) return

      // Set initial state
      gsap.set(glitchLayers, {
        opacity: 0,
        x: 0,
        y: 0,
        skewX: 0,
        skewY: 0,
      })

      // Glitch animation function
      const createGlitch = () => {
        const intensity = glitchIntensity === 'low' ? 1 : glitchIntensity === 'high' ? 3 : 2
        const maxOffset = intensity * 5
        const maxSkew = intensity * 2

        // Random glitch effects
        const timeline = gsap.timeline()

        glitchLayers.forEach((layer, index) => {
          const randomX = gsap.utils.random(-maxOffset, maxOffset)
          const randomY = gsap.utils.random(-maxOffset, maxOffset)
          const randomSkewX = gsap.utils.random(-maxSkew, maxSkew)
          const randomSkewY = gsap.utils.random(-maxSkew, maxSkew)
          const randomDuration = gsap.utils.random(0.05, 0.15)

          timeline.to(layer, {
            opacity: 0.8,
            x: randomX,
            y: randomY,
            skewX: randomSkewX,
            skewY: randomSkewY,
            duration: randomDuration,
            ease: 'power2.inOut'
          }, index * 0.02)

          timeline.to(layer, {
            opacity: 0,
            x: 0,
            y: 0,
            skewX: 0,
            skewY: 0,
            duration: randomDuration,
            ease: 'power2.inOut'
          }, `>${0.1 + index * 0.02}`)
        })

        return timeline
      }

      // Initial entrance animation
      gsap.fromTo(textEl,
        { opacity: 0, scale: 0.8, rotation: 5 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1,
          ease: 'power3.out',
        }
      )

      // Hover glitch effect
      const handleMouseEnter = () => {
        createGlitch()
      }

      container.addEventListener('mouseenter', handleMouseEnter)

      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter)
      }
    }, containerRef)

    return () => ctx.revert()
  }, [text, glitchIntensity, duration, trigger])

  return (
    <div ref={containerRef} className={`glitch-text-container relative inline-block ${className}`}>
      <span ref={textRef} className="relative z-10 block">
        {text}
      </span>

      {/* Glitch layers */}
      <span ref={(el) => { glitchLayersRef.current[0] = el }} className="absolute top-0 left-0 z-0 text-red-500">
        {text}
      </span>
      <span ref={(el) => { glitchLayersRef.current[1] = el }} className="absolute top-0 left-0 z-0 text-blue-500">
        {text}
      </span>
      <span ref={(el) => { glitchLayersRef.current[2] = el }} className="absolute top-0 left-0 z-0 text-green-500">
        {text}
      </span>

      <style jsx>{`
        .glitch-text-container {
          position: relative;
        }

        .glitch-text-container span {
          display: block;
        }

        .glitch-text-container span:not(:first-child) {
          mix-blend-mode: multiply;
        }
      `}</style>
    </div>
  )
}
