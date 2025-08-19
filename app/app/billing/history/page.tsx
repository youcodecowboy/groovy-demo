'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Filter,
  Search
} from 'lucide-react'
import { InvoicesTable } from '@/components/billing/invoices-table'
import { InvoiceDrawer } from '@/components/billing/invoice-drawer'
import { useToast } from '@/hooks/use-toast'

// Mock invoice data
const mockInvoices = [
  {
    id: 'INV-2024-001',
    period: 'Dec 2023',
    status: 'paid',
    subtotalCents: 11500,
    taxCents: 350,
    totalCents: 11850,
    issued: '2024-01-01',
    paid: '2024-01-02',
    items: [
      { entity: 'Items', count: 456, costCents: 4560 },
      { entity: 'Orders', count: 234, costCents: 2340 },
      { entity: 'Materials', count: 189, costCents: 1890 },
      { entity: 'Messages', count: 178, costCents: 1780 },
      { entity: 'Workflows', count: 89, costCents: 890 },
      { entity: 'Teams', count: 67, costCents: 670 }
    ]
  },
  {
    id: 'INV-2024-002',
    period: 'Nov 2023',
    status: 'paid',
    subtotalCents: 10900,
    taxCents: 330,
    totalCents: 11230,
    issued: '2023-12-01',
    paid: '2023-12-03',
    items: [
      { entity: 'Items', count: 423, costCents: 4230 },
      { entity: 'Orders', count: 198, costCents: 1980 },
      { entity: 'Materials', count: 167, costCents: 1670 },
      { entity: 'Messages', count: 156, costCents: 1560 },
      { entity: 'Workflows', count: 78, costCents: 780 },
      { entity: 'Teams', count: 59, costCents: 590 }
    ]
  },
  {
    id: 'INV-2024-003',
    period: 'Oct 2023',
    status: 'paid',
    subtotalCents: 10550,
    taxCents: 340,
    totalCents: 10890,
    issued: '2023-11-01',
    paid: '2023-11-02',
    items: [
      { entity: 'Items', count: 398, costCents: 3980 },
      { entity: 'Orders', count: 187, costCents: 1870 },
      { entity: 'Materials', count: 145, costCents: 1450 },
      { entity: 'Messages', count: 134, costCents: 1340 },
      { entity: 'Workflows', count: 72, costCents: 720 },
      { entity: 'Teams', count: 52, costCents: 520 }
    ]
  },
  {
    id: 'INV-2024-004',
    period: 'Sep 2023',
    status: 'paid',
    subtotalCents: 10200,
    taxCents: 310,
    totalCents: 10510,
    issued: '2023-10-01',
    paid: '2023-10-03',
    items: [
      { entity: 'Items', count: 376, costCents: 3760 },
      { entity: 'Orders', count: 175, costCents: 1750 },
      { entity: 'Materials', count: 134, costCents: 1340 },
      { entity: 'Messages', count: 123, costCents: 1230 },
      { entity: 'Workflows', count: 68, costCents: 680 },
      { entity: 'Teams', count: 48, costCents: 480 }
    ]
  },
  {
    id: 'INV-2024-005',
    period: 'Aug 2023',
    status: 'paid',
    subtotalCents: 9850,
    taxCents: 295,
    totalCents: 10145,
    issued: '2023-09-01',
    paid: '2023-09-02',
    items: [
      { entity: 'Items', count: 354, costCents: 3540 },
      { entity: 'Orders', count: 162, costCents: 1620 },
      { entity: 'Materials', count: 123, costCents: 1230 },
      { entity: 'Messages', count: 112, costCents: 1120 },
      { entity: 'Workflows', count: 64, costCents: 640 },
      { entity: 'Teams', count: 44, costCents: 440 }
    ]
  }
]

export default function BillingHistoryPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState(mockInvoices)
  const [filteredInvoices, setFilteredInvoices] = useState(mockInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  // Apply filters
  const applyFilters = () => {
    let filtered = invoices

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (dateRange) {
        case '30days':
          cutoffDate.setDate(now.getDate() - 30)
          break
        case '90days':
          cutoffDate.setDate(now.getDate() - 90)
          break
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6)
          break
        case '1year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(invoice => new Date(invoice.issued) >= cutoffDate)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.period.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredInvoices(filtered)
  }

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters()
  }, [statusFilter, dateRange, searchTerm])

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsDrawerOpen(true)
  }

  const handleDownloadInvoice = (invoice: any) => {
    // Mock PDF download
    toast({
      title: "Download Started",
      description: `Downloading ${invoice.id}.pdf`,
    })
  }

  const handleExportInvoices = () => {
    // Generate CSV for invoices
    const csvData = filteredInvoices.map(invoice => ({
      'Invoice #': invoice.id,
      'Period': invoice.period,
      'Status': invoice.status,
      'Subtotal': formatCurrency(invoice.subtotalCents),
      'Tax': formatCurrency(invoice.taxCents),
      'Total': formatCurrency(invoice.totalCents),
      'Issued': invoice.issued,
      'Paid': invoice.paid || ''
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
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `${filteredInvoices.length} invoices exported to CSV`,
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing History</h1>
          <p className="text-muted-foreground">
            View and download your billing invoices
          </p>
        </div>
        <Button onClick={handleExportInvoices}>
          <Download className="w-4 h-4 mr-2" />
          Export Invoices
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground pt-2">
                {filteredInvoices.length} invoices found
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicesTable 
            invoices={filteredInvoices}
            onViewInvoice={handleViewInvoice}
            onDownloadInvoice={handleDownloadInvoice}
          />
        </CardContent>
      </Card>

      {/* Invoice Drawer */}
      <InvoiceDrawer
        invoice={selectedInvoice}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onDownload={handleDownloadInvoice}
      />
    </div>
  )
}
