"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Check, 
  X, 
  Users, 
  Bell, 
  Clock, 
  AlertTriangle,
  Camera,
  FileText,
  CheckSquare,
  Ruler,
  Search,
  Settings
} from "lucide-react"

interface WorkflowStage {
  id: string
  name: string
  description?: string
  order: number
  actions?: any[]
  estimatedDuration?: number
  isActive: boolean
  responsibleTeam?: string
  notifications?: string[]
  canCompleteOutOfOrder?: boolean
}

interface StageConfigurationCardProps {
  stage: WorkflowStage
  stageIndex: number
  onUpdate: (stage: WorkflowStage) => void
  onComplete: () => void
}

const actionTypes = [
  { 
    id: "scan", 
    label: "QR/Barcode Scan", 
    icon: Search, 
    short: "SCAN",
    description: "Worker must scan QR code or barcode to verify item identity and location"
  },
  { 
    id: "photo", 
    label: "Photo Documentation", 
    icon: Camera, 
    short: "PHOTO",
    description: "Worker must take photos to document process completion or quality status"
  },
  { 
    id: "note", 
    label: "Notes/Comments", 
    icon: FileText, 
    short: "NOTE",
    description: "Worker must add text notes describing any issues, observations, or special instructions"
  },
  { 
    id: "approval", 
    label: "Supervisor Approval", 
    icon: CheckSquare, 
    short: "APPROVAL",
    description: "Supervisor must review and approve before stage can be completed"
  },
  { 
    id: "measurement", 
    label: "Take Measurements", 
    icon: Ruler, 
    short: "MEASURE",
    description: "Worker must record specific measurements (dimensions, weight, etc.)"
  },
  { 
    id: "inspection", 
    label: "Quality Inspection", 
    icon: AlertTriangle, 
    short: "INSPECT",
    description: "Quality control check required - worker must verify item meets specifications"
  }
]

export function StageConfigurationCard({ 
  stage, 
  stageIndex, 
  onUpdate, 
  onComplete 
}: StageConfigurationCardProps) {
  const [localStage, setLocalStage] = useState<WorkflowStage>(stage)

  const updateStage = (updates: Partial<WorkflowStage>) => {
    const updatedStage = { ...localStage, ...updates }
    setLocalStage(updatedStage)
    onUpdate(updatedStage)
  }

  const toggleAction = (actionType: string) => {
    const hasAction = localStage.actions?.some(a => a.type === actionType)
    if (hasAction) {
      updateStage({
        actions: localStage.actions?.filter(a => a.type !== actionType) || []
      })
    } else {
      const newAction = {
        id: `action-${Date.now()}`,
        type: actionType,
        label: actionTypes.find(t => t.id === actionType)?.label || actionType,
        required: true
      }
      updateStage({
        actions: [...(localStage.actions || []), newAction]
      })
    }
  }

  const handleComplete = () => {
    if (!localStage.name.trim()) {
      alert("Please enter a stage name")
      return
    }
    onComplete()
  }

  return (
    <div className="bg-white border-2 border-gray-900 p-6">
      {/* Form Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
              {stageIndex + 1}
            </div>
            <div className="flex-1">
              <Input
                value={localStage.name}
                onChange={(e) => updateStage({ name: e.target.value })}
                placeholder={`STAGE ${stageIndex + 1} NAME *`}
                className="text-lg font-bold border-0 border-b-2 border-gray-900 rounded-none p-0 pb-1 focus:border-blue-600 focus:ring-0 placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>
          <Button
            onClick={handleComplete}
            variant="outline"
            size="sm"
            className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold"
          >
            ✓ COMPLETE
          </Button>
        </div>
      </div>

      {/* Form Body - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Basic Info Section */}
          <div className="border border-gray-300 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
              □ BASIC INFORMATION
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                  Description/Notes:
                </label>
                <Textarea
                  value={localStage.description || ""}
                  onChange={(e) => updateStage({ description: e.target.value })}
                  placeholder="Brief description of what happens in this stage..."
                  rows={3}
                  className="text-sm border border-gray-400 rounded-none resize-none focus:border-blue-600"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                    Est. Duration (min):
                  </label>
                  <Input
                    type="number"
                    value={localStage.estimatedDuration || ""}
                    onChange={(e) => updateStage({ estimatedDuration: parseInt(e.target.value) || undefined })}
                    placeholder="30"
                    className="text-sm border border-gray-400 rounded-none focus:border-blue-600"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                    Responsible Team:
                  </label>
                  <Input
                    value={localStage.responsibleTeam || ""}
                    onChange={(e) => updateStage({ responsibleTeam: e.target.value })}
                    placeholder="QC, Assembly, etc."
                    className="text-sm border border-gray-400 rounded-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Required Actions Section */}
          <div className="border border-gray-300 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
              □ REQUIRED ACTIONS
            </h3>
            
            <div className="space-y-3">
              {actionTypes.map((actionType) => {
                const isChecked = localStage.actions?.some(a => a.type === actionType.id)
                const IconComponent = actionType.icon
                return (
                  <div key={actionType.id} className="border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={actionType.id}
                        checked={isChecked}
                        onCheckedChange={() => toggleAction(actionType.id)}
                        className="border-2 border-gray-900 data-[state=checked]:bg-gray-900 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                          <Label 
                            htmlFor={actionType.id} 
                            className="text-sm font-bold text-gray-900 uppercase tracking-wide cursor-pointer"
                          >
                            {actionType.short}
                          </Label>
                          {isChecked && (
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                              ✓ REQUIRED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {actionType.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Settings Section */}
          <div className="border border-gray-300 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
              □ STAGE SETTINGS
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="stage-active"
                  checked={localStage.isActive}
                  onCheckedChange={(checked) => updateStage({ isActive: checked as boolean })}
                  className="border-2 border-gray-900 data-[state=checked]:bg-gray-900"
                />
                <Label htmlFor="stage-active" className="text-xs font-semibold text-gray-700 uppercase">
                  Stage is Active
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="out-of-order"
                  checked={localStage.canCompleteOutOfOrder || false}
                  onCheckedChange={(checked) => updateStage({ canCompleteOutOfOrder: checked as boolean })}
                  className="border-2 border-gray-900 data-[state=checked]:bg-gray-900"
                />
                <Label htmlFor="out-of-order" className="text-xs font-semibold text-gray-700 uppercase">
                  Allow Out-of-Order Completion
                </Label>
              </div>
            </div>
          </div>

          {/* Stage Summary */}
          <div className="border border-gray-300 p-4 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
              □ STAGE SUMMARY
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">STAGE:</span>
                <span className="font-mono">{localStage.name || `STAGE ${stageIndex + 1}`}</span>
              </div>
              
              {localStage.responsibleTeam && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">TEAM:</span>
                  <span className="font-mono">{localStage.responsibleTeam}</span>
                </div>
              )}
              
              {localStage.estimatedDuration && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">DURATION:</span>
                  <span className="font-mono">{localStage.estimatedDuration} MIN</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">ACTIONS:</span>
                <span className="font-mono">{localStage.actions?.length || 0} REQUIRED</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">STATUS:</span>
                <span className="font-mono">{localStage.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
