"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, DollarSign, Package, Clock } from "lucide-react"

const pricingFeatures = [
  {
    icon: Zap,
    title: "Usage-based",
    description: "Pay for what you use, scale as you grow"
  },
  {
    icon: Package,
    title: "Hardware included",
    description: "No capital expenditure required"
  },
  {
    icon: DollarSign,
    title: "Zero cap-ex",
    description: "Operational expense model only"
  },
  {
    icon: Clock,
    title: "Pilot in weeks",
    description: "Not quarters - rapid deployment"
  }
]

export function PricingStrip() {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-semibold text-zinc-900"
        >
          Usage-based. Hardware included. Zero cap-ex.
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-zinc-600 max-w-2xl mx-auto"
        >
          Start with pilots. Scale to networks. Pay for what you use.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {pricingFeatures.map((feature, idx) => (
          <Card key={feature.title} className="border-2 border-black bg-white">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-sky-50">
                  <feature.icon className="h-6 w-6 text-sky-600" />
                </div>
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3"
      >
        <Badge variant="outline" className="px-4 py-2 text-sm">
          No setup fees
        </Badge>
        <Badge variant="outline" className="px-4 py-2 text-sm">
          Month-to-month
        </Badge>
        <Badge variant="outline" className="px-4 py-2 text-sm">
          Cancel anytime
        </Badge>
        <Badge variant="outline" className="px-4 py-2 text-sm">
          Enterprise security
        </Badge>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-sm text-zinc-500 italic"
      >
        We're stealth-ish. Book a demo for details.
      </motion.p>
    </div>
  )
}

export default PricingStrip
