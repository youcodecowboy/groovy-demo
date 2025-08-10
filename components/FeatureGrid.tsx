"use client"

import { motion } from "framer-motion"
import { Boxes, GitBranch, SmartphoneNfc, Scan } from "lucide-react"

const features = [
  {
    icon: Boxes,
    title: "Workflow Builder",
    blurb: "Drag, drop, and publish stages that mirror how your team actually works.",
  },
  {
    icon: GitBranch,
    title: "Rules & Routing",
    blurb: "Human-readable logic: gates, branches, capacity prefs, and location triggers.",
  },
  {
    icon: SmartphoneNfc,
    title: "Mobile Floor App",
    blurb: "Scan-first guidance so operators always know the next right move.",
  },
  {
    icon: Scan,
    title: "Traceability & DPP",
    blurb: "Evidence at the source; clean milestones for brands and auditors.",
  },
]

export function FeatureGrid() {
  return (
    <section id="product" className="relative container mx-auto px-4 py-16">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-black" aria-hidden />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {features.map((f, idx) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: idx * 0.06 }}
            className="rounded-lg border-2 border-black bg-white p-5 hover:-translate-y-1 transition-transform"
          >
            <f.icon className="h-5 w-5 text-zinc-600" strokeWidth={1.5} />
            <div className="mt-3 font-semibold text-zinc-900">{f.title}</div>
            <p className="mt-2 text-sm text-zinc-700 leading-relaxed">{f.blurb}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default FeatureGrid


