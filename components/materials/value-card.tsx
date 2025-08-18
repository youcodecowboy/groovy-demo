'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/types/materials'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ValueCardProps {
  title: string
  value: number
  currency?: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export default function ValueCard({
  title,
  value,
  currency = 'USD',
  subtitle,
  trend,
  icon: Icon,
  className
}: ValueCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(value, currency)}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center mt-2 text-xs">
                {trend.value === 0 ? (
                  <Minus className="w-3 h-3 mr-1 text-muted-foreground" />
                ) : trend.isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                )}
                <span className={
                  trend.value === 0 
                    ? 'text-muted-foreground' 
                    : trend.isPositive 
                      ? 'text-green-600' 
                      : 'text-red-600'
                }>
                  {trend.value === 0 ? 'No change' : `${Math.abs(trend.value)}%`}
                </span>
                <span className="text-muted-foreground ml-1">
                  vs {trend.period}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="ml-4 p-2 bg-muted rounded-lg">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
