import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Stage } from "@/types/schema"

interface StageCardProps {
  stage: Stage
  count: number
  className?: string
}

export function StageCard({ stage, count, className }: StageCardProps) {
  return (
    <Card className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: stage.color }} />
            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
          </div>
          {stage.actions.some((action) => action.required) && (
            <Badge variant="secondary" className="text-xs">
              Actions Required
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{count}</div>
          <div className="text-sm text-gray-600">Current Items</div>
          {stage.description && <div className="text-xs text-gray-500 mt-2">{stage.description}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
