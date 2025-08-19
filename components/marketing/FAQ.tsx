"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: "process",
    question: "Do we change our process?",
    answer: "No. Groovy models your current workflow. We adapt to your existing processes rather than forcing you to change how you work."
  },
  {
    id: "value",
    question: "How fast to value?",
    answer: "Pilots in weeks, not quarters. Our modular approach means you can start with a single workflow and expand as you see results."
  },
  {
    id: "security",
    question: "Security?",
    answer: "Single-tenant DB by default; audit logging on every event. Enterprise-grade security with full compliance and data sovereignty controls."
  },
  {
    id: "integrations",
    question: "Integrations?",
    answer: "ERPs, WMS, PLM via API/webhooks. We integrate with your existing systems rather than replacing them."
  }
]

export function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqItems.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
        >
          <Card 
            className={`border-2 border-black cursor-pointer transition-all ${
              expandedId === item.id ? 'ring-2 ring-sky-300 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => toggleExpanded(item.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 pr-4">
                  {item.question}
                </h3>
                <AnimatePresence mode="wait">
                  {expandedId === item.id ? (
                    <motion.div
                      key="up"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 180 }}
                      exit={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronUp className="h-5 w-5 text-zinc-500 flex-shrink-0" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="down"
                      initial={{ rotate: 180 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-zinc-500 flex-shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>
            
            <AnimatePresence>
              {expandedId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 pb-6">
                    <p className="text-zinc-700 leading-relaxed">{item.answer}</p>
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

export default FAQ
