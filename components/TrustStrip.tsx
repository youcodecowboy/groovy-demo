"use client"

import { motion } from "framer-motion"

export function TrustStrip() {
  return (
    <section className="relative container mx-auto px-4 py-14" aria-label="Operating partners and advisors">
      <div className="text-center text-sm text-zinc-600 mb-4">Operating partners & advisors</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
            className="relative h-10 rounded-md border-2 border-black bg-white overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 1px)", backgroundSize: '12px 12px' }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default TrustStrip


