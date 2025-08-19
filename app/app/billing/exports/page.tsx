'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  Copy, 
  ExternalLink,
  FileText,
  BarChart3,
  Webhook,
  Key,
  Calendar,
  Filter,
  Plus
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Mock data
const mockExportData = {
  webhookUrl: 'https://api.groovy.com/webhooks/billing/org_123456',
  apiKeys: [
    { id: 'key_1', name: 'Production API Key', key: 'sk_live_...', created: '2024-01-01', lastUsed: '2024-01-15' },
    { id: 'key_2', name: 'Development API Key', key: 'sk_test_...', created: '2024-01-10', lastUsed: '2024-01-20' }
  ]
}

export default function ExportsPage() {
  const { toast } = useToast()
  const [exportData] = useState(mockExportData)
  const [dateRange, setDateRange] = useState('30days')
  const [format, setFormat] = useState('csv')

  const handleExportUsage = () => {
    // Mock usage export
    const csvData = [
      { Date: '2024-01-01', Entity: 'Items', Count: 12, Cost: '$1.20' },
      { Date: '2024-01-01', Entity: 'Orders', Count: 8, Cost: '$0.80' },
      { Date: '2024-01-02', Entity: 'Items', Count: 15, Cost: '$1.50' },
      { Date: '2024-01-02', Entity: 'Orders', Count: 10, Cost: '$1.00' },
      { Date: '2024-01-03', Entity: 'Items', Count: 18, Cost: '$1.80' },
      { Date: '2024-01-03', Entity: 'Orders', Count: 12, Cost: '$1.20' }
    ]

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usage-export-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Usage data exported successfully",
    })
  }

  const handleExportInvoices = () => {
    // Mock invoice export
    const csvData = [
      { 'Invoice #': 'INV-2024-001', Period: 'Dec 2023', Status: 'paid', Total: '$1,185.00', Issued: '2024-01-01' },
      { 'Invoice #': 'INV-2024-002', Period: 'Nov 2023', Status: 'paid', Total: '$1,123.00', Issued: '2023-12-01' },
      { 'Invoice #': 'INV-2024-003', Period: 'Oct 2023', Status: 'paid', Total: '$1,089.00', Issued: '2023-11-01' }
    ]

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices-export-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Invoice data exported successfully",
    })
  }

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(exportData.webhookUrl)
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard",
    })
  }

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  const handleRegenerateApiKey = (keyId: string) => {
    toast({
      title: "API Key Regenerated",
      description: "New API key has been generated",
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exports & API</h1>
          <p className="text-muted-foreground">
            Export your data and manage API access
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Exports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Options */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="6months">Last 6 months</SelectItem>
                      <SelectItem value="1year">Last year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleExportUsage}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Usage Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleExportInvoices}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Invoice Data
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Exports include all data for the selected date range in {format.toUpperCase()} format.
            </div>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Webhook Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Webhook URL</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={exportData.webhookUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyWebhook}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              This webhook will receive real-time notifications for invoice events, payment updates, and usage alerts.
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Events</Label>
              <div className="space-y-1">
                <Badge variant="secondary" className="mr-2">invoice.created</Badge>
                <Badge variant="secondary" className="mr-2">invoice.paid</Badge>
                <Badge variant="secondary" className="mr-2">usage.threshold</Badge>
                <Badge variant="secondary" className="mr-2">payment.failed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportData.apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{apiKey.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Created {apiKey.created} • Last used {apiKey.lastUsed}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Input 
                      value={apiKey.key} 
                      readOnly 
                      className="w-32 font-mono text-sm"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyApiKey(apiKey.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRegenerateApiKey(apiKey.id)}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create New API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                API Reference
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                Webhook Guide
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                SDK Downloads
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Access comprehensive documentation, code examples, and SDKs for integrating with our billing API.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
