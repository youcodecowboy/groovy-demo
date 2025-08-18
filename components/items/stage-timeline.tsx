"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  CheckCircle, 
  Play,
  Pause,
  AlertTriangle,
  ArrowRight
} from "lucide-react"
import { StageBadge } from "@/components/ui/stage-badge"
import type { Stage } from "@/types/schema"

interface StageEntry {
  stage: Stage
  enteredAt: number
  exitedAt?: number
  duration?: number
  isCurrent: boolean
  isCompleted: boolean
}

interface StageTimelineProps {
  stages: Stage[]
  currentStageId: string
  stageHistory: StageEntry[]
  startTime: number
}

export function StageTimeline({ 
  stages, 
  currentStageId, 
  stageHistory, 
  startTime 
}: StageTimelineProps) {
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [timeInCurrentStage, setTimeInCurrentStage] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now()
      setCurrentTime(now)
      
      // Calculate time in current stage
      const currentStageEntry = stageHistory.find(entry => entry.isCurrent)
      if (currentStageEntry) {
        setTimeInCurrentStage(now - currentStageEntry.enteredAt)
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [stageHistory])

  const formatDuration = (durationMs: number) => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStageStatus = (stage: Stage, isCurrent: boolean, isCompleted: boolean) => {
    if (isCompleted) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    } else if (isCurrent) {
      return {
        icon: Play,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    } else {
      return {
        icon: Clock,
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
    }
  }

  const totalDuration = stageHistory.reduce((total, entry) => {
    return total + (entry.duration || 0)
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Stage Timeline
          <Badge variant="outline" className="ml-auto">
            {formatDuration(totalDuration)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Live Ticker */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Time in Current Stage</span>
              </div>
              <div className="text-lg font-mono font-bold text-blue-600">
                {formatDuration(timeInCurrentStage)}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
            
            <div className="space-y-4">
              {stageHistory.map((entry, index) => {
                const status = getStageStatus(entry.stage, entry.isCurrent, entry.isCompleted)
                const StatusIcon = status.icon
                const isLast = index === stageHistory.length - 1

                return (
                  <div key={entry.stage.id} className="relative">
                    {/* Stage Dot */}
                    <div className={`absolute left-4 w-4 h-4 rounded-full border-2 ${status.borderColor} ${status.bgColor} flex items-center justify-center z-10`}>
                      <StatusIcon className={`h-2.5 w-2.5 ${status.color}`} />
                    </div>

                    {/* Stage Content */}
                    <div className={`ml-12 p-4 rounded-lg border ${status.borderColor} ${status.bgColor}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StageBadge stage={entry.stage} />
                          {entry.isCurrent && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatTimestamp(entry.enteredAt)}
                          </div>
                          {entry.duration && (
                            <div className="text-xs text-gray-500">
                              Duration: {formatDuration(entry.duration)}
                            </div>
                          )}
                        </div>
                      </div>

                      {entry.stage.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {entry.stage.description}
                        </p>
                      )}

                      {/* Stage Actions */}
                      {entry.stage.actions && entry.stage.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.stage.actions.map((action) => (
                            <Badge key={action.id} variant="outline" className="text-xs">
                              {action.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Connector Line */}
                    {!isLast && (
                      <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Stages</div>
                <div className="font-medium">{stageHistory.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Completed</div>
                <div className="font-medium">
                  {stageHistory.filter(entry => entry.isCompleted).length}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Average Stage Time</div>
                <div className="font-medium">
                  {stageHistory.length > 0 
                    ? formatDuration(totalDuration / stageHistory.length)
                    : '0s'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-500">Current Stage</div>
                <div className="font-medium">
                  {stageHistory.findIndex(entry => entry.isCurrent) + 1} of {stageHistory.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
