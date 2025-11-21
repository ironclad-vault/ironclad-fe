'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './RotatingText.css'

interface RotatingTextProps {
  words: string[]
  duration?: number
  className?: string
  splitText?: string
}

export default function RotatingText({
  words,
  duration = 2500,
  className = '',
  splitText = ''
}: RotatingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const currentIndexRef = useRef(0)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Set initial state - hide all words except the first one
      wordRefs.current.forEach((word, index) => {
        if (!word) return

        if (index === 0) {
          gsap.set(word, { y: 0, opacity: 1, zIndex: 2 })
        } else {
          gsap.set(word, { y: 20, opacity: 0, zIndex: 1 })
        }
      })

      // Rotate words function using ref to avoid closure issues
      const rotateWords = () => {
        const currentIndex = currentIndexRef.current
        const currentEl = wordRefs.current[currentIndex]
        const nextIndex = (currentIndex + 1) % words.length
        const nextEl = wordRefs.current[nextIndex]

        if (!currentEl || !nextEl) return

        // Bring next element to front
        gsap.set(nextEl, { zIndex: 2 })
        gsap.set(currentEl, { zIndex: 1 })

        // Animate out current word
        gsap.to(currentEl, {
          y: -25,
          opacity: 0,
          duration: 0.4,
          ease: "cubic.inOut"
        })

        // Animate in next word
        gsap.to(nextEl, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "cubic.inOut"
        })

        // Update the ref
        currentIndexRef.current = nextIndex
      }

      // Start rotation after initial delay
      const interval = setInterval(rotateWords, duration)
      return () => clearInterval(interval)
    }, containerRef)

    return () => ctx.revert()
  }, [words, duration])

  // Determine word length for dynamic sizing
  const getWordLength = (word: string): 'short' | 'medium' | 'long' => {
    if (word.length <= 6) return 'short'
    if (word.length <= 10) return 'medium'
    return 'long'
  }

  return (
    <div ref={containerRef} className={`rotating-text flex items-center justify-center ${className}`}>
      <span className="text-rotate-sr-only">
        {splitText} {words.join(', ')}
      </span>
      <div className="rotating-word-container relative">
        {words.map((word, index) => (
          <span
            key={index}
            ref={(el) => { wordRefs.current[index] = el }}
            className={`rotating-word heading-brutal absolute left-1/2 transform -translate-x-1/2 w-max`}
            data-length={getWordLength(word)}
            style={{ textAlign: 'center' }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}
