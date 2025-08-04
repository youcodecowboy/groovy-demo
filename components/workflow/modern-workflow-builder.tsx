"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ActionConfigurator, type StageAction } from "./action-configurator"
import {
    Plus,
    Settings,
    Trash2, GripVertical,
    ArrowRight,
    Save,
    Clock
} from "lucide-react"

interface Stage {
  id?: string;
  name: string;
  description?: string;
  order: number;
  actions: StageAction[];
  estimatedDuration?: number;
  isActive: boolean;
}

interface Workflow {
  id?: string;
  name: string;
  description?: string;
  stages: Stage[];
}

interface ModernWorkflowBuilderProps {
  onSave: (workflow: { name: string; description?: string; stages: Omit<Stage, "id">[] }) => void
  onUpdate: (workflowId: string, workflow: { name: string; description?: string; stages: Omit<Stage, "id">[] }) => void
  onLoadDemo: () => void
  getWorkflow: (workflowId: string) => Promise<Workflow>
}



export function ModernWorkflowBuilder({ onSave, onUpdate, onLoadDemo, getWorkflow }: ModernWorkflowBuilderProps) {
  const searchParams = useSearchParams()
  const editWorkflowId = searchParams.get("edit")
  const isEditing = !!editWorkflowId

  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [stages, setStages] = useState<Omit<Stage, "id">[]>([])
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditing && editWorkflowId) {
      loadWorkflowForEditing(editWorkflowId)
    }
  }, [editWorkflowId, isEditing])

  const loadWorkflowForEditing = async (workflowId: string) => {
    try {
      setLoading(true)
      const workflow = await getWorkflow(workflowId)
      setWorkflowName(workflow.name)
      setWorkflowDescription(workflow.description || "")
      setStages(
        workflow.stages.map((stage) => ({
          name: stage.name,
          color: stage.color,
          description: stage.description,
          actions: stage.actions,
          allowedNextStageIds: stage.allowedNextStageIds,
          order: stage.order,
        })),
      )
    } catch (error) {
      console.error("Failed to load workflow for editing:", error)
    } finally {
      setLoading(false)
    }
  }

  const addStage = () => {
    const newStage: Omit<Stage, "id"> = {
      name: `Stage ${stages.length + 1}`,
      description: "",
      actions: [],
      order: stages.length,
      estimatedDuration: 15,
      isActive: true,
    }
    setStages([...stages, newStage])
  }

  const updateStage = (index: number, updates: Partial<Omit<Stage, "id">>) => {
    const updatedStages = [...stages]
    updatedStages[index] = { ...updatedStages[index], ...updates }
    setStages(updatedStages)
  }

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index))
    if (selectedStageIndex === index) {
      setSelectedStageIndex(null)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const reorderedStages = Array.from(stages)
    const [removed] = reorderedStages.splice(result.source.index, 1)
    reorderedStages.splice(result.destination.index, 0, removed)

    const updatedStages = reorderedStages.map((stage, index) => ({
      ...stage,
      order: index,
    }))

    setStages(updatedStages)
  }

  const addAction = (stageIndex: number) => {
    const newAction: StageAction = {
      id: `action-${Date.now()}`,
      type: "scan",
      label: "New Action",
      required: false,
    }
    updateStage(stageIndex, {
      actions: [...stages[stageIndex].actions, newAction],
    })
  }

  const updateAction = (stageIndex: number, actionIndex: number, updates: Partial<StageAction>) => {
    const updatedActions = [...stages[stageIndex].actions]
    updatedActions[actionIndex] = { ...updatedActions[actionIndex], ...updates }
    updateStage(stageIndex, { actions: updatedActions })
  }

  const removeAction = (stageIndex: number, actionIndex: number) => {
    updateStage(stageIndex, {
      actions: stages[stageIndex].actions.filter((_, index) => index !== actionIndex),
    })
  }

  const handleSave = () => {
    if (!workflowName.trim() || stages.length === 0) return

    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      stages,
    }

    if (isEditing && editWorkflowId) {
      onUpdate(editWorkflowId, workflowData)
    } else {
      onSave(workflowData)
    }

    // Reset form if creating new
    if (!isEditing) {
      setWorkflowName("")
      setWorkflowDescription("")
      setStages([])
      setSelectedStageIndex(null)
    }
  }

  const loadDemoWorkflow = () => {
    setWorkflowName("Standard Production Flow")
    setWorkflowDescription("Complete garment production workflow with quality controls")
    setStages([
      {
        name: "Cut",
        description: "Fabric cutting operations",
        order: 0,
        estimatedDuration: 15,
        isActive: true,
        actions: [
          {
            id: "cut-measurement",
            type: "measurement",
            label: "Measure fabric dimensions",
            required: true,
            config: {
              measurementUnit: "inches",
              minValue: 0,
              maxValue: 100,
            },
          },
          {
            id: "cut-scan",
            type: "scan",
            label: "Scan cut pieces",
            required: true,
            config: {
              scanType: "qr",
            },
          },
        ],
      },
      {
        name: "Sew",
        description: "Sewing and assembly operations",
        order: 1,
        estimatedDuration: 30,
        isActive: true,
        actions: [
          {
            id: "sew-inspection",
            type: "inspection",
            label: "Pre-sewing inspection",
            required: true,
            config: {
              inspectionChecklist: [
                "Check thread tension",
                "Verify pattern alignment",
                "Inspect fabric quality",
              ],
              allowPartial: false,
            },
          },
          {
            id: "sew-photo",
            type: "photo",
            label: "Document sewing progress",
            required: false,
            config: {
              photoCount: 2,
              photoQuality: "medium",
            },
          },
        ],
      },
      {
        name: "QC",
        description: "Quality control and inspection",
        order: 2,
        estimatedDuration: 20,
        isActive: true,
        actions: [
          {
            id: "qc-approval",
            type: "approval",
            label: "QC approval",
            required: true,
            config: {
              approverRole: "qc",
              autoApprove: false,
            },
          },
          {
            id: "qc-note",
            type: "note",
            label: "QC notes",
            required: false,
            config: {
              notePrompt: "Enter any quality issues or notes",
              maxLength: 500,
            },
          },
        ],
      },
    ])
    onLoadDemo()
  }

  const selectedStage = selectedStageIndex !== null ? stages[selectedStageIndex] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading workflow...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      {/* Left Panel - Configuration */}
      <div className="space-y-6 overflow-y-auto pr-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? "Edit Workflow" : "Create New Workflow"}
          </h2>
          <p className="text-gray-600">
            {isEditing
              ? "Modify your existing workflow configuration"
              : "Define a production workflow trigger and response"}
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="workflow-name" className="text-sm font-medium text-gray-700">
                Workflow Name
              </Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label htmlFor="workflow-description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe this workflow..."
                className="mt-1"
                rows={3}
              />
            </div>
            {!isEditing && (
              <Button onClick={loadDemoWorkflow} variant="outline" className="w-full bg-transparent">
                Load Demo Workflow
              </Button>
            )}
          </CardContent>
        </Card>

        {selectedStage && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configure Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Stage Name</Label>
                <Input
                  value={selectedStage.name}
                  onChange={(e) => updateStage(selectedStageIndex!, { name: e.target.value })}
                  className="mt-1 h-11"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  value={selectedStage.description || ""}
                  onChange={(e) => updateStage(selectedStageIndex!, { description: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Estimated Duration (minutes)</Label>
                <Input
                  type="number"
                  value={selectedStage.estimatedDuration || 15}
                  onChange={(e) => updateStage(selectedStageIndex!, { estimatedDuration: parseInt(e.target.value) || 15 })}
                  className="mt-1 h-11"
                  min="1"
                  max="480"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-700">Stage Actions</Label>
                  <Button onClick={() => addAction(selectedStageIndex!)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Action
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedStage.actions.map((action, actionIndex) => (
                    <ActionConfigurator
                      key={action.id}
                      action={action}
                      onUpdate={(updatedAction) => updateAction(selectedStageIndex!, actionIndex, updatedAction)}
                      onDelete={() => removeAction(selectedStageIndex!, actionIndex)}
                    />
                  ))}
                  {selectedStage.actions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      <Settings className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No actions configured</p>
                      <p className="text-xs">Add actions to define what operators must complete</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stages.length > 0 && (
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} size="lg" className="px-8">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Update Workflow" : "Create Workflow"}
            </Button>
          </div>
        )}
      </div>

      {/* Right Panel - Visualization */}
      <div className="bg-gray-50 rounded-xl p-6 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Workflow Visualization</h3>
          <p className="text-gray-600">
            {isEditing
              ? "Modify the workflow stages and configuration"
              : "Complete the workflow configuration to see a visualization"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Production Stages</h4>
            <Button onClick={addStage} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
          </div>

          {stages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-8 h-8" />
              </div>
              <p className="font-medium">No stages configured yet</p>
              <p className="text-sm">Add a stage to start building your workflow</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="stages">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {stages.map((stage, index) => (
                      <Draggable key={index} draggableId={`stage-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <Card
                              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                selectedStageIndex === index ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-sm"
                              } ${snapshot.isDragging ? "opacity-75 rotate-2" : ""}`}
                              onClick={() => setSelectedStageIndex(index)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900">{stage.name}</h5>
                                    {stage.description && (
                                      <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="w-3 h-3" />
                                      {stage.estimatedDuration || 15}m
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {stage.actions.length} actions
                                    </Badge>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeStage(index)
                                      }}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            {index < stages.length - 1 && (
                              <div className="flex justify-center py-2">
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  )
}
