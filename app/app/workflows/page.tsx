"use client"

import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Workflow, 
  Edit3, 
  Eye, 
  Trash2, 
  Play, 
  Pause,
  Clock,
  Users,
  Settings,
  ArrowRight,
  Filter
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function WorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")
  
  const workflows = useQuery(api.workflows.getAll) || []
  const toggleActive = useMutation(api.workflows.toggleActive)
  const removeWorkflow = useMutation(api.workflows.remove)
  const router = useRouter()

  // Filter workflows based on search and active status
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterActive === "all" || 
                         (filterActive === "active" && workflow.isActive) ||
                         (filterActive === "inactive" && !workflow.isActive)
    
    return matchesSearch && matchesFilter
  })

  const handleToggleActive = async (workflowId: string) => {
    try {
      await toggleActive({ id: workflowId as any })
    } catch (error) {
      console.error("Failed to toggle workflow:", error)
    }
  }

  const handleDeleteWorkflow = async (workflowId: string, workflowName: string) => {
    if (!confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await removeWorkflow({ id: workflowId as any })
    } catch (error) {
      console.error("Failed to delete workflow:", error)
      alert(`Failed to delete workflow: ${error}`)
    }
  }

  const getWorkflowStats = (workflow: any) => {
    const totalStages = workflow.stages?.length || 0
    const activeStages = workflow.stages?.filter((s: any) => s.isActive)?.length || 0
    const totalActions = workflow.stages?.reduce((acc: number, stage: any) => 
      acc + (stage.actions?.length || 0), 0) || 0
    
    return { totalStages, activeStages, totalActions }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Library</h1>
          <p className="text-gray-600 mt-1">Manage your production workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push("/app/workflows/builder2")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Builder
          </Button>
          <Button 
            onClick={() => router.push("/app/workflows/builder")}
            size="lg"
            variant="outline"
            className="border-2 border-gray-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Legacy Builder
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterActive === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive("all")}
          >
            All
          </Button>
          <Button
            variant={filterActive === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive("active")}
          >
            <Play className="w-4 h-4 mr-1" />
            Active
          </Button>
          <Button
            variant={filterActive === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive("inactive")}
          >
            <Pause className="w-4 h-4 mr-1" />
            Inactive
          </Button>
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Workflow className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-600 text-center mb-6">
              {searchQuery || filterActive !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by creating your first workflow"
              }
            </p>
            {!searchQuery && filterActive === "all" && (
              <Button 
                onClick={() => router.push("/app/workflows/builder")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Workflow
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => {
            const stats = getWorkflowStats(workflow)
            
            return (
              <Card key={workflow._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {workflow.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={workflow.isActive ? "default" : "secondary"}>
                          {workflow.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleToggleActive(workflow._id)}
                        size="sm"
                        variant="ghost"
                        className={workflow.isActive ? "text-green-600" : "text-gray-400"}
                      >
                        {workflow.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Description */}
                  {workflow.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {workflow.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{stats.totalStages}</div>
                      <div className="text-xs text-gray-500">Stages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{stats.activeStages}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{stats.totalActions}</div>
                      <div className="text-xs text-gray-500">Actions</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      onClick={() => router.push(`/app/workflows/builder?id=${workflow._id}`)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => router.push(`/app/workflows/${workflow._id}`)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleDeleteWorkflow(workflow._id, workflow.name)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 