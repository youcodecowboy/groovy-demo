import { Badge } from "@/components/ui/badge"
import type { Stage } from "@/types/schema"

interface StageBadgeProps {
  stage: Stage
  className?: string
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  return (
    <Badge
      className={className}
      style={{
        backgroundColor: stage.color,
        color: "white",
        border: "none",
      }}
    >
      {stage.name}
      {stage.requiredScan && " 🔒"}
    </Badge>
  )
}
