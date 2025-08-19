"use client"

import { motion } from "framer-motion"
import { Zap, Search, Settings, Clock } from "lucide-react"

const pillars = [
  {
    icon: Zap,
    title: "Frictionless",
    description: "Agnostic hardware, offline-friendly, multi-language.",
  },
  {
    icon: Search,
    title: "Traceable",
    description: "Item-level provenance, end-to-end timestamps.",
  },
  {
    icon: Settings,
    title: "Configurable",
    description: "Rules, labels, and dashboards fit your process—not the other way around.",
  },
  {
    icon: Clock,
    title: "Fast",
    description: "Shorter lead times, fewer surprises, higher sell-through.",
  },
]

export function Pillars() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {pillars.map((pillar, idx) => (
        <motion.div
          key={pillar.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          whileHover={{ y: -4 }}
          className="group relative rounded-lg border-2 border-black bg-white p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md bg-zinc-100 group-hover:bg-sky-50 transition-colors">
              <pillar.icon className="h-5 w-5 text-zinc-600 group-hover:text-sky-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-900">{pillar.title}</h3>
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed">{pillar.description}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default Pillars
