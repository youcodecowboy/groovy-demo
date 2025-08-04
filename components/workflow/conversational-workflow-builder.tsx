"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Settings,
    Play,
    CheckCircle,
    Camera,
    ScanLine,
    FileText,
    Eye,
    Ruler,
    ArrowRight,
    ArrowLeft,
    X,
    Edit,
    GripVertical
} from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

interface WorkflowStage {
  id: string
  name: string
  description: string
  order: number
  actions: WorkflowAction[]
  estimatedDuration: number
  isActive: boolean
  assignedLocationIds?: string[] // Array of location IDs assigned to this stage
}

interface WorkflowAction {
  id: string
  type: "scan" | "photo" | "note" | "approval" | "measurement" | "inspection"
  label: string
  required: boolean
  description?: string
  config?: any
}

interface ConversationalWorkflowBuilderProps {
  onSave: (workflow: { name: string; description?: string; stages: WorkflowStage[] }) => void
}

const actionTypes = [
  { 
    value: "scan", 
    label: "QR/Barcode Scan", 
    icon: ScanLine,
    description: "Scan codes to advance",
    color: "bg-blue-500"
  },
  { 
    value: "photo", 
    label: "Photo Capture", 
    icon: Camera,
    description: "Take photos for documentation",
    color: "bg-green-500"
  },
  { 
    value: "note", 
    label: "Text Note", 
    icon: FileText,
    description: "Add notes or comments",
    color: "bg-purple-500"
  },
  { 
    value: "approval", 
    label: "Approval Required", 
    icon: CheckCircle,
    description: "Require supervisor approval",
    color: "bg-orange-500"
  },
  { 
    value: "measurement", 
    label: "Measurement", 
    icon: Ruler,
    description: "Record measurements",
    color: "bg-red-500"
  },
  { 
    value: "inspection", 
    label: "Inspection", 
    icon: Eye,
    description: "Complete inspection checklist",
    color: "bg-indigo-500"
  },
]

