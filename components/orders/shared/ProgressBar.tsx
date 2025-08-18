"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  completed: number
  total: number
  showPercentage?: boolean
  className?: string
}

export default function ProgressBar({ 
  completed, 
  total, 
  showPercentage = true,
  className = ""
}: ProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className={`space-y-2 ${className}`}>
      <Progress value={percentage} className="h-2" />
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{completed} of {total} items</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  )
}
