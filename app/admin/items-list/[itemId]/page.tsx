"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Item, Workflow } from "@/types/schema"
import { ItemDetailView } from "@/components/items/item-detail-view"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.itemId as string
  const [item, setItem] = useState<Item | null>(null)
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Query for active item
  const activeItem = useQuery(api.items.getByItemId, { itemId })
  const workflows = useQuery(api.workflows.getAll)
  
  // Query for completed item
  const completedItem = useQuery(api.items.getCompletedByItemId, { itemId })
  const completedHistory = useQuery(api.items.getCompletedHistory, { itemId })

  useEffect(() => {
    loadItemData()
  }, [itemId, activeItem, completedItem, completedHistory, workflows])

  const loadItemData = async () => {
    try {
      setLoading(true)
      
      // First try to load as active item
      if (activeItem && workflows) {
        const workflowData = workflows.find((w) => w._id === activeItem.workflowId)
        if (workflowData) {
          // Convert Convex item to the format expected by ItemDetailView
          const convertedItem: Item = {
            id: activeItem.itemId,
            sku: activeItem.itemId,
            qrData: activeItem.qrCode || activeItem.itemId,
            currentStageId: activeItem.currentStageId,
            workflowId: activeItem.workflowId,
            status: activeItem.status === "error" ? "paused" : activeItem.status,
            createdAt: new Date(activeItem.startedAt).toISOString(),
            activatedAt: new Date(activeItem.startedAt).toISOString(),
            completedAt: undefined,
            metadata: activeItem.metadata || {},
            history: [], // Will be populated separately if needed
          }

          // Convert Convex workflow to the format expected by ItemDetailView
          const convertedWorkflow: Workflow = {
            id: workflowData._id,
            name: workflowData.name,
            description: workflowData.description || "",
            entryStageId: workflowData.stages[0]?.id || "",
            stages: workflowData.stages.map((stage: any, index: number) => ({
              id: stage.id,
              name: stage.name,
              description: stage.description || "",
              color: getStageColor(stage.name),
              order: stage.order,
              actions: stage.actions || [],
              allowedNextStageIds: getNextStageIds(workflowData.stages, stage.order),
            })),
          }

          setItem(convertedItem)
          setWorkflow(convertedWorkflow)
          return
        }
      }

      // If active item not found, check if it's a completed item
      if (completedItem && completedHistory !== undefined && workflows) {
        // Convert completed item to the format expected by ItemDetailView
        const convertedItem: Item = {
          id: completedItem.itemId,
          sku: completedItem.itemId,
          qrData: completedItem.qrCode || completedItem.itemId,
          currentStageId: completedItem.finalStageId,
          workflowId: completedItem.workflowId,
          status: "completed",
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
        }

        // Find the original workflow for the completed item
        const originalWorkflow = workflows.find(w => w._id === completedItem.workflowId)
        const convertedWorkflow: Workflow = {
          id: completedItem.workflowId,
          name: originalWorkflow?.name || "Completed Workflow",
          description: originalWorkflow?.description || "Workflow for completed item",
          entryStageId: "",
          stages: completedHistory?.map(entry => ({
            id: entry.stageId,
            name: entry.stageName,
            description: "",
            color: "#6b7280",
            order: 0,
            actions: [],
            allowedNextStageIds: [],
          })) || [],
        }

        setItem(convertedItem)
        setWorkflow(convertedWorkflow)
        return
      }

      // If we get here, neither active nor completed item was found
      toast({
        title: "Error",
        description: "Item not found",
        variant: "destructive",
      })
      router.push("/admin/items-list")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/admin/items-list")
  }

  const handleActivateItem = async (itemId: string) => {
    // This would need to be implemented with Convex mutations
    toast({
      title: "Info",
      description: "Item activation would be implemented with Convex mutations",
    })
  }

  const handleAdvanceItem = async (itemId: string, toStageId: string, completedActions: any[]) => {
    // This would need to be implemented with Convex mutations
    toast({
      title: "Info",
      description: "Item advancement would be implemented with Convex mutations",
    })
  }

  const handleStageCompletionWithScan = async (qrData: string) => {
    // This would need to be implemented with Convex mutations
    toast({
      title: "Info",
      description: "Stage completion would be implemented with Convex mutations",
    })
  }

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex-1 space-y-6 p-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading item details...</div>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  if (!item || !workflow) {
    return (
      <AdminSidebar>
        <div className="flex-1 space-y-6 p-6">
          <div className="text-center py-12">
            <div className="text-lg">Item not found</div>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        <ItemDetailView
          item={item}
          workflow={workflow}
          onBack={handleBack}
          onActivateItem={handleActivateItem}
          onAdvanceItem={handleAdvanceItem}
          onStageCompletionWithScan={handleStageCompletionWithScan}
        />
      </div>
    </AdminSidebar>
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
