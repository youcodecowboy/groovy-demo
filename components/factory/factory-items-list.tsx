"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StageBadge } from "@/components/ui/stage-badge"
import { ItemTimer } from "./item-timer"
import { StageActionModal } from "./stage-action-modal"
import type { Item, Workflow } from "@/types/schema"
import { Search, Filter, Eye, Play, Package, Clock } from "lucide-react"

interface FactoryItemsListProps {
  items: Item[]
  workflows: Workflow[]
  onItemClick: (itemId: string) => void
  onAdvanceItem: (itemId: string, toStageId: string, completedActions: any[]) => void
}

export function FactoryItemsList({ items, workflows, onItemClick, onAdvanceItem }: FactoryItemsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [workflowFilter, setWorkflowFilter] = useState<string>("all")
  const [actionModalItem, setActionModalItem] = useState<Item | null>(null)

  // Only show active items on factory floor
  const activeItems = items.filter((item) => item.status === "active")

  // Get unique brands from active items
  const brands = Array.from(new Set(activeItems.map((item) => item.metadata?.brand).filter(Boolean))) as string[]

  const filteredItems = activeItems.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.style?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBrand = brandFilter === "all" || item.metadata?.brand === brandFilter
    const matchesWorkflow = workflowFilter === "all" || item.workflowId === workflowFilter

    return matchesSearch && matchesBrand && matchesWorkflow
  })

  const getWorkflowName = (workflowId: string) => {
    return workflows.find((w) => w.id === workflowId)?.name || "Unknown Workflow"
  }

  const getCurrentStage = (item: Item) => {
    const workflow = workflows.find((w) => w.id === item.workflowId)
    if (!workflow) return null
    return workflow.stages.find((s) => s.id === item.currentStageId)
  }

  const getWorkflowForItem = (item: Item) => {
    return workflows.find((w) => w.id === item.workflowId)
  }

  const handleAdvanceClick = (item: Item) => {
    const workflow = getWorkflowForItem(item)
    if (!workflow) return

    const currentStage = workflow.stages.find((s) => s.id === item.currentStageId)
    const nextStages = currentStage
      ? workflow.stages.filter((s) => currentStage.allowedNextStageIds.includes(s.id))
      : []

    if (nextStages.length > 0) {
      setActionModalItem(item)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Active Production Items</h1>
        <p className="text-gray-600">Items currently in production stages</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by SKU, ID, brand, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select value={brandFilter} onValueChange={setBrandFilter}>
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
              <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
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

      {/* Items List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Active Items ({filteredItems.length} of {activeItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No active items found</p>
                <p className="text-sm">
                  Try adjusting your search or filters, or check if items need to be activated from the admin dashboard
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const currentStage = getCurrentStage(item)

                return (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => onItemClick(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {item.sku}
                            </div>
                            <div className="text-sm text-gray-600">{item.id}</div>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <Clock className="w-3 h-3" />
                            Active
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>Stage:</span>
                            {currentStage ? (
                              <StageBadge stage={currentStage} className="text-xs" />
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                No Stage
                              </Badge>
                            )}
                          </div>
                          <div>Workflow: {getWorkflowName(item.workflowId)}</div>
                          {item.metadata?.brand && <div>Brand: {item.metadata.brand}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <ItemTimer item={item} stage={currentStage} />
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              onItemClick(item.id)
                            }}
                            size="sm"
                            variant="outline"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdvanceClick(item)
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Advance
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
