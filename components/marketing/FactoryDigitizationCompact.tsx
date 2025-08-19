"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Settings2, QrCode, Sparkles, Timer, Bot, ArrowRight, Workflow, Timer as TimerIcon, Infinity } from "lucide-react"

// Content constants
const CONTENT = {
  title: "AI-powered workflows. Built in minutes.",
  bullets: [
    { icon: Settings2, text: "No rip-and-replace — Digitize the workflow you already run." },
    { icon: QrCode, text: "Every item gets a code — One scan = total visibility." },
    { icon: Sparkles, text: "Disco, your factory agent — predicts bottlenecks & enforces rules." },
    { icon: Timer, text: "5-minute setup — Change nothing about how you manufacture." }
  ],
  ctaText: "Start Building",
  stages: ["Sewing", "Washing", "QC", "Shipping"]
}

// Stage Card Component (matching hero style exactly)
function StageCard({ stage, isActive = false }: { stage: string; isActive?: boolean }) {
  // Generate random metrics for demo (like hero cards)
  const seed = stage.charCodeAt(0) + stage.length
  const progress = 10 + (seed % 86)
  const seconds = 10 + (seed % 180)
  const combo = seed % 3
  const IconA = combo === 0 ? QrCode : combo === 1 ? Workflow : QrCode
  const IconB = combo === 0 ? Workflow : combo === 1 ? TimerIcon : TimerIcon

  function formatSeconds(total: number): string {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isActive ? 1 : 0.4,
        scale: isActive ? 1 : 0.95
      }}
      transition={{ duration: 0.3 }}
      className={`
        group relative select-none rounded-md border-2 bg-white h-28 w-36 px-3 py-2 grid grid-rows-[auto,1fr,auto,auto] gap-1 text-xs text-zinc-800 shadow-[0_1px_0_#fff_inset] transform-gpu
        ${isActive ? 'border-purple-500 shadow-lg' : 'border-gray-200'}
      `}
    >
      {/* stage content */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">Stage</span>
        <span className="text-[10px] text-zinc-600">#{stage.length}</span>
      </div>
      <div className="grid place-items-center">
        <span className="text-zinc-900 font-semibold text-sm text-center leading-tight">{stage}</span>
      </div>
      <div className="flex items-center justify-between text-zinc-600">
        <span className="inline-flex items-center gap-1 text-[10px]"><IconA className="h-3 w-3" /> Scan</span>
        <span className="inline-flex items-center gap-1 text-[10px]"><IconB className="h-3 w-3" /> Meta</span>
        <span className="inline-flex items-center gap-1 text-[10px]"><TimerIcon className="h-2.5 w-2.5" />{formatSeconds(seconds)}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-zinc-200/70 overflow-hidden">
        <div 
          className={`h-full rounded-full ${isActive ? 'bg-purple-500' : 'bg-sky-500/70'}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </motion.div>
  )
}

// Mobile Device Mockup Component
function MobileDevice({ activeStages, efficiency, errors }: { 
  activeStages: string[]; 
  efficiency: number; 
  errors: number; 
}) {
  const [pulseIndex, setPulseIndex] = useState(-1)

  useEffect(() => {
    if (activeStages.length > 0) {
      const interval = setInterval(() => {
        setPulseIndex(activeStages.length - 1)
        setTimeout(() => setPulseIndex(-1), 500)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [activeStages.length])

  return (
    <div className="relative flex justify-center">
      {/* Mobile Device Mockup */}
      <div className="w-48 h-96 bg-gray-800 rounded-3xl border-4 border-gray-700 shadow-xl overflow-hidden">
        {/* Screen */}
        <div className="h-full bg-zinc-50 p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <Bot className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-zinc-900">Floor App</span>
          </div>

          {/* Workflow Stages - Scrollable */}
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-medium text-zinc-700 mb-3 flex-shrink-0">Current Workflow</h4>
            <div className="h-full overflow-y-auto">
              {activeStages.length > 0 ? (
                <div className="space-y-2">
                  {activeStages.map((stage, index) => (
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-2 p-2 rounded-lg bg-white border border-zinc-200 flex-shrink-0 ${
                        pulseIndex === index ? 'ring-1 ring-green-400' : ''
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-purple-600">{index + 1}</span>
                      </div>
                      <span className="text-xs text-zinc-700 font-medium flex-1">{stage}</span>
                      {pulseIndex === index && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Workflow className="h-6 w-6 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">No workflow active</p>
                </div>
              )}
            </div>
          </div>

          {/* Disco Metrics (only show when active) */}
          {activeStages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex-shrink-0"
            >
              <div className="flex items-center gap-1 mb-1">
                <Bot className="h-3 w-3" />
                <span className="text-[10px] font-medium">Disco estimates:</span>
              </div>
              <div className="text-[10px] space-y-0.5">
                <div>+{efficiency}% efficiency</div>
                <div>-{errors}% errors</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export function FactoryDigitizationCompact() {
  const [activeStages, setActiveStages] = useState<string[]>([])
  const [efficiency, setEfficiency] = useState(5)
  const [errors, setErrors] = useState(15)

  useEffect(() => {
    const runDemo = () => {
      setActiveStages([])
      setEfficiency(5)
      setErrors(15)

      // Add stages one by one
      setTimeout(() => {
        setActiveStages(["Sewing"])
        setEfficiency(7)
        setErrors(13)
      }, 1000)

      setTimeout(() => {
        setActiveStages(["Sewing", "Washing"])
        setEfficiency(9)
        setErrors(11)
      }, 3000)

      setTimeout(() => {
        setActiveStages(["Sewing", "Washing", "QC"])
        setEfficiency(12)
        setErrors(8)
      }, 5000)

      setTimeout(() => {
        setActiveStages(["Sewing", "Washing", "QC", "Shipping"])
        setEfficiency(15)
        setErrors(5)
      }, 7000)

      // Reset and loop
      setTimeout(() => {
        runDemo()
      }, 10000)
    }

    // Start the demo loop
    runDemo()
  }, [])

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-lg text-zinc-600 font-medium italic"
              >
                Digitize your physical workflow
              </motion.p>
              <h2 className="text-4xl font-bold text-zinc-900 leading-tight">
                {CONTENT.title}
              </h2>
            </div>

            <div className="space-y-4">
              {CONTENT.bullets.map((bullet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-zinc-100">
                    <bullet.icon className="h-5 w-5 text-zinc-600" />
                  </div>
                  <p className="text-lg text-zinc-600 leading-relaxed">
                    {bullet.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-medium">
              {CONTENT.ctaText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          {/* Right Column - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-2xl">
              {/* Main Demo Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                
                {/* Header - Left Aligned */}
                <div className="text-left mb-8">
                  <h3 className="text-lg font-semibold text-zinc-900">Workflow Builder</h3>
                  <p className="text-sm text-zinc-600 mt-1">Watch stages activate automatically</p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Side - Workflow Cards */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-zinc-700">Available Stages</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {CONTENT.stages.map((stage) => (
                        <StageCard 
                          key={stage} 
                          stage={stage} 
                          isActive={activeStages.includes(stage)} 
                        />
                      ))}
                    </div>
                    
                    {/* Callout about infinite stages and rules */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-purple-100">
                          <Infinity className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-purple-900">
                            Infinite flexibility
                          </p>
                          <p className="text-xs text-purple-700 leading-relaxed">
                            Generate unlimited stages with unlimited rules to match any workflow. Track and trace anything.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Side - Mobile Device */}
                  <div className="flex justify-center items-start">
                    <MobileDevice 
                      activeStages={activeStages}
                      efficiency={efficiency}
                      errors={errors}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FactoryDigitizationCompact
