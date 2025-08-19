"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
  dark?: boolean
  id?: string
}

export function Section({ children, className = "", dark = false, id }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden ${
        dark ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
      } ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        {children}
      </div>
    </section>
  )
}

export default Section
