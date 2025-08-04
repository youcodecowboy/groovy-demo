"use client"

import type { Item, Workflow } from "@/types/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StageBadge } from "./stage-badge"
import { Badge } from "@/components/ui/badge"

interface ItemPanelProps {
  item: Item
  workflow: Workflow
  onAdvance: (toStageId: string, scanToken?: string) => void
  scanToken?: string
}

export function ItemPanel({ item, workflow, onAdvance, scanToken }: ItemPanelProps) {
  const currentStage = workflow.stages.find((s) => s.id === item.currentStageId)
  const nextStages = currentStage ? workflow.stages.filter((s) => currentStage.allowedNextStageIds.includes(s.id)) : []

  if (!currentStage) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-red-600">Error: Current stage not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{item.sku}</span>
          <Badge variant="outline">{item.id}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Current Stage:</p>
          <StageBadge stage={currentStage} />
        </div>

        {nextStages.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Available Actions:</p>
            <div className="space-y-2">
              {nextStages.map((stage) => {
                const canAdvance = !stage.requiredScan || scanToken
                return (
                  <Button
                    key={stage.id}
                    onClick={() => onAdvance(stage.id, scanToken)}
                    disabled={!canAdvance}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Move to {stage.name}
                    {stage.requiredScan && !scanToken && " (Scan Required)"}
                    {stage.requiredScan && scanToken && " ✓"}
                  </Button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Badge variant="secondary">At Terminal Stage</Badge>
            <p className="text-sm text-gray-600 mt-2">No further actions available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
