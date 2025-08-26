"use client"

import React, { useState, useEffect } from "react"
import { Globe, Play, Square, Pause, RotateCcw, Zap, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react"
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

  // Convex hooks
  const chaosStatus = useQuery(api.chaosMode.getChaosStatus)
  const startChaosMode = useMutation(api.chaosMode.startChaosMode)
  const stopChaosMode = useMutation(api.chaosMode.stopChaosMode)
  const pauseChaosMode = useMutation(api.chaosMode.pauseChaosMode)
  const resumeChaosMode = useMutation(api.chaosMode.resumeChaosMode)
  const testFireAllFunctions = useMutation(api.chaosMode.testFireAllFunctions)

  const isActive = chaosStatus?.isActive || false
  const mode = chaosStatus?.mode || "stopped"
  const uptime = chaosStatus?.uptime || 0
  const errorCount = chaosStatus?.errorCount || 0
  const testFireProgress = chaosStatus?.control?.testFireProgress

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

  // Get mode badge variant
  const getModeVariant = (mode: string) => {
    switch (mode) {
      case "full-chaos": return "destructive"
      case "test-fire": return "default"
      case "paused": return "secondary"
      default: return "outline"
    }
  }

  // Get mode display text
  const getModeText = (mode: string) => {
    switch (mode) {
      case "full-chaos": return "ACTIVE"
      case "test-fire": return "TEST FIRE"
      case "paused": return "PAUSED"
      default: return "INACTIVE"
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

  // Handle pause chaos mode
  const handlePause = async () => {
    try {
      await pauseChaosMode()
    } catch (error) {
      console.error("Failed to pause chaos mode:", error)
    }
  }

  // Handle resume chaos mode
  const handleResume = async () => {
    try {
      await resumeChaosMode()
    } catch (error) {
      console.error("Failed to resume chaos mode:", error)
    }
  }

  // Handle test fire
  const handleTestFire = async () => {
    try {
      await testFireAllFunctions()
    } catch (error) {
      console.error("Failed to run test fire:", error)
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
        {isActive && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Hidden control panel */}
      <Collapsible open={isVisible}>
        <CollapsibleContent className="absolute top-12 right-0 z-50">
          <Card className="w-96 shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Chaos Mode</CardTitle>
                <Badge variant={getModeVariant(mode)} className="px-2 py-1">
                  {getModeText(mode)}
                </Badge>
              </div>
              <CardDescription>
                Automated testing system for comprehensive validation
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Control Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleStart} 
                  disabled={isActive || isStarting}
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
                {mode === "paused" ? (
                  <Button 
                    onClick={handleResume} 
                    disabled={!isActive}
                    variant="outline"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                ) : (
                  <Button 
                    onClick={handlePause} 
                    disabled={!isActive || mode === "test-fire"}
                    variant="outline"
                    size="sm"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
              </div>

              {/* Test Fire Button */}
              <Button 
                onClick={handleTestFire} 
                disabled={isActive}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Fire All Functions
              </Button>

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
                  <div className="text-muted-foreground">Orders</div>
                  <div className="font-medium">
                    {chaosStatus?.orders?.length || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Items</div>
                  <div className="font-medium">
                    {chaosStatus?.orders?.reduce((total, order) => total + order.totalItems, 0) || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Errors</div>
                  <div className="font-medium flex items-center">
                    {errorCount > 0 ? (
                      <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    )}
                    {errorCount}
                  </div>
                </div>
              </div>

              {/* Test Fire Progress */}
              {testFireProgress && !testFireProgress.isCompleted && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Test Fire Progress</span>
                      <span className="text-muted-foreground">
                        {testFireProgress.completedTests.length}/{testFireProgress.totalTests}
                      </span>
                    </div>
                    <Progress 
                      value={(testFireProgress.completedTests.length / testFireProgress.totalTests) * 100} 
                    />
                    <div className="text-xs text-muted-foreground">
                      Current: {testFireProgress.currentTest}
                    </div>
                  </div>
                </>
              )}

              {/* Test Fire Results */}
              {testFireProgress?.isCompleted && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Test Fire Results</div>
                    {testFireProgress.errors.length > 0 ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {testFireProgress.errors.length} test(s) failed
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          All tests passed successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}

              {/* Error Log Preview */}
              {chaosStatus?.errors && chaosStatus.errors.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recent Errors</div>
                    <ScrollArea className="max-h-24">
                      <div className="space-y-1">
                        {chaosStatus.errors.slice(0, 3).map((error, index) => (
                          <div key={index} className="text-xs p-2 bg-red-50 text-red-700 rounded border">
                            <div className="font-medium">{error.category}</div>
                            <div className="truncate">{error.message}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {chaosStatus.errors.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{chaosStatus.errors.length - 3} more errors
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Activity Feed Preview */}
              {chaosStatus?.activity && chaosStatus.activity.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      Recent Activity
                    </div>
                    <ScrollArea className="max-h-24">
                      <div className="space-y-1">
                        {chaosStatus.activity.slice(0, 3).map((activity, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-50 rounded border">
                            <div className="font-medium">{activity.action}</div>
                            <div className="text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {chaosStatus.activity.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{chaosStatus.activity.length - 3} more activities
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Orders Progress */}
              {chaosStatus?.orders && chaosStatus.orders.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Active Orders</div>
                    <div className="space-y-2">
                      {chaosStatus.orders.map((order, index) => (
                        <div key={index} className="text-xs p-2 bg-blue-50 rounded border">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{order.poNumber}</div>
                            <Badge variant="outline" className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {order.completedItems}/{order.totalItems} items completed
                          </div>
                          <Progress 
                            value={(order.completedItems / order.totalItems) * 100} 
                            className="h-1 mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Chaos Mode creates realistic factory simulation for comprehensive testing
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}