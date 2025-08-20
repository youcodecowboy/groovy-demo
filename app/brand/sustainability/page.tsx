"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Leaf, TrendingUp, Target, Activity, CheckCircle, AlertTriangle, Globe, Recycle } from "lucide-react"

interface SustainabilityMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  category: 'carbon' | 'waste' | 'energy' | 'water' | 'materials'
  trend: 'up' | 'down' | 'stable'
  status: 'excellent' | 'good' | 'warning' | 'critical'
  description: string
}

const defaultMetrics: SustainabilityMetric[] = [
  {
    id: "1",
    name: "Carbon Footprint",
    value: 1250,
    target: 1000,
    unit: "kg CO2e",
    category: "carbon",
    trend: "down",
    status: "good",
    description: "Total carbon emissions from operations"
  },
  {
    id: "2",
    name: "Waste Reduction",
    value: 85,
    target: 90,
    unit: "%",
    category: "waste",
    trend: "up",
    status: "good",
    description: "Percentage of waste diverted from landfill"
  },
  {
    id: "3",
    name: "Energy Efficiency",
    value: 78,
    target: 85,
    unit: "%",
    category: "energy",
    trend: "up",
    status: "warning",
    description: "Energy efficiency improvement"
  },
  {
    id: "4",
    name: "Water Conservation",
    value: 92,
    target: 95,
    unit: "%",
    category: "water",
    trend: "up",
    status: "excellent",
    description: "Water usage reduction"
  },
  {
    id: "5",
    name: "Sustainable Materials",
    value: 65,
    target: 80,
    unit: "%",
    category: "materials",
    trend: "up",
    status: "warning",
    description: "Percentage of sustainable materials used"
  },
  {
    id: "6",
    name: "Recycling Rate",
    value: 88,
    target: 90,
    unit: "%",
    category: "waste",
    trend: "up",
    status: "good",
    description: "Overall recycling rate"
  }
]

export default function SustainabilityTrackerPage() {
  const [metrics, setMetrics] = useState<SustainabilityMetric[]>(defaultMetrics)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("month")

  const filteredMetrics = selectedCategory === "all" 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
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

  const getPerformanceScore = (metric: SustainabilityMetric) => {
    const percentage = (metric.value / metric.target) * 100
    if (metric.category === 'carbon') {
      // For carbon footprint, lower is better
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
    return { status: "Needs Improvement", color: "bg-red-100 text-red-800", icon: AlertTriangle }
  }

  const updateMetric = (id: string, field: keyof SustainabilityMetric, value: any) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, [field]: value } : metric
    ))
  }

  const addMetric = () => {
    const newMetric: SustainabilityMetric = {
      id: Date.now().toString(),
      name: "",
      value: 0,
      target: 0,
      unit: "%",
      category: "energy",
      trend: "stable",
      status: "good",
      description: ""
    }
    setMetrics(prev => [...prev, newMetric])
  }

  const removeMetric = (id: string) => {
    setMetrics(prev => prev.filter(metric => metric.id !== id))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'carbon': return Globe
      case 'waste': return Recycle
      case 'energy': return Activity
      case 'water': return Leaf
      case 'materials': return Leaf
      default: return Leaf
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Leaf className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sustainability Tracker</h1>
          <p className="text-gray-600">Monitor and improve your brand's environmental impact</p>
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
              <SelectItem value="carbon">Carbon Footprint</SelectItem>
              <SelectItem value="waste">Waste Management</SelectItem>
              <SelectItem value="energy">Energy Efficiency</SelectItem>
              <SelectItem value="water">Water Conservation</SelectItem>
              <SelectItem value="materials">Sustainable Materials</SelectItem>
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
                Sustainability Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{overallScore}</div>
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

          {/* Environmental Impact */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Carbon Saved:</span>
                  <span className="text-sm font-medium text-green-600">-250 kg CO2e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Waste Diverted:</span>
                  <span className="text-sm font-medium text-blue-600">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Energy Saved:</span>
                  <span className="text-sm font-medium text-purple-600">22%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Water Saved:</span>
                  <span className="text-sm font-medium text-teal-600">8,500 L</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMetrics.map((metric) => {
              const IconComponent = getCategoryIcon(metric.category)
              return (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-green-600" />
                        <CardTitle className="text-lg">{metric.name}</CardTitle>
                      </div>
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

                      <div className="text-sm text-gray-600">
                        {metric.description}
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
              )
            })}
          </div>
        </div>
      </div>

      {/* Sustainability Initiatives */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Sustainability Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Carbon Neutral Goal</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Achieve carbon neutrality by 2025 through renewable energy and offset programs.
                </p>
                <Badge className="bg-green-100 text-green-800">On Track</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Zero Waste Initiative</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Implement comprehensive waste reduction and recycling programs.
                </p>
                <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Sustainable Materials</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Transition to 100% sustainable and recycled materials by 2024.
                </p>
                <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>
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
                      Consider implementing specific sustainability measures to improve this metric.
                    </div>
                  </div>
                </div>
              ))}
              
              {metrics.filter(m => getPerformanceScore(m) < 80).length === 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Excellent Sustainability Performance</div>
                    <div className="text-sm text-green-700">
                      All sustainability metrics are performing well. Continue monitoring and consider setting more ambitious targets for continuous improvement.
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
