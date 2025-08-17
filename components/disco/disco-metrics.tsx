"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface DiscoMetricsProps {
  teamId: string
  factoryId?: string
}

export function DiscoMetrics({ teamId, factoryId }: DiscoMetricsProps) {
  // Get real metrics from Convex
  const todayMetrics = useQuery(api.items.getTeamMetrics, { 
    teamId, 
    factoryId: factoryId as any,
    timeRange: "today" 
  })
  
  const weekMetrics = useQuery(api.items.getTeamMetrics, { 
    teamId, 
    factoryId: factoryId as any,
    timeRange: "week" 
  })
  
  const monthMetrics = useQuery(api.items.getTeamMetrics, { 
    teamId, 
    factoryId: factoryId as any,
    timeRange: "month" 
  })

  const getTeamColors = (teamId: string) => {
    const colors: Record<string, { bg: string; text: string; accent: string }> = {
      production: { bg: "bg-blue-50", text: "text-blue-700", accent: "bg-blue-100" },
      cutting: { bg: "bg-red-50", text: "text-red-700", accent: "bg-red-100" },
      sewing: { bg: "bg-orange-50", text: "text-orange-700", accent: "bg-orange-100" },
      quality: { bg: "bg-purple-50", text: "text-purple-700", accent: "bg-purple-100" },
      packaging: { bg: "bg-green-50", text: "text-green-700", accent: "bg-green-100" },
    }
    return colors[teamId] || colors.production
  }

  const teamColors = getTeamColors(teamId)

  // Loading state
  if (!todayMetrics || !weekMetrics || !monthMetrics) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Team Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Team Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today */}
        <Card className={`${teamColors.bg} border-0 shadow-sm`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${teamColors.text} flex items-center gap-2`}>
              <Clock className="w-5 h-5" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-bold text-lg">{todayMetrics.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-medium">{todayMetrics.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Efficiency</span>
              <Badge variant="outline" className={`${teamColors.accent} ${teamColors.text} border-0`}>
                {todayMetrics.efficiency}%
              </Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{todayMetrics.onTime}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{todayMetrics.late}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7 Days */}
        <Card className={`${teamColors.bg} border-0 shadow-sm`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${teamColors.text} flex items-center gap-2`}>
              <TrendingUp className="w-5 h-5" />
              7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-bold text-lg">{weekMetrics.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-medium">{weekMetrics.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Efficiency</span>
              <Badge variant="outline" className={`${teamColors.accent} ${teamColors.text} border-0`}>
                {weekMetrics.efficiency}%
              </Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{weekMetrics.onTime}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{weekMetrics.late}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 30 Days */}
        <Card className={`${teamColors.bg} border-0 shadow-sm`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${teamColors.text} flex items-center gap-2`}>
              <TrendingUp className="w-5 h-5" />
              30 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-bold text-lg">{monthMetrics.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-medium">{monthMetrics.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Efficiency</span>
              <Badge variant="outline" className={`${teamColors.accent} ${teamColors.text} border-0`}>
                {monthMetrics.efficiency}%
              </Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{monthMetrics.onTime}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{monthMetrics.late}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
