'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package
} from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { format, subDays, subMonths } from 'date-fns'

// Mock report data
const mockOnTimeData = [
  { month: 'Jan', onTime: 89, late: 11 },
  { month: 'Feb', onTime: 92, late: 8 },
  { month: 'Mar', onTime: 87, late: 13 },
  { month: 'Apr', onTime: 94, late: 6 },
  { month: 'May', onTime: 91, late: 9 },
  { month: 'Jun', onTime: 96, late: 4 },
]

const mockLeadTimeData = [
  { month: 'Jan', avgLeadTime: 28, target: 25 },
  { month: 'Feb', avgLeadTime: 26, target: 25 },
  { month: 'Mar', avgLeadTime: 30, target: 25 },
  { month: 'Apr', avgLeadTime: 24, target: 25 },
  { month: 'May', avgLeadTime: 23, target: 25 },
  { month: 'Jun', avgLeadTime: 22, target: 25 },
]

const mockDefectHeatmap = [
  { factory: 'Apex Mfg', category: 'Cutting', defects: 2.1 },
  { factory: 'Apex Mfg', category: 'Sewing', defects: 1.8 },
  { factory: 'Apex Mfg', category: 'Finishing', defects: 0.9 },
  { factory: 'Global Textiles', category: 'Cutting', defects: 1.5 },
  { factory: 'Global Textiles', category: 'Sewing', defects: 2.3 },
  { factory: 'Global Textiles', category: 'Finishing', defects: 1.1 },
  { factory: 'Premium Ltd', category: 'Cutting', defects: 0.3 },
  { factory: 'Premium Ltd', category: 'Sewing', defects: 0.7 },
  { factory: 'Premium Ltd', category: 'Finishing', defects: 0.2 },
]

const mockThroughputData = [
  { factory: 'Swift Production', throughput: 95, capacity: 100 },
  { factory: 'Global Textiles', throughput: 92, capacity: 100 },
  { factory: 'Apex Manufacturing', throughput: 85, capacity: 100 },
  { factory: 'Premium Garments', throughput: 78, capacity: 100 },
  { factory: 'Eco Manufacture', throughput: 72, capacity: 100 },
]

const mockSpendData = [
  { month: 'Jan', spend: 32000, budget: 35000 },
  { month: 'Feb', spend: 28000, budget: 35000 },
  { month: 'Mar', spend: 41000, budget: 35000 },
  { month: 'Apr', spend: 35000, budget: 35000 },
  { month: 'May', spend: 38000, budget: 35000 },
  { month: 'Jun', spend: 42000, budget: 35000 },
]

interface ReportTile {
  id: string
  title: string
  type: 'metric' | 'chart' | 'table'
  chartType?: 'bar' | 'line' | 'pie' | 'area'
  data: any
  description: string
  trend?: {
    value: number
    direction: 'up' | 'down'
    isGood: boolean
  }
}

const reportTiles: ReportTile[] = [
  {
    id: 'on-time-delivery',
    title: 'On-time Delivery %',
    type: 'chart',
    chartType: 'bar',
    data: mockOnTimeData,
    description: 'Monthly on-time vs late delivery performance',
    trend: { value: 5.2, direction: 'up', isGood: true }
  },
  {
    id: 'lead-time-trend',
    title: 'Lead Time Trend',
    type: 'chart',
    chartType: 'line',
    data: mockLeadTimeData,
    description: 'Average lead times vs target over time',
    trend: { value: 8.1, direction: 'down', isGood: true }
  },
  {
    id: 'defect-heatmap',
    title: 'Defect Rate by Factory',
    type: 'table',
    data: mockDefectHeatmap,
    description: 'Defect rates across factories and production stages'
  },
  {
    id: 'throughput-comparison',
    title: 'Factory Throughput',
    type: 'chart',
    chartType: 'bar',
    data: mockThroughputData,
    description: 'Production throughput by factory vs capacity',
    trend: { value: 12.3, direction: 'up', isGood: true }
  },
  {
    id: 'spend-analysis',
    title: 'Monthly Spend',
    type: 'chart',
    chartType: 'area',
    data: mockSpendData,
    description: 'Monthly spending vs budget',
    trend: { value: 18.5, direction: 'up', isGood: false }
  }
]

export function BrandReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const dashboardStats = await brandAdapter.getDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const renderChart = (tile: ReportTile) => {
    const height = 300

    switch (tile.chartType) {
      case 'bar':
        if (tile.id === 'on-time-delivery') {
          return (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={tile.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onTime" fill="#10b981" name="On Time" />
                <Bar dataKey="late" fill="#f59e0b" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          )
        }
        if (tile.id === 'throughput-comparison') {
          return (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={tile.data} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="factory" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="throughput" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )
        }
        break

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={tile.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="avgLeadTime" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Actual Lead Time"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={tile.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Area 
                type="monotone" 
                dataKey="spend" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
                name="Actual Spend"
              />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                name="Budget"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const renderTable = (tile: ReportTile) => {
    if (tile.id === 'defect-heatmap') {
      const groupedData = tile.data.reduce((acc: any, item: any) => {
        if (!acc[item.factory]) acc[item.factory] = {}
        acc[item.factory][item.category] = item.defects
        return acc
      }, {})

      return (
        <div className="space-y-4">
          {Object.entries(groupedData).map(([factory, categories]: [string, any]) => (
            <div key={factory} className="space-y-2">
              <h4 className="font-medium text-sm">{factory}</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(categories).map(([category, defects]: [string, any]) => (
                  <div key={category} className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">{category}</p>
                    <p className={`font-semibold ${
                      defects <= 1 ? 'text-green-600' : 
                      defects <= 2 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {defects}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Build Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg On-time Rate</p>
                <p className="text-2xl font-bold text-green-600">91.8%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+5.2% vs last period</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Lead Time</p>
                <p className="text-2xl font-bold text-blue-600">24.8 days</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">-8.1% vs last period</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Defect Rate</p>
                <p className="text-2xl font-bold text-orange-600">1.4%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">-0.3% vs last period</span>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Spend</p>
                <p className="text-2xl font-bold text-purple-600">${stats?.monthlySpend?.toLocaleString() || '0'}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">+18.5% vs budget</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportTiles.map((tile) => (
          <Card key={tile.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{tile.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{tile.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {tile.trend && (
                    <div className={`flex items-center gap-1 text-sm ${
                      tile.trend.isGood ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tile.trend.direction === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{tile.trend.value}%</span>
                    </div>
                  )}
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tile.type === 'chart' && renderChart(tile)}
              {tile.type === 'table' && renderTable(tile)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Report Builder CTA */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Build Custom Report</h3>
            <p className="text-gray-600 mb-6">
              Create custom reports with your specific metrics, filters, and visualizations.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}