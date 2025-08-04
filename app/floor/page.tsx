"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useWorkflows, useItems, useItemMutations } from "@/hooks/use-convex"
import { FactoryHeader } from "@/components/factory/factory-header"
import { FactoryFooter } from "@/components/factory/factory-footer"
import { FactoryDashboard } from "@/components/factory/factory-dashboard"
import { MoveItemDialog } from "@/components/factory/move-item-dialog"
import { MessagesPanel } from "@/components/factory/messages-panel"

export default function FactoryFloorPage() {
  const { workflows, isLoading: workflowsLoading } = useWorkflows()
  const { allItems, isLoading: itemsLoading } = useItems()
  const { advanceToStage, advanceStage } = useItemMutations()
  const { toast } = useToast()
  const router = useRouter()
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isMessagesPanelOpen, setIsMessagesPanelOpen] = useState(false)

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
        // Use advanceStage to complete the item (it will automatically detect final stage)
        await advanceStage({
          itemId: convexItem._id,
          userId: "floor@demo",
          notes: completedActions?.map(action => action.label).join(", "),
        })
      } else {
        // Use advanceToStage for normal stage progression
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

  // Convert Convex data to the format expected by the dashboard
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
      allowedNextStageIds: getNextStageIds(workflow.stages, stage.order),
    })),
  })) || []

  const convertedItems = allItems?.map(item => ({
    id: item.itemId, // Use itemId (SKU) for navigation instead of Convex document ID
    sku: item.itemId,
    qrData: item.qrCode || item.itemId,
    currentStageId: item.currentStageId,
    workflowId: item.workflowId,
    status: item.status === "error" ? "paused" : item.status, // Map error to paused
    currentLocationId: item.currentLocationId,
    createdAt: new Date(item.startedAt).toISOString(),
    activatedAt: new Date(item.startedAt).toISOString(),
    completedAt: undefined, // Items don't have completedAt until moved to completedItems
    metadata: item.metadata || {},
    history: [], // Will be populated separately if needed
  })) || []

  if (workflowsLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FactoryHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-lg">Loading factory floor data...</div>
          </div>
        </div>
        <FactoryFooter onScan={handleScan} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FactoryHeader />
      <div className="container mx-auto px-4 py-6">
        <FactoryDashboard
          items={convertedItems}
          workflows={convertedWorkflows}
          onItemClick={handleItemClick}
          onAdvanceItem={handleAdvanceItem}
        />
      </div>
      <FactoryFooter 
        onScan={handleScan} 
        onMove={() => setIsMoveDialogOpen(true)}
        onMessages={() => setIsMessagesPanelOpen(true)}
        unreadMessages={3} 
      />
      
      {/* Move Item Dialog */}
      <MoveItemDialog 
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
      />
      
      {/* Messages Panel */}
      <MessagesPanel 
        isOpen={isMessagesPanelOpen}
        onClose={() => setIsMessagesPanelOpen(false)}
        currentUserId="floor@demo"
      />
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

// Helper function to get next stage IDs
const getNextStageIds = (stages: any[], currentOrder: number): string[] => {
  const nextStage = stages.find(stage => stage.order === currentOrder + 1);
  return nextStage ? [nextStage.id] : [];
};
