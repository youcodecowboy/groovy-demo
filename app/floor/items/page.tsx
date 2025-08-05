"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useWorkflows, useItems, useItemMutations } from "@/hooks/use-convex"
import { FactoryHeader } from "@/components/factory/factory-header"
import { FactoryFooter } from "@/components/factory/factory-footer"
import { FactoryItemsList } from "@/components/factory/factory-items-list"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, CheckCircle, TrendingUp } from "lucide-react"

export default function FactoryItemsPage() {
  const { workflows, isLoading: workflowsLoading } = useWorkflows()
  const { allItems, isLoading: itemsLoading } = useItems()
  const { advanceToStage, advanceStage } = useItemMutations()
  const { toast } = useToast()
  const router = useRouter()

  const handleScan = async (data: string) => {
    try {
      // Always navigate to item details page when QR is scanned
      router.push(`/floor/items/${data}`)

      toast({
        title: "✅ Item Scanned",
        description: `Opening details for: ${data}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process scan",
        variant: "destructive",
      })
    }
  }

  const handleItemClick = (itemId: string) => {
    router.push(`/floor/items/${itemId}`)
  }

  const handleAdvanceItem = async (itemId: string, toStageId: string, completedActions: any[]) => {
    try {
      // Find the item by its itemId (SKU) to get the Convex document ID
      const convexItem = allItems?.find(item => item.itemId === itemId)
      if (!convexItem) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        })
        return
      }

      if (toStageId === "completed") {
        await advanceStage({
          itemId: convexItem._id,
          userId: "floor@demo",
          notes: completedActions?.map(action => action.label).join(", "),
        })
      } else {
        await advanceToStage({
          itemId: convexItem._id,
          toStageId,
          userId: "floor@demo",
          notes: completedActions?.map(action => action.label).join(", "),
        })
      }
      
      toast({
        title: "Success",
        description: toStageId === "completed" ? "Item completed successfully" : "Item advanced successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to advance item",
        variant: "destructive",
      })
    }
  }

  // Convert Convex data to the format expected by the components
  const convertedWorkflows = workflows?.map(workflow => ({
    id: workflow._id,
    name: workflow.name,
    description: workflow.description || "",
    entryStageId: workflow.stages[0]?.id || "",
    stages: workflow.stages.map((stage: any, index: number) => ({
      id: stage.id,
      name: stage.name,
      description: stage.description || "",
      color: getStageColor(stage.name),
      order: stage.order,
      actions: stage.actions || [],
      allowedNextStageIds: stage.allowedNextStageIds || [],
    })),
  })) || []

  const convertedItems = allItems?.map(item => ({
    id: item.itemId, // Use itemId (SKU) for navigation instead of Convex document ID
    sku: item.itemId,
    qrData: item.qrCode || item.itemId,
    currentStageId: item.currentStageId,
    workflowId: item.workflowId,
    status: item.status === "error" ? "paused" : item.status,
    currentLocationId: item.currentLocationId,
    createdAt: new Date(item.startedAt).toISOString(),
    activatedAt: new Date(item.startedAt).toISOString(),
    completedAt: undefined,
    metadata: item.metadata || {},
    history: [],
  })) || []

  // Calculate metrics
  const activeItems = convertedItems.filter(item => item.status === "active")
  const completedItems = convertedItems.filter(item => item.status === "completed")
  const itemsByStage = activeItems.reduce((acc, item) => {
    acc[item.currentStageId] = (acc[item.currentStageId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalStages = convertedWorkflows.reduce((total, workflow) => total + workflow.stages.length, 0)
  const averageItemsPerStage = totalStages > 0 ? activeItems.length / totalStages : 0

  if (workflowsLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FactoryHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-lg">Loading items...</div>
          </div>
        </div>
        <FactoryFooter onScan={handleScan} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FactoryHeader />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Items"
            value={activeItems.length}
            subtitle="Items in production"
            icon={Package}
            color="#3b82f6"
          />
          <MetricCard
            title="Completed Items"
            value={completedItems.length}
            subtitle="Items finished today"
            icon={CheckCircle}
            color="#10b981"
          />
          <MetricCard
            title="Average per Stage"
            value={averageItemsPerStage.toFixed(1)}
            subtitle="Items per stage"
            icon={TrendingUp}
            color="#f59e0b"
          />
          <MetricCard
            title="Total Stages"
            value={totalStages}
            subtitle="Active workflow stages"
            icon={Clock}
            color="#8b5cf6"
          />
        </div>

        {/* Stage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Production Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {convertedWorkflows.map((workflow) =>
                workflow.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => {
                    const count = itemsByStage[stage.id] || 0
                    if (count === 0) return null

                    return (
                      <Card key={stage.id} className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              {stage.name}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{count}</div>
                          <div className="text-xs text-gray-600">items</div>
                        </CardContent>
                      </Card>
                    )
                  })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <FactoryItemsList
          items={convertedItems}
          workflows={convertedWorkflows}
          onItemClick={handleItemClick}
          onAdvanceItem={handleAdvanceItem}
        />
      </div>
      <FactoryFooter onScan={handleScan} unreadMessages={3} />
    </div>
  )
}

// Helper function to get stage color based on name
const getStageColor = (stageName: string): string => {
  const name = stageName.toLowerCase();
  if (name.includes("cut")) return "#ef4444";
  if (name.includes("sew")) return "#f97316";
  if (name.includes("wash")) return "#3b82f6";
  if (name.includes("qc") || name.includes("quality")) return "#8b5cf6";
  if (name.includes("pack")) return "#10b981";
  if (name.includes("dry")) return "#f59e0b";
  if (name.includes("press")) return "#8b5cf6";
  if (name.includes("ship")) return "#06b6d4";
  return "#6b7280";
};
