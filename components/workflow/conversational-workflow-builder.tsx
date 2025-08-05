"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ActionConfigurator } from "./action-configurator"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
    Plus,
    Settings,
    Trash2,
    Save,
    Clock,
    Factory,
    Package,
    Play,
    Pause,
    Zap,
    Workflow,
    Edit3,
    Eye,
    Scissors,
    Droplets,
    Sun,
    Truck, ArrowRight,
    ArrowLeft,
    CheckCircle,
    Camera,
    FileText,
    ScanLine,
    Ruler,
    ZoomIn,
    ZoomOut
} from "lucide-react"

interface WorkflowStage {
  id: string
  name: string
  description: string
  order: number
  actions: WorkflowAction[]
  estimatedDuration: number
  isActive: boolean
  assignedLocationIds?: string[]
  color?: string
  allowedNextStageIds?: string[]
  position?: { x: number; y: number }
  locationId?: string
  assignedUserId?: string
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

// Action type configurations
const actionTypes = [
  { 
    type: "scan", 
    label: "QR/Barcode Scan", 
    icon: ScanLine,
    description: "Scan codes to advance",
    color: "bg-blue-500",
    details: "Requires scanning a QR code or barcode to proceed"
  },
  { 
    type: "photo", 
    label: "Photo Capture", 
    icon: Camera,
    description: "Take photos for documentation",
    color: "bg-green-500",
    details: "Capture photos for quality documentation"
  },
  { 
    type: "note", 
    label: "Text Note", 
    icon: FileText,
    description: "Add notes or comments",
    color: "bg-purple-500",
    details: "Add text notes or comments about the item"
  },
  { 
    type: "approval", 
    label: "Approval Required", 
    icon: CheckCircle,
    description: "Require supervisor approval",
    color: "bg-orange-500",
    details: "Requires supervisor approval to proceed"
  },
  { 
    type: "measurement", 
    label: "Measurement", 
    icon: Ruler,
    description: "Record measurements",
    color: "bg-indigo-500",
    details: "Record specific measurements or dimensions"
  },
  { 
    type: "inspection", 
    label: "Quality Inspection", 
    icon: Eye,
    description: "Quality check and inspection",
    color: "bg-red-500",
    details: "Perform quality inspection and checks"
  }
]

export function ConversationalWorkflowBuilder({ onSave }: ConversationalWorkflowBuilderProps) {
  const [currentStep, setCurrentStep] = useState<"name" | "stages" | "canvas">("name")
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [stages, setStages] = useState<WorkflowStage[]>([])
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [canvasZoom, setCanvasZoom] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Fetch real data from database
  const locations = useQuery(api.locations.getActive) || []
  const users = useQuery(api.users.getActive) || []

  const calculateStagePosition = (index: number, totalStages: number) => {
    // Calculate positions in a grid pattern to avoid overlap
    const cols = Math.ceil(Math.sqrt(totalStages))
    const rows = Math.ceil(totalStages / cols)
    
    const col = index % cols
    const row = Math.floor(index / cols)
    
    // Center the grid and add spacing
    const centerX = 400
    const centerY = 300
    const spacing = 350
    
    return {
      x: centerX + (col - (cols - 1) / 2) * spacing,
      y: centerY + (row - (rows - 1) / 2) * spacing
    }
  }

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
    if (name.includes("assembly")) return "#6366f1";
    if (name.includes("inspection")) return "#8b5cf6";
    return "#6b7280";
  }

  const getStageIcon = (stageName: string) => {
    const name = stageName.toLowerCase();
    if (name.includes("cut")) return Scissors;
    if (name.includes("sew")) return Package;
    if (name.includes("wash")) return Droplets;
    if (name.includes("qc") || name.includes("quality")) return Eye;
    if (name.includes("pack")) return Package;
    if (name.includes("dry")) return Sun;
    if (name.includes("press")) return Zap;
    if (name.includes("ship")) return Truck;
    if (name.includes("assembly")) return Settings;
    if (name.includes("inspection")) return Eye;
    return Factory;
  }

