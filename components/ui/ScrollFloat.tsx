'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollFloat.css'

gsap.registerPlugin(ScrollTrigger)

interface ScrollFloatProps {
  text: string
  speed?: number
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  enableHover?: boolean
  colorShift?: boolean
}

export default function ScrollFloat({
  text,
  speed = 0.5,
  className = '',
  intensity = 'medium',
  enableHover = true,
  colorShift = false
}: ScrollFloatProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const charElementsRef = useRef<HTMLSpanElement[]>([])
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const textElement = containerRef.current?.querySelector('.scroll-float-text')
      if (!textElement) return

      // Split text into individual characters
      const chars = text.split('')
      textElement.innerHTML = chars.map((char, index) =>
        `<span class="char" data-index="${index}">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('')

      const charElements = Array.from(containerRef.current!.querySelectorAll('.char')) as HTMLSpanElement[]
      charElementsRef.current = charElements

      // Set initial positions based on intensity
      const intensityMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1
      const initialY = intensityMultiplier * 15
      const rotationIntensity = intensityMultiplier * 5

      gsap.set(charElements, {
        y: (index: number) => index % 2 === 0 ? -initialY : initialY,
        rotation: (index: number) => (index % 2 === 0 ? -rotationIntensity : rotationIntensity),
        opacity: 0.8,
        scale: 0.95,
        transformOrigin: 'center bottom'
      })

      // Create main timeline with ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress

            // Animate each character with wave effect
            charElements.forEach((char, index) => {
              const waveOffset = Math.sin(progress * Math.PI * 4 + index * 0.3) * 20 * speed * intensityMultiplier
              const rotation = Math.sin(progress * Math.PI * 2 + index * 0.2) * rotationIntensity
              const scale = 0.95 + Math.abs(Math.sin(progress * Math.PI + index * 0.1)) * 0.1
              const opacity = 0.7 + Math.abs(Math.sin(progress * Math.PI + index * 0.15)) * 0.3

              gsap.set(char, {
                y: waveOffset,
                rotation: rotation,
                scale: scale,
                opacity: opacity
              })

              // Color shift effect
              if (colorShift) {
                const hue = (progress * 360 + index * 30) % 360
                gsap.set(char, {
                  color: `hsl(${hue}, 70%, 50%)`,
                  filter: `hue-rotate(${hue}deg)`
                })
              }
            })
          }
        }
      })

      timelineRef.current = tl

      // Enhanced hover effects
      if (enableHover) {
        const handleMouseEnter = () => {
          gsap.to(charElements, {
            scale: 1.15,
            rotation: 'random(-8, 8)',
            duration: 0.4,
            stagger: 0.03,
            ease: 'cubic.out'
          })
        }

        const handleMouseLeave = () => {
          gsap.to(charElements, {
            scale: 0.95,
            rotation: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: 'cubic.out'
          })
        }

        const handleMouseMove = (e: MouseEvent) => {
          const rect = containerRef.current!.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const mouseX = e.clientX - centerX
          const mouseY = e.clientY - centerY

          const angleX = (mouseY / centerY) * -12
          const angleY = (mouseX / centerX) * 12

          gsap.to(containerRef.current, {
            rotationX: angleX,
            rotationY: angleY,
            duration: 0.6,
            ease: 'cubic.out'
          })
        }

        const container = containerRef.current
        if (container) {
          container.addEventListener('mouseenter', handleMouseEnter)
          container.addEventListener('mouseleave', handleMouseLeave)
          container.addEventListener('mousemove', handleMouseMove)

          return () => {
            container.removeEventListener('mouseenter', handleMouseEnter)
            container.removeEventListener('mouseleave', handleMouseLeave)
            container.removeEventListener('mousemove', handleMouseMove)
          }
        }
      }

      // Add entrance animation - smooth and fluid
      gsap.fromTo(charElements,
        {
          y: 80,
          opacity: 0,
          rotation: 15,
          scale: 0.8
        },
        {
          y: (index: number) => index % 2 === 0 ? -initialY : initialY,
          opacity: 0.8,
          rotation: (index: number) => (index % 2 === 0 ? -rotationIntensity : rotationIntensity),
          scale: 1,
          duration: 0.8,
          stagger: 0.04,
          ease: 'elastic.out(0.8, 0.5)',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            once: true
          }
        }
      )

    }, containerRef)

    return () => {
      ctx.revert()
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
      gsap.killTweensOf(charElementsRef.current)
    }
  }, [text, speed, intensity, enableHover, colorShift])

  return (
    <div
      ref={containerRef}
      className={`scroll-float ${intensity} ${colorShift ? 'color-shift' : ''} ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div className="scroll-float-text heading-brutal">
        {text}
      </div>
    </div>
  )
}
