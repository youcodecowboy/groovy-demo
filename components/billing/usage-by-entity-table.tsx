'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  FileText, 
  Box, 
  MessageSquare, 
  Workflow, 
  Users, 
  Paperclip
} from 'lucide-react'

interface EntityData {
  entity: string
  count: number
  share: number
  costCents: number
  trend: number[]
}

interface UsageByEntityTableProps {
  data: EntityData[]
}

const ENTITY_ICONS = {
  Items: Package,
  Orders: FileText,
  Materials: Box,
  Messages: MessageSquare,
  Workflows: Workflow,
  Teams: Users,
  Attachments: Paperclip
}

const ENTITY_COLORS = {
  Items: '#3b82f6',
  Orders: '#10b981',
  Materials: '#f59e0b',
  Messages: '#8b5cf6',
  Workflows: '#ef4444',
  Teams: '#06b6d4',
  Attachments: '#84cc16'
}

export function UsageByEntityTable({ data }: UsageByEntityTableProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const Sparkline = ({ data: sparklineData, color }: { data: number[], color: string }) => {
    if (!sparklineData || sparklineData.length === 0) return null

    const max = Math.max(...sparklineData)
    const min = Math.min(...sparklineData)
    const range = max - min || 1

    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <svg width="60" height="20" className="inline-block">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    )
  }

  const getEntityIcon = (entityName: string) => {
    const IconComponent = ENTITY_ICONS[entityName as keyof typeof ENTITY_ICONS] || Package
    return <IconComponent className="w-4 h-4" />
  }

  const getEntityColor = (entityName: string) => {
    return ENTITY_COLORS[entityName as keyof typeof ENTITY_COLORS] || '#6b7280'
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Entity</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Share</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entity) => {
            const color = getEntityColor(entity.entity)
            return (
              <TableRow key={entity.entity}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <div style={{ color }}>
                        {getEntityIcon(entity.entity)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{entity.entity}</div>
                      <div className="text-sm text-muted-foreground">
                        {entity.count.toLocaleString()} records
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">{entity.count.toLocaleString()}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    {entity.share.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">{formatCurrency(entity.costCents)}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(entity.costCents / 100).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Sparkline data={entity.trend} color={color} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
