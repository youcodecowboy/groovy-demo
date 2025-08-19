"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, ArrowRight, Workflow, QrCode, Camera, Clock } from "lucide-react"

// Content constants
const CONTENT = {
  headline: "AI-powered workflows. Built in minutes.",
  subhead: "Your factory agent, Disco, designs your digital floor app in real-time. Drag blocks to mirror your actual process. Change nothing about how you manufacture.",
  supporting: "One scan = total visibility. One workflow = fewer errors. 5-minute setup to digitize your operations, friction-free.",
  ctaText: "Start Building",
  workflowBlocks: ["Sewing", "Washing", "QC", "Shipping"],
  discoMessage: "Disco is optimizing this workflow in real time…"
}

// Workflow Block Component (matching hero style)
function WorkflowBlock({ id, children, isInTrack = false }: { id: string; children: React.ReactNode; isInTrack?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Generate random metrics for demo (like hero cards)
  const seed = id.charCodeAt(0) + id.length
  const progress = 10 + (seed % 86)
  const seconds = 10 + (seed % 180)
  const combo = seed % 3
  const IconA = combo === 0 ? QrCode : combo === 1 ? Camera : QrCode
  const IconB = combo === 0 ? Camera : combo === 1 ? Clock : Clock

  function formatSeconds(total: number): string {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  if (isInTrack) {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group relative cursor-grab active:cursor-grabbing select-none rounded-md border-2 border-black bg-white h-32 w-40 px-3 py-3 grid grid-rows-[auto,1fr,auto,auto] gap-1 text-sm text-zinc-800 shadow-[0_1px_0_#fff_inset] focus:outline-none focus:ring-2 focus:ring-black transform-gpu"
        whileDrag={{ scale: 1.04 }}
        dragTransition={{ power: 0.25, timeConstant: 120 }}
        dragElastic={0.28}
        transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.4 }}
      >
        {/* stage content */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-600">Stage</span>
          <span className="text-[11px] text-zinc-600">#{id.length}</span>
        </div>
        <div className="grid place-items-center">
          <span className="text-zinc-900 font-semibold text-base text-center leading-tight">{children}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-600">
          <span className="inline-flex items-center gap-1 text-[11px]"><IconA className="h-3.5 w-3.5" /> Scan</span>
          <span className="inline-flex items-center gap-1 text-[11px]"><IconB className="h-3.5 w-3.5" /> Meta</span>
          <span className="inline-flex items-center gap-1 text-[11px]"><Clock className="h-3 w-3" />{formatSeconds(seconds)}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-200/70 overflow-hidden">
          <div className="h-full rounded-full bg-sky-500/70" style={{ width: `${progress}%` }} />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative cursor-grab active:cursor-grabbing select-none rounded-md border-2 border-black bg-white h-32 w-40 px-3 py-3 grid grid-rows-[auto,1fr,auto,auto] gap-1 text-sm text-zinc-800 shadow-[0_1px_0_#fff_inset] focus:outline-none focus:ring-2 focus:ring-black transform-gpu"
      whileDrag={{ scale: 1.04 }}
      dragTransition={{ power: 0.25, timeConstant: 120 }}
      dragElastic={0.28}
      transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.4 }}
    >
      {/* stage content */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-600">Stage</span>
        <span className="text-[11px] text-zinc-600">#{id.length}</span>
      </div>
      <div className="grid place-items-center">
        <span className="text-zinc-900 font-semibold text-base text-center leading-tight">{children}</span>
      </div>
      <div className="flex items-center justify-between text-zinc-600">
        <span className="inline-flex items-center gap-1 text-[11px]"><IconA className="h-3.5 w-3.5" /> Scan</span>
        <span className="inline-flex items-center gap-1 text-[11px]"><IconB className="h-3.5 w-3.5" /> Meta</span>
        <span className="inline-flex items-center gap-1 text-[11px]"><Clock className="h-3 w-3" />{formatSeconds(seconds)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-200/70 overflow-hidden">
        <div className="h-full rounded-full bg-sky-500/70" style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  )
}

// Disco AI Badge Component
function DiscoBadge({ efficiency, errors }: { efficiency: number; errors: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium shadow-lg"
    >
      <Bot className="h-4 w-4" />
      <span>+{efficiency}% efficiency</span>
      <span>•</span>
      <span>–{errors}% errors</span>
    </motion.div>
  )
}

// Mock Device Component
function MockDevice({ workflowStages }: { workflowStages: string[] }) {
  return (
    <div className="relative">
      {/* Phone Mockup */}
      <div className="relative mx-auto w-64 h-96 bg-white rounded-3xl border-8 border-gray-200 shadow-xl overflow-hidden">
        {/* Screen Content */}
        <div className="h-full bg-zinc-50 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-zinc-900">Floor App</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xs font-medium text-purple-600">QC</span>
            </div>
          </div>

          {/* Workflow Stages */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-700 mb-3">Current Workflow</h3>
            {workflowStages.length > 0 ? (
              <div className="space-y-2">
                {workflowStages.map((stage, index) => (
                  <motion.div
                    key={stage}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white border border-zinc-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-sky-600">{index + 1}</span>
                    </div>
                    <span className="text-sm text-zinc-700">{stage}</span>
                    {index === workflowStages.length - 1 && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Workflow className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">Drag blocks to build workflow</p>
              </div>
            )}
          </div>

          {/* Disco Status */}
          {workflowStages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 border border-purple-200">
                <Bot className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-purple-700">{CONTENT.discoMessage}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export function FactoryDigitizationSection() {
  const [workflowTrack, setWorkflowTrack] = useState<string[]>([])
  const [showDiscoBadge, setShowDiscoBadge] = useState(false)

  // Calculate mock metrics based on workflow
  const calculateMetrics = () => {
    const baseEfficiency = 12
    const baseErrors = 8
    const efficiencyBonus = workflowTrack.length * 2
    const errorReduction = workflowTrack.length * 1.5
    
    return {
      efficiency: baseEfficiency + efficiencyBonus,
      errors: Math.max(0, baseErrors - errorReduction)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const blockId = active.id as string
      
      // Add to workflow track if not already there
      if (!workflowTrack.includes(blockId)) {
        const newTrack = [...workflowTrack, blockId]
        setWorkflowTrack(newTrack)
        
        // Show Disco badge after first block is added
        if (newTrack.length === 1) {
          setShowDiscoBadge(true)
        }
      }
    }
  }

  const metrics = calculateMetrics()

  return (
    <section className="relative overflow-hidden">
      {/* Grid Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-zinc-900 leading-tight">
              {CONTENT.headline}
            </h2>
            
            <p className="text-lg text-zinc-600 leading-relaxed">
              {CONTENT.subhead}
            </p>
            
            <p className="text-base text-zinc-500 leading-relaxed">
              {CONTENT.supporting}
            </p>
            
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-medium">
              {CONTENT.ctaText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          {/* Right Column - Interactive Builder */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            
            {/* Workflow Builder Panel */}
            <Card className="border-2 border-black bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Workflow Builder</h3>
                  <p className="text-sm text-zinc-600">Drag blocks to build your workflow</p>
                  
                  {/* Available Blocks */}
                  <div className="flex flex-wrap gap-3">
                    {CONTENT.workflowBlocks.map((block) => (
                      <WorkflowBlock key={block} id={block}>
                        {block}
                      </WorkflowBlock>
                    ))}
                  </div>
                </div>

                {/* Workflow Track */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Your Workflow</h3>
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="flex flex-row items-center gap-3 border-2 border-dashed border-zinc-300 rounded-lg p-4 min-h-32 bg-zinc-50">
                      <SortableContext items={workflowTrack} strategy={horizontalListSortingStrategy}>
                        {workflowTrack.map((block) => (
                          <WorkflowBlock key={block} id={block} isInTrack={true}>
                            {block}
                          </WorkflowBlock>
                        ))}
                      </SortableContext>
                      
                      {workflowTrack.length === 0 && (
                        <p className="text-zinc-400 text-sm">Drag blocks here to build your workflow</p>
                      )}
                    </div>
                  </DndContext>
                </div>

                {/* Disco Badge */}
                <AnimatePresence>
                  {showDiscoBadge && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex justify-center"
                    >
                      <DiscoBadge efficiency={metrics.efficiency} errors={metrics.errors} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Mock Device Preview */}
            <Card className="border-2 border-black bg-white">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Live Preview</h3>
                  <p className="text-sm text-zinc-600">Your floor app updates in real-time</p>
                  
                  <MockDevice workflowStages={workflowTrack} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FactoryDigitizationSection
