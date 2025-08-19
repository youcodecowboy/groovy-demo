'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Download, 
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface Invoice {
  id: string
  period: string
  status: 'paid' | 'pending' | 'overdue'
  subtotalCents: number
  taxCents: number
  totalCents: number
  issued: string
  paid?: string
}

interface InvoicesTableProps {
  invoices: Invoice[]
  onViewInvoice?: (invoice: Invoice) => void
  onDownloadInvoice?: (invoice: Invoice) => void
}

export function InvoicesTable({ invoices, onViewInvoice, onDownloadInvoice }: InvoicesTableProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-right">Tax</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-medium">{invoice.id}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{invoice.period}</div>
              </TableCell>
              <TableCell>
                {getStatusBadge(invoice.status)}
              </TableCell>
              <TableCell className="text-right">
                <div className="font-medium">{formatCurrency(invoice.subtotalCents)}</div>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(invoice.taxCents)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="font-semibold">{formatCurrency(invoice.totalCents)}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatDate(invoice.issued)}</div>
              </TableCell>
              <TableCell>
                {invoice.paid ? (
                  <div className="text-sm">{formatDate(invoice.paid)}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  {onViewInvoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewInvoice(invoice)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  {onDownloadInvoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownloadInvoice(invoice)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {invoices.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No invoices found</h3>
          <p className="text-sm text-muted-foreground">
            Invoices will appear here once they are generated.
          </p>
        </div>
      )}
    </div>
  )
}