function SortableStageCard({ stage, index, onClick }: { 
  stage: WorkflowStage; 
  index: number; 
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card 
        className={`w-80 cursor-pointer hover:shadow-lg transition-all duration-200 ${
          isDragging ? 'shadow-2xl' : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg">{stage.name}</h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm font-bold">
                {index + 1}
              </Badge>
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{stage.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="font-medium">{stage.estimatedDuration}m</span>
            <span className="font-medium">{stage.actions.length} actions</span>
          </div>
          {stage.actions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {stage.actions.map((action) => {
                const actionType = actionTypes.find(type => type.value === action.type)
                return (
                  <Badge key={action.id} variant="secondary" className="text-xs">
                    {actionType?.label}
                  </Badge>
                )
              })}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Edit className="w-3 h-3" />
            <span>Click to edit</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Connection line to next stage */}
      {index < stage.order && (
        <div className="absolute top-1/2 -right-6 w-12 h-0.5 bg-blue-400 transform -translate-y-1/2">
          <div className="absolute right-0 top-1/2 w-2 h-2 bg-blue-400 transform rotate-45 translate-x-1 -translate-y-1/2"></div>
        </div>
      )}
    </div>
  )
}

export function ConversationalWorkflowBuilder({ onSave }: ConversationalWorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [stages, setStages] = useState<WorkflowStage[]>([])
  const [currentStep, setCurrentStep] = useState<"welcome" | "naming" | "adding-stage" | "stage-actions" | "canvas" | "review">("welcome")
  const [currentStageName, setCurrentStageName] = useState("")
  const [currentStageDescription, setCurrentStageDescription] = useState("")
  const [currentStageDuration, setCurrentStageDuration] = useState(15)
  const [currentStageActions, setCurrentStageActions] = useState<WorkflowAction[]>([])
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null)
  const [currentStageLocationIds, setCurrentStageLocationIds] = useState<string[]>([])
  const [editingStageLocationIds, setEditingStageLocationIds] = useState<string[]>([])
  const router = useRouter()

  const locations = useQuery(api.locations.getAll)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const addStage = () => {
    const newStage: WorkflowStage = {
      id: `stage-${Date.now()}`,
      name: currentStageName,
      description: currentStageDescription,
      order: stages.length,
      actions: currentStageActions,
      estimatedDuration: currentStageDuration,
      isActive: true,
      assignedLocationIds: currentStageLocationIds,
    }
    setStages([...stages, newStage])
    
    // Reset current stage data
    setCurrentStageName("")
    setCurrentStageDescription("")
    setCurrentStageDuration(15)
    setCurrentStageActions([])
    setCurrentStageLocationIds([])
    
    setCurrentStep("canvas")
  }

  const updateStage = (index: number, updates: Partial<WorkflowStage>) => {
    const updatedStages = [...stages]
    updatedStages[index] = { ...updatedStages[index], ...updates }
    setStages(updatedStages)
  }

  const addAction = (type: string) => {
    const newAction: WorkflowAction = {
      id: `action-${Date.now()}`,
      type: type as any,
      label: actionTypes.find(t => t.value === type)?.label || "New Action",
      required: true,
    }
    setCurrentStageActions([...currentStageActions, newAction])
  }

  const updateAction = (index: number, updates: Partial<WorkflowAction>) => {
    const updatedActions = [...currentStageActions]
    updatedActions[index] = { ...updatedActions[index], ...updates }
    setCurrentStageActions(updatedActions)
  }

  const removeAction = (index: number) => {
    setCurrentStageActions(currentStageActions.filter((_, i) => i !== index))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setStages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex).map((stage, index) => ({
          ...stage,
          order: index,
        }))
      })
    }
  }

  const handleEditStage = (index: number) => {
    const stage = stages[index]
    setCurrentStageName(stage.name)
    setCurrentStageDescription(stage.description)
    setCurrentStageDuration(stage.estimatedDuration)
    setCurrentStageActions([...stage.actions])
    setCurrentStageLocationIds(stage.assignedLocationIds || [])
    setEditingStageIndex(index)
    setCurrentStep("adding-stage")
  }

  const saveEditedStage = () => {
    if (editingStageIndex !== null) {
      updateStage(editingStageIndex, {
        name: currentStageName,
        description: currentStageDescription,
        estimatedDuration: currentStageDuration,
        actions: currentStageActions,
        assignedLocationIds: currentStageLocationIds,
      })
      setEditingStageIndex(null)
    } else {
      addStage()
    }
  }

  const handleSave = async () => {
    try {
      await onSave({
        name: workflowName,
        description: workflowDescription,
        stages: stages.map((stage, index) => ({
          id: stage.id,
          name: stage.name,
          description: stage.description,
          order: index,
          actions: stage.actions.map(action => ({
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
      })
      router.push("/admin/workflows")
    } catch (error) {
      console.error("Error saving workflow:", error)
    }
  }

  const canGoBack = currentStep !== "welcome"
  const canGoForward = (currentStep === "welcome") || 
                      (currentStep === "naming" && workflowName.trim()) ||
                      (currentStep === "adding-stage" && currentStageName.trim()) ||
                      (currentStep === "stage-actions") ||
                      (currentStep === "canvas") ||
                      (currentStep === "review")

  const getBackStep = () => {
    switch (currentStep) {
      case "naming": return "welcome"
      case "adding-stage": return "naming"
      case "stage-actions": return "adding-stage"
      case "canvas": return "stage-actions"
      case "review": return "canvas"
      default: return "welcome"
    }
  }

  const getNextStep = () => {
    switch (currentStep) {
      case "welcome": return "naming"
      case "naming": return "adding-stage"
      case "adding-stage": return "stage-actions"
      case "stage-actions": return "canvas"
      case "canvas": return "review"
      case "review": return "canvas"
      default: return "welcome"
    }
  }

  const handleNext = () => {
    if (currentStep === "stage-actions") {
      saveEditedStage()
    } else if (currentStep === "review") {
      handleSave()
    } else {
      setCurrentStep(getNextStep())
    }
  }

  const handleBack = () => {
    setCurrentStep(getBackStep())
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-8 max-w-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <Play className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Build Your Workflow
              </h1>
              <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
                Create powerful production workflows with our intuitive builder. 
                Design your process step by step, then watch it come to life.
              </p>
            </div>
          </div>
        )

      case "naming":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-2xl space-y-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="workflow-name" className="text-2xl font-medium">
                    Workflow Name
                  </Label>
                  <Input
                    id="workflow-name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="e.g., Jeans Production, Quality Control"
                    className="mt-3 text-xl h-16 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="workflow-description" className="text-2xl font-medium">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="workflow-description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Brief description of your production process..."
                    className="mt-3 text-lg"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case "adding-stage":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-3xl space-y-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="stage-name" className="text-2xl font-medium">
                    Stage Name
                  </Label>
                  <Input
                    id="stage-name"
                    value={currentStageName}
                    onChange={(e) => setCurrentStageName(e.target.value)}
                    placeholder="e.g., Cutting, Sewing, Quality Check"
                    className="mt-3 text-xl h-16 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stage-description" className="text-2xl font-medium">
                    What happens in this stage?
                  </Label>
                  <Textarea
                    id="stage-description"
                    value={currentStageDescription}
                    onChange={(e) => setCurrentStageDescription(e.target.value)}
                    placeholder="Describe what workers do in this stage..."
                    className="mt-3 text-lg"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="stage-duration" className="text-2xl font-medium">
                    How long should this take? (minutes)
                  </Label>
                  <Input
                    id="stage-duration"
                    type="number"
                    value={currentStageDuration}
                    onChange={(e) => setCurrentStageDuration(Number(e.target.value))}
                    className="mt-3 text-xl h-16 text-lg"
                    min="1"
                  />
                </div>

                {locations && (
                  <div>
                    <Label htmlFor="stage-locations" className="text-2xl font-medium">
                      Assign Locations (Optional)
                    </Label>
                    <p className="text-gray-600 mt-2 mb-3">
                      Select locations where items in this stage will be stored
                    </p>
                    <div className="space-y-2">
                      {locations.map((location) => (
                        <div key={location._id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`location-${location._id}`}
                            checked={currentStageLocationIds.includes(location._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentStageLocationIds([...currentStageLocationIds, location._id])
                              } else {
                                setCurrentStageLocationIds(currentStageLocationIds.filter(id => id !== location._id))
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`location-${location._id}`} className="text-lg cursor-pointer">
                            {location.name} ({location.type})
                          </label>
                        </div>
                      ))}
                      {locations.length === 0 && (
                        <p className="text-gray-500 italic">
                          No locations available. Create locations first in the Locations page.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "stage-actions":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-6xl space-y-8">
              {/* Action Type Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {actionTypes.map((actionType) => (
                  <Card 
                    key={actionType.value}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                    onClick={() => addAction(actionType.value)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${actionType.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                        <actionType.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{actionType.label}</h3>
                      <p className="text-gray-600 text-sm">{actionType.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Current Actions */}
              {currentStageActions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Current Actions</h2>
                  <div className="space-y-4">
                    {currentStageActions.map((action, index) => {
                      const actionType = actionTypes.find(type => type.value === action.type)
                      const IconComponent = actionType?.icon || Settings
                      
                      return (
                        <Card key={action.id} className="border-0 shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${actionType?.color} rounded-full flex items-center justify-center`}>
                                  <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <Input
                                    value={action.label}
                                    onChange={(e) => updateAction(index, { label: e.target.value })}
                                    className="font-bold text-xl border-0 p-0 focus-visible:ring-0"
                                    placeholder="Action name"
                                  />
                                  <p className="text-gray-600">{actionType?.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant={action.required ? "default" : "secondary"} className="text-sm">
                                  {action.required ? "Required" : "Optional"}
                                </Badge>
                                <Button
                                  onClick={() => updateAction(index, { required: !action.required })}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Settings className="w-5 h-5" />
                                </Button>
                                <Button
                                  onClick={() => removeAction(index)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                >
                                  <X className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case "canvas":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-6xl">
              {/* Workflow Canvas */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 min-h-[500px]">
                {stages.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900">No stages yet</h3>
                      <p className="text-gray-600">Add your first stage to start building</p>
                    </div>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={stages.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                      <div className="flex items-center justify-center gap-8 flex-wrap">
                        {stages.map((stage, index) => (
                          <SortableStageCard
                            key={stage.id}
                            stage={stage}
                            index={index}
                            onClick={() => handleEditStage(index)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </div>
        )

      case "review":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-4xl space-y-8">
              <Card className="shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-3xl">{workflowName}</CardTitle>
                  {workflowDescription && (
                    <p className="text-gray-600 text-lg">{workflowDescription}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {stages.map((stage, index) => (
                      <div key={stage.id} className="border-l-4 border-blue-500 pl-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-xl">{stage.name}</h4>
                            <p className="text-gray-600 text-lg">{stage.description}</p>
                            <p className="text-gray-600">
                              {stage.estimatedDuration} minutes • {stage.actions.length} actions
                            </p>
                          </div>
                          <Badge variant="outline" className="text-lg px-3 py-1">{index + 1}</Badge>
                        </div>
                        {stage.actions.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {stage.actions.map((action) => {
                              const actionType = actionTypes.find(type => type.value === action.type)
                              return (
                                <Badge key={action.id} variant="secondary" className="text-sm">
                                  {actionType?.label}
                                </Badge>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }



  return (
    <div className="flex flex-col h-screen">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden pb-24">
        <div className="h-full">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Sticky Footer - ALWAYS VISIBLE */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Button 
              onClick={handleBack}
              variant="outline"
              size="lg"
              disabled={!canGoBack}
              className="px-8"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-4">
              {currentStep === "canvas" && (
                <>
                  <Button 
                    onClick={() => setCurrentStep("adding-stage")} 
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Stage
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep("review")} 
                    size="lg"
                    className="px-8"
                  >
                    Finish Workflow
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </Button>
                </>
              )}
              
              {currentStep !== "canvas" && (
                <Button 
                  onClick={handleNext}
                  disabled={!canGoForward}
                  size="lg"
                  className="px-8"
                >
                  {currentStep === "stage-actions" ? "Add Stage" : 
                   currentStep === "review" ? "Create Workflow" : "Next"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 