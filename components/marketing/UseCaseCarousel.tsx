"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Shirt, Package, Footprints, Watch } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UseCase {
  id: string
  title: string
  icon: any
  description: string
  bullets: string[]
}

const useCases: UseCase[] = [
  {
    id: "textiles",
    title: "Textiles & Apparel",
    icon: Shirt,
    description: "Sampling, size/color variants, washing/QC gates.",
    bullets: [
      "Digital sampling workflows with instant feedback",
      "Size and color variant tracking across production",
      "Washing and QC gate controls with automated alerts",
      "End-to-end traceability from yarn to finished garment"
    ]
  },
  {
    id: "consumer",
    title: "Consumer Goods",
    icon: Package,
    description: "Batch IDs, lot traceability, packing & ASN events.",
    bullets: [
      "Batch and lot-level traceability systems",
      "Automated packing and ASN (Advanced Shipping Notice) events",
      "Real-time inventory visibility across warehouses",
      "Quality control integration with ERP systems"
    ]
  },
  {
    id: "footwear",
    title: "Footwear",
    icon: Footprints,
    description: "Component linking, pair matching, box-level labels.",
    bullets: [
      "Component linking for complex assembly processes",
      "Pair matching and quality assurance workflows",
      "Box-level labeling with automated sorting",
      "Multi-stage production tracking with defect prevention"
    ]
  },
  {
    id: "accessories",
    title: "Accessories",
    icon: Watch,
    description: "Small parts, high mix/low volume, quick changeovers.",
    bullets: [
      "Small parts inventory and assembly tracking",
      "High mix/low volume production optimization",
      "Quick changeover procedures with minimal downtime",
      "Flexible workflow configuration for diverse product lines"
    ]
  }
]

export function UseCaseCarousel() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {useCases.map((useCase, idx) => (
        <motion.div
          key={useCase.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
        >
          <Card 
            className={`border-2 border-black cursor-pointer transition-all ${
              expandedId === useCase.id ? 'ring-2 ring-sky-300 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => toggleExpanded(useCase.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-zinc-100">
                    <useCase.icon className="h-5 w-5 text-zinc-600" />
                  </div>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </div>
                <AnimatePresence mode="wait">
                  {expandedId === useCase.id ? (
                    <motion.div
                      key="up"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 180 }}
                      exit={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="down"
                      initial={{ rotate: 180 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm text-zinc-600 mt-2">{useCase.description}</p>
            </CardHeader>
            
            <AnimatePresence>
              {expandedId === useCase.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {useCase.bullets.map((bullet, bulletIdx) => (
                        <motion.div
                          key={bulletIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: bulletIdx * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 flex-shrink-0" />
                          <span className="text-sm text-zinc-700 leading-relaxed">{bullet}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default UseCaseCarousel
