"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StageGraph } from "@/components/ui/stage-graph"
import type { Workflow } from "@/types/schema"
import { Search, Edit, Trash2, Plus, Clock, Package, Settings, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface WorkflowLibraryProps {
  workflows: Workflow[]
  itemCounts: Record<string, number>
  onEditWorkflow: (workflowId: string) => void
  onDeleteWorkflow: (workflowId: string) => void
  onCreateNew: () => void
}

export function WorkflowLibrary({
  workflows,
  itemCounts,
  onEditWorkflow,
  onDeleteWorkflow,
  onCreateNew,
}: WorkflowLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const filteredWorkflows = workflows.filter(
    (workflow) =>
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getWorkflowStats = (workflow: Workflow) => {
    const totalActions = workflow.stages.reduce((sum, stage) => sum + stage.actions.length, 0)
    const requiredActions = workflow.stages.reduce(
      (sum, stage) => sum + stage.actions.filter((action) => action.required).length,
      0,
    )
    return { totalActions, requiredActions }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Library</h1>
          <p className="text-gray-600">Manage and organize your production workflows</p>
        </div>
        <Button onClick={onCreateNew} size="lg" className="px-6">
          <Plus className="w-4 h-4 mr-2" />
          Create New Workflow
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search workflows by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkflows.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No workflows found</p>
            <p className="text-sm">
              {searchQuery ? "Try adjusting your search terms" : "Create your first workflow to get started"}
            </p>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => {
            const stats = getWorkflowStats(workflow)
            const itemCount = itemCounts[workflow.id] || 0

            return (
              <Card key={workflow.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{workflow.name}</CardTitle>
                      {workflow.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">{workflow.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => onEditWorkflow(workflow.id)}
                        size="sm"
                        variant="outline"
                        className="bg-transparent"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{workflow.name}"? This action cannot be undone.
                              {itemCount > 0 && (
                                <span className="block mt-2 text-red-600 font-medium">
                                  Warning: {itemCount} items are currently using this workflow.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteWorkflow(workflow.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={itemCount > 0}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Workflow Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{workflow.stages.length}</div>
                      <div className="text-xs text-gray-600">Stages</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalActions}</div>
                      <div className="text-xs text-gray-600">Actions</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{itemCount}</div>
                      <div className="text-xs text-gray-600">Items</div>
                    </div>
                  </div>

                  {/* Stage Flow */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Production Flow</span>
                    </div>
                    <StageGraph stages={workflow.stages} className="bg-white p-3 rounded-lg border" />
                  </div>

                  {/* Workflow Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {stats.requiredActions} required actions
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Package className="w-3 h-3 mr-1" />
                      {itemCount} active items
                    </Badge>
                    {workflow.stages.some((stage) => stage.actions.some((action) => action.type === "scan")) && (
                      <Badge variant="secondary" className="text-xs">
                        QR Scanning
                      </Badge>
                    )}
                    {workflow.stages.some((stage) => stage.actions.some((action) => action.type === "photo")) && (
                      <Badge variant="secondary" className="text-xs">
                        Photo Capture
                      </Badge>
                    )}
                    {workflow.stages.some((stage) => stage.actions.some((action) => action.type === "inspection")) && (
                      <Badge variant="secondary" className="text-xs">
                        Quality Control
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
