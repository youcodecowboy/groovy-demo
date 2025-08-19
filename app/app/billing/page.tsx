'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Download,
  Eye,
  Clock,
  BarChart3,
  FileText,
  CreditCard,
  Package
} from 'lucide-react'
import { BillingHeaderCards } from '@/components/billing/billing-header-cards'
import { UsageTrendChart } from '@/components/billing/usage-trend-chart'
import { UsageByEntityTable } from '@/components/billing/usage-by-entity-table'
import { InvoicesTable } from '@/components/billing/invoices-table'
import { useToast } from '@/hooks/use-toast'

// Mock data - would come from API
const mockUsageData = {
  currentPeriod: {
    start: '2024-01-01',
    end: '2024-01-31',
    totalRecords: 1247,
    totalCostCents: 12470, // $124.70
    forecastCostCents: 13500, // $135.00
    nextInvoiceDate: '2024-02-01'
  },
  byEntity: [
    { entity: 'Items', count: 456, share: 36.6, costCents: 4560, trend: [12, 15, 18, 22, 25, 28, 30] },
    { entity: 'Orders', count: 234, share: 18.8, costCents: 2340, trend: [8, 10, 12, 15, 18, 20, 22] },
    { entity: 'Materials', count: 189, share: 15.2, costCents: 1890, trend: [6, 8, 10, 12, 14, 16, 18] },
    { entity: 'Messages', count: 178, share: 14.3, costCents: 1780, trend: [5, 7, 9, 11, 13, 15, 17] },
    { entity: 'Workflows', count: 89, share: 7.1, costCents: 890, trend: [3, 4, 5, 6, 7, 8, 9] },
    { entity: 'Teams', count: 67, share: 5.4, costCents: 670, trend: [2, 3, 4, 5, 6, 7, 8] },
    { entity: 'Attachments', count: 34, share: 2.7, costCents: 340, trend: [1, 2, 2, 3, 3, 4, 4] }
  ],
  trend: [
    { date: '2024-01-01', items: 12, orders: 8, materials: 6, messages: 5, workflows: 3, teams: 2, attachments: 1 },
    { date: '2024-01-02', items: 15, orders: 10, materials: 8, messages: 7, workflows: 4, teams: 3, attachments: 2 },
    { date: '2024-01-03', items: 18, orders: 12, materials: 10, messages: 9, workflows: 5, teams: 4, attachments: 2 },
    { date: '2024-01-04', items: 22, orders: 15, materials: 12, messages: 11, workflows: 6, teams: 5, attachments: 3 },
    { date: '2024-01-05', items: 25, orders: 18, materials: 14, messages: 13, workflows: 7, teams: 6, attachments: 3 },
    { date: '2024-01-06', items: 28, orders: 20, materials: 16, messages: 15, workflows: 8, teams: 7, attachments: 4 },
    { date: '2024-01-07', items: 30, orders: 22, materials: 18, messages: 17, workflows: 9, teams: 8, attachments: 4 }
  ],
  recentInvoices: [
    { id: 'INV-2024-001', period: 'Dec 2023', status: 'paid', totalCents: 11850, issued: '2024-01-01', paid: '2024-01-02' },
    { id: 'INV-2024-002', period: 'Nov 2023', status: 'paid', totalCents: 11230, issued: '2023-12-01', paid: '2023-12-03' },
    { id: 'INV-2024-003', period: 'Oct 2023', status: 'paid', totalCents: 10890, issued: '2023-11-01', paid: '2023-11-02' }
  ],
  alerts: [
    { id: '1', type: 'cost', threshold: 15000, enabled: true, message: 'Cost threshold exceeded' },
    { id: '2', type: 'usage', threshold: 1500, enabled: true, message: 'Usage threshold approaching' }
  ]
}

export default function BillingPage() {
  const { toast } = useToast()
  const [usageData, setUsageData] = useState(mockUsageData)
  const [loading, setLoading] = useState(false)

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const handleExportUsage = () => {
    // Generate CSV for usage data
    const csvData = usageData.byEntity.map(entity => ({
      Entity: entity.entity,
      Count: entity.count,
      'Share %': entity.share.toFixed(1),
      Cost: formatCurrency(entity.costCents)
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usage-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Usage data exported to CSV",
    })
  }

  const handleManageAlerts = () => {
    // Navigate to alerts settings
    window.location.href = '/app/billing/settings'
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usage & Billing</h1>
          <p className="text-muted-foreground">
            Monitor your usage, costs, and billing information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportUsage}>
            <Download className="w-4 h-4 mr-2" />
            Export Usage
          </Button>
          <Button variant="outline" onClick={handleManageAlerts}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Manage Alerts
          </Button>
        </div>
      </div>

      {/* Header Cards */}
      <BillingHeaderCards usageData={usageData.currentPeriod} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Details</TabsTrigger>
          <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Usage Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Usage Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageTrendChart data={usageData.trend} />
            </CardContent>
          </Card>

          {/* Usage by Entity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Usage by Entity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageByEntityTable data={usageData.byEntity} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {/* Detailed Usage Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Usage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageData.byEntity.map((entity) => (
                  <div key={entity.entity} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{entity.entity}</div>
                        <div className="text-sm text-muted-foreground">
                          {entity.count} records • {entity.share.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(entity.costCents)}</div>
                      <div className="text-sm text-muted-foreground">
                        ${(entity.costCents / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvoicesTable invoices={usageData.recentInvoices} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active Alerts */}
      {usageData.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usageData.alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {alert.type === 'cost' ? formatCurrency(alert.threshold) : `${alert.threshold} records`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
