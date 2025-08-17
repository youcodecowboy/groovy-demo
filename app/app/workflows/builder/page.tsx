"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter, useSearchParams } from "next/navigation"
import { ConversationalWorkflowBuilder } from "@/components/workflow/conversational-workflow-builder"
import { useAuth } from "@/components/providers/mock-auth-provider"
import { toast } from "sonner"

interface WorkflowData {
  name: string
  description?: string
  stages: any[]
}

function WorkflowBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workflowId = searchParams.get("id")
  const { user } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  
  // Fetch existing workflow if editing
  const existingWorkflow = useQuery(
    api.workflows.getById,
    workflowId ? { id: workflowId as any } : "skip"
  )
  
  const createWorkflow = useMutation(api.workflows.create)
  const updateWorkflow = useMutation(api.workflows.update)

  const handleSave = async (workflowData: WorkflowData) => {
    if (!user) {
      toast.error("User not authenticated")
      return
    }

    setIsLoading(true)
    
    try {
      if (workflowId) {
        // Update existing workflow
        await updateWorkflow({
          id: workflowId as any,
          name: workflowData.name,
          description: workflowData.description,
          stages: workflowData.stages,
        })
        toast.success("Workflow updated successfully!")
      } else {
        // Create new workflow
        await createWorkflow({
          name: workflowData.name,
          description: workflowData.description,
          stages: workflowData.stages,
          createdBy: user.id,
        })
        toast.success("Workflow created successfully!")
      }
      
      // Navigate back to workflow library
      router.push("/app/workflows")
    } catch (error) {
      console.error("Failed to save workflow:", error)
      toast.error("Failed to save workflow. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Transform existing workflow data for the builder
  const getInitialWorkflowData = () => {
    if (!existingWorkflow) return null
    
    return {
      name: existingWorkflow.name,
      description: existingWorkflow.description,
      stages: existingWorkflow.stages || []
    }
  }

  return (
    <div className="h-screen bg-gray-50">
      <ConversationalWorkflowBuilder 
        onSave={handleSave}
        initialData={getInitialWorkflowData() as any}
        isLoading={isLoading}
      />
    </div>
  )
}

export default function WorkflowBuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <WorkflowBuilderContent />
    </Suspense>
  )
} 