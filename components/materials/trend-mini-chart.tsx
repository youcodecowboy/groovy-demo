'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DataPoint {
  date: string
  value: number
}

interface TrendMiniChartProps {
  data: DataPoint[]
  height?: number
  className?: string
  showTrend?: boolean
}

export default function TrendMiniChart({ 
  data, 
  height = 40, 
  className = "",
  showTrend = true 
}: TrendMiniChartProps) {
  const { pathData, trend } = useMemo(() => {
    if (data.length < 2) {
      return { pathData: '', trend: { direction: 'flat' as const, percentage: 0 } }
    }

    const values = data.map(d => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue

    if (range === 0) {
      return { pathData: '', trend: { direction: 'flat' as const, percentage: 0 } }
    }

    const width = 120
    const stepX = width / (data.length - 1)
    
    const points = data.map((point, index) => {
      const x = index * stepX
      const y = height - ((point.value - minValue) / range) * height
      return `${x},${y}`
    }).join(' L')

    const pathData = `M${points}`

    // Calculate trend
    const firstValue = values[0]
    const lastValue = values[values.length - 1]
    const percentage = firstValue === 0 ? 0 : ((lastValue - firstValue) / firstValue) * 100
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'flat'

    return {
      pathData,
      trend: { direction, percentage: Math.abs(percentage) }
    }
  }, [data, height])

  if (data.length < 2) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    )
  }

  const strokeColor = trend.direction === 'up' 
    ? '#22c55e' 
    : trend.direction === 'down' 
      ? '#ef4444' 
      : '#6b7280'

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        width="120" 
        height={height} 
        className="mr-2"
        viewBox={`0 0 120 ${height}`}
      >
        <path
          d={pathData}
          stroke={strokeColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {showTrend && (
        <div className="flex items-center text-xs">
          {trend.direction === 'up' && (
            <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
          )}
          {trend.direction === 'down' && (
            <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
          )}
          {trend.direction === 'flat' && (
            <Minus className="w-3 h-3 mr-1 text-gray-600" />
          )}
          <span className={
            trend.direction === 'up' 
              ? 'text-green-600' 
              : trend.direction === 'down' 
                ? 'text-red-600' 
                : 'text-gray-600'
          }>
            {trend.direction === 'flat' ? '0%' : `${trend.percentage.toFixed(1)}%`}
          </span>
        </div>
      )}
    </div>
  )
}