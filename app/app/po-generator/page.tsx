"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Download, Eye, Plus, Trash2, Building2, Calendar, Truck } from "lucide-react"

interface POItem {
  id: string
  sku: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  deliveryDate: string
}

interface PurchaseOrderData {
  poNumber: string
  date: string
  deliveryDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  vendor: {
    name: string
    address: string
    email: string
    phone: string
    contact: string
  }
  shipTo: {
    name: string
    address: string
    contact: string
    phone: string
  }
  items: POItem[]
  terms: string
  notes: string
  paymentTerms: string
}

export default function POGeneratorPage() {
  const [po, setPO] = useState<PurchaseOrderData>({
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    vendor: {
      name: "",
      address: "",
      email: "",
      phone: "",
      contact: ""
    },
    shipTo: {
      name: "Skywalker Textiles",
      address: "123 Factory Lane\nTatooine, Outer Rim 12345",
      contact: "Luke Skywalker",
      phone: "+1 (555) 123-4567"
    },
    items: [{
      id: "1",
      sku: "FAB-COTTON-001",
      description: "Organic Cotton Fabric - Natural",
      quantity: 100,
      unitPrice: 12.50,
      total: 1250.00,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }],
    terms: "Net 30",
    notes: "",
    paymentTerms: "Payment due within 30 days of delivery"
  })

  const [showPreview, setShowPreview] = useState(false)

  const addItem = () => {
    const newItem: POItem = {
      id: Date.now().toString(),
      sku: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      deliveryDate: po.deliveryDate
    }
    setPO(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (id: string) => {
    setPO(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const updateItem = (id: string, field: keyof POItem, value: string | number) => {
    setPO(prev => ({
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

  const total = po.items.reduce((sum, item) => sum + item.total, 0)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const generatePDF = () => {
    // Mock PDF generation
    const link = document.createElement('a')
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago...'
    link.download = `${po.poNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Generator</h1>
          <p className="text-gray-600">Create and manage purchase orders for materials and supplies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PO Form */}
        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="poNumber">PO Number</Label>
                  <Input
                    id="poNumber"
                    value={po.poNumber}
                    onChange={(e) => setPO(prev => ({ ...prev, poNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Order Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={po.date}
                    onChange={(e) => setPO(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryDate">Required Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={po.deliveryDate}
                    onChange={(e) => setPO(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={po.priority} onValueChange={(value: any) => setPO(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  placeholder="Fabric Suppliers Inc."
                  value={po.vendor.name}
                  onChange={(e) => setPO(prev => ({
                    ...prev,
                    vendor: { ...prev.vendor, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="vendorAddress">Address</Label>
                <Textarea
                  id="vendorAddress"
                  placeholder="456 Supplier Street, City, State 67890"
                  value={po.vendor.address}
                  onChange={(e) => setPO(prev => ({
                    ...prev,
                    vendor: { ...prev.vendor, address: e.target.value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendorContact">Contact Person</Label>
                  <Input
                    id="vendorContact"
                    placeholder="John Smith"
                    value={po.vendor.contact}
                    onChange={(e) => setPO(prev => ({
                      ...prev,
                      vendor: { ...prev.vendor, contact: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vendorPhone">Phone</Label>
                  <Input
                    id="vendorPhone"
                    placeholder="+1 (555) 987-6543"
                    value={po.vendor.phone}
                    onChange={(e) => setPO(prev => ({
                      ...prev,
                      vendor: { ...prev.vendor, phone: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="vendorEmail">Email</Label>
                <Input
                  id="vendorEmail"
                  type="email"
                  placeholder="orders@fabrics.com"
                  value={po.vendor.email}
                  onChange={(e) => setPO(prev => ({
                    ...prev,
                    vendor: { ...prev.vendor, email: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Items</span>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {po.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      {po.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>SKU</Label>
                        <Input
                          placeholder="SKU-001"
                          value={item.sku}
                          onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Delivery Date</Label>
                        <Input
                          type="date"
                          value={item.deliveryDate}
                          onChange={(e) => updateItem(item.id, 'deliveryDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Item description"
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

          {/* Terms & Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={po.paymentTerms} onValueChange={(value) => setPO(prev => ({ ...prev, paymentTerms: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payment due within 30 days of delivery">Net 30</SelectItem>
                    <SelectItem value="Payment due within 15 days of delivery">Net 15</SelectItem>
                    <SelectItem value="Payment due immediately upon delivery">Due on Receipt</SelectItem>
                    <SelectItem value="50% upfront, 50% on delivery">50/50 Split</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="Delivery instructions, quality requirements, etc."
                  value={po.notes}
                  onChange={(e) => setPO(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PO Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Purchase Order Preview</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                  <Button onClick={generatePDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {showPreview && (
              <CardContent>
                <div className="bg-white border rounded-lg p-6 space-y-6 text-sm">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">PURCHASE ORDER</h2>
                      <p className="text-gray-600">#{po.poNumber}</p>
                      <Badge className={`mt-2 ${getPriorityColor(po.priority)}`}>
                        {po.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{po.shipTo.name}</div>
                      <div className="text-gray-600 whitespace-pre-line">{po.shipTo.address}</div>
                      <div className="text-gray-600">Contact: {po.shipTo.contact}</div>
                      <div className="text-gray-600">{po.shipTo.phone}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Vendor & Dates */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Vendor:
                      </h3>
                      <div className="text-gray-700">
                        <div className="font-medium">{po.vendor.name}</div>
                        <div className="whitespace-pre-line">{po.vendor.address}</div>
                        <div>Contact: {po.vendor.contact}</div>
                        <div>{po.vendor.email}</div>
                        <div>{po.vendor.phone}</div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Order Date:
                          </span>
                          <span>{new Date(po.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Required By:
                          </span>
                          <span>{new Date(po.deliveryDate).toLocaleDateString()}</span>
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
                          <th className="text-left py-2">SKU</th>
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2">Qty</th>
                          <th className="text-right py-2">Unit Price</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {po.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2 font-mono text-xs">{item.sku}</td>
                            <td className="py-2">{item.description}</td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                            <td className="text-right py-2">${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Order Value:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Notes */}
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Payment Terms:</h3>
                      <p className="text-gray-700">{po.paymentTerms}</p>
                    </div>
                    {po.notes && (
                      <div>
                        <h3 className="font-semibold mb-2">Special Instructions:</h3>
                        <p className="text-gray-700 whitespace-pre-line">{po.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{po.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">{po.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <Badge className={getPriorityColor(po.priority)}>
                    {po.priority.toUpperCase()}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Value:</span>
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