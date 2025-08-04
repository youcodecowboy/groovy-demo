"use client"

import { useState, useEffect } from "react"
import type { Item, Stage } from "@/types/schema"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"

interface ItemTimerProps {
  item: Item
  stage: Stage | null
  className?: string
}

export function ItemTimer({ item, stage, className }: ItemTimerProps) {
  const [timeInStage, setTimeInStage] = useState<number>(0)

  useEffect(() => {
    const updateTimer = () => {
      if (item.status !== "active" || !item.history.length) {
        setTimeInStage(0)
        return
      }

      // Get the last history entry (when item entered current stage)
      const lastEntry = item.history[item.history.length - 1]
      const stageEntryTime = new Date(lastEntry.at).getTime()
      const now = Date.now()
      const hoursInStage = (now - stageEntryTime) / (1000 * 60 * 60)

      setTimeInStage(hoursInStage)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [item])

  if (item.status !== "active" || !stage) {
    return null
  }

  // Define expected time thresholds (in hours)
  const expectedTime = 8 // 8 hours expected per stage
  const atRiskThreshold = expectedTime * 0.8 // 80% of expected time
  const lateThreshold = expectedTime * 1.2 // 120% of expected time

  const getStatus = () => {
    if (timeInStage >= lateThreshold) {
      return { label: "Late", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle }
    } else if (timeInStage >= atRiskThreshold) {
      return { label: "At Risk", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertTriangle }
    } else {
      return { label: "On Time", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle }
    }
  }

  const formatTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60)
      return `${minutes}m`
    } else if (hours < 24) {
      const wholeHours = Math.floor(hours)
      const minutes = Math.floor((hours - wholeHours) * 60)
      return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = Math.floor(hours % 24)
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
    }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}
      >
        <StatusIcon className="w-3 h-3" />
        {status.label}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <Clock className="w-3 h-3" />
        {formatTime(timeInStage)}
      </div>
    </div>
  )
}
