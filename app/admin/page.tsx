"use client"

import { useToast } from "@/hooks/use-toast"
import { useWorkflows, useItems } from "@/hooks/use-convex"
import { ModularDashboard } from "@/components/admin/modular-dashboard"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminMessages } from "@/components/admin/admin-messages"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function AdminPage() {
  const { toast } = useToast()
  const { workflows, isLoading: workflowsLoading } = useWorkflows()
  const { allItems, isLoading: itemsLoading } = useItems()
  const seedDemoData = useMutation(api.seed.seedDemoData)

  const handleItemClick = (itemId: string) => {
    // Navigate to item detail page
    window.open(`/admin/items-list/${itemId}`, "_blank")
  }

  const resetDemoData = async () => {
    try {
      await seedDemoData()
      toast({
        title: "Success",
        description: "Demo data reset successfully with admin and floor users",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset demo data",
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
    id: item._id,
    sku: item.itemId,
    qrData: item.qrCode || item.itemId,
    currentStageId: item.currentStageId,
    workflowId: item.workflowId,
    status: item.status === "error" ? "paused" : item.status, // Map error to paused
    createdAt: new Date(item.startedAt).toISOString(),
    activatedAt: new Date(item.startedAt).toISOString(),
    completedAt: undefined, // Items don't have completedAt until moved to completedItems
    metadata: item.metadata || {},
    history: [], // Will be populated separately if needed
  })) || []

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        <ModularDashboard
          items={convertedItems}
          workflows={convertedWorkflows}
          onItemClick={handleItemClick}
          onResetData={resetDemoData}
        />
        
        {/* Admin Messages */}
        <div className="mt-8">
          <AdminMessages />
        </div>
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
