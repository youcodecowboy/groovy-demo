"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StageBadge } from "@/components/ui/stage-badge"
import { ItemTimer } from "./item-timer"
import type { Item, Workflow } from "@/types/schema"
import { ArrowRight, Play, Clock, AlertTriangle, CheckCircle, MessageSquare } from "lucide-react"

interface ActiveStageComponentProps {
  item: Item
  workflow: Workflow
  onAdvanceItem: () => void
  onMessageAboutItem?: (itemId: string) => void
  className?: string
}

export function ActiveStageComponent({ item, workflow, onAdvanceItem, onMessageAboutItem, className }: ActiveStageComponentProps) {
  const currentStage = workflow.stages.find((s) => s.id === item.currentStageId)
  const nextStages = currentStage ? workflow.stages.filter((s) => currentStage.allowedNextStageIds.includes(s.id)) : []
  const nextStage = nextStages[0]

  if (!currentStage) {
    return (
      <Card className={`border-0 shadow-sm bg-gray-50 ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">Stage information not available</p>
        </CardContent>
      </Card>
    )
  }

  const requiredActions = nextStage?.actions.filter((action) => action.required) || []
  const isTerminalStage = !nextStage

  return (
    <Card
      className={`border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Stage</h3>
              <p className="text-sm text-gray-600">Item location and next actions</p>
            </div>
          </div>
          <ItemTimer item={item} stage={currentStage} />
        </div>

        {/* Stage Flow */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <StageBadge stage={currentStage} />
            <span className="text-sm font-medium text-gray-900">{currentStage.name}</span>
          </div>

          {nextStage && (
            <>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">{nextStage.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Current Stage Description */}
        {currentStage.description && (
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-700">{currentStage.description}</p>
          </div>
        )}

        {/* Next Actions */}
        {!isTerminalStage && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Next: Move to {nextStage.name}</h4>

              {requiredActions.length > 0 ? (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-600">Required actions to advance:</p>
                  <div className="flex flex-wrap gap-2">
                    {requiredActions.map((action) => (
                      <Badge key={action.id} variant="outline" className="text-xs">
                        {action.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-4">No additional actions required</p>
              )}

              <div className="flex gap-2">
                <Button onClick={onAdvanceItem} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  {requiredActions.length > 0
                    ? `Complete Actions & Advance (${requiredActions.length})`
                    : "Advance to Next Stage"}
                </Button>
                {onMessageAboutItem && (
                  <Button 
                    variant="outline" 
                    onClick={() => onMessageAboutItem(item.id)}
                    className="flex-shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Terminal Stage */}
        {isTerminalStage && (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium text-gray-900">Item Complete</p>
            <p className="text-xs text-gray-600">This item has reached the final stage</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
