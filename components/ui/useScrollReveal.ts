'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollRevealOptions {
  trigger?: string
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  pinSpacing?: boolean
  anticipatePin?: number
  toggleActions?: string
  opacity?: number
  y?: number
  x?: number
  scale?: number
  rotation?: number
  duration?: number
  delay?: number
  stagger?: number
  ease?: string
  markers?: boolean
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const elementRef = useRef<T>(null)

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element) return

    const ctx = gsap.context(() => {
      // Set initial state - subtle animation with minimal rotation
      gsap.set(element, {
        opacity: options.opacity ?? 0,
        y: options.y ?? 60,
        x: options.x ?? 0,
        scale: options.scale ?? 0.9,
        rotation: options.rotation ?? 0,
        transformOrigin: 'center bottom',
      })

      // Create scroll-triggered animation - fluid entrance with refined easing
      gsap.to(element, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        duration: options.duration ?? 1.0,
        delay: options.delay ?? 0,
        ease: options.ease ?? 'expo.out',
        scrollTrigger: {
          trigger: options.trigger || element,
          start: options.start || 'top 85%',
          end: options.end || 'bottom 20%',
          scrub: options.scrub || false,
          pin: options.pin || false,
          pinSpacing: options.pinSpacing || false,
          anticipatePin: options.anticipatePin || 0,
          toggleActions: options.toggleActions || 'play none none reverse',
          markers: options.markers || false,
        },
      })
    }, element)

    return () => ctx.revert()
  }, [
    options.trigger,
    options.start,
    options.end,
    options.scrub,
    options.pin,
    options.pinSpacing,
    options.anticipatePin,
    options.toggleActions,
    options.opacity,
    options.y,
    options.x,
    options.scale,
    options.rotation,
    options.duration,
    options.delay,
    options.ease,
    options.markers,
  ])

  return elementRef
}

export function useScrollRevealStagger<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  options: ScrollRevealOptions = {}
) {
  const containerRef = useRef<T>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      const elements = container.querySelectorAll(selector)
      if (elements.length === 0) return

      // Set initial state for all elements - subtle entrance
      gsap.set(elements, {
        opacity: options.opacity ?? 0,
        y: options.y ?? 60,
        x: options.x ?? 0,
        scale: options.scale ?? 0.9,
        rotation: options.rotation ?? 0,
        transformOrigin: 'center bottom',
      })

      // Create staggered animation - fluid and refined
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        duration: options.duration ?? 1.0,
        delay: options.delay ?? 0,
        stagger: options.stagger ?? 0.15,
        ease: options.ease ?? 'expo.out',
        scrollTrigger: {
          trigger: options.trigger || container,
          start: options.start || 'top 85%',
          end: options.end || 'bottom 20%',
          scrub: options.scrub || false,
          toggleActions: options.toggleActions || 'play none none reverse',
          markers: options.markers || false,
        },
      })
    }, container)

    return () => ctx.revert()
  }, [
    selector,
    options.trigger,
    options.start,
    options.end,
    options.scrub,
    options.toggleActions,
    options.opacity,
    options.y,
    options.x,
    options.scale,
    options.rotation,
    options.duration,
    options.delay,
    options.stagger,
    options.ease,
    options.markers,
  ])

  return containerRef
}
