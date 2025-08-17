"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Activity, 
  TrendingUp, 
  Clock,
  Users,
  Package,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

interface AnalyticsDashboardProps {
  items: any[]
  completedItems: any[]
  workflows: any[]
  users: any[]
  activityLog: any[]
  scans: any[]
}

export function AnalyticsDashboard({
  items,
  completedItems,
  workflows,
  users,
  activityLog,
  scans
}: AnalyticsDashboardProps) {
  // Calculate analytics data
  const totalItems = items?.length || 0
  const completedItemsCount = completedItems?.length || 0
  const activeItems = items?.filter(item => item.status === 'active').length || 0
  const defectiveItems = items?.filter(item => item.isDefective).length || 0
  
  // Workflow performance
  const workflowStats = workflows?.map(workflow => {
    const workflowItems = items?.filter(item => item.workflowId === workflow._id) || []
    const completedWorkflowItems = completedItems?.filter(item => item.workflowId === workflow._id) || []
    const completionRate = workflowItems.length > 0 ? (completedWorkflowItems.length / workflowItems.length) * 100 : 0
    
    return {
      name: workflow.name,
      total: workflowItems.length,
      completed: completedWorkflowItems.length,
      completionRate: completionRate
    }
  }) || []

  // User performance
  const userStats = users?.map(user => {
    const userItems = items?.filter(item => item.assignedTo === user._id) || []
    const completedUserItems = completedItems?.filter(item => item.assignedTo === user._id) || []
    const completionRate = userItems.length > 0 ? (completedUserItems.length / userItems.length) * 100 : 0
    
    return {
      name: user.name,
      total: userItems.length,
      completed: completedUserItems.length,
      completionRate: completionRate
    }
  }) || []

  // Recent activity summary
  const recentActivity = activityLog?.slice(0, 5) || []

  // Scan success rate
  const totalScans = scans?.length || 0
  const successfulScans = scans?.filter(scan => scan.success).length || 0
  const scanSuccessRate = totalScans > 0 ? (successfulScans / totalScans) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Production Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {activeItems} active, {completedItemsCount} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalItems > 0 ? ((completedItemsCount / totalItems) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedItemsCount} of {totalItems} items completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalItems > 0 ? (((totalItems - defectiveItems) / totalItems) * 100).toFixed(1) : 100}%
            </div>
            <p className="text-xs text-muted-foreground">
              {defectiveItems} defective items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scan Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulScans} of {totalScans} scans successful
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Workflow Performance
            </CardTitle>
            <CardDescription>
              Completion rates by workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowStats.map((workflow, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{workflow.name}</span>
                    <Badge variant="secondary">{workflow.completionRate.toFixed(1)}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(workflow.completionRate, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workflow.completed} of {workflow.total} items completed
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance
            </CardTitle>
            <CardDescription>
              Individual completion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats.slice(0, 5).map((user, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{user.name}</span>
                    <Badge variant="secondary">{user.completionRate.toFixed(1)}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(user.completionRate, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user.completed} of {user.total} items completed
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest system activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.entityType}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Production */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Daily Production Trends
            </CardTitle>
            <CardDescription>
              Items completed per day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[12, 15, 8, 20, 18, 25, 22].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(value / 25) * 200}px` }}
                  ></div>
                  <span className="text-xs text-muted-foreground mt-2">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </CardContent>
        </Card>

        {/* Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Quality Distribution
            </CardTitle>
            <CardDescription>
              Item status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-sm font-medium">{completedItemsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Active</span>
                </div>
                <span className="text-sm font-medium">{activeItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Defective</span>
                </div>
                <span className="text-sm font-medium">{defectiveItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Other</span>
                </div>
                <span className="text-sm font-medium">{totalItems - completedItemsCount - activeItems - defectiveItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
