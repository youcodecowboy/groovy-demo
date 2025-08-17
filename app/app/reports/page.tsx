"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Download,
  RefreshCw,
  Lightbulb,
  Zap,
  Calendar,
  Filter,
  PieChart,
  Activity,
  LineChart,
  BarChart,
  Scatter,
  Gauge,
  FileText
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrg } from "@/lib/useOrg"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { ReportGenerator } from "@/components/analytics/report-generator"
import { OptimizationSuggestions } from "@/components/analytics/optimization-suggestions"
import { MetricCard } from "@/components/ui/metric-card"

export default function ReportsPage() {
  const { orgId } = useOrg()
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState("7d")

  // Fetch analytics data
  const items = useQuery(api.items.getAll, { orgId })
  const completedItems = useQuery(api.items.getCompleted, { orgId })
  const workflows = useQuery(api.workflows.getAll, { orgId })
  const users = useQuery(api.users.getAll, { orgId })
  const activityLog = useQuery(api.activity.getAllActivity, { orgId })
  const scans = useQuery(api.scans.getAllScans, { orgId })

  // Calculate key metrics
  const totalItems = items?.length || 0
  const completedItemsCount = completedItems?.length || 0
  const activeWorkflows = workflows?.filter(w => w.isActive).length || 0
  const activeUsers = users?.filter(u => u.isActive).length || 0
  const completionRate = totalItems > 0 ? (completedItemsCount / totalItems) * 100 : 0
  const avgCompletionTime = completedItems && completedItems.length > 0 
    ? completedItems.reduce((acc, item) => acc + (item.completedAt - item.startedAt), 0) / completedItems.length / (1000 * 60 * 60) // hours
    : 0

  const recentActivity = activityLog?.slice(0, 10) || []
  const recentScans = scans?.slice(0, 10) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and automated reporting for your production data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Items"
          value={totalItems}
          icon={Package}
          trend="+12%"
          trendDirection="up"
          description="Items in production"
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          icon={CheckCircle}
          trend="+5.2%"
          trendDirection="up"
          description="Success rate"
        />
        <MetricCard
          title="Avg Completion Time"
          value={`${avgCompletionTime.toFixed(1)}h`}
          icon={Clock}
          trend="-8.3%"
          trendDirection="down"
          description="Time to complete"
        />
        <MetricCard
          title="Active Users"
          value={activeUsers}
          icon={Users}
          trend="+3"
          trendDirection="up"
          description="Team members"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsDashboard 
            items={items}
            completedItems={completedItems}
            workflows={workflows}
            users={users}
            activityLog={activityLog}
            scans={scans}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportGenerator 
            items={items}
            completedItems={completedItems}
            workflows={workflows}
            users={users}
            activityLog={activityLog}
            scans={scans}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  AI-powered insights from your production data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Production Efficiency Up 15%</p>
                      <p className="text-sm text-blue-700">Your completion rate has improved significantly this month</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Quality Score: 98.5%</p>
                      <p className="text-sm text-green-700">Defect rate is below industry average</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Bottleneck Detected</p>
                      <p className="text-sm text-orange-700">Stage 3 is causing delays - consider adding resources</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Historical performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Daily Throughput</span>
                    <Badge variant="secondary">+12%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <Badge variant="secondary">+5%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Team Efficiency</span>
                    <Badge variant="secondary">+8%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <OptimizationSuggestions 
            items={items}
            completedItems={completedItems}
            workflows={workflows}
            users={users}
            activityLog={activityLog}
            scans={scans}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
