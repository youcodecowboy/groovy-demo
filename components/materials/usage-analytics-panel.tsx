'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  Calendar,
  AlertTriangle,
  Target,
  Clock,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TrendMiniChart from './trend-mini-chart'
import ValueCard from './value-card'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material, formatCurrency } from '@/types/materials'

interface UsageAnalyticsPanelProps {
  material: Material
}

export default function UsageAnalyticsPanel({ material }: UsageAnalyticsPanelProps) {
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    loadAnalytics()
  }, [material.id, timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const analyticsData = await dataAdapter.getMaterialUsageAnalytics(material.id, parseInt(timeRange))
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load usage analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load usage analytics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <p>No usage data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const chartData = Object.entries(analytics.dailyUsage).map(([date, usage]) => ({
    date,
    value: usage as number
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const projectedRunOutDays = analytics.projectedRunOut ? Math.ceil(analytics.projectedRunOut) : null
  const isHighUsage = analytics.avgDailyUsage > (material.reorderPoint || 0) / 30 // High if using more than monthly reorder amount per day

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Usage Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ValueCard
          title="Total Usage"
          value={analytics.totalUsage}
          showAsQuantity={true}
          unit={material.defaultUnit}
          subtitle={`Last ${timeRange} days`}
          icon={Activity}
          trend={{
            value: 15.2,
            isPositive: false,
            period: 'vs previous period'
          }}
        />
        
        <ValueCard
          title="Daily Average"
          value={analytics.avgDailyUsage}
          showAsQuantity={true}
          unit={`${material.defaultUnit}/day`}
          subtitle="Average consumption"
          icon={TrendingUp}
          trend={{
            value: 8.7,
            isPositive: true,
            period: 'vs previous period'
          }}
        />
        
        <ValueCard
          title="Projected Run-out"
          value={projectedRunOutDays || 0}
          showAsQuantity={true}
          unit="days"
          subtitle="At current usage rate"
          icon={Clock}
          className={projectedRunOutDays && projectedRunOutDays < 30 ? 'border-orange-200 bg-orange-50' : ''}
        />
      </div>

      {/* Usage alerts */}
      {(isHighUsage || (projectedRunOutDays && projectedRunOutDays < 14)) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-4 h-4" />
              Usage Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isHighUsage && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">High Usage Detected</p>
                    <p className="text-xs text-orange-700">
                      Current usage ({analytics.avgDailyUsage.toFixed(1)} {material.defaultUnit}/day) is above normal patterns
                    </p>
                  </div>
                </div>
              )}
              {projectedRunOutDays && projectedRunOutDays < 14 && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Low Stock Warning</p>
                    <p className="text-xs text-orange-700">
                      Material will run out in approximately {projectedRunOutDays} days at current usage rate
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <TrendMiniChart data={chartData} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p>No usage data for selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent movements summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Usage Events</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.movements.length > 0 ? (
            <div className="space-y-3">
              {analytics.movements.map((movement: any) => (
                <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Material Issued</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(movement.at).toLocaleDateString()} • {movement.actor || 'System'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">
                      -{movement.quantity.toFixed(1)} {material.defaultUnit}
                    </div>
                    {movement.reason && (
                      <div className="text-xs text-muted-foreground">
                        {movement.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p>No recent usage events</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
