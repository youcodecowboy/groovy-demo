"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, DollarSign, Target, Activity, Eye, Download } from "lucide-react"

interface AnalyticsData {
  period: string
  revenue: number
  orders: number
  customers: number
  conversionRate: number
  averageOrderValue: number
  customerSatisfaction: number
  brandAwareness: number
}

const mockData: AnalyticsData[] = [
  {
    period: "Jan 2024",
    revenue: 125000,
    orders: 450,
    customers: 320,
    conversionRate: 3.2,
    averageOrderValue: 278,
    customerSatisfaction: 4.6,
    brandAwareness: 78
  },
  {
    period: "Feb 2024",
    revenue: 138000,
    orders: 485,
    customers: 345,
    conversionRate: 3.4,
    averageOrderValue: 285,
    customerSatisfaction: 4.7,
    brandAwareness: 81
  },
  {
    period: "Mar 2024",
    revenue: 152000,
    orders: 520,
    customers: 370,
    conversionRate: 3.6,
    averageOrderValue: 292,
    customerSatisfaction: 4.8,
    brandAwareness: 84
  }
]

export default function BrandAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("month")
  const [selectedMetric, setSelectedMetric] = useState<string>("revenue")

  const currentData = mockData[mockData.length - 1]
  const previousData = mockData[mockData.length - 2]

  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100
  }

  const getMetricData = (metric: string) => {
    return mockData.map(item => ({
      period: item.period,
      value: item[metric as keyof AnalyticsData] as number
    }))
  }

  const getMetricInfo = (metric: string) => {
    switch (metric) {
      case 'revenue':
        return {
          label: 'Revenue',
          icon: DollarSign,
          color: 'text-green-600',
          format: (value: number) => `$${value.toLocaleString()}`
        }
      case 'orders':
        return {
          label: 'Orders',
          icon: Target,
          color: 'text-blue-600',
          format: (value: number) => value.toLocaleString()
        }
      case 'customers':
        return {
          label: 'Customers',
          icon: Users,
          color: 'text-purple-600',
          format: (value: number) => value.toLocaleString()
        }
      case 'conversionRate':
        return {
          label: 'Conversion Rate',
          icon: TrendingUp,
          color: 'text-orange-600',
          format: (value: number) => `${value}%`
        }
      case 'averageOrderValue':
        return {
          label: 'Average Order Value',
          icon: DollarSign,
          color: 'text-indigo-600',
          format: (value: number) => `$${value}`
        }
      case 'customerSatisfaction':
        return {
          label: 'Customer Satisfaction',
          icon: Activity,
          color: 'text-pink-600',
          format: (value: number) => `${value}/5`
        }
      case 'brandAwareness':
        return {
          label: 'Brand Awareness',
          icon: Eye,
          color: 'text-teal-600',
          format: (value: number) => `${value}%`
        }
      default:
        return {
          label: 'Metric',
          icon: BarChart3,
          color: 'text-gray-600',
          format: (value: number) => value.toString()
        }
    }
  }

  const metricInfo = getMetricInfo(selectedMetric)
  const IconComponent = metricInfo.icon

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Analytics</h1>
          <p className="text-gray-600">Comprehensive analytics and insights for brand performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="conversionRate">Conversion Rate</SelectItem>
              <SelectItem value="averageOrderValue">Average Order Value</SelectItem>
              <SelectItem value="customerSatisfaction">Customer Satisfaction</SelectItem>
              <SelectItem value="brandAwareness">Brand Awareness</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="h-5 w-5" />
                {metricInfo.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${metricInfo.color}`}>
                    {metricInfo.format(currentData[selectedMetric as keyof AnalyticsData] as number)}
                  </div>
                  <div className="text-sm text-gray-600">Current Period</div>
                </div>

                {previousData && (
                  <div className="flex items-center justify-center gap-2">
                    <Badge className={
                      calculateGrowth(
                        currentData[selectedMetric as keyof AnalyticsData] as number,
                        previousData[selectedMetric as keyof AnalyticsData] as number
                      ) >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {calculateGrowth(
                        currentData[selectedMetric as keyof AnalyticsData] as number,
                        previousData[selectedMetric as keyof AnalyticsData] as number
                      ) >= 0 ? '+' : ''}
                      {calculateGrowth(
                        currentData[selectedMetric as keyof AnalyticsData] as number,
                        previousData[selectedMetric as keyof AnalyticsData] as number
                      ).toFixed(1)}%
                    </Badge>
                    <span className="text-sm text-gray-600">vs previous period</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-medium">${currentData.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-medium">{currentData.orders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Customers</span>
                  <span className="font-medium">{currentData.customers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-medium">{currentData.conversionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Order Value</span>
                  <span className="font-medium">${currentData.averageOrderValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-medium">{currentData.customerSatisfaction}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand Awareness</span>
                  <span className="font-medium">{currentData.brandAwareness}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metric Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{metricInfo.label} Trend</span>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {getMetricData(selectedMetric).map((item, index) => {
                  const maxValue = Math.max(...getMetricData(selectedMetric).map(d => d.value))
                  const height = (item.value / maxValue) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2 text-center">
                        {item.period}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Top Performers</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Revenue growth: +12.4%</li>
                      <li>• Customer satisfaction: 4.8/5</li>
                      <li>• Brand awareness: 84%</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Areas for Improvement</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Conversion rate optimization</li>
                      <li>• Customer retention strategies</li>
                      <li>• Order value enhancement</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Recommendations</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>• Implement targeted marketing campaigns to improve conversion rates</p>
                    <p>• Focus on customer experience to boost satisfaction scores</p>
                    <p>• Develop loyalty programs to increase average order values</p>
                    <p>• Invest in brand awareness campaigns to reach new audiences</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Detailed Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Period</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Orders</th>
                    <th className="text-right py-2">Customers</th>
                    <th className="text-right py-2">Conv. Rate</th>
                    <th className="text-right py-2">Avg Order</th>
                    <th className="text-right py-2">Satisfaction</th>
                    <th className="text-right py-2">Awareness</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.period}</td>
                      <td className="text-right py-2">${item.revenue.toLocaleString()}</td>
                      <td className="text-right py-2">{item.orders.toLocaleString()}</td>
                      <td className="text-right py-2">{item.customers.toLocaleString()}</td>
                      <td className="text-right py-2">{item.conversionRate}%</td>
                      <td className="text-right py-2">${item.averageOrderValue}</td>
                      <td className="text-right py-2">{item.customerSatisfaction}/5</td>
                      <td className="text-right py-2">{item.brandAwareness}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
