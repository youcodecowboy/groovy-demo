'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Download, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Calendar
} from 'lucide-react'

interface InvoiceItem {
  entity: string
  count: number
  costCents: number
}

interface Invoice {
  id: string
  period: string
  status: 'paid' | 'pending' | 'overdue'
  subtotalCents: number
  taxCents: number
  totalCents: number
  issued: string
  paid?: string
  items: InvoiceItem[]
}

interface InvoiceDrawerProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload?: (invoice: Invoice) => void
}

export function InvoiceDrawer({ invoice, open, onOpenChange, onDownload }: InvoiceDrawerProps) {
  if (!invoice) return null

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'overdue':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Details
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Invoice Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{invoice.id}</h2>
                <p className="text-muted-foreground">{invoice.period}</p>
              </div>
              {getStatusBadge(invoice.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Issued</div>
                <div className="text-muted-foreground">{formatDate(invoice.issued)}</div>
              </div>
              {invoice.paid && (
                <div>
                  <div className="font-medium">Paid</div>
                  <div className="text-muted-foreground">{formatDate(invoice.paid)}</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-4">
            <h3 className="font-semibold">Usage Breakdown</h3>
            <div className="space-y-3">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.entity}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.count.toLocaleString()} records
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.costCents)}</div>
                    <div className="text-sm text-muted-foreground">
                      ${(item.costCents / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Invoice Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotalCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">{formatCurrency(invoice.taxCents)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(invoice.totalCents)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {onDownload && (
              <Button 
                className="flex-1" 
                onClick={() => onDownload(invoice)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
