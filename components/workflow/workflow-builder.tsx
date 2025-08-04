"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StageCard } from "./stage-card"
import type { Stage } from "@/types/schema"
import { Plus, Save, RotateCcw } from "lucide-react"

interface WorkflowBuilderProps {
  onSave: (workflow: { name: string; description?: string; stages: Omit<Stage, "id">[] }) => void
  onLoadDemo: () => void
}

export function WorkflowBuilder({ onSave, onLoadDemo }: WorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [stages, setStages] = useState<Omit<Stage, "id">[]>([])

  const addStage = () => {
    const newStage: Omit<Stage, "id"> = {
      name: `Stage ${stages.length + 1}`,
      color: "#6b7280",
      description: "",
      actions: [],
      allowedNextStageIds: [],
      order: stages.length,
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
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const reorderedStages = Array.from(stages)
    const [removed] = reorderedStages.splice(result.source.index, 1)
    reorderedStages.splice(result.destination.index, 0, removed)

    // Update order and allowedNextStageIds
    const updatedStages = reorderedStages.map((stage, index) => ({
      ...stage,
      order: index,
      allowedNextStageIds: index < reorderedStages.length - 1 ? [`stage-${index + 1}`] : [],
    }))

    setStages(updatedStages)
  }

  const handleSave = () => {
    if (!workflowName.trim() || stages.length === 0) return

    onSave({
      name: workflowName,
      description: workflowDescription,
      stages,
    })

    // Reset form
    setWorkflowName("")
    setWorkflowDescription("")
    setStages([])
  }

  const loadDemoWorkflow = () => {
    setWorkflowName("Standard Production Flow")
    setWorkflowDescription("Complete garment production workflow with quality controls")
    setStages([
      {
        name: "Cut",
        color: "#ef4444",
        description: "Fabric cutting operations",
        order: 0,
        actions: [
          {
            id: "cut-measurement",
            type: "measurement",
            label: "Measure fabric dimensions",
            required: true,
            config: { measurementUnit: "inches" },
          },
        ],
        allowedNextStageIds: ["sew"],
      },
      {
        name: "Sew",
        color: "#f97316",
        description: "Sewing and assembly operations",
        order: 1,
        actions: [
          {
            id: "sew-inspection",
            type: "inspection",
            label: "Pre-sewing inspection",
            required: true,
          },
        ],
        allowedNextStageIds: ["wash"],
      },
      {
        name: "Wash",
        color: "#3b82f6",
        description: "Washing and treatment",
        order: 2,
        actions: [
          {
            id: "wash-scan",
            type: "scan",
            label: "Scan before washing",
            required: true,
          },
        ],
        allowedNextStageIds: ["qc"],
      },
      {
        name: "QC",
        color: "#8b5cf6",
        description: "Quality control and inspection",
        order: 3,
        actions: [
          {
            id: "qc-approval",
            type: "approval",
            label: "QC approval",
            required: true,
          },
        ],
        allowedNextStageIds: ["pack"],
      },
      {
        name: "Pack",
        color: "#10b981",
        description: "Final packaging",
        order: 4,
        actions: [
          {
            id: "pack-scan",
            type: "scan",
            label: "Final scan",
            required: true,
          },
        ],
        allowedNextStageIds: [],
      },
    ])
    onLoadDemo()
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Create New Workflow</CardTitle>
          <CardDescription>Design your production workflow with configurable stages and actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadDemoWorkflow} variant="outline" className="bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Load Demo Workflow
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Describe this workflow..."
              className="mt-1"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Stages</CardTitle>
              <CardDescription>Drag and drop to reorder stages. Configure actions for each stage.</CardDescription>
            </div>
            <Button onClick={addStage}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stages">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {stages.map((stage, index) => (
                    <Draggable key={index} draggableId={`stage-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <StageCard
                            stage={stage}
                            onUpdate={(updates) => updateStage(index, updates)}
                            onDelete={() => removeStage(index)}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {stages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No stages configured yet.</p>
              <p className="text-sm">Add a stage to get started building your workflow.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {stages.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="px-8">
            <Save className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      )}
    </div>
  )
}
