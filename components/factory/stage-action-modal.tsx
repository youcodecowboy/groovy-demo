"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { QRScanner } from "@/components/ui/qr-scanner"
import type { Item, Workflow, StageAction } from "@/types/schema"
import { Camera, FileText, Ruler, CheckSquare, ThumbsUp, QrCode, Clock, AlertCircle, CheckCircle2 } from "lucide-react"

interface StageActionModalProps {
  item: Item
  workflow: Workflow
  isOpen: boolean
  onClose: () => void
  onComplete: (completedActions: any[]) => void
  onScanLog?: (scanData: any) => Promise<void>
}

interface ActionState {
  [actionId: string]: {
    completed: boolean
    data?: any
  }
}

const actionIcons = {
  scan: QrCode,
  photo: Camera,
  note: FileText,
  measurement: Ruler,
  inspection: CheckSquare,
  approval: ThumbsUp,
}

export function StageActionModal({ item, workflow, isOpen, onClose, onComplete, onScanLog }: StageActionModalProps) {
  const [actionStates, setActionStates] = useState<ActionState>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [currentScanAction, setCurrentScanAction] = useState<StageAction | null>(null)

  const currentStage = workflow.stages.find((s) => s.id === item.currentStageId)
  const nextStages = currentStage ? workflow.stages.filter((s) => currentStage.allowedNextStageIds.includes(s.id)) : []
  const nextStage = nextStages[0]

  if (!currentStage || !nextStage) {
    return null
  }

  const requiredActions = nextStage.actions.filter((action) => action.required)
  const optionalActions = nextStage.actions.filter((action) => !action.required)

  const updateActionState = (actionId: string, completed: boolean, data?: any) => {
    setActionStates((prev) => ({
      ...prev,
      [actionId]: { completed, data },
    }))
  }

  const renderActionInput = (action: StageAction) => {
    const state = actionStates[action.id]
    const IconComponent = actionIcons[action.type]

    switch (action.type) {
      case "scan":
        return (
          <div className="space-y-2">
            <Input
              placeholder="Scan or enter code manually"
              value={state?.data || ""}
              onChange={(e) => updateActionState(action.id, !!e.target.value, e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCurrentScanAction(action)
                setShowScanner(true)
              }}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan Now
            </Button>
          </div>
        )

      case "photo":
        const photoCount = action.config?.photoCount || 1
        const currentPhotos = state?.data?.length || 0
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Photos: {currentPhotos}/{photoCount}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Simulate photo capture
                  const newPhotos = [...(state?.data || []), `photo-${Date.now()}.jpg`]
                  updateActionState(action.id, newPhotos.length >= photoCount, newPhotos)
                }}
                disabled={currentPhotos >= photoCount}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
            {state?.data?.map((photo: string, index: number) => (
              <div key={index} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                📸 {photo}
              </div>
            ))}
          </div>
        )

      case "note":
        return (
          <Textarea
            placeholder={action.config?.notePrompt || "Enter notes..."}
            value={state?.data || ""}
            onChange={(e) => updateActionState(action.id, !!e.target.value.trim(), e.target.value)}
            rows={3}
          />
        )

      case "measurement":
        const unit = action.config?.measurementUnit || "units"
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter measurement"
              value={state?.data || ""}
              onChange={(e) => updateActionState(action.id, !!e.target.value, e.target.value)}
            />
            <span className="flex items-center px-3 text-sm text-gray-600 bg-gray-50 rounded">{unit}</span>
          </div>
        )

      case "inspection":
        const checklist = action.config?.inspectionChecklist || []
        const checkedItems = state?.data || []
        return (
          <div className="space-y-2">
            {checklist.map((item: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${action.id}-${index}`}
                  checked={checkedItems.includes(item)}
                  onCheckedChange={(checked) => {
                    const newChecked = checked
                      ? [...checkedItems, item]
                      : checkedItems.filter((i: string) => i !== item)
                    updateActionState(action.id, newChecked.length === checklist.length, newChecked)
                  }}
                />
                <label htmlFor={`${action.id}-${index}`} className="text-sm">
                  {item}
                </label>
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-2">
              {checkedItems.length}/{checklist.length} items checked
            </div>
          </div>
        )

      case "approval":
        return (
          <Button
            variant={state?.completed ? "default" : "outline"}
            onClick={() =>
              updateActionState(action.id, !state?.completed, {
                approvedBy: "current-user",
                approvedAt: new Date().toISOString(),
              })
            }
            className="w-full"
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            {state?.completed ? "Approved ✓" : "Click to Approve"}
          </Button>
        )

      case "photo":
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {state?.completed ? "Photo captured ✓" : "Click to capture photo"}
              </p>
            </div>
            <Button
              variant={state?.completed ? "default" : "outline"}
              onClick={() =>
                updateActionState(action.id, !state?.completed, {
                  photoCount: action.config?.photoCount || 1,
                  photoQuality: action.config?.photoQuality || "medium",
                  capturedAt: new Date().toISOString(),
                })
              }
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              {state?.completed ? "Photo Captured ✓" : "Capture Photo"}
            </Button>
          </div>
        )

      default:
        return (
          <Input
            placeholder="Complete this action"
            value={state?.data || ""}
            onChange={(e) => updateActionState(action.id, !!e.target.value, e.target.value)}
          />
        )
    }
  }

  const allRequiredCompleted = requiredActions.every((action) => actionStates[action.id]?.completed)
  const completedCount = requiredActions.filter((action) => actionStates[action.id]?.completed).length

  const handleComplete = async () => {
    if (!allRequiredCompleted) return

    setIsSubmitting(true)
    try {
      const completedActions = Object.entries(actionStates)
        .filter(([_, state]) => state.completed)
        .map(([actionId, state]) => {
          // Find the action definition to get the type and label
          const action = [...requiredActions, ...optionalActions].find(a => a.id === actionId)
          return {
            actionId,
            type: action?.type || "unknown",
            label: action?.label || "Unknown Action",
            data: state.data,
            completedAt: new Date().toISOString(),
            completedBy: "current-user",
          }
        })

      await onComplete(completedActions)
    } catch (error) {
      console.error("Failed to complete actions:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleScanResult = (qrData: string) => {
    if (currentScanAction) {
      updateActionState(currentScanAction.id, true, qrData)
      setShowScanner(false)
      setCurrentScanAction(null)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Advance Item: {item.sku}
            </DialogTitle>
            <div className="text-sm text-gray-600">
              Moving from <strong>{currentStage.name}</strong> to <strong>{nextStage.name}</strong>
            </div>
          </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <Card className="border-0 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {completedCount}/{requiredActions.length} required actions completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / requiredActions.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Required Actions */}
          {requiredActions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Required Actions
              </h3>
              {requiredActions.map((action) => {
                const IconComponent = actionIcons[action.type]
                const isCompleted = actionStates[action.id]?.completed

                return (
                  <Card
                    key={action.id}
                    className={`border-2 ${isCompleted ? "border-green-200 bg-green-50" : "border-gray-200"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${isCompleted ? "bg-green-100" : "bg-gray-100"}`}>
                          <IconComponent className={`w-4 h-4 ${isCompleted ? "text-green-600" : "text-gray-600"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{action.label}</span>
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </div>
                          <Badge variant={action.required ? "destructive" : "secondary"} className="text-xs mt-1">
                            {action.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      </div>
                      {renderActionInput(action)}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Optional Actions */}
          {optionalActions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                Optional Actions
              </h3>
              {optionalActions.map((action) => {
                const IconComponent = actionIcons[action.type]
                const isCompleted = actionStates[action.id]?.completed

                return (
                  <Card
                    key={action.id}
                    className={`border ${isCompleted ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${isCompleted ? "bg-blue-100" : "bg-gray-100"}`}>
                          <IconComponent className={`w-4 h-4 ${isCompleted ? "text-blue-600" : "text-gray-600"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{action.label}</span>
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Optional
                          </Badge>
                        </div>
                      </div>
                      {renderActionInput(action)}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={!allRequiredCompleted || isSubmitting} className="flex-1">
              {isSubmitting ? "Processing..." : `Complete & Advance to ${nextStage.name}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* QR Scanner Modal */}
    <Dialog open={showScanner} onOpenChange={setShowScanner}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
          <div className="text-sm text-gray-600">
            {currentScanAction?.label || "Scan required QR code"}
          </div>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4">
          <QRScanner 
            onScan={handleScanResult}
            userId="floor@demo"
            stageId={currentStage?.id}
            workflowId={workflow.id}
            onScanLog={onScanLog}
          />
          
          <Button 
            variant="outline" 
            onClick={() => setShowScanner(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
