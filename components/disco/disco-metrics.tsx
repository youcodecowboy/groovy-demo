"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface DiscoMetricsProps {
  teamId: string
}

export function DiscoMetrics({ teamId }: DiscoMetricsProps) {
  // Mock data - will be replaced with real data from Convex
  const getTeamMetrics = (teamId: string) => {
    const baseMetrics = {
      today: {
        completed: Math.floor(Math.random() * 50) + 20,
        inProgress: Math.floor(Math.random() * 15) + 5,
        onTime: Math.floor(Math.random() * 20) + 15,
        late: Math.floor(Math.random() * 5) + 1,
        efficiency: Math.floor(Math.random() * 20) + 80,
      },
      week7: {
        completed: Math.floor(Math.random() * 300) + 150,
        inProgress: Math.floor(Math.random() * 50) + 20,
        onTime: Math.floor(Math.random() * 120) + 80,
        late: Math.floor(Math.random() * 20) + 5,
        efficiency: Math.floor(Math.random() * 15) + 75,
      },
      month30: {
        completed: Math.floor(Math.random() * 1200) + 600,
        inProgress: Math.floor(Math.random() * 100) + 50,
        onTime: Math.floor(Math.random() * 500) + 300,
        late: Math.floor(Math.random() * 50) + 20,
        efficiency: Math.floor(Math.random() * 10) + 70,
      },
    }

    return baseMetrics
  }

  const metrics = getTeamMetrics(teamId)

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
              <span className="font-bold text-lg">{metrics.today.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-medium">{metrics.today.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Efficiency</span>
              <Badge variant="outline" className={`${teamColors.accent} ${teamColors.text} border-0`}>
                {metrics.today.efficiency}%
              </Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{metrics.today.onTime}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{metrics.today.late}</span>
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
              <span className="font-bold text-lg">{metrics.week7.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-medium">{metrics.week7.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Efficiency</span>
              <Badge variant="outline" className={`${teamColors.accent} ${teamColors.text} border-0`}>
                {metrics.week7.efficiency}%
              </Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{metrics.week7.onTime}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{metrics.week7.late}</span>
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
              <span className="font-bold text-lg">{metrics.month30.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-medium">{metrics.month30.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Efficiency</span>
              <Badge variant="outline" className={`${teamColors.accent} ${teamColors.text} border-0`}>
                {metrics.month30.efficiency}%
              </Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{metrics.month30.onTime}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{metrics.month30.late}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
