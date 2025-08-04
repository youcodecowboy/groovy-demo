"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Item, Workflow } from "@/types/schema"
import {
    Target,
    TrendingUp,
    AlertTriangle,
    CheckCircle, Zap
} from "lucide-react"

interface CapacityTrackerProps {
  items: Item[]
  workflows: Workflow[]
}

export function CapacityTracker({ items, workflows }: CapacityTrackerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week")
  const [selectedWorkflow, setSelectedWorkflow] = useState("all")

  // Calculate capacity metrics
  const capacityMetrics = useMemo(() => {
    const activeItems = items.filter(item => item.status === "active")
    const completedItems = items.filter(item => item.status === "completed")
    
    // Calculate items by workflow
    const itemsByWorkflow = activeItems.reduce((acc, item) => {
      acc[item.workflowId] = (acc[item.workflowId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate capacity utilization
    const totalCapacity = 100 // Assuming 100% capacity
    const currentUtilization = Math.min((activeItems.length / 50) * 100, 100) // Assuming max 50 items
    
    // Calculate efficiency by workflow
    const workflowEfficiency = workflows.map(workflow => {
      const workflowItems = activeItems.filter(item => item.workflowId === workflow.id)
      const workflowCompleted = completedItems.filter(item => item.workflowId === workflow.id)
      
      const efficiency = workflowCompleted.length > 0 
        ? Math.round((workflowCompleted.length / (workflowItems.length + workflowCompleted.length)) * 100)
        : 0

      return {
        id: workflow.id,
        name: workflow.name,
        activeItems: workflowItems.length,
        completedItems: workflowCompleted.length,
        efficiency,
        utilization: Math.min((workflowItems.length / 10) * 100, 100) // Assuming max 10 items per workflow
      }
    })

    // Calculate bottleneck stages
    const stageCounts = activeItems.reduce((acc, item) => {
      acc[item.currentStageId] = (acc[item.currentStageId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const bottlenecks = Object.entries(stageCounts)
      .filter(([_, count]) => count > 3) // Stages with more than 3 items
      .map(([stageId, count]) => {
        const workflow = workflows.find(w => w.stages.some(s => s.id === stageId))
        const stage = workflow?.stages.find(s => s.id === stageId)
        return {
          stageId,
          stageName: stage?.name || "Unknown Stage",
          count,
          workflowName: workflow?.name || "Unknown Workflow"
        }
      })
      .sort((a, b) => b.count - a.count)

    return {
      totalActive: activeItems.length,
      totalCompleted: completedItems.length,
      currentUtilization,
      workflowEfficiency,
      bottlenecks,
      itemsByWorkflow
    }
  }, [items, workflows])

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">Capacity Tracker</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Workflows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              {workflows.map(workflow => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Capacity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Capacity Utilization</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(capacityMetrics.currentUtilization)}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress value={capacityMetrics.currentUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Items</p>
                <p className="text-2xl font-bold text-green-600">{capacityMetrics.totalActive}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{capacityMetrics.totalCompleted}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bottlenecks</p>
                <p className="text-2xl font-bold text-amber-600">{capacityMetrics.bottlenecks.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Efficiency */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Workflow Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capacityMetrics.workflowEfficiency.map(workflow => (
              <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">{workflow.name}</p>
                    <p className="text-sm text-gray-600">
                      {workflow.activeItems} active, {workflow.completedItems} completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{workflow.efficiency}%</p>
                    <p className="text-xs text-gray-600">Efficiency</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{Math.round(workflow.utilization)}%</p>
                    <p className="text-xs text-gray-600">Utilization</p>
                  </div>
                  <Progress value={workflow.utilization} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks */}
      {capacityMetrics.bottlenecks.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Production Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {capacityMetrics.bottlenecks.slice(0, 5).map(bottleneck => (
                <div key={bottleneck.stageId} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{bottleneck.stageName}</p>
                    <p className="text-sm text-gray-600">{bottleneck.workflowName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      {bottleneck.count} items
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 