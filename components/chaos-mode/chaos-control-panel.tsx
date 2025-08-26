"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Globe, 
  Play, 
  Square, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  Users,
  Package,
  MessageSquare,
  Bell,
  Loader2
} from "lucide-react"

interface ChaosControlPanelProps {
  isVisible?: boolean
  onVisibilityChange?: (visible: boolean) => void
}

export function ChaosControlPanel({ isVisible = false, onVisibilityChange }: ChaosControlPanelProps) {
  const [isOpen, setIsOpen] = useState(isVisible)
  
  // Query chaos mode status
  const chaosStatus = useQuery(api.chaosMode.getChaosStatus)
  
  // Mutations
  const startChaosMode = useMutation(api.chaosMode.startChaosMode)
  const stopChaosMode = useMutation(api.chaosMode.stopChaosMode)
  const clearDatabase = useMutation(api.chaosMode.clearDatabase)
  
  // Local state for UI
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    setIsOpen(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isOpen)
    }
  }, [isOpen, onVisibilityChange])

  const handleStart = async () => {
    setIsStarting(true)
    try {
      await startChaosMode()
    } catch (error) {
      console.error("Failed to start chaos mode:", error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleStop = async () => {
    setIsStopping(true)
    try {
      await stopChaosMode()
    } catch (error) {
      console.error("Failed to stop chaos mode:", error)
    } finally {
      setIsStopping(false)
    }
  }

  const handleClear = async () => {
    setIsClearing(true)
    try {
      await clearDatabase()
    } catch (error) {
      console.error("Failed to clear database:", error)
    } finally {
      setIsClearing(false)
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getStatusColor = (mode: string) => {
    switch (mode) {
      case "full-chaos": return "bg-red-500"
      case "test-fire": return "bg-orange-500"
      case "paused": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (mode: string) => {
    switch (mode) {
      case "full-chaos": return "FULL CHAOS"
      case "test-fire": return "TEST FIRE"
      case "paused": return "PAUSED"
      default: return "STOPPED"
    }
  }

  if (!chaosStatus) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          disabled
        >
          <Globe className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Globe className="h-5 w-5" />
            {chaosStatus.isActive && (
              <div className={`absolute -top-1 -right-1 h-3 w-3 ${getStatusColor(chaosStatus.mode)} rounded-full animate-pulse`} />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="absolute top-12 right-0 w-96 bg-white border-2 border-black rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-lg">Chaos Mode</h3>
              </div>
              <Badge 
                variant={chaosStatus.isActive ? "destructive" : "secondary"}
                className={`${chaosStatus.isActive ? 'animate-pulse' : ''}`}
              >
                {getStatusText(chaosStatus.mode)}
              </Badge>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleStart} 
                disabled={chaosStatus.isActive || isStarting}
                className="flex items-center gap-2 flex-1"
                size="sm"
              >
                {isStarting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start
              </Button>
              
              <Button 
                onClick={handleStop} 
                disabled={!chaosStatus.isActive || isStopping}
                variant="destructive"
                className="flex items-center gap-2 flex-1"
                size="sm"
              >
                {isStopping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Stop
              </Button>
              
              <Button 
                onClick={handleClear} 
                disabled={chaosStatus.isActive || isClearing}
                variant="outline"
                className="flex items-center gap-2"
                size="sm"
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Clear
              </Button>
            </div>

            {/* Test Fire Progress */}
            {chaosStatus.testFireInProgress && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Test Fire Progress</span>
                </div>
                <Progress value={chaosStatus.testFireProgress || 0} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {chaosStatus.testFireProgress || 0}% complete
                </div>
              </div>
            )}

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-medium">Uptime</div>
                  <div className="text-muted-foreground">
                    {chaosStatus.uptime ? formatUptime(chaosStatus.uptime) : "0s"}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium">Items</div>
                  <div className="text-muted-foreground">
                    {chaosStatus.totalItemsCompleted}/{chaosStatus.totalItemsCreated}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="font-medium">Scans</div>
                  <div className="text-muted-foreground">{chaosStatus.totalScans}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="font-medium">Alerts</div>
                  <div className="text-muted-foreground">{chaosStatus.totalNotifications}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-500" />
                <div>
                  <div className="font-medium">Messages</div>
                  <div className="text-muted-foreground">{chaosStatus.totalMessages}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <div className="font-medium">Errors</div>
                  <div className="text-muted-foreground">{chaosStatus.errorCount}</div>
                </div>
              </div>
            </div>

            {/* Test Fire Results */}
            {chaosStatus.testFireResults && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Test Fire Results</span>
                </div>
                <div className="text-xs space-y-1">
                  {chaosStatus.testFireResults.tests?.map((test: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{test.name}</span>
                      <span className={test.success ? "text-green-600" : "text-red-600"}>
                        {test.success ? "✓" : "✗"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Errors */}
            {chaosStatus.errors && chaosStatus.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Recent Errors</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {chaosStatus.errors.slice(0, 3).map((error: any) => (
                    <div key={error.id} className="text-xs text-red-600 bg-red-50 p-1 rounded">
                      {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Mode Description */}
            <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
              {chaosStatus.mode === "full-chaos" && "🌟 Star Wars factory simulation running - orders progressing through workflows"}
              {chaosStatus.mode === "test-fire" && "🧪 Running system validation and seeding test data"}
              {chaosStatus.mode === "paused" && "⏸️ Simulation paused - can be resumed"}
              {chaosStatus.mode === "stopped" && "🛑 Simulation stopped - click Start to begin"}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}