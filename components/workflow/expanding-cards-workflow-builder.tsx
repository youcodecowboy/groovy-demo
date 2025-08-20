"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Check, 
  X, 
  Save, 
  ArrowLeft,
  Settings,
  Users,
  Bell,
  Clock,
  AlertTriangle,
  Workflow,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { StageConfigurationCard } from "./stage-configuration-card"
import { WorkflowLibrary } from "./workflow-library"
import { toast } from "sonner"

interface WorkflowStage {
  id: string
  name: string
  description?: string
  order: number
  actions?: any[]
  estimatedDuration?: number
  isActive: boolean
  allowedNextStageIds?: string[]
  assignedLocationIds?: string[]
  color?: string
  responsibleTeam?: string
  notifications?: string[]
  conditionalRules?: any[]
  canCompleteOutOfOrder?: boolean
}

interface WorkflowData {
  name: string
  description?: string
  stages: WorkflowStage[]
}

interface ExpandingCardsWorkflowBuilderProps {
  onSave: (workflowData: WorkflowData) => Promise<void>
  initialData?: WorkflowData | null
  isLoading?: boolean
}

export function ExpandingCardsWorkflowBuilder({ 
  onSave, 
  initialData, 
  isLoading = false 
}: ExpandingCardsWorkflowBuilderProps) {
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    name: "",
    description: "",
    stages: []
  })
  
  const [currentView, setCurrentView] = useState<"builder" | "library">("builder")
  const [expandedStageIndex, setExpandedStageIndex] = useState<number | null>(null)
  const [isAddingStage, setIsAddingStage] = useState(false)

  // Initialize with existing data if editing
  useEffect(() => {
    if (initialData) {
      setWorkflowData(initialData)
    }
  }, [initialData])

  const handleWorkflowInfoChange = (field: keyof WorkflowData, value: string) => {
    setWorkflowData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addStage = () => {
    const newStage: WorkflowStage = {
      id: `stage-${Date.now()}`,
      name: "",
      description: "",
      order: workflowData.stages.length,
      actions: [],
      isActive: true,
      responsibleTeam: "",
      notifications: [],
      conditionalRules: [],
      canCompleteOutOfOrder: false
    }

    setWorkflowData(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }))

    setExpandedStageIndex(workflowData.stages.length)
    setIsAddingStage(true)
  }

  const updateStage = (index: number, updatedStage: WorkflowStage) => {
    setWorkflowData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...updatedStage, order: index } : stage
      )
    }))
  }

  const removeStage = (index: number) => {
    setWorkflowData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }))
    
    if (expandedStageIndex === index) {
      setExpandedStageIndex(null)
    } else if (expandedStageIndex !== null && expandedStageIndex > index) {
      setExpandedStageIndex(expandedStageIndex - 1)
    }
  }

  const handleStageComplete = (index: number) => {
    setExpandedStageIndex(null)
    setIsAddingStage(false)
    toast.success(`Stage ${index + 1} configured successfully!`)
  }

  const handleSave = async () => {
    if (!workflowData.name.trim()) {
      toast.error("Please enter a workflow name")
      return
    }

    if (workflowData.stages.length === 0) {
      toast.error("Please add at least one stage")
      return
    }

    // Validate all stages have names
    const invalidStages = workflowData.stages.filter(stage => !stage.name.trim())
    if (invalidStages.length > 0) {
      toast.error("All stages must have names")
      return
    }

    await onSave(workflowData)
  }

  const toggleStageExpansion = (index: number) => {
    if (expandedStageIndex === index) {
      setExpandedStageIndex(null)
      setIsAddingStage(false)
    } else {
      setExpandedStageIndex(index)
      setIsAddingStage(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView(currentView === "builder" ? "library" : "builder")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentView === "builder" ? "Workflow Library" : "Back to Builder"}
            </Button>
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                {currentView === "builder" ? "Workflow Builder" : "Workflow Library"}
              </h1>
            </div>
          </div>
          
          {currentView === "builder" && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentView("library")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Library
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || !workflowData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Workflow"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {currentView === "builder" ? (
          <div className="space-y-8">
            {/* Workflow Header - Industrial Form Style */}
            <div className="bg-white border-2 border-gray-900 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    value={workflowData.name}
                    onChange={(e) => handleWorkflowInfoChange("name", e.target.value)}
                    placeholder="WORKFLOW NAME *"
                    className="text-2xl font-bold border-0 border-b-2 border-gray-900 rounded-none p-0 pb-1 focus:border-blue-600 focus:ring-0 placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                <div className="text-right text-sm text-gray-600 font-mono">
                  <div>DATE: {new Date().toLocaleDateString()}</div>
                  <div>FORM: WF-001</div>
                </div>
              </div>
              {workflowData.description && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <Textarea
                    value={workflowData.description}
                    onChange={(e) => handleWorkflowInfoChange("description", e.target.value)}
                    placeholder="Brief description of workflow purpose..."
                    rows={2}
                    className="text-sm border-0 resize-none focus:ring-0 p-0 placeholder:text-gray-400"
                  />
                </div>
              )}
              {!workflowData.description && (
                <button
                  onClick={() => handleWorkflowInfoChange("description", "")}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  + Add description
                </button>
              )}
            </div>

            {/* Stages Section - Industrial Form Style */}
            <div className="bg-white border-2 border-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                    Workflow Stages
                  </h2>
                </div>
                <Button
                  onClick={addStage}
                  disabled={isAddingStage}
                  className="border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white font-bold uppercase tracking-wide px-6 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stage
                </Button>
              </div>
            </div>

            {/* Stages List */}
            <div className="space-y-4">
              {workflowData.stages.map((stage, index) => (
                <div key={stage.id} className="relative">
                  {/* Stage Summary Card - Industrial Form Style */}
                  <div 
                    className={`border-2 transition-all duration-200 cursor-pointer ${
                      expandedStageIndex === index 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-gray-900 bg-white hover:border-blue-600"
                    }`}
                    onClick={() => toggleStageExpansion(index)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 uppercase tracking-wide">
                              {stage.name || `STAGE ${index + 1}`}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs font-mono text-gray-600">
                              {stage.responsibleTeam && (
                                <span>TEAM: {stage.responsibleTeam}</span>
                              )}
                              {stage.actions && stage.actions.length > 0 && (
                                <span>ACTIONS: {stage.actions.length}</span>
                              )}
                              {stage.estimatedDuration && (
                                <span>TIME: {stage.estimatedDuration}MIN</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Status Indicators */}
                          <div className="flex items-center gap-2">
                            {stage.name && (
                              <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                                ✓ NAMED
                              </span>
                            )}
                            {stage.responsibleTeam && (
                              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                                ✓ ASSIGNED
                              </span>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeStage(index)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                          >
                            ✕
                          </Button>
                          
                          <div className="text-gray-600 text-lg">
                            {expandedStageIndex === index ? "▲" : "▼"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Stage Configuration */}
                  {expandedStageIndex === index && (
                    <div className="mt-4">
                      <StageConfigurationCard
                        stage={stage}
                        stageIndex={index}
                        onUpdate={(updatedStage) => updateStage(index, updatedStage)}
                        onComplete={() => handleStageComplete(index)}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Empty State - Industrial Form Style */}
              {workflowData.stages.length === 0 && (
                <div className="bg-white border-2 border-dashed border-gray-900 p-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-900 text-white flex items-center justify-center mb-4 font-bold text-2xl">
                      S
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
                      No Stages Defined
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm font-mono">
                      WORKFLOW REQUIRES AT LEAST ONE STAGE
                    </p>
                    <Button
                      onClick={addStage}
                      className="border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white font-bold uppercase tracking-wide px-6 py-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Stage
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <WorkflowLibrary onEditWorkflow={(workflowId) => {
            // Navigate to edit mode
            window.location.href = `/app/workflows/builder2?id=${workflowId}`
          }} />
        )}
      </div>
    </div>
  )
}
