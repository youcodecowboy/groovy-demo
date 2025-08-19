'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { 
  AlertTriangle, 
  Edit, 
  Trash2,
  Bell,
  Mail,
  DollarSign,
  BarChart3
} from 'lucide-react'

interface Alert {
  id: string
  type: 'cost' | 'usage'
  threshold: number
  enabled: boolean
  channels: string[]
  message: string
}

interface AlertsTableProps {
  alerts: Alert[]
  onEditAlert: (alert: Alert) => void
  onDeleteAlert: (alertId: string) => void
  onToggleAlert: (alertId: string) => void
}

export function AlertsTable({ alerts, onEditAlert, onDeleteAlert, onToggleAlert }: AlertsTableProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost':
        return <DollarSign className="w-4 h-4" />
      case 'usage':
        return <BarChart3 className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cost':
        return 'text-red-600 bg-red-100'
      case 'usage':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'in-app':
        return <Bell className="w-3 h-3" />
      case 'email':
        return <Mail className="w-3 h-3" />
      default:
        return <Bell className="w-3 h-3" />
    }
  }

  const getThresholdDisplay = (alert: Alert) => {
    if (alert.type === 'cost') {
      return formatCurrency(alert.threshold)
    } else {
      return `${alert.threshold.toLocaleString()} records`
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Threshold</TableHead>
            <TableHead>Channels</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(alert.type)}`}
                  >
                    {getTypeIcon(alert.type)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{alert.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {alert.message}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {getThresholdDisplay(alert)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {alert.channels.map((channel) => (
                    <Badge key={channel} variant="secondary" className="text-xs">
                      <div className="flex items-center gap-1">
                        {getChannelIcon(channel)}
                        {channel}
                      </div>
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={alert.enabled}
                  onCheckedChange={() => onToggleAlert(alert.id)}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditAlert(alert)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteAlert(alert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {alerts.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No alerts configured</h3>
          <p className="text-sm text-muted-foreground">
            Create alerts to get notified about usage and cost thresholds.
          </p>
        </div>
      )}
    </div>
  )
}
