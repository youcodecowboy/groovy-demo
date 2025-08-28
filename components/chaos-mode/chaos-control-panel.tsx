"use client"

import React, { useState, useEffect } from "react"
import { Globe, Play, Square, Pause, RotateCcw, Zap, AlertTriangle, CheckCircle, Clock, Activity, Database, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

interface ChaosControlPanelProps {
  className?: string;
}

export function ChaosControlPanel({ className }: ChaosControlPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // Convex hooks
  const chaosStatus = useQuery(api.chaosMode.getChaosStatus)
  const manualSimulationStatus = useQuery(api.chaosMode.getManualSimulationStatus)
  const startChaosMode = useMutation(api.chaosMode.startChaosMode)
  const stopChaosMode = useMutation(api.chaosMode.stopChaosMode)
  const clearDatabase = useMutation(api.chaosMode.clearDatabase)
  const executeSeedScript = useMutation(api.chaosMode.executeSeedScript)
  const startManualScanSimulation = useMutation(api.chaosMode.startManualScanSimulation)
  const resetChaosModeControl = useMutation(api.chaosMode.resetChaosModeControl)

  const isActive = chaosStatus?.isActive || false
  const startTime = chaosStatus?.startTime || 0
  const isManualSimulationActive = manualSimulationStatus?.isActive || false
  const isManualSimulationCompleted = manualSimulationStatus?.currentScan === manualSimulationStatus?.totalScans && manualSimulationStatus?.totalScans > 0

  // Calculate real-time uptime
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isActive])
  
  const uptime = isActive && startTime ? currentTime - startTime : 0

  // Format uptime
  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Handle start chaos mode
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

  // Handle stop chaos mode
  const handleStop = async () => {
    try {
      await stopChaosMode()
    } catch (error) {
      console.error("Failed to stop chaos mode:", error)
    }
  }

  // Handle clear database
  const handleClearDatabase = async () => {
    try {
      await clearDatabase()
    } catch (error) {
      console.error("Failed to clear database:", error)
    }
  }

  // Handle execute seed script
  const handleExecuteSeedScript = async () => {
    setIsSeeding(true)
    try {
      const result = await executeSeedScript()
      console.log("Seed script result:", result)
    } catch (error) {
      console.error("Failed to execute seed script:", error)
    } finally {
      setIsSeeding(false)
    }
  }

  // Handle start manual scan simulation
  const handleStartManualScanSimulation = async () => {
    setIsScanning(true)
    try {
      const result = await startManualScanSimulation({
        scanCount: 20,
        intervalSeconds: 5,
      })
      console.log("Manual scan simulation result:", result)
    } catch (error) {
      console.error("Failed to start manual scan simulation:", error)
    } finally {
      setIsScanning(false)
    }
  }

  // Handle reset chaos mode control
  const handleResetControl = async () => {
    try {
      await resetChaosModeControl()
    } catch (error) {
      console.error("Failed to reset chaos mode control:", error)
    }
  }

  return (
    <div className={className}>
      {/* Globe icon trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => setIsVisible(!isVisible)}
        title="Chaos Mode Control Panel"
      >
        <Globe className="h-5 w-5" />
        {(isActive || isManualSimulationActive) && (
          <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse ${
            isActive ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
        )}
      </Button>

      {/* Hidden control panel */}
      <Collapsible open={isVisible}>
        <CollapsibleContent className="absolute top-12 right-0 z-50">
          <Card className="w-96 shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Chaos Mode</CardTitle>
                <Badge variant={isActive || isManualSimulationActive ? "destructive" : "outline"} className="px-2 py-1">
                  {isActive 
                    ? "ACTIVE" 
                    : isManualSimulationActive 
                      ? (isManualSimulationCompleted ? "COMPLETED" : "SCANNING") 
                      : "INACTIVE"
                  }
                </Badge>
              </div>
              <CardDescription>
                Step-by-step testing system for comprehensive validation
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Step 1: Seed Script */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Step 1: Seed Database</div>
                <Button 
                  onClick={handleExecuteSeedScript} 
                  disabled={isSeeding || isActive || (isManualSimulationActive && !isManualSimulationCompleted)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Database className="h-4 w-4 mr-1" />
                  {isSeeding ? "Seeding..." : "Execute Seed Script"}
                </Button>
              </div>

              {/* Step 2: Manual Scan Simulation */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Step 2: Manual Scan Simulation</div>
                <Button 
                  onClick={handleStartManualScanSimulation} 
                  disabled={isScanning || isActive || (isManualSimulationActive && !isManualSimulationCompleted)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Scan className="h-4 w-4 mr-1" />
                  {isScanning ? "Starting..." : "Start 20 Scans (5s intervals)"}
                </Button>
              </div>

              <Separator />

              {/* Full Chaos Mode */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Full Chaos Mode (Continuous)</div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleStart} 
                    disabled={isActive || isStarting || (isManualSimulationActive && !isManualSimulationCompleted)}
                    className="flex-1"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {isStarting ? "Starting..." : "Start"}
                  </Button>
                  <Button 
                    onClick={handleStop} 
                    disabled={!isActive}
                    variant="destructive"
                    size="sm"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                </div>
              </div>

              {/* Clear Database Button */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleClearDatabase} 
                  disabled={isActive || (isManualSimulationActive && !isManualSimulationCompleted)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear Database
                </Button>
                <Button 
                  onClick={handleResetControl} 
                  disabled={isActive || (isManualSimulationActive && !isManualSimulationCompleted)}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Reset Control
                </Button>
              </div>

              <Separator />

              {/* Status Display */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Uptime</div>
                  <div className="font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatUptime(uptime)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Mode</div>
                  <div className="font-medium">
                    {manualSimulationStatus?.mode || chaosStatus?.mode || "stopped"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Scan Progress</div>
                  <div className="font-medium">
                    {manualSimulationStatus?.currentScan || 0}/{manualSimulationStatus?.totalScans || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Error Count</div>
                  <div className="font-medium">
                    {chaosStatus?.errorCount || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Last Activity</div>
                  <div className="font-medium">
                    {chaosStatus?.lastActivity ? new Date(chaosStatus.lastActivity).toLocaleTimeString() : "Never"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium">
                    {isActive ? "🟢 Active" : isManualSimulationActive ? "🟡 Scanning" : "🔴 Inactive"}
                  </div>
                </div>
              </div>

              {/* Manual Simulation Status */}
              {isManualSimulationActive && (
                <Alert>
                  <Scan className="h-4 w-4" />
                  <AlertDescription>
                    {isManualSimulationCompleted 
                      ? `Manual scan simulation completed: ${manualSimulationStatus?.currentScan || 0}/${manualSimulationStatus?.totalScans || 0} scans completed`
                      : `Manual scan simulation in progress: ${manualSimulationStatus?.currentScan || 0}/${manualSimulationStatus?.totalScans || 0} scans completed`
                    }
                  </AlertDescription>
                </Alert>
              )}

              {/* Footer */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Step-by-step chaos mode for controlled testing and validation
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}






