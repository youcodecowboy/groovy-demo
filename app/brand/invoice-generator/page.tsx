"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Receipt, Download, Eye, Plus, Trash2, Building2, User, FileText, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  billTo: {
    name: string
    address: string
    email: string
    phone: string
  }
  billFrom: {
    name: string
    address: string
    email: string
    phone: string
  }
  items: InvoiceItem[]
  notes: string
  taxRate: number
}

export default function InvoiceGeneratorPage() {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billTo: {
      name: "",
      address: "",
      email: "",
      phone: ""
    },
    billFrom: {
      name: "Groovy Brand Solutions",
      address: "456 Brand Avenue\nInnovation District, Tech City 67890",
      email: "billing@groovybrand.com",
      phone: "+1 (555) 987-6543"
    },
    items: [{
      id: "1",
      description: "Premium Brand Consultation",
      quantity: 1,
      unitPrice: 250.00,
      total: 250.00
    }],
    notes: "",
    taxRate: 8.5
  })

  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (id: string) => {
    if (invoice.items.length === 1) {
      toast.error("Invoice must have at least one item")
      return
    }
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
    toast.success("Item removed")
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    }))
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = subtotal * (invoice.taxRate / 100)
  const total = subtotal + taxAmount

  const generatePDF = async () => {
    if (!invoiceRef.current) {
      toast.error("Invoice preview not available")
      return
    }

    setIsGeneratingPDF(true)
    try {
      // Show preview if hidden
      if (!showPreview) {
        setShowPreview(true)
        // Wait for preview to render
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Dynamic imports to avoid SSR issues
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ])

      const element = invoiceRef.current
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        background: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${invoice.invoiceNumber}.pdf`)
      toast.success("PDF generated successfully!")
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error("Failed to generate PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const generateInvoiceNumber = () => {
    const newNumber = `INV-${Date.now().toString().slice(-6)}`
    setInvoice(prev => ({ ...prev, invoiceNumber: newNumber }))
    toast.success("New invoice number generated")
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
          <p className="text-gray-600">Create professional invoices for your brand services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Form */}
        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="invoiceNumber"
                      value={invoice.invoiceNumber}
                      onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateInvoiceNumber}
                      className="shrink-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bill To */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Bill To
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="billToName">Company/Client Name</Label>
                <Input
                  id="billToName"
                  placeholder="Client Company"
                  value={invoice.billTo.name}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    billTo: { ...prev.billTo, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="billToAddress">Address</Label>
                <Textarea
                  id="billToAddress"
                  placeholder="Client Address"
                  value={invoice.billTo.address}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    billTo: { ...prev.billTo, address: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billToEmail">Email</Label>
                  <Input
                    id="billToEmail"
                    type="email"
                    placeholder="client@company.com"
                    value={invoice.billTo.email}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      billTo: { ...prev.billTo, email: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="billToPhone">Phone</Label>
                  <Input
                    id="billToPhone"
                    placeholder="+1 (555) 123-4567"
                    value={invoice.billTo.phone}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      billTo: { ...prev.billTo, phone: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Line Items</span>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={invoice.items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Service or product description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Unit Price ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Total</Label>
                        <Input
                          value={`$${item.total.toFixed(2)}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={invoice.taxRate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Payment terms, special instructions, etc."
                  value={invoice.notes}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Invoice Preview</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                  <Button 
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {showPreview && (
              <CardContent>
                <div 
                  ref={invoiceRef}
                  className="bg-white border rounded-lg p-6 space-y-6 text-sm"
                  style={{ minHeight: '297mm', width: '210mm', margin: '0 auto' }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                      <p className="text-gray-600">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{invoice.billFrom.name}</div>
                      <div className="text-gray-600 whitespace-pre-line">{invoice.billFrom.address}</div>
                      <div className="text-gray-600">{invoice.billFrom.email}</div>
                      <div className="text-gray-600">{invoice.billFrom.phone}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Bill To & Dates */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Bill To:</h3>
                      <div className="text-gray-700">
                        <div className="font-medium">{invoice.billTo.name || 'N/A'}</div>
                        <div className="whitespace-pre-line">{invoice.billTo.address || 'N/A'}</div>
                        <div>{invoice.billTo.email || 'N/A'}</div>
                        <div>{invoice.billTo.phone || 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Invoice Date:</span>
                          <span>{new Date(invoice.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Due Date:</span>
                          <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Items */}
                  <div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2">Qty</th>
                          <th className="text-right py-2">Unit Price</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2">{item.description || 'N/A'}</td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                            <td className="text-right py-2">${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({invoice.taxRate}%):</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Notes:</h3>
                        <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{invoice.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
