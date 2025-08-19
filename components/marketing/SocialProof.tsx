"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

const partners = [
  { name: "Advisor 1", role: "Former VP Manufacturing", company: "Fortune 500" },
  { name: "Advisor 2", role: "Supply Chain Expert", company: "Global Retail" },
  { name: "Advisor 3", role: "Technology Leader", company: "Enterprise SaaS" },
  { name: "Advisor 4", role: "Operations Specialist", company: "Manufacturing" },
]

const logos = [
  { name: "Partner 1", type: "Manufacturing" },
  { name: "Partner 2", type: "Technology" },
  { name: "Partner 3", type: "Logistics" },
  { name: "Partner 4", type: "Retail" },
  { name: "Partner 5", type: "Consulting" },
  { name: "Partner 6", type: "Enterprise" },
]

export function SocialProof() {
  return (
    <div className="space-y-12">
      {/* Advisors */}
      <div className="text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-zinc-900 mb-8"
        >
          Trusted by Industry Leaders
        </motion.h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, idx) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-zinc-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-zinc-600 font-semibold text-lg">
                  {partner.name.split(' ')[1][0]}
                </span>
              </div>
              <h4 className="font-medium text-zinc-900 mb-1">{partner.name}</h4>
              <p className="text-sm text-zinc-600 mb-2">{partner.role}</p>
              <Badge variant="outline" className="text-xs">{partner.company}</Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Partner Logos */}
      <div className="text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-zinc-900 mb-8"
        >
          Strategic Partners
        </motion.h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {logos.map((logo, idx) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-12 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center mb-2">
                <span className="text-zinc-500 text-xs font-medium">{logo.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">{logo.type}</Badge>
            </motion.div>
          ))}
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-zinc-500 mt-8"
        >
          * Confidential partnerships not shown
        </motion.p>
      </div>
    </div>
  )
}

export default SocialProof
