import type { Stage } from "@/types/schema"
import { StageBadge } from "./stage-badge"
import { ArrowRight } from "lucide-react"

interface StageGraphProps {
  stages: Stage[]
  className?: string
}

export function StageGraph({ stages, className }: StageGraphProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 ${className}`}>
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
          <StageBadge stage={stage} />
          {index < stages.length - 1 && <ArrowRight className="w-4 h-4 text-gray-400" />}
        </div>
      ))}
    </div>
  )
}
