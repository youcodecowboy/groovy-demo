"use client"

import { useReducedMotion, useMotionValue, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"

type AbstractBgProps = {
  className?: string
}

// Light-mode abstract node/edge background with subtle parallax and glow
export function AbstractBg({ className }: AbstractBgProps) {
  const prefersReduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useTransform(my, [-50, 50], [3, -3])
  const rotateY = useTransform(mx, [-50, 50], [-3, 3])

  useEffect(() => {
    if (prefersReduced) return
    const handle = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      mx.set(((e.clientX - cx) / rect.width) * 100)
      my.set(((e.clientY - cy) / rect.height) * 100)
    }
    window.addEventListener("mousemove", handle)
    return () => window.removeEventListener("mousemove", handle)
  }, [prefersReduced, mx, my])

  // Brutalist variant: keep container for future use, but render nothing (clean background)
  return <div ref={containerRef} className={className} aria-hidden />
}

export default AbstractBg


