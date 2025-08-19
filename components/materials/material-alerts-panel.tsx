'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle,
  Clock,
  TrendingUp,
  Package,
  DollarSign,
  X,
  Settings,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material } from '@/types/materials'

interface MaterialAlert {
  id: string
  type: 'low_stock' | 'high_usage' | 'po_mismatch' | 'expiry_warning' | 'cost_variance'
  severity: 'info' | 'warning' | 'error'
  materialId?: string
  materialName?: string
  message: string
  createdAt: number
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: number
  metadata?: Record<string, any>
}

interface MaterialAlertsPanelProps {
  materialId?: string // If provided, show alerts for specific material
}

export default function MaterialAlertsPanel({ materialId }: MaterialAlertsPanelProps) {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<MaterialAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  useEffect(() => {
    loadAlerts()
  }, [materialId])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const alertsData = await dataAdapter.getMaterialAlerts()
      
      // Filter by material if specified
      const filteredAlerts = materialId 
        ? alertsData.filter((alert: MaterialAlert) => alert.materialId === materialId)
        : alertsData
      
      setAlerts(filteredAlerts)
    } catch (error) {
      console.error('Failed to load alerts:', error)
      toast({
        title: "Error",
        description: "Failed to load material alerts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await dataAdapter.acknowledgeAlert(alertId)
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true, acknowledgedAt: Date.now(), acknowledgedBy: 'Current User' }
          : alert
      ))
      
      toast({
        title: "Alert Acknowledged",
        description: "Alert has been marked as acknowledged",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      })
    }
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    toast({
      title: "Alert Dismissed",
      description: "Alert has been dismissed",
    })
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    const matchesType = filterType === 'all' || alert.type === filterType
    const matchesAcknowledged = showAcknowledged || !alert.acknowledged
    return matchesSeverity && matchesType && matchesAcknowledged
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return Package
      case 'high_usage': return TrendingUp
      case 'po_mismatch': return DollarSign
      case 'expiry_warning': return Clock
      case 'cost_variance': return AlertTriangle
      default: return Bell
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Low Stock'
      case 'high_usage': return 'High Usage'
      case 'po_mismatch': return 'PO Mismatch'
      case 'expiry_warning': return 'Expiry Warning'
      case 'cost_variance': return 'Cost Variance'
      default: return type
    }
  }

  const alertCounts = {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    error: alerts.filter(a => a.severity === 'error').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  }

  return (
    <div className="space-y-6">
      {/* Alert summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{alertCounts.total}</div>
                <div className="text-sm text-muted-foreground">Total Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{alertCounts.unacknowledged}</div>
                <div className="text-sm text-muted-foreground">Unacknowledged</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-full">
                <X className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{alertCounts.error}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{alertCounts.warning}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{alertCounts.info}</div>
                <div className="text-sm text-muted-foreground">Info</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="high_usage">High Usage</SelectItem>
              <SelectItem value="po_mismatch">PO Mismatch</SelectItem>
              <SelectItem value="expiry_warning">Expiry Warning</SelectItem>
              <SelectItem value="cost_variance">Cost Variance</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              id="show-acknowledged"
              checked={showAcknowledged}
              onCheckedChange={setShowAcknowledged}
            />
            <Label htmlFor="show-acknowledged" className="text-sm">
              Show acknowledged
            </Label>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Material Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const TypeIcon = getTypeIcon(alert.type)
                return (
                  <Card key={alert.id} className={`${getSeverityColor(alert.severity)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            alert.severity === 'error' ? 'bg-red-200 text-red-700' :
                            alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-700' :
                            'bg-blue-200 text-blue-700'
                          }`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{getTypeLabel(alert.type)}</span>
                              <Badge variant="outline" className="text-xs">
                                {alert.severity}
                              </Badge>
                              {alert.materialName && (
                                <Badge variant="secondary" className="text-xs">
                                  {alert.materialName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm mb-2">{alert.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(alert.createdAt).toLocaleString()}</span>
                              {alert.acknowledged && alert.acknowledgedBy && (
                                <span>Acknowledged by {alert.acknowledgedBy}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.acknowledged ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Acknowledge
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismissAlert(alert.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2" />
              <p>No alerts found</p>
              {(filterSeverity !== 'all' || filterType !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setFilterSeverity('all')
                    setFilterType('all')
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Alert Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Alert when materials fall below reorder point
              </p>
            </div>
            <Switch id="low-stock-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-usage-alerts">High Usage Alerts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Alert when usage exceeds normal patterns
              </p>
            </div>
            <Switch id="high-usage-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="po-mismatch-alerts">PO Mismatch Alerts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Alert when PO is accepted without sufficient material
              </p>
            </div>
            <Switch id="po-mismatch-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="cost-variance-alerts">Cost Variance Alerts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Alert when material costs vary significantly
              </p>
            </div>
            <Switch id="cost-variance-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="expiry-alerts">Expiry Alerts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Alert when materials are approaching expiry
              </p>
            </div>
            <Switch id="expiry-alerts" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
