"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Workflow, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Settings,
  Eye,
  Scan,
  Camera,
  FileText
} from "lucide-react"
import { StageBadge } from "@/components/ui/stage-badge"
import { useToast } from "@/hooks/use-toast"
import type { Stage, Workflow as WorkflowType } from "@/types/schema"

interface WorkflowMiniMapProps {
  workflow: WorkflowType
  currentStageId: string
  onAdvanceItem?: (itemId: string, toStageId: string, reason: string) => Promise<void>
  itemId: string
}

export function WorkflowMiniMap({ 
  workflow, 
  currentStageId, 
  onAdvanceItem,
  itemId
}: WorkflowMiniMapProps) {
  const { toast } = useToast()
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState("")
  const [advanceReason, setAdvanceReason] = useState("")
  const [isAdvancing, setIsAdvancing] = useState(false)

  const currentStage = workflow.stages.find(stage => stage.id === currentStageId)
  const currentStageIndex = workflow.stages.findIndex(stage => stage.id === currentStageId)
  
  // Get next allowed transitions
  const nextStages = currentStage?.allowedNextStageIds.map(id => 
    workflow.stages.find(stage => stage.id === id)
  ).filter(Boolean) as Stage[]

  const handleAdvance = async () => {
    if (!selectedStageId || !advanceReason.trim()) return

    setIsAdvancing(true)
    try {
      await onAdvanceItem?.(itemId, selectedStageId, advanceReason.trim())
      setAdvanceDialogOpen(false)
      setSelectedStageId("")
      setAdvanceReason("")
      toast({
        title: "Item advanced",
        description: "Item has been advanced to the next stage",
      })
    } catch (error) {
      toast({
        title: "Advance failed",
        description: "Could not advance item to next stage",
        variant: "destructive",
      })
    } finally {
      setIsAdvancing(false)
    }
  }

  const getStageStatus = (stage: Stage) => {
    const stageIndex = workflow.stages.findIndex(s => s.id === stage.id)
    
    if (stage.id === currentStageId) {
      return {
        status: 'current',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Clock
      }
    } else if (stageIndex < currentStageIndex) {
      return {
        status: 'completed',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle
      }
    } else if (nextStages.some(s => s.id === stage.id)) {
      return {
        status: 'next',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: ArrowRight
      }
    } else {
      return {
        status: 'upcoming',
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        icon: Clock
      }
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'scan': return <Scan className="h-3 w-3" />
      case 'photo': return <Camera className="h-3 w-3" />
      case 'note': return <FileText className="h-3 w-3" />
      case 'approval': return <CheckCircle className="h-3 w-3" />
      case 'measurement': return <Settings className="h-3 w-3" />
      case 'inspection': return <Eye className="h-3 w-3" />
      default: return <Settings className="h-3 w-3" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Workflow Mini-Map
          <Badge variant="outline" className="ml-auto">
            {workflow.stages.length} stages
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stage */}
        {currentStage && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StageBadge stage={currentStage} />
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  Current
                </Badge>
              </div>
              <span className="text-sm text-gray-600">
                Stage {currentStageIndex + 1} of {workflow.stages.length}
              </span>
            </div>
            {currentStage.description && (
              <p className="text-sm text-gray-600 mb-3">{currentStage.description}</p>
            )}
            
            {/* Current Stage Actions */}
            {currentStage.actions && currentStage.actions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700">Required Actions:</div>
                <div className="flex flex-wrap gap-1">
                  {currentStage.actions.map((action) => (
                    <Badge 
                      key={action.id} 
                      variant={action.required ? "default" : "outline"}
                      className="text-xs"
                    >
                      {getActionIcon(action.type)}
                      {action.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workflow Stages */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">All Stages</h4>
            <Badge variant="outline" className="text-xs">
              {nextStages.length} next available
            </Badge>
          </div>
          
          <div className="space-y-2">
            {workflow.stages.map((stage, index) => {
              const status = getStageStatus(stage)
              const StatusIcon = status.icon
              const isNext = nextStages.some(s => s.id === stage.id)

              return (
                <div 
                  key={stage.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${status.color}`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <StatusIcon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{stage.name}</span>
                        {isNext && (
                          <Badge variant="outline" className="text-xs">
                            Next
                          </Badge>
                        )}
                      </div>
                      {stage.description && (
                        <p className="text-xs text-gray-600">{stage.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {index < workflow.stages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Next Transitions */}
        {nextStages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Next Available Transitions</h4>
            <div className="space-y-2">
              {nextStages.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-yellow-600" />
                    <StageBadge stage={stage} />
                  </div>
                  <Dialog open={advanceDialogOpen && selectedStageId === stage.id} onOpenChange={(open) => {
                    setAdvanceDialogOpen(open)
                    if (!open) {
                      setSelectedStageId("")
                      setAdvanceReason("")
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedStageId(stage.id)}
                        className="h-8"
                      >
                        Advance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Advance Item</DialogTitle>
                        <DialogDescription>
                          Advance this item to the "{stage.name}" stage. This action will be logged with your reason.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Reason for Advance</label>
                          <Textarea
                            placeholder="Enter the reason for advancing this item..."
                            value={advanceReason}
                            onChange={(e) => setAdvanceReason(e.target.value)}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setAdvanceDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAdvance}
                          disabled={!advanceReason.trim() || isAdvancing}
                        >
                          {isAdvancing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Advancing...
                            </div>
                          ) : (
                            "Advance Item"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Rules */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Workflow Rules</h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              <Scan className="h-3 w-3 mr-1" />
              Scan Required
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              QC Checkpoint
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Approval Required
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