  const addStage = () => {
    const newStage: WorkflowStage = {
      id: `stage-${Date.now()}`,
      name: `Stage ${stages.length + 1}`,
      description: "",
      actions: [],
      order: stages.length,
      estimatedDuration: 15,
      isActive: true,
      color: "#6b7280",
      allowedNextStageIds: [],
      position: calculateStagePosition(stages.length, stages.length + 1),
    }
    setStages([...stages, newStage])
    setSelectedStageIndex(stages.length)
    setCurrentStep("stages")
  }

  const updateStage = (index: number, updates: Partial<WorkflowStage>) => {
    const updatedStages = [...stages]
    updatedStages[index] = { ...updatedStages[index], ...updates }
    setStages(updatedStages)
  }

  const removeStage = (index: number) => {
    const updatedStages = stages.filter((_, i) => i !== index)
    setStages(updatedStages.map((stage, i) => ({ ...stage, order: i })))
    
    if (selectedStageIndex === index) {
      setSelectedStageIndex(updatedStages.length > 0 ? 0 : null)
    } else if (selectedStageIndex !== null && selectedStageIndex > index) {
      setSelectedStageIndex(selectedStageIndex - 1)
    }
  }

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current.getBoundingClientRect()
    const stage = stages[index]
    const position = stage.position || { x: 0, y: 0 }
    
    setDragOffset({
      x: e.clientX - canvas.left - position.x,
      y: e.clientY - canvas.top - position.y
    })
    setIsDragging(true)
    setSelectedStageIndex(index)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return
    
    const canvas = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - canvas.left - dragOffset.x
    const newY = e.clientY - canvas.top - dragOffset.y
    
