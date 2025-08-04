"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useWorkflowMutations } from "@/hooks/use-convex"
import { ConversationalWorkflowBuilder } from "@/components/workflow/conversational-workflow-builder"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export default function WorkflowPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { createWorkflow, updateWorkflow } = useWorkflowMutations()

  const handleSaveWorkflow = async (workflow: {
    name: string
    description?: string
    stages: any[]
  }) => {
    try {
      await createWorkflow({
        name: workflow.name,
        description: workflow.description,
        stages: workflow.stages.map((stage, index) => ({
          id: `stage-${Date.now()}-${index}`,
          name: stage.name,
          description: stage.description,
          order: index,
          actions: stage.actions.map((action: any) => ({
            id: action.id,
            type: action.type,
            label: action.label,
            description: action.description,
            required: action.required,
            config: action.config,
          })),
          estimatedDuration: stage.estimatedDuration,
          isActive: true,
          assignedLocationIds: stage.assignedLocationIds || [],
        })),
        createdBy: "admin",
      })
      
      toast({
        title: "Success",
        description: "Workflow created successfully",
      })
      router.push("/admin/workflows")
    } catch (error) {
      console.error("Error creating workflow:", error)
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      })
    }
  }



  return (
    <AdminSidebar>
      <div className="flex-1 p-8">
              <ConversationalWorkflowBuilder
        onSave={handleSaveWorkflow}
      />
      </div>
    </AdminSidebar>
  )
}
