"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    ArrowLeft,
    ArrowRight,
    Plus,
    Settings,
    Play,
    CheckCircle,
    Camera,
    ScanLine,
    FileText,
    Eye,
    Ruler,
    Clock,
    Trash2
} from "lucide-react"

interface WorkflowStage {
  id: string
  name: string
  description?: string
  order: number
  actions: WorkflowAction[]
  estimatedDuration: number
  isActive: boolean
}

interface WorkflowAction {
  id: string
  type: "scan" | "photo" | "note" | "approval" | "measurement" | "inspection"
  label: string
  required: boolean
}

interface SimpleWorkflowBuilderProps {
  onSave: (workflow: { name: string; description?: string; stages: WorkflowStage[] }) => void
}

const actionTypes = [
  { 
    value: "scan", 
    label: "QR/Barcode Scan", 
    icon: ScanLine,
    description: "Scan codes to advance"
  },
  { 
    value: "photo", 
    label: "Photo Capture", 
    icon: Camera,
    description: "Take photos for documentation"
  },
  { 
    value: "note", 
    label: "Text Note", 
    icon: FileText,
    description: "Add notes or comments"
  },
  { 
    value: "approval", 
    label: "Approval Required", 
    icon: CheckCircle,
    description: "Require supervisor approval"
  },
  { 
    value: "measurement", 
    label: "Measurement", 
    icon: Ruler,
    description: "Record measurements"
  },
  { 
    value: "inspection", 
    label: "Inspection", 
    icon: Eye,
    description: "Complete inspection checklist"
  },
]