    if (selectedStageIndex !== null) {
      updateStage(selectedStageIndex, { position: { x: newX, y: newY } })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const addAction = (stageIndex: number, actionType: string) => {
    const stage = stages[stageIndex]
    const actionConfig = actionTypes.find(a => a.type === actionType)
    const newAction: WorkflowAction = {
      id: `action-${Date.now()}`,
      type: actionType as any,
      label: actionConfig?.label || "New Action",
      required: false,
      description: actionConfig?.details,
    }
    updateStage(stageIndex, {
      actions: [...stage.actions, newAction],
    })
  }

  const updateAction = (stageIndex: number, actionIndex: number, updates: Partial<WorkflowAction>) => {
    const stage = stages[stageIndex]
    const updatedActions = [...stage.actions]
    updatedActions[actionIndex] = { ...updatedActions[actionIndex], ...updates }
    updateStage(stageIndex, { actions: updatedActions })
  }

  const removeAction = (stageIndex: number, actionIndex: number) => {
    const stage = stages[stageIndex]
    const updatedActions = stage.actions.filter((_, i) => i !== actionIndex)
    updateStage(stageIndex, { actions: updatedActions })
  }

  const handleSave = () => {
    if (!workflowName.trim()) {
      alert("Please enter a workflow name")
      return
    }

    if (stages.length === 0) {
      alert("Please add at least one stage")
      return
    }

    const workflowData = {
      name: workflowName.trim(),
      description: workflowDescription.trim(),
      stages: stages.map((stage, index) => ({
        ...stage,
        order: index,
      })),
    }

    onSave(workflowData)
  }

  const selectedStage = selectedStageIndex !== null ? stages[selectedStageIndex] : null

  // Step 1: Name the Workflow
  if (currentStep === "name") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Workflow className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Name Your Workflow</CardTitle>
            <p className="text-gray-600">Let's start by giving your workflow a name</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Workflow Name</Label>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g., Shirt Production Workflow"
                className="mt-2 h-12 text-lg"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Description (Optional)</Label>
              <Textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep("stages")}
                disabled={!workflowName.trim()}
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: Configure Stages
  if (currentStep === "stages" && selectedStage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Configure Stage</CardTitle>
                <p className="text-gray-600">Set up the details for this stage</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep("canvas")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Canvas
                </Button>
                <Button 
                  onClick={() => setCurrentStep("canvas")}
                  disabled={!selectedStage.name.trim()}
                >
                  Save Stage
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Stage Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">What is this stage called?</Label>
                <Input
                  value={selectedStage.name}
                  onChange={(e) => updateStage(selectedStageIndex!, { name: e.target.value })}
                  placeholder="e.g., Cutting, Sewing, Quality Check"
                  className="mt-2 h-12"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">How long does this stage take? (minutes)</Label>
                <Input
                  type="number"
                  value={selectedStage.estimatedDuration || 15}
                  onChange={(e) => updateStage(selectedStageIndex!, { estimatedDuration: parseInt(e.target.value) || 15 })}
                  className="mt-2 h-12"
                  min="1"
                  max="480"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Where does this stage happen?</Label>
                <Select
                  value={selectedStage.locationId || ""}
                  onValueChange={(value) => updateStage(selectedStageIndex!, { locationId: value })}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc._id} value={loc._id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Who is responsible for this stage?</Label>
                <Select
                  value={selectedStage.assignedUserId || ""}
                  onValueChange={(value) => updateStage(selectedStageIndex!, { assignedUserId: value })}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">What happens at this stage?</Label>
              <Textarea
                value={selectedStage.description || ""}
                onChange={(e) => updateStage(selectedStageIndex!, { description: e.target.value })}
                placeholder="Describe what happens at this stage..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Action Types */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-4 block">What data do you want to collect at this stage?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actionTypes.map((actionType) => {
                  const Icon = actionType.icon
                  const isSelected = selectedStage.actions.some(a => a.type === actionType.type)
                  
                  return (
                    <Card 
                      key={actionType.type}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          // Remove action
                          const actionIndex = selectedStage.actions.findIndex(a => a.type === actionType.type)
                          if (actionIndex !== -1) {
                            removeAction(selectedStageIndex!, actionIndex)
                          }
                        } else {
                          // Add action
                          addAction(selectedStageIndex!, actionType.type)
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${actionType.color}`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{actionType.label}</h4>
                            <p className="text-sm text-gray-600">{actionType.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Selected Actions Summary */}
            {selectedStage.actions.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Selected Actions:</Label>
                <div className="space-y-3">
                  {selectedStage.actions.map((action, actionIndex) => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                          {actionTypes.find(t => t.type === action.type)?.icon && 
                            React.createElement(actionTypes.find(t => t.type === action.type)!.icon, { className: "w-4 h-4 text-blue-600" })
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.label}</p>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeAction(selectedStageIndex!, actionIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">Stage Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedStage.name || "Not set"}</p>
                  <p><span className="font-medium">Duration:</span> {selectedStage.estimatedDuration || 15} minutes</p>
                  <p><span className="font-medium">Location:</span> {locations.find(loc => loc._id === selectedStage.locationId)?.name || "Not set"}</p>
                  <p><span className="font-medium">Responsible:</span> {users.find(user => user._id === selectedStage.assignedUserId)?.name || "Not assigned"}</p>
                  <p><span className="font-medium">Actions:</span> {selectedStage.actions.length} selected</p>
                  {selectedStage.description && (
                    <p><span className="font-medium">Description:</span> {selectedStage.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 3: Canvas View
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Workflow className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workflowName || "Untitled Workflow"}</h1>
              <p className="text-gray-600">{workflowDescription || "Design your production workflow"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} size="lg" disabled={!workflowName.trim() || stages.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Configuration */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Workflow Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Workflow Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Describe this workflow..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stage Configuration */}
            {selectedStage && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
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
                    <Label className="text-sm font-medium text-gray-700">Duration (min)</Label>
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
                    <Label className="text-sm font-medium text-gray-700">Color</Label>
                    <Select
                      value={selectedStage.color || "#6b7280"}
                      onValueChange={(value) => updateStage(selectedStageIndex!, { color: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#ef4444">Red (Cutting)</SelectItem>
                        <SelectItem value="#f97316">Orange (Sewing)</SelectItem>
                        <SelectItem value="#3b82f6">Blue (Washing)</SelectItem>
                        <SelectItem value="#8b5cf6">Purple (QC)</SelectItem>
                        <SelectItem value="#10b981">Green (Packaging)</SelectItem>
                        <SelectItem value="#f59e0b">Yellow (Drying)</SelectItem>
                        <SelectItem value="#06b6d4">Cyan (Shipping)</SelectItem>
                        <SelectItem value="#6366f1">Indigo (Assembly)</SelectItem>
                        <SelectItem value="#6b7280">Gray (Default)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-700">Actions</Label>
                      <Button onClick={() => setCurrentStep("stages")} size="sm" variant="outline">
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
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
                        <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
                          <Settings className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm">No actions</p>
                          <Button 
                            onClick={() => setCurrentStep("stages")} 
                            size="sm" 
                            variant="outline" 
                            className="mt-2"
                          >
                            Add Actions
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          {/* Canvas Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white p-2 rounded-lg shadow-lg">
            <Button onClick={addStage} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
            <div className="w-px h-6 bg-gray-300"></div>
            <Button 
              onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.1))} 
              size="sm" 
              variant="outline"
              disabled={canvasZoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {Math.round(canvasZoom * 100)}%
            </span>
            <Button 
              onClick={() => setCanvasZoom(Math.min(2, canvasZoom + 0.1))} 
              size="sm" 
              variant="outline"
              disabled={canvasZoom >= 2}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Canvas */}
          <div 
            ref={canvasRef}
            className="w-full h-full relative"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e5e7eb 2px, transparent 2px)', 
              backgroundSize: '40px 40px',
              transform: `scale(${canvasZoom})`,
              transformOrigin: '0 0'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {stages.map((stage, index) => 
                stage.allowedNextStageIds?.map((targetName, connectionIndex) => {
                  const targetStage = stages.find(s => s.name === targetName)
                  if (!targetStage || !stage.position || !targetStage.position) return null
                  
                  const isConnected = stage.allowedNextStageIds?.includes(targetStage.name)
                  
                  return (
                    <line
                      key={`${index}-${connectionIndex}`}
                      x1={stage.position.x + 150}
                      y1={stage.position.y + 75}
                      x2={targetStage.position.x + 150}
                      y2={targetStage.position.y + 75}
                      stroke={isConnected ? "#10b981" : "#6b7280"}
                      strokeWidth="3"
                      markerEnd="url(#arrowhead)"
                    />
                  )
                })
              )}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                </marker>
              </defs>
            </svg>

            {/* Stage Cards */}
            {stages.map((stage, index) => {
              const StageIcon = getStageIcon(stage.name)
              const position = stage.position || calculateStagePosition(index, stages.length)
              
              return (
                <div
                  key={index}
                  className={`absolute cursor-move transition-all duration-200 ${
                    selectedStageIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{ 
                    left: position.x, 
                    top: position.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => {
                    handleMouseDown(index, e)
                  }}
                  onMouseUp={() => {
                  }}
                >
                  <Card className="w-80 border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      {/* Step Number */}
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      
                      {/* Stage Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${stage.color}20` }}
                        >
                          <StageIcon className="w-6 h-6" style={{ color: stage.color }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{stage.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={stage.isActive ? "default" : "secondary"} className="text-xs">
                              {stage.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {stage.estimatedDuration || 15}m
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStage(index, { isActive: !stage.isActive })
                            }}
                            size="sm"
                            variant="ghost"
                            className={stage.isActive ? "text-green-600" : "text-gray-400"}
                          >
                            {stage.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeStage(index)
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Stage Description */}
                      {stage.description && (
                        <p className="text-sm text-gray-600 mb-4">{stage.description}</p>
                      )}

                      {/* Stage Location & Responsible Person */}
                      <div className="space-y-2 mb-4">
                        {stage.locationId && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-medium">📍 Location:</span>
                            <span>{locations.find(loc => loc._id === stage.locationId)?.name || "Not set"}</span>
                          </div>
                        )}
                        {stage.assignedUserId && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-medium">👤 Responsible:</span>
                            <span>{users.find(user => user._id === stage.assignedUserId)?.name || "Not assigned"}</span>
                          </div>
                        )}
                      </div>

                      {/* Stage Actions */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">Actions ({stage.actions.length})</span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedStageIndex(index)
                              setCurrentStep("stages")
                            }}
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        
                        {stage.actions.slice(0, 3).map((action, actionIndex) => (
                          <div key={action.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: action.required ? '#ef4444' : '#6b7280' }} />
                            <span className="flex-1 truncate">{action.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {action.type}
                            </Badge>
                          </div>
                        ))}
                        
                        {stage.actions.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{stage.actions.length - 3} more actions
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}

            {/* Empty State */}
            {stages.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Factory className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Workflow</h3>
                  <p className="text-gray-600 mb-6">Add stages to create your production workflow</p>
                  <Button onClick={addStage} size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add First Stage
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 