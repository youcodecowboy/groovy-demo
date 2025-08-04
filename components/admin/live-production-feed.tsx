"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Item, Workflow, Stage } from "@/types/schema"
import { Activity, Clock, Users } from "lucide-react"

interface LiveProductionFeedProps {
  items: Item[]
  workflows: Workflow[]
  onItemClick?: (itemId: string) => void
}

interface StageMetrics {
  stage: Stage
  currentCount: number
  capacity: number
  avgTime: string
  operators: number
  efficiency: number
}

export function LiveProductionFeed({ items, workflows, onItemClick }: LiveProductionFeedProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")

  // Get unique brands from items
  const brands = Array.from(new Set(items.map((item) => item.metadata?.brand).filter(Boolean))) as string[]

  // Filter items based on selected filters
  const filteredItems = items.filter((item) => {
    const matchesWorkflow = selectedWorkflow === "all" || item.workflowId === selectedWorkflow
    const matchesBrand = selectedBrand === "all" || item.metadata?.brand === selectedBrand
    const isActive = item.status === "active"
    return matchesWorkflow && matchesBrand && isActive
  })

  // Calculate stage metrics
  const getStageMetrics = (): StageMetrics[] => {
    const stageMetrics: StageMetrics[] = []

    workflows.forEach((workflow) => {
      if (selectedWorkflow !== "all" && workflow.id !== selectedWorkflow) return

      workflow.stages.forEach((stage) => {
        const stageItems = filteredItems.filter((item) => item.currentStageId === stage.id)

        if (stageItems.length > 0) {
          stageMetrics.push({
            stage,
            currentCount: stageItems.length,
            capacity: Math.max(50, stageItems.length + Math.floor(Math.random() * 30)),
            avgTime: `${Math.floor(Math.random() * 120) + 30}m`,
            operators: Math.floor(Math.random() * 12) + 4,
            efficiency: Math.floor(Math.random() * 25) + 75,
          })
        }
      })
    })

    return stageMetrics.sort((a, b) => a.stage.order - b.stage.order)
  }

  const stageMetrics = getStageMetrics()

  const getStageIcon = (stageName: string) => {
    const name = stageName.toLowerCase()
    if (name.includes("cut")) return "✂️"
    if (name.includes("sew")) return "🧵"
    if (name.includes("wash")) return "🌊"
    if (name.includes("qc") || name.includes("quality")) return "✅"
    if (name.includes("pack")) return "📦"
    if (name.includes("dry")) return "🌡️"
    if (name.includes("press")) return "👔"
    if (name.includes("ship")) return "🚚"
    return "⚙️"
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="All Workflows" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workflows</SelectItem>
            {workflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {stageMetrics.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600">No active production data available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stageMetrics.map((metrics, index) => (
            <Card
              key={`${metrics.stage.id}-${index}`}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onItemClick?.(metrics.stage.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">{getStageIcon(metrics.stage.name)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{metrics.stage.name}</h3>
                    <p className="text-sm text-gray-600">{metrics.currentCount} items</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-medium">{Math.round((metrics.currentCount / metrics.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (metrics.currentCount / metrics.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Avg Time</span>
                      </div>
                      <p className="font-medium text-gray-900">{metrics.avgTime}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                        <Users className="w-3 h-3" />
                        <span>Operators</span>
                      </div>
                      <p className="font-medium text-gray-900">{metrics.operators}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