export function SimpleWorkflowBuilder({ onSave }: SimpleWorkflowBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [stages, setStages] = useState<WorkflowStage[]>([])
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null)

  const steps = [
    { title: "Workflow Basics", description: "Name and describe your workflow" },
    { title: "Add Stages", description: "Define your production stages" },
    { title: "Configure Actions", description: "Add actions to each stage" },
    { title: "Review & Save", description: "Review your workflow and save" },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const addStage = () => {
    const newStage: WorkflowStage = {
      id: `stage-${Date.now()}`,
      name: `Stage ${stages.length + 1}`,
      description: "",
      order: stages.length,
      actions: [],
      estimatedDuration: 15,
      isActive: true,
    }
    setStages([...stages, newStage])
    setSelectedStageIndex(stages.length)
  }

  const updateStage = (index: number, updates: Partial<WorkflowStage>) => {
    const updatedStages = [...stages]
    updatedStages[index] = { ...updatedStages[index], ...updates }
    setStages(updatedStages)
  }

  const addAction = (stageIndex: number) => {
    const newAction: WorkflowAction = {
      id: `action-${Date.now()}`,
      type: "scan",
      label: "New Action",
      required: true,
    }
    const updatedStages = [...stages]
    updatedStages[stageIndex].actions.push(newAction)
    setStages(updatedStages)
  }

  const updateAction = (stageIndex: number, actionIndex: number, updates: Partial<WorkflowAction>) => {
    const updatedStages = [...stages]
    updatedStages[stageIndex].actions[actionIndex] = { 
      ...updatedStages[stageIndex].actions[actionIndex], 
      ...updates 
    }
    setStages(updatedStages)
  }

  const removeAction = (stageIndex: number, actionIndex: number) => {
    const updatedStages = [...stages]
    updatedStages[stageIndex].actions.splice(actionIndex, 1)
    setStages(updatedStages)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = () => {
    onSave({
      name: workflowName,
      description: workflowDescription,
      stages: stages,
    })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="workflow-name" className="text-lg font-medium">
                What's your workflow called?
              </Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g., Jeans Production, Quality Control"
                className="mt-2 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="workflow-description" className="text-lg font-medium">
                Describe what this workflow does
              </Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Brief description of your production process..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Production Stages</h3>
              <Button onClick={addStage} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Stage
              </Button>
            </div>
            
            {stages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stages yet</h3>
                <p className="text-gray-600 mb-4">Add your first production stage to get started</p>
                <Button onClick={addStage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Stage
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <Card 
                    key={stage.id}
                    className={`cursor-pointer transition-all ${
                      selectedStageIndex === index ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedStageIndex(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Input
                            value={stage.name}
                            onChange={(e) => updateStage(index, { name: e.target.value })}
                            className="font-medium text-lg border-0 p-0 focus-visible:ring-0"
                            placeholder="Stage name"
                          />
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <Input
                                type="number"
                                value={stage.estimatedDuration}
                                onChange={(e) => updateStage(index, { estimatedDuration: Number(e.target.value) })}
                                className="w-16 h-6 text-sm border-0 p-0 focus-visible:ring-0"
                                min="1"
                              />
                              <span>minutes</span>
                            </div>
                            <Badge variant="outline">
                              {stage.actions.length} actions
                            </Badge>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-300">
                          {index + 1}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Configure Stage Actions</h3>
            
            {selectedStageIndex !== null && stages[selectedStageIndex] ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{stages[selectedStageIndex].name}</h4>
                  <Button onClick={() => addAction(selectedStageIndex)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Action
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {stages[selectedStageIndex].actions.map((action, actionIndex) => {
                    const actionType = actionTypes.find(type => type.value === action.type)
                    const IconComponent = actionType?.icon || Settings
                    
                    return (
                      <Card key={action.id} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <IconComponent className="w-5 h-5 text-gray-600" />
                              <div className="flex-1">
                                <Input
                                  value={action.label}
                                  onChange={(e) => updateAction(selectedStageIndex, actionIndex, { label: e.target.value })}
                                  className="font-medium border-0 p-0 focus-visible:ring-0"
                                  placeholder="Action name"
                                />
                                <p className="text-sm text-gray-600">{actionType?.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={action.required ? "default" : "secondary"}>
                                {action.required ? "Required" : "Optional"}
                              </Badge>
                              <Button
                                onClick={() => updateAction(selectedStageIndex, actionIndex, { required: !action.required })}
                                size="sm"
                                variant="ghost"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => removeAction(selectedStageIndex, actionIndex)}
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                
                {stages[selectedStageIndex].actions.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No actions configured yet</p>
                    <p className="text-sm text-gray-500">Add actions to define what happens in this stage</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Stage</h3>
                <p className="text-gray-600">Click on a stage above to configure its actions</p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Your Workflow</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>{workflowName}</CardTitle>
                <p className="text-gray-600">{workflowDescription}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{stage.name}</h4>
                          <p className="text-sm text-gray-600">
                            {stage.estimatedDuration} minutes • {stage.actions.length} actions
                          </p>
                        </div>
                        <Badge variant="outline">{index + 1}</Badge>
                      </div>
                      {stage.actions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Progress */}
      <div className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Create Workflow</h1>
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{steps[currentStep].title}</span>
              <span className="text-gray-600">{steps[currentStep].description}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-8 p-6 overflow-hidden">
        {/* Left Panel - Step Content */}
        <div className="overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Right Panel - Live Preview */}
        <div className="bg-gray-50 rounded-xl p-6 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Workflow Preview</h3>
          
          {workflowName && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-lg">{workflowName}</h4>
                {workflowDescription && (
                  <p className="text-gray-600 text-sm mt-1">{workflowDescription}</p>
                )}
              </div>
              
              {stages.length > 0 && (
                <div className="space-y-3">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{stage.name}</h5>
                        <Badge variant="outline">{index + 1}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{stage.estimatedDuration}m</span>
                        <span>{stage.actions.length} actions</span>
                      </div>
                      {stage.actions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
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
                    </div>
                  ))}
                </div>
              )}
              
              {stages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Play className="w-8 h-8 mx-auto mb-2" />
                  <p>Add stages to see preview</p>
                </div>
              )}
            </div>
          )}
          
          {!workflowName && (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-8 h-8 mx-auto mb-2" />
              <p>Start building to see preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer Navigation */}
      <div className="border-t bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              ) : (
                <Button onClick={nextStep} disabled={
                  (currentStep === 0 && !workflowName) ||
                  (currentStep === 1 && stages.length === 0)
                }>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 