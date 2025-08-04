"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StageBadge } from "@/components/ui/stage-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { ItemTimer } from "./item-timer"
import { StageActionModal } from "./stage-action-modal"
import type { Item, Workflow } from "@/types/schema"
import { AlertTriangle, Package, CheckCircle, Clock, Filter, Eye, Play, TrendingUp } from "lucide-react"

interface FactoryDashboardProps {
  items: Item[]
  workflows: Workflow[]
  onItemClick: (itemId: string) => void
  onAdvanceItem: (itemId: string, toStageId: string, completedActions: any[]) => void
}

export function FactoryDashboard({ items, workflows, onItemClick, onAdvanceItem }: FactoryDashboardProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all")
  const [actionModalItem, setActionModalItem] = useState<Item | null>(null)

  // Only show active items on factory floor
  const activeItems = items.filter((item) => item.status === "active")

  // Get unique brands from active items
  const brands = Array.from(new Set(activeItems.map((item) => item.metadata?.brand).filter(Boolean))) as string[]

  // Filter items based on selected filters
  const filteredItems = activeItems.filter((item) => {
    const matchesBrand = selectedBrand === "all" || item.metadata?.brand === selectedBrand
    const matchesWorkflow = selectedWorkflow === "all" || item.workflowId === selectedWorkflow
    return matchesBrand && matchesWorkflow
  })

  // Calculate metrics for active items only
  const completedItems = items.filter((item) => item.status === "completed")

  // Items requiring attention (active items that haven't moved in a while)
  const itemsRequiringAttention = filteredItems.filter((item) => {
    const lastActivity = item.history[item.history.length - 1]
    if (!lastActivity) return true
    const hoursSinceLastActivity = (Date.now() - new Date(lastActivity.at).getTime()) / (1000 * 60 * 60)
    return hoursSinceLastActivity > 4 // Items stuck for more than 4 hours
  })

  // Items by stage
  const itemsByStage = filteredItems.reduce(
    (acc, item) => {
      acc[item.currentStageId] = (acc[item.currentStageId] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Get workflow for an item
  const getWorkflowForItem = (item: Item) => {
    return workflows.find((w) => w.id === item.workflowId)
  }

  // Get current stage for an item
  const getCurrentStage = (item: Item) => {
    const workflow = getWorkflowForItem(item)
    if (!workflow) return null
    return workflow.stages.find((s) => s.id === item.currentStageId)
  }

  // Get recent completed items (last 24 hours)
  const recentCompletedItems = completedItems
    .filter((item) => {
      if (!item.completedAt) return false
      const hoursAgo = (Date.now() - new Date(item.completedAt).getTime()) / (1000 * 60 * 60)
      return hoursAgo <= 24
    })
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 10)

  const handleAdvanceClick = (item: Item) => {
    const workflow = getWorkflowForItem(item)
    if (!workflow) return

    const currentStage = workflow.stages.find((s) => s.id === item.currentStageId)
    if (!currentStage) return

    // Check if this is the final stage (no next stages allowed)
    const isFinalStage = currentStage.allowedNextStageIds.length === 0

    if (isFinalStage) {
      // Complete the item
      onAdvanceItem(item.id, "completed", [])
    } else {
      // Advance to next stage
      const nextStages = workflow.stages.filter((s) => currentStage.allowedNextStageIds.includes(s.id))
      if (nextStages.length > 0) {
        setActionModalItem(item)
      }
    }
  }

  const handleActionModalComplete = async (completedActions: any[]) => {
    if (!actionModalItem) return

    const workflow = getWorkflowForItem(actionModalItem)
    if (!workflow) return

    const currentStage = workflow.stages.find((s) => s.id === actionModalItem.currentStageId)
    const nextStages = currentStage
      ? workflow.stages.filter((s) => currentStage.allowedNextStageIds.includes(s.id))
      : []

    if (nextStages.length > 0) {
      await onAdvanceItem(actionModalItem.id, nextStages[0].id, completedActions)
      setActionModalItem(null)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Production Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Filter by brand" />
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
            <div className="flex-1">
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Filter by workflow" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Need Attention"
          value={itemsRequiringAttention.length}
          subtitle="Items stuck in stages"
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <MetricCard
          title="In Production"
          value={filteredItems.length}
          subtitle="Active items"
          icon={Package}
          color="#3b82f6"
        />
        <MetricCard
          title="Completed Today"
          value={recentCompletedItems.length}
          subtitle="Last 24 hours"
          icon={CheckCircle}
          color="#10b981"
        />
        <MetricCard
          title="Total Active"
          value={activeItems.length}
          subtitle="All workflows"
          icon={Clock}
          color="#8b5cf6"
        />
      </div>

      {/* Stage Distribution */}
      {filteredItems.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Production Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {workflows.map((workflow) =>
                workflow.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => {
                    const count = itemsByStage[stage.id] || 0
                    if (count === 0) return null

                    return (
                      <Card key={stage.id} className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                          <div className="mb-2">
                            <StageBadge stage={stage} className="text-xs" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{count}</div>
                          <div className="text-xs text-gray-600">items</div>
                        </CardContent>
                      </Card>
                    )
                  }),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Requiring Attention */}
      {itemsRequiringAttention.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Items Requiring Attention ({itemsRequiringAttention.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itemsRequiringAttention.slice(0, 8).map((item) => {
                const workflow = getWorkflowForItem(item)
                const currentStage = getCurrentStage(item) || null
                const isFinalStage = currentStage ? currentStage.allowedNextStageIds.length === 0 : false

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                    onClick={() => onItemClick(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="font-semibold text-gray-900">{item.sku}</div>
                        <div className="text-sm text-gray-600">
                          {item.metadata?.brand} • {item.metadata?.style}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ItemTimer item={item} stage={currentStage} />
                      {currentStage && <StageBadge stage={currentStage} className="text-xs" />}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onItemClick(item.id)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className={isFinalStage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAdvanceClick(item)
                          }}
                        >
                          {isFinalStage ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Advance
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Completed Items */}
      {recentCompletedItems.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recently Completed ({recentCompletedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCompletedItems.map((item) => {
                const workflow = getWorkflowForItem(item)
                const completedHours = item.completedAt
                  ? Math.floor((Date.now() - new Date(item.completedAt).getTime()) / (1000 * 60 * 60))
                  : 0

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                    onClick={() => onItemClick(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-semibold text-gray-900">{item.sku}</div>
                        <div className="text-sm text-gray-600">
                          {item.metadata?.brand} • {item.metadata?.style}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Completed {completedHours}h ago
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onItemClick(item.id)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage Action Modal */}
      {actionModalItem && (
        <StageActionModal
          item={actionModalItem}
          workflow={getWorkflowForItem(actionModalItem)!}
          isOpen={!!actionModalItem}
          onClose={() => setActionModalItem(null)}
          onComplete={handleActionModalComplete}
        />
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Items</h3>
            <p className="text-gray-600">
              No active items match your current filters or there are no items in production.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
