"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Target,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Settings,
  BarChart3,
  PieChart
} from "lucide-react"

interface OptimizationSuggestionsProps {
  items: any[]
  completedItems: any[]
  workflows: any[]
  users: any[]
  activityLog: any[]
  scans: any[]
}

const optimizationCategories = [
  {
    id: "efficiency",
    name: "Efficiency Improvements",
    icon: TrendingUp,
    color: "blue",
    priority: "high"
  },
  {
    id: "quality",
    name: "Quality Enhancements",
    icon: CheckCircle,
    color: "green",
    priority: "medium"
  },
  {
    id: "bottlenecks",
    name: "Bottleneck Resolution",
    icon: AlertTriangle,
    color: "orange",
    priority: "high"
  },
  {
    id: "workforce",
    name: "Workforce Optimization",
    icon: Users,
    color: "purple",
    priority: "medium"
  }
]

export function OptimizationSuggestions({
  items,
  completedItems,
  workflows,
  users,
  activityLog,
  scans
}: OptimizationSuggestionsProps) {
  // Calculate optimization metrics
  const totalItems = items?.length || 0
  const completedItemsCount = completedItems?.length || 0
  const activeItems = items?.filter(item => item.status === 'active').length || 0
  const defectiveItems = items?.filter(item => item.isDefective).length || 0
  
  // Workflow analysis
  const workflowStats = workflows?.map(workflow => {
    const workflowItems = items?.filter(item => item.workflowId === workflow._id) || []
    const completedWorkflowItems = completedItems?.filter(item => item.workflowId === workflow._id) || []
    const avgCompletionTime = completedWorkflowItems.length > 0 
      ? completedWorkflowItems.reduce((acc, item) => acc + (item.completedAt - item.startedAt), 0) / completedWorkflowItems.length / (1000 * 60 * 60)
      : 0
    
    return {
      name: workflow.name,
      total: workflowItems.length,
      completed: completedWorkflowItems.length,
      avgCompletionTime,
      efficiency: completedWorkflowItems.length > 0 ? (completedWorkflowItems.length / workflowItems.length) * 100 : 0
    }
  }) || []

  // User performance analysis
  const userStats = users?.map(user => {
    const userItems = items?.filter(item => item.assignedTo === user._id) || []
    const completedUserItems = completedItems?.filter(item => item.assignedTo === user._id) || []
    const avgCompletionTime = completedUserItems.length > 0 
      ? completedUserItems.reduce((acc, item) => acc + (item.completedAt - item.startedAt), 0) / completedUserItems.length / (1000 * 60 * 60)
      : 0
    
    return {
      name: user.name,
      total: userItems.length,
      completed: completedUserItems.length,
      avgCompletionTime,
      efficiency: userItems.length > 0 ? (completedUserItems.length / userItems.length) * 100 : 0
    }
  }) || []

  // Generate optimization suggestions
  const suggestions = [
    {
      id: 1,
      category: "efficiency",
      title: "Optimize Workflow Stage 3",
      description: "Stage 3 shows 40% slower completion times compared to other stages. Consider adding additional resources or process improvements.",
      impact: "high",
      effort: "medium",
      estimatedImprovement: "25% faster completion",
      status: "pending"
    },
    {
      id: 2,
      category: "quality",
      title: "Implement Quality Checkpoints",
      description: "Adding quality checkpoints at stages 2 and 4 could reduce defect rate by up to 30%.",
      impact: "high",
      effort: "low",
      estimatedImprovement: "30% fewer defects",
      status: "pending"
    },
    {
      id: 3,
      category: "workforce",
      title: "Balance Team Workload",
      description: "Team A is handling 60% of items while Team B is at 40%. Redistributing workload could improve overall efficiency.",
      impact: "medium",
      effort: "low",
      estimatedImprovement: "15% efficiency gain",
      status: "pending"
    },
    {
      id: 4,
      category: "bottlenecks",
      title: "Add Parallel Processing",
      description: "Stage 2 can be split into parallel sub-stages, reducing wait times by up to 50%.",
      impact: "high",
      effort: "high",
      estimatedImprovement: "50% faster processing",
      status: "pending"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50"
      case "medium": return "text-orange-600 bg-orange-50"
      case "low": return "text-green-600 bg-green-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-500"
      case "medium": return "bg-orange-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalItems > 0 ? ((completedItemsCount / totalItems) * 100).toFixed(1) : 0}%
            </div>
            <Progress value={totalItems > 0 ? (completedItemsCount / totalItems) * 100 : 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: 95%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalItems > 0 ? (((totalItems - defectiveItems) / totalItems) * 100).toFixed(1) : 100}%
            </div>
            <Progress value={totalItems > 0 ? ((totalItems - defectiveItems) / totalItems) * 100 : 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: 98%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedItemsCount > 0 
                ? (completedItems.reduce((acc, item) => acc + (item.completedAt - item.startedAt), 0) / completedItemsCount / (1000 * 60 * 60)).toFixed(1)
                : 0}h
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Target: 4h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              +12% this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Powered Optimization Suggestions
          </CardTitle>
          <CardDescription>
            Intelligent recommendations to improve your production efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(suggestion.impact)}>
                        {suggestion.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">{suggestion.estimatedImprovement}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{suggestion.effort} effort</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Implement
                    </Button>
                    <Button size="sm" variant="ghost">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analyze
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Workflow Efficiency Analysis
            </CardTitle>
            <CardDescription>
              Performance breakdown by workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowStats.map((workflow, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{workflow.name}</span>
                    <Badge variant="secondary">{workflow.efficiency.toFixed(1)}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(workflow.efficiency, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{workflow.completed} completed</span>
                    <span>{workflow.avgCompletionTime.toFixed(1)}h avg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance Analysis
            </CardTitle>
            <CardDescription>
              Individual team member efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats.slice(0, 5).map((user, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{user.name}</span>
                    <Badge variant="secondary">{user.efficiency.toFixed(1)}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(user.efficiency, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{user.completed} completed</span>
                    <span>{user.avgCompletionTime.toFixed(1)}h avg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Optimization Actions
          </CardTitle>
          <CardDescription>
            Immediate actions you can take to improve performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Target className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Set Targets</div>
                <div className="text-xs text-muted-foreground">Define performance goals</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Activity className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Monitor Real-time</div>
                <div className="text-xs text-muted-foreground">Track live performance</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <PieChart className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Analyze Trends</div>
                <div className="text-xs text-muted-foreground">Identify patterns</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Settings className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Auto-optimize</div>
                <div className="text-xs text-muted-foreground">Enable smart suggestions</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
