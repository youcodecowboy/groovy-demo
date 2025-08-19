'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Send, 
  Calculator,
  Building,
  Calendar,
  Plus,
  Eye,
  Check,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material, formatCurrency } from '@/types/materials'

interface POGenerationPanelProps {
  material: Material
  onPOGenerated?: (poId: string) => void
}

export default function POGenerationPanel({ material, onPOGenerated }: POGenerationPanelProps) {
  const { toast } = useToast()
  const [poHistory, setPOHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPODialog, setShowNewPODialog] = useState(false)
  const [newPO, setNewPO] = useState({
    quantity: '',
    unitCost: '',
    supplier: '',
    expectedDelivery: '',
    notes: ''
  })

  useEffect(() => {
    loadPOHistory()
  }, [material.id])

  const loadPOHistory = async () => {
    try {
      setLoading(true)
      const historyData = await dataAdapter.getPurchaseOrderHistory(material.id)
      setPOHistory(historyData)
    } catch (error) {
      console.error('Failed to load PO history:', error)
      toast({
        title: "Error",
        description: "Failed to load purchase order history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePO = async () => {
    try {
      const quantity = parseFloat(newPO.quantity)
      const unitCost = parseFloat(newPO.unitCost)
      
      if (!quantity || !unitCost || !newPO.supplier) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const poId = await dataAdapter.createPurchaseOrder(
        material.id,
        quantity,
        unitCost,
        newPO.supplier,
        newPO.notes
      )

      setNewPO({ quantity: '', unitCost: '', supplier: '', expectedDelivery: '', notes: '' })
      setShowNewPODialog(false)
      await loadPOHistory()
      onPOGenerated?.(poId)

      toast({
        title: "PO Created",
        description: `Purchase order ${poId} has been created`,
      })

      // Generate PDF invoice
      generatePDFInvoice(poId, quantity, unitCost, newPO.supplier)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      })
    }
  }

  const generatePDFInvoice = (poId: string, quantity: number, unitCost: number, supplier: string) => {
    // Mock PDF generation - in real app would use a PDF library
    const invoiceData = {
      poId,
      material,
      quantity,
      unitCost,
      totalValue: quantity * unitCost,
      supplier,
      generatedAt: new Date().toISOString(),
      companyName: 'Your Company Name',
      companyAddress: '123 Business St, City, State 12345',
      companyPhone: '(555) 123-4567',
      companyEmail: 'orders@company.com'
    }

    // Create a simple HTML invoice and convert to PDF
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order ${poId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .po-details { margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PURCHASE ORDER</h1>
            <h2>PO #${poId}</h2>
          </div>
          
          <div class="company-info">
            <strong>${invoiceData.companyName}</strong><br>
            ${invoiceData.companyAddress}<br>
            Phone: ${invoiceData.companyPhone}<br>
            Email: ${invoiceData.companyEmail}
          </div>
          
          <div class="po-details">
            <p><strong>Supplier:</strong> ${supplier}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Expected Delivery:</strong> ${newPO.expectedDelivery || 'TBD'}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Unit Cost</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${material.code}</td>
                <td>${material.name}</td>
                <td>${quantity}</td>
                <td>${material.defaultUnit}</td>
                <td>${formatCurrency(unitCost)}</td>
                <td>${formatCurrency(quantity * unitCost)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">
            Total: ${formatCurrency(quantity * unitCost)}
          </div>
          
          ${newPO.notes ? `<p><strong>Notes:</strong> ${newPO.notes}</p>` : ''}
        </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PO-${poId}-${material.code}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Invoice Generated",
      description: `PDF invoice for PO ${poId} has been downloaded`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-600">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick reorder section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Reorder
            </CardTitle>
            <Dialog open={showNewPODialog} onOpenChange={setShowNewPODialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate PO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate Purchase Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Material info */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Material:</span>
                          <span className="ml-2 font-medium">{material.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Code:</span>
                          <span className="ml-2 font-mono">{material.code}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Unit:</span>
                          <span className="ml-2">{material.defaultUnit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reorder Point:</span>
                          <span className="ml-2">{material.reorderPoint || 'Not set'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="po-quantity">Quantity *</Label>
                      <Input
                        id="po-quantity"
                        type="number"
                        placeholder="Enter quantity"
                        value={newPO.quantity}
                        onChange={(e) => setNewPO({ ...newPO, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="po-unit-cost">Unit Cost *</Label>
                      <Input
                        id="po-unit-cost"
                        type="number"
                        step="0.01"
                        placeholder="Cost per unit"
                        value={newPO.unitCost}
                        onChange={(e) => setNewPO({ ...newPO, unitCost: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="po-supplier">Supplier *</Label>
                    <Input
                      id="po-supplier"
                      placeholder="Supplier name"
                      value={newPO.supplier}
                      onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="po-delivery">Expected Delivery</Label>
                    <Input
                      id="po-delivery"
                      type="date"
                      value={newPO.expectedDelivery}
                      onChange={(e) => setNewPO({ ...newPO, expectedDelivery: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="po-notes">Notes</Label>
                    <Textarea
                      id="po-notes"
                      placeholder="Special instructions or notes"
                      value={newPO.notes}
                      onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Cost calculation */}
                  {newPO.quantity && newPO.unitCost && (
                    <Card className="bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Order Value:</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(parseFloat(newPO.quantity) * parseFloat(newPO.unitCost))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewPODialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePO}>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate PO & Invoice
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Generate Purchase Order</h3>
            <p className="text-muted-foreground mb-4">
              Create a branded purchase order with PDF invoice for easy reordering
            </p>
            <Button onClick={() => setShowNewPODialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New PO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PO History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Purchase Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : poHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO ID</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poHistory.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 rounded">{po.id}</code>
                    </TableCell>
                    <TableCell>
                      {new Date(po.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {po.quantity} {material.defaultUnit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(po.unitCost)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(po.totalValue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {po.supplier}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(po.status)}
                    </TableCell>
                    <TableCell>
                      {po.deliveredDate ? new Date(po.deliveredDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Purchase Order Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>PO ID</Label>
                                <p className="text-sm font-mono">{po.id}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                {getStatusBadge(po.status)}
                              </div>
                              <div>
                                <Label>Order Date</Label>
                                <p className="text-sm">{new Date(po.orderDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <Label>Delivered Date</Label>
                                <p className="text-sm">
                                  {po.deliveredDate ? new Date(po.deliveredDate).toLocaleDateString() : 'Not delivered'}
                                </p>
                              </div>
                              <div>
                                <Label>Quantity</Label>
                                <p className="text-sm font-medium">{po.quantity} {material.defaultUnit}</p>
                              </div>
                              <div>
                                <Label>Unit Cost</Label>
                                <p className="text-sm">{formatCurrency(po.unitCost)}</p>
                              </div>
                              <div className="col-span-2">
                                <Label>Supplier</Label>
                                <p className="text-sm">{po.supplier}</p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>Total Value:</span>
                              <span>{formatCurrency(po.totalValue)}</span>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => generatePDFInvoice(po.id, po.quantity, po.unitCost, po.supplier)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download Invoice
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p>No purchase orders found</p>
              <p className="text-sm">Create your first PO to start tracking order history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
