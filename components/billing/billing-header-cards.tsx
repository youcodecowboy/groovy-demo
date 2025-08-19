'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  BarChart3
} from 'lucide-react'

interface UsageData {
  start: string
  end: string
  totalRecords: number
  totalCostCents: number
  forecastCostCents: number
  nextInvoiceDate: string
}

interface BillingHeaderCardsProps {
  usageData: UsageData
}

export function BillingHeaderCards({ usageData }: BillingHeaderCardsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysRemaining = () => {
    const endDate = new Date(usageData.end)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getUsagePercentage = () => {
    const startDate = new Date(usageData.start)
    const endDate = new Date(usageData.end)
    const today = new Date()
    
    const totalPeriod = endDate.getTime() - startDate.getTime()
    const elapsed = today.getTime() - startDate.getTime()
    
    return Math.min(100, Math.max(0, (elapsed / totalPeriod) * 100))
  }

  const daysRemaining = getDaysRemaining()
  const usagePercentage = getUsagePercentage()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Period Usage */}
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Period Usage</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{usageData.totalRecords.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            records created
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Period Progress</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost to Date */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost to Date</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(usageData.totalCostCents)}</div>
          <p className="text-xs text-muted-foreground">
            ${(usageData.totalCostCents / 100).toFixed(2)} total
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              $0.10 per record
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Forecast */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Forecast</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(usageData.forecastCostCents)}</div>
          <p className="text-xs text-muted-foreground">
            estimated end-of-period
          </p>
          <div className="mt-2">
            {usageData.forecastCostCents > usageData.totalCostCents ? (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                +{formatCurrency(usageData.forecastCostCents - usageData.totalCostCents)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                On track
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Invoice */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Invoice</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDate(usageData.nextInvoiceDate)}</div>
          <p className="text-xs text-muted-foreground">
            {daysRemaining} days remaining
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {new Date(usageData.start).toLocaleDateString('en-US', { month: 'short' })} {new Date(usageData.start).getFullYear()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
