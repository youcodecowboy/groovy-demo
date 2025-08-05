"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useWorkflows, useItemMutations } from "@/hooks/use-convex"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FactoryHeader } from "@/components/factory/factory-header"
import { FactoryFooter } from "@/components/factory/factory-footer"
import { ItemDetailView } from "@/components/items/item-detail-view"

export default function FactoryItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.itemId as string
  const { toast } = useToast()
  const { workflows } = useWorkflows()
  const { advanceToStage, advanceStage } = useItemMutations()
  
  // State for messaging
  const [isMessagesPanelOpen, setIsMessagesPanelOpen] = useState(false)
  
  // New scan mutations
  const logScan = useMutation(api.scans.logScan)
  const completeStageWithScan = useMutation(api.scans.completeStageWithScan)

  // Handle message about item
  const handleMessageAboutItem = (itemId: string) => {
    // Navigate to messaging page with item pre-attached
    router.push(`/floor/messaging?itemId=${itemId}`)
  }

  // Wrapper function for scan logging
  const handleScanLog = async (scanData: any) => {
    await logScan({
      qrData: scanData.qrData,
      scanType: "stage_completion",
      success: true,
      userId: scanData.userId,
      stageId: scanData.stageId,
      workflowId: scanData.workflowId,
      deviceInfo: scanData.deviceInfo,
    })
  }

  // Get item by itemId (string identifier) - check both active and completed items
  const convexItem = useQuery(api.items.getByItemId, { itemId })
  const completedItem = useQuery(api.items.getCompletedByItemId, { itemId })
  const completedHistory = useQuery(api.items.getCompletedHistory, { itemId })
  
  // Convert Convex item to app format - handle both active and completed items
  const item = convexItem ? {
    id: convexItem._id,
    sku: convexItem.itemId,
    qrData: convexItem.qrCode || convexItem.itemId,
    currentStageId: convexItem.currentStageId,
    workflowId: convexItem.workflowId,
    status: convexItem.status === "error" ? "paused" : convexItem.status, // Map error to paused
    currentLocationId: convexItem.currentLocationId,
    createdAt: new Date(convexItem.startedAt).toISOString(),
    activatedAt: new Date(convexItem.startedAt).toISOString(),
    completedAt: undefined, // Items don't have completedAt until moved to completedItems
    metadata: convexItem.metadata || {},
    history: [], // Will be populated separately if needed
  } : completedItem ? {
    id: completedItem.itemId,
    sku: completedItem.itemId,
    qrData: completedItem.qrCode || completedItem.itemId,
    currentStageId: completedItem.finalStageId,
    workflowId: completedItem.workflowId,
    status: "completed" as const,
    currentLocationId: completedItem.finalLocationId,
    createdAt: new Date(completedItem.startedAt).toISOString(),
    activatedAt: new Date(completedItem.startedAt).toISOString(),
    completedAt: new Date(completedItem.completedAt).toISOString(),
    metadata: completedItem.metadata || {},
    history: completedHistory?.map(entry => ({
      from: entry.action === "started" ? "" : entry.stageId,
      to: entry.stageId,
      at: new Date(entry.timestamp).toISOString(),
      user: entry.userId || "Unknown",
    })) || [],
  } : null

  // Convert workflow to app format - handle both active and completed items
  const workflow = workflows?.find(w => w._id === (convexItem?.workflowId || completedItem?.workflowId)) ? {
    id: workflows.find(w => w._id === (convexItem?.workflowId || completedItem?.workflowId))!._id,
    name: workflows.find(w => w._id === (convexItem?.workflowId || completedItem?.workflowId))!.name,
    description: workflows.find(w => w._id === (convexItem?.workflowId || completedItem?.workflowId))!.description || "",
    entryStageId: workflows.find(w => w._id === (convexItem?.workflowId || completedItem?.workflowId))!.stages[0]?.id || "",
    stages: workflows.find(w => w._id === (convexItem?.workflowId || completedItem?.workflowId))!.stages.map((stage: any, index: number) => ({
      id: stage.id,
      name: stage.name,
      description: stage.description || "",
      color: getStageColor(stage.name),
      order: stage.order,
      actions: stage.actions || [],
      allowedNextStageIds: getNextStageIds(workflows.find(w => w._id === (convexItem?.workflowId || completedItem?.workflowId))!.stages, stage.order),
    })),
  } : null

  const handleScan = async (data: string) => {
    try {
      // Log the scan attempt
      await logScan({
        qrData: data,
        scanType: "item_lookup",
        success: true,
        userId: "floor@demo",
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      })

      // Always navigate to item details page when QR is scanned
      router.push(`/floor/items/${data}`)

      toast({
        title: "✅ Item Scanned",
        description: `Opening details for: ${data}`,
      })
    } catch (error) {
      // Log failed scan
      await logScan({
        qrData: data,
        scanType: "item_lookup",
        success: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        userId: "floor@demo",
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      })

      toast({
        title: "Error",
        description: "Failed to process scan",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.push("/floor")
  }

  const handleActivateItem = async (itemId: string) => {
    try {
      // For now, we'll just show a success message since activation is handled differently in Convex
      toast({
        title: "Success",
        description: "Item activated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate item",
        variant: "destructive",
      })
    }
  }

  const handleAdvanceItem = async (itemId: string, toStageId: string, completedActions: any[]) => {
    try {
      if (!convexItem) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        })
        return
      }

      // Log the completed actions for debugging
      console.log("Completed actions:", completedActions)

      // Check if any of the completed actions require a scan
      const scanAction = completedActions?.find(action => action.data && action.data.startsWith('item:'))
      
      if (scanAction) {
        // If there's a scan action, we need to handle it differently
        // For now, we'll just advance normally and log that scan was required
        toast({
          title: "Scan Required",
          description: "This stage requires a QR scan to complete",
          variant: "destructive",
        })
        return
      }

      // Prepare notes from completed actions
      const actionNotes = completedActions?.map(action => {
        if (action.data && typeof action.data === 'object') {
          return `${action.label}: ${JSON.stringify(action.data)}`
        }
        return action.label
      }).join(", ")

      if (toStageId === "completed") {
        // Use advanceStage to complete the item (it will automatically detect final stage)
        await advanceStage({
          itemId: convexItem._id,
          userId: "floor@demo",
          notes: actionNotes,
          actionData: completedActions, // Pass the detailed action data
        })
      } else {
        // Use advanceToStage for normal stage progression
        await advanceToStage({
          itemId: convexItem._id,
          toStageId,
          userId: "floor@demo",
          notes: actionNotes,
          actionData: completedActions, // Pass the detailed action data
        })
      }
      
      toast({
        title: "Success",
        description: toStageId === "completed" ? "Item completed successfully" : "Item advanced successfully",
      })
    } catch (error) {
      console.error("Advance item error:", error)
      toast({
        title: "Error",
        description: "Failed to advance item",
        variant: "destructive",
      })
    }
  }

  // New function to handle stage completion with QR scan
  const handleStageCompletionWithScan = async (qrData: string) => {
    try {
      if (!convexItem) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        })
        return
      }

      const result = await completeStageWithScan({
        itemId: convexItem._id,
        stageId: convexItem.currentStageId,
        qrData,
        userId: "floor@demo",
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      })

      if (result.status === "completed") {
        toast({
          title: "✅ Item Completed",
          description: "Item has been completed successfully with QR scan verification",
        })
        // Navigate back to floor view
        router.push("/floor")
      } else {
        toast({
          title: "✅ Stage Completed",
          description: `Advanced to next stage: ${result.nextStage?.name}`,
        })
      }
    } catch (error) {
      toast({
        title: "Scan Error",
        description: error instanceof Error ? error.message : "Failed to complete stage with scan",
        variant: "destructive",
      })
    }
  }

  if (convexItem === undefined && completedItem === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FactoryHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-lg">Loading item details...</div>
          </div>
        </div>
        <FactoryFooter onScan={handleScan} />
      </div>
    )
  }

  if (!item || !workflow) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FactoryHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-lg">Item not found</div>
          </div>
        </div>
        <FactoryFooter onScan={handleScan} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FactoryHeader />
      <div className="flex-1 container mx-auto px-4 py-6 overflow-y-auto">
        <ItemDetailView
          item={item}
          workflow={workflow}
          onBack={handleBack}
          onActivateItem={handleActivateItem}
          onAdvanceItem={handleAdvanceItem}
          onStageCompletionWithScan={handleStageCompletionWithScan}
          onScanLog={handleScanLog}
          onMessageAboutItem={handleMessageAboutItem}
          currentUserId="floor@demo"
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

// Helper function to get next stage IDs
const getNextStageIds = (stages: any[], currentOrder: number): string[] => {
  const nextStage = stages.find(stage => stage.order === currentOrder + 1);
  return nextStage ? [nextStage.id] : [];
};
