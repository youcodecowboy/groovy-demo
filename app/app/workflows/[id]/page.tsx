"use client"

import React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Play, 
  Pause,
  Clock,
  Users,
  Settings,
  Eye,
  CheckCircle,
  AlertTriangle,
  Package,
  Factory
} from "lucide-react"

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id as string
  
  const workflow = useQuery(api.workflows.getById, { id: workflowId as any })
  const usageDetails = useQuery(api.workflows.getWorkflowUsageDetails, { id: workflowId as any })
  const toggleActive = useMutation(api.workflows.toggleActive)
  const removeWorkflow = useMutation(api.workflows.remove)

  if (!workflow) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Factory className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Workflow not found</h2>
          <p className="text-gray-600 mb-4">The workflow you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push("/app/workflows")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </Button>
        </div>
      </div>
    )
  }

  const handleToggleActive = async () => {
    try {
      await toggleActive({ id: workflowId as any })
    } catch (error) {
      console.error("Failed to toggle workflow:", error)
    }
  }

  const handleDeleteWorkflow = async () => {
    if (!confirm(`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await removeWorkflow({ id: workflowId as any })
      router.push("/app/workflows")
    } catch (error) {
      console.error("Failed to delete workflow:", error)
      alert(`Failed to delete workflow: ${error}`)
    }
  }

  const getStageStats = () => {
    const totalStages = workflow.stages?.length || 0
    const activeStages = workflow.stages?.filter(s => s.isActive)?.length || 0
    const totalActions = workflow.stages?.reduce((acc, stage) => 
      acc + (stage.actions?.length || 0), 0) || 0
    
    return { totalStages, activeStages, totalActions }
  }

  const stats = getStageStats()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push("/app/workflows")}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{workflow.name}</h1>
            <p className="text-gray-600 mt-1">
              Created {new Date(workflow.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleToggleActive}
            variant={workflow.isActive ? "outline" : "default"}
            size="sm"
          >
            {workflow.isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {workflow.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            onClick={() => router.push(`/app/workflows/builder?id=${workflowId}`)}
            size="sm"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDeleteWorkflow}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant={workflow.isActive ? "default" : "secondary"}>
          {workflow.isActive ? "Active" : "Inactive"}
        </Badge>
        {usageDetails && usageDetails.activeItemCount > 0 && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {usageDetails.activeItemCount} active items
          </Badge>
        )}
      </div>

      {/* Description */}
      {workflow.description && (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-700">{workflow.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalStages}</div>
                <div className="text-sm text-gray-600">Total Stages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.activeStages}</div>
                <div className="text-sm text-gray-600">Active Stages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalActions}</div>
                <div className="text-sm text-gray-600">Total Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {usageDetails ? usageDetails.activeItemCount + usageDetails.completedItemCount : 0}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Stages ({stats.totalStages})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflow.stages?.map((stage, index) => (
              <div key={stage.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    {stage.description && (
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {stage.estimatedDuration || 15}m
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {stage.actions?.length || 0} actions
                      </div>
                      <Badge variant={stage.isActive ? "default" : "secondary"} className="text-xs">
                        {stage.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Information */}
      {usageDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Usage Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Active Items ({usageDetails.activeItemCount})</h4>
                {usageDetails.activeItems.length > 0 ? (
                  <div className="space-y-2">
                    {usageDetails.activeItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{item.itemId}</div>
                          <div className="text-sm text-gray-600">Stage: {item.currentStageId}</div>
                        </div>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No active items</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Completed Items ({usageDetails.completedItemCount})</h4>
                {usageDetails.completedItems.length > 0 ? (
                  <div className="space-y-2">
                    {usageDetails.completedItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{item.itemId}</div>
                          <div className="text-sm text-gray-600">Final: {item.finalStageName}</div>
                        </div>
                        <Badge variant="default" className="bg-green-600">Completed</Badge>
                      </div>
                    ))}
                    {usageDetails.completedItems.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{usageDetails.completedItems.length - 5} more completed items
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No completed items</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 