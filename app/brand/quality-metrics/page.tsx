"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, Target, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react"

interface QualityMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  category: 'defect' | 'compliance' | 'efficiency' | 'customer'
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

const defaultMetrics: QualityMetric[] = [
  {
    id: "1",
    name: "Defect Rate",
    value: 2.3,
    target: 2.0,
    unit: "%",
    category: "defect",
    trend: "down",
    status: "warning"
  },
  {
    id: "2",
    name: "First Pass Yield",
    value: 94.5,
    target: 95.0,
    unit: "%",
    category: "efficiency",
    trend: "up",
    status: "good"
  },
  {
    id: "3",
    name: "Compliance Score",
    value: 98.2,
    target: 99.0,
    unit: "%",
    category: "compliance",
    trend: "stable",
    status: "good"
  },
  {
    id: "4",
    name: "Customer Satisfaction",
    value: 4.6,
    target: 4.5,
    unit: "/5",
    category: "customer",
    trend: "up",
    status: "good"
  },
  {
    id: "5",
    name: "Return Rate",
    value: 1.8,
    target: 1.5,
    unit: "%",
    category: "defect",
    trend: "up",
    status: "warning"
  },
  {
    id: "6",
    name: "On-Time Delivery",
    value: 96.7,
    target: 98.0,
    unit: "%",
    category: "efficiency",
    trend: "down",
    status: "warning"
  }
]

export default function QualityMetricsPage() {
  const [metrics, setMetrics] = useState<QualityMetric[]>(defaultMetrics)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("month")

  const filteredMetrics = selectedCategory === "all" 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getPerformanceScore = (metric: QualityMetric) => {
    const percentage = (metric.value / metric.target) * 100
    if (metric.category === 'defect' || metric.name.includes('Rate')) {
      // For defect rates, lower is better
      return Math.max(0, Math.min(100, (100 - percentage) + 100))
    }
    return Math.max(0, Math.min(100, percentage))
  }

  const overallScore = Math.round(
    metrics.reduce((sum, metric) => sum + getPerformanceScore(metric), 0) / metrics.length
  )

  const getOverallStatus = (score: number) => {
    if (score >= 90) return { status: "Excellent", color: "bg-green-100 text-green-800", icon: CheckCircle }
    if (score >= 80) return { status: "Good", color: "bg-blue-100 text-blue-800", icon: Target }
    if (score >= 70) return { status: "Fair", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle }
    return { status: "Needs Improvement", color: "bg-red-100 text-red-800", icon: XCircle }
  }

  const updateMetric = (id: string, field: keyof QualityMetric, value: any) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, [field]: value } : metric
    ))
  }

  const addMetric = () => {
    const newMetric: QualityMetric = {
      id: Date.now().toString(),
      name: "",
      value: 0,
      target: 0,
      unit: "%",
      category: "efficiency",
      trend: "stable",
      status: "good"
    }
    setMetrics(prev => [...prev, newMetric])
  }

  const removeMetric = (id: string) => {
    setMetrics(prev => prev.filter(metric => metric.id !== id))
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Metrics Dashboard</h1>
          <p className="text-gray-600">Track and analyze quality performance for brand operations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="defect">Defect Metrics</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="efficiency">Efficiency</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Time Range</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={addMetric} className="w-full">
            Add Metric
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Performance */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{overallScore}</div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                
                {(() => {
                  const status = getOverallStatus(overallScore)
                  const IconComponent = status.icon
                  return (
                    <div className="flex items-center justify-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <Badge className={status.color}>
                        {status.status}
                      </Badge>
                    </div>
                  )
                })()}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Metrics Tracked:</span>
                    <span className="font-medium">{metrics.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>On Target:</span>
                    <span className="font-medium">
                      {metrics.filter(m => getPerformanceScore(m) >= 90).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Needs Attention:</span>
                    <span className="font-medium">
                      {metrics.filter(m => getPerformanceScore(m) < 80).length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{metric.value}{metric.unit}</div>
                        <div className="text-sm text-gray-600">Current Value</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium">{metric.target}{metric.unit}</div>
                        <div className="text-sm text-gray-600">Target</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance:</span>
                        <span className="font-medium">{Math.round(getPerformanceScore(metric))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            getPerformanceScore(metric) >= 90 ? 'bg-green-500' :
                            getPerformanceScore(metric) >= 80 ? 'bg-blue-500' :
                            getPerformanceScore(metric) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, getPerformanceScore(metric))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          const newValue = prompt(`Enter new value for ${metric.name}:`, metric.value.toString())
                          if (newValue !== null) {
                            updateMetric(metric.id, 'value', Number(newValue))
                          }
                        }}
                      >
                        Update Value
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeMetric(metric.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quality Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.filter(m => m.status === 'good').length}
                </div>
                <div className="text-sm text-gray-600">Good Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.filter(m => m.status === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">Needs Attention</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.filter(m => m.status === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">Critical Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((metrics.filter(m => m.trend === 'up').length / metrics.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Improving</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.filter(m => getPerformanceScore(m) < 80).map(metric => (
                <div key={metric.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">{metric.name}</div>
                    <div className="text-sm text-yellow-700">
                      Current performance is {Math.round(getPerformanceScore(metric))}% of target. 
                      Consider reviewing processes and implementing improvement measures.
                    </div>
                  </div>
                </div>
              ))}
              
              {metrics.filter(m => getPerformanceScore(m) < 80).length === 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Excellent Performance</div>
                    <div className="text-sm text-green-700">
                      All metrics are performing well. Continue monitoring and consider setting higher targets for continuous improvement.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
