'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface TrendData {
  date: string
  items: number
  orders: number
  materials: number
  messages: number
  workflows: number
  teams: number
  attachments: number
}

interface UsageTrendChartProps {
  data: TrendData[]
}

const COLORS = {
  items: '#3b82f6',
  orders: '#10b981',
  materials: '#f59e0b',
  messages: '#8b5cf6',
  workflows: '#ef4444',
  teams: '#06b6d4',
  attachments: '#84cc16'
}

export function UsageTrendChart({ data }: UsageTrendChartProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}:</span>
                <span className="text-sm">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium capitalize">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          
          <Area 
            type="monotone" 
            dataKey="items" 
            stackId="1"
            stroke={COLORS.items} 
            fill={COLORS.items} 
            fillOpacity={0.6}
            name="Items"
          />
          <Area 
            type="monotone" 
            dataKey="orders" 
            stackId="1"
            stroke={COLORS.orders} 
            fill={COLORS.orders} 
            fillOpacity={0.6}
            name="Orders"
          />
          <Area 
            type="monotone" 
            dataKey="materials" 
            stackId="1"
            stroke={COLORS.materials} 
            fill={COLORS.materials} 
            fillOpacity={0.6}
            name="Materials"
          />
          <Area 
            type="monotone" 
            dataKey="messages" 
            stackId="1"
            stroke={COLORS.messages} 
            fill={COLORS.messages} 
            fillOpacity={0.6}
            name="Messages"
          />
          <Area 
            type="monotone" 
            dataKey="workflows" 
            stackId="1"
            stroke={COLORS.workflows} 
            fill={COLORS.workflows} 
            fillOpacity={0.6}
            name="Workflows"
          />
          <Area 
            type="monotone" 
            dataKey="teams" 
            stackId="1"
            stroke={COLORS.teams} 
            fill={COLORS.teams} 
            fillOpacity={0.6}
            name="Teams"
          />
          <Area 
            type="monotone" 
            dataKey="attachments" 
            stackId="1"
            stroke={COLORS.attachments} 
            fill={COLORS.attachments} 
            fillOpacity={0.6}
            name="Attachments"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
