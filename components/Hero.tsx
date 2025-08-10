"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, Reorder, useReducedMotion } from "framer-motion"
// background removed per brutalist look
import { Sparkles, Workflow, QrCode, Camera, Clock } from "lucide-react"

const WORDS = [
  "Physical",
  "Digital",
  "Production",
  "Manufacturing",
  "Logistics",
  "Workflows",
  "Projects",
  "Hybrid",
] as const
const WORKFLOW_SETS = [
  { label: "Manufacturing", stages: ["Plan", "Cut", "Sew", "QC", "Finish"] },
  { label: "Projects", stages: ["Plan", "Design", "Build", "Test", "Ship"] },
  { label: "Logistics", stages: ["Pick", "Pack", "Stage", "Load", "Deliver"] },
]

export function Hero(): JSX.Element {
  const [wordIndex, setWordIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [setIndex, setSetIndex] = useState(0)
  const [stages, setStages] = useState<string[]>(WORKFLOW_SETS[0].stages)
  const [lastDropped, setLastDropped] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const prefersReduced = useReducedMotion()
  const announceRef = useRef<HTMLDivElement | null>(null)
  const resumeTimer = useRef<number | null>(null)
  const autoTimer = useRef<number | null>(null)

  useEffect(() => {
    announceRef.current?.setAttribute("aria-live", "polite")
    setMounted(true)
  }, [])

  const currentWord = useMemo(() => WORDS[wordIndex % WORDS.length], [wordIndex])

  useEffect(() => {
    if (paused) return
    const kick = window.setTimeout(() => {
      setWordIndex((i) => (i + 1) % WORDS.length)
    }, 500)
    const id = window.setInterval(() => {
      setWordIndex((i) => (i + 1) % WORDS.length)
    }, 1800)
    return () => {
      window.clearTimeout(kick)
      window.clearInterval(id)
    }
  }, [paused])

  // Auto-reorder and auto-switch workflow sets to feel alive
  useEffect(() => {
    if (prefersReduced) return
    if (autoTimer.current) window.clearInterval(autoTimer.current)
    autoTimer.current = window.setInterval(() => {
      if (paused) return
      // alternate between shuffle and set switch
      const now = Date.now()
      if (Math.floor(now / 6000) % 2 === 0) {
        // shuffle current stages
        setStages((curr) => {
          const copy = [...curr]
          for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[copy[i], copy[j]] = [copy[j], copy[i]]
          }
          if (announceRef.current) announceRef.current.textContent = `Workflow order updated: ${copy.join(", ")}`
          return copy
        })
      } else {
        // switch to next set
        setSetIndex((idx) => {
          const next = (idx + 1) % WORKFLOW_SETS.length
          const set = WORKFLOW_SETS[next]
          setStages(set.stages)
          if (announceRef.current) announceRef.current.textContent = `Workflow switched to ${set.label}: ${set.stages.join(", ")}`
          return next
        })
      }
    }, 3000)
    return () => {
      if (autoTimer.current) window.clearInterval(autoTimer.current)
    }
  }, [prefersReduced, paused])

  // helpers for per-card variation
  function charSum(value: string): number {
    let sum = 0
    for (let i = 0; i < value.length; i++) sum += value.charCodeAt(i)
    return sum
  }
  function formatSeconds(total: number): string {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  function onReorder(newOrder: string[]) {
    setStages(newOrder)
    // subtle announcement for a11y
    const message = `Workflow order updated: ${newOrder.join(", ")}`
    if (announceRef.current) {
      announceRef.current.textContent = message
    }
  }

  function moveStage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= stages.length) return
    const copy = [...stages]
    const [moved] = copy.splice(index, 1)
    copy.splice(nextIndex, 0, moved)
    onReorder(copy)
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-0 border-b-2 border-black" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative container mx-auto px-4 pt-28 md:pt-32 pb-24 text-center">
        {/* pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 backdrop-blur-md shadow-[0_1px_0_#fff_inset,0_1px_20px_rgba(0,0,0,.04)] px-4 py-1.5 text-sm text-zinc-700">
          <Sparkles className="h-4 w-4 text-sky-600" /> Operating System Builder
        </div>

        {/* H1 */}
        <motion.h1
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 text-zinc-900 text-6xl sm:text-[72px] leading-[1.08] font-semibold tracking-tight max-w-5xl mx-auto"
        >
          Build the way you work.
        </motion.h1>

        {/* Subhead with animated word (fixed slot, single-line; only the word animates) */}
        <div className="mt-5 text-lg sm:text-[20px] text-zinc-700 max-w-5xl mx-auto leading-relaxed">
          <p className="whitespace-nowrap">
            A configurable operating system for your business—track anything:
            <span className="inline-flex w-[13ch] align-baseline ml-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: prefersReduced ? 0 : 0.25 }}
                  className="text-zinc-900 italic font-medium"
                >
                  {currentWord}
                </motion.span>
              </AnimatePresence>
            </span>
            .
          </p>
        </div>

        {/* toggle chips removed per feedback */}

        {/* (Buttons removed per feedback; primary CTA in navbar and CTA section) */}

        {/* draggable workflow cards */}
        <div className="mt-12">
          <div className="text-sm text-zinc-600 mb-3 flex items-center justify-center gap-2">
            <Workflow className="h-4 w-4" />
            <span>Play with a workflow. Drag to reorder.</span>
          </div>
          {mounted && (
          <Reorder.Group
            as="ul"
            axis="x"
            values={stages}
            onReorder={onReorder}
            className="flex items-stretch justify-center gap-3 md:gap-4"
            role="list"
            aria-label="Workflow stages"
          >
            {stages.map((stage, idx) => {
                const seed = charSum(stage) + setIndex * 17 + idx * 7
                const progress = 10 + (seed % 86)
                const seconds = 10 + (seed % 180)
                const combo = seed % 3
                const IconA = combo === 0 ? QrCode : combo === 1 ? Camera : QrCode
                const IconB = combo === 0 ? Camera : combo === 1 ? Clock : Clock
                return (
                <Reorder.Item
                  layout="position"
                  drag="x"
                  key={stage}
                  value={stage}
                  tabIndex={0}
                  onDragStart={() => setPaused(true)}
                  onDragEnd={() => {
                    setLastDropped(stage)
                    if (resumeTimer.current) window.clearTimeout(resumeTimer.current)
                    resumeTimer.current = window.setTimeout(() => setPaused(false), 4000)
                    window.setTimeout(() => setLastDropped((v) => (v === stage ? null : v)), 350)
                  }}
                  className={`group relative cursor-grab active:cursor-grabbing select-none rounded-md border-2 border-black bg-white h-36 md:h-40 w-40 md:w-56 px-3 py-3 grid grid-rows-[auto,1fr,auto,auto] gap-1 text-sm text-zinc-800 shadow-[0_1px_0_#fff_inset] focus:outline-none focus:ring-2 focus:ring-black transform-gpu ${
                    lastDropped === stage ? "ring-2 ring-sky-300 shadow-[0_0_0_8px_rgba(14,165,233,0.08)]" : ""
                  }`}
                  whileDrag={{ scale: prefersReduced ? 1 : 1.04 }}
                  dragTransition={{ power: 0.25, timeConstant: 120 }}
                  dragElastic={0.28}
                  transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.4 }}
                  aria-roledescription="draggable chip"
                >
                  {/* stage content */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600">Stage</span>
                    <span className="text-[11px] text-zinc-600">#{idx + 1}</span>
                  </div>
                  <div className="grid place-items-center">
                    <span className="text-zinc-900 font-semibold text-base md:text-lg text-center leading-tight">{stage}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span className="inline-flex items-center gap-1 text-[11px]"><IconA className="h-3.5 w-3.5" /> Scan</span>
                    <span className="inline-flex items-center gap-1 text-[11px]"><IconB className="h-3.5 w-3.5" /> Meta</span>
                    <span className="inline-flex items-center gap-1 text-[11px]"><Clock className="h-3 w-3" />{formatSeconds(seconds)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-200/70 overflow-hidden">
                    <div className="h-full rounded-full bg-sky-500/70" style={{ width: `${progress}%` }} />
                  </div>

                  {/* keyboard a11y controls: appear on focus */}
                  <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                    <button
                      type="button"
                      className="rounded-full border border-zinc-200/70 bg-white/80 px-2 py-0.5 text-xs text-zinc-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
                      onClick={() => moveStage(idx, -1)}
                      aria-label={`Move ${stage} left`}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-zinc-200/70 bg-white/80 px-2 py-0.5 text-xs text-zinc-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
                      onClick={() => moveStage(idx, 1)}
                      aria-label={`Move ${stage} right`}
                    >
                      →
                    </button>
                  </div>
                </Reorder.Item>
            )})}
          </Reorder.Group>
          )}
            {/* a11y live region for reorder announcements */}
            <div ref={announceRef} className="sr-only" aria-live="polite" />
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero


