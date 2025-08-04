import { Badge } from "@/components/ui/badge"
import type { Stage } from "@/types/schema"

interface KPIChipsProps {
  itemsByStage: Record<string, number>
  stages: Stage[]
}

export function KPIChips({ itemsByStage, stages }: KPIChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {stages.map((stage) => (
        <Badge key={stage.id} variant="outline" className="px-3 py-1" style={{ borderColor: stage.color }}>
          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: stage.color }} />
          {stage.name}: {itemsByStage[stage.id] || 0}
        </Badge>
      ))}
    </div>
  )
}
