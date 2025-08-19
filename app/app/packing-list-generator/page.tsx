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
import { ClipboardList, Download, Eye, Plus, Trash2, Package, MapPin, Weight } from "lucide-react"

interface PackingItem {
  id: string
  itemNumber: string
  description: string
  hsCode: string
  quantity: number
  unit: string
  unitWeight: number
  totalWeight: number
  unitValue: number
  totalValue: number
  countryOfOrigin: string
}

interface PackingListData {
  packingListNumber: string
  date: string
  invoiceNumber: string
  awbNumber: string
  exporter: {
    name: string
    address: string
    phone: string
    email: string
  }
  consignee: {
    name: string
    address: string
    phone: string
    email: string
  }
  shipment: {
    totalPackages: number
    packageType: string
    totalWeight: number
    totalValue: number
    currency: string
    incoterms: string
    portOfLoading: string
    portOfDischarge: string
  }
  items: PackingItem[]
  notes: string
}

export default function PackingListGeneratorPage() {
  const [packingList, setPackingList] = useState<PackingListData>({
    packingListNumber: `PL-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: "",
    awbNumber: "",
    exporter: {
      name: "Skywalker Textiles",
      address: "123 Factory Lane\nTatooine, Outer Rim 12345",
      phone: "+1 (555) 123-4567",
      email: "export@skywalker-textiles.com"
    },
    consignee: {
      name: "",
      address: "",
      phone: "",
      email: ""
    },
    shipment: {
      totalPackages: 1,
      packageType: "Carton",
      totalWeight: 0,
      totalValue: 0,
      currency: "USD",
      incoterms: "FOB",
      portOfLoading: "",
      portOfDischarge: ""
    },
    items: [{
      id: "1",
      itemNumber: "JR-001",
      description: "Jedi Robe - Brown Cotton",
      hsCode: "6204.12.0010",
      quantity: 50,
      unit: "PCS",
      unitWeight: 0.8,
      totalWeight: 40,
      unitValue: 150,
      totalValue: 7500,
      countryOfOrigin: "USA"
    }],
    notes: ""
  })

  const [showPreview, setShowPreview] = useState(false)

  const addItem = () => {
    const newItem: PackingItem = {
      id: Date.now().toString(),
      itemNumber: "",
      description: "",
      hsCode: "",
      quantity: 1,
      unit: "PCS",
      unitWeight: 0,
      totalWeight: 0,
      unitValue: 0,
      totalValue: 0,
      countryOfOrigin: "USA"
    }
    setPackingList(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (id: string) => {
    setPackingList(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const updateItem = (id: string, field: keyof PackingItem, value: string | number) => {
    setPackingList(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitWeight') {
            updated.totalWeight = updated.quantity * updated.unitWeight
          }
          if (field === 'quantity' || field === 'unitValue') {
            updated.totalValue = updated.quantity * updated.unitValue
          }
          return updated
        }
        return item
      })
    }))
  }

  // Calculate totals
  const totalQuantity = packingList.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalWeight = packingList.items.reduce((sum, item) => sum + item.totalWeight, 0)
  const totalValue = packingList.items.reduce((sum, item) => sum + item.totalValue, 0)

  // Update shipment totals
  if (packingList.shipment.totalWeight !== totalWeight || packingList.shipment.totalValue !== totalValue) {
    setPackingList(prev => ({
      ...prev,
      shipment: {
        ...prev.shipment,
        totalWeight: totalWeight,
        totalValue: totalValue
      }
    }))
  }

  const generatePDF = () => {
    // Mock PDF generation
    const link = document.createElement('a')
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago...'
    link.download = `${packingList.packingListNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Packing List Generator</h1>
          <p className="text-gray-600">Create detailed packing lists for international shipments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packing List Form */}
        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="packingListNumber">Packing List Number</Label>
                  <Input
                    id="packingListNumber"
                    value={packingList.packingListNumber}
                    onChange={(e) => setPackingList(prev => ({ ...prev, packingListNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={packingList.date}
                    onChange={(e) => setPackingList(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="INV-123456"
                    value={packingList.invoiceNumber}
                    onChange={(e) => setPackingList(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="awbNumber">AWB/BL Number</Label>
                  <Input
                    id="awbNumber"
                    placeholder="AWB-123456"
                    value={packingList.awbNumber}
                    onChange={(e) => setPackingList(prev => ({ ...prev, awbNumber: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consignee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Consignee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="consigneeName">Company/Name</Label>
                <Input
                  id="consigneeName"
                  placeholder="Jedi Order"
                  value={packingList.consignee.name}
                  onChange={(e) => setPackingList(prev => ({
                    ...prev,
                    consignee: { ...prev.consignee, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="consigneeAddress">Address</Label>
                <Textarea
                  id="consigneeAddress"
                  placeholder="Jedi Temple, Coruscant"
                  value={packingList.consignee.address}
                  onChange={(e) => setPackingList(prev => ({
                    ...prev,
                    consignee: { ...prev.consignee, address: e.target.value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consigneePhone">Phone</Label>
                  <Input
                    id="consigneePhone"
                    placeholder="+44 20 7946 0958"
                    value={packingList.consignee.phone}
                    onChange={(e) => setPackingList(prev => ({
                      ...prev,
                      consignee: { ...prev.consignee, phone: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="consigneeEmail">Email</Label>
                  <Input
                    id="consigneeEmail"
                    type="email"
                    placeholder="orders@jediorder.com"
                    value={packingList.consignee.email}
                    onChange={(e) => setPackingList(prev => ({
                      ...prev,
                      consignee: { ...prev.consignee, email: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Shipment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="totalPackages">Total Packages</Label>
                  <Input
                    id="totalPackages"
                    type="number"
                    min="1"
                    value={packingList.shipment.totalPackages}
                    onChange={(e) => setPackingList(prev => ({
                      ...prev,
                      shipment: { ...prev.shipment, totalPackages: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="packageType">Package Type</Label>
                  <Select 
                    value={packingList.shipment.packageType} 
                    onValueChange={(value) => setPackingList(prev => ({
                      ...prev,
                      shipment: { ...prev.shipment, packageType: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carton">Carton</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Crate">Crate</SelectItem>
                      <SelectItem value="Pallet">Pallet</SelectItem>
                      <SelectItem value="Roll">Roll</SelectItem>
                      <SelectItem value="Bundle">Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={packingList.shipment.currency} 
                    onValueChange={(value) => setPackingList(prev => ({
                      ...prev,
                      shipment: { ...prev.shipment, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incoterms">Incoterms</Label>
                  <Select 
                    value={packingList.shipment.incoterms} 
                    onValueChange={(value) => setPackingList(prev => ({
                      ...prev,
                      shipment: { ...prev.shipment, incoterms: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOB">FOB (Free On Board)</SelectItem>
                      <SelectItem value="CIF">CIF (Cost, Insurance & Freight)</SelectItem>
                      <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
                      <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                      <SelectItem value="FCA">FCA (Free Carrier)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="portOfLoading">Port of Loading</Label>
                  <Input
                    id="portOfLoading"
                    placeholder="New York, NY"
                    value={packingList.shipment.portOfLoading}
                    onChange={(e) => setPackingList(prev => ({
                      ...prev,
                      shipment: { ...prev.shipment, portOfLoading: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="portOfDischarge">Port of Discharge</Label>
                <Input
                  id="portOfDischarge"
                  placeholder="London, UK"
                  value={packingList.shipment.portOfDischarge}
                  onChange={(e) => setPackingList(prev => ({
                    ...prev,
                    shipment: { ...prev.shipment, portOfDischarge: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Packing Items</span>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packingList.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      {packingList.items.length > 1 && (
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
                        <Label>Item Number</Label>
                        <Input
                          placeholder="JR-001"
                          value={item.itemNumber}
                          onChange={(e) => updateItem(item.id, 'itemNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>HS Code</Label>
                        <Input
                          placeholder="6204.12.0010"
                          value={item.hsCode}
                          onChange={(e) => updateItem(item.id, 'hsCode', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Product description"
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
                        <Label>Unit</Label>
                        <Select 
                          value={item.unit} 
                          onValueChange={(value) => updateItem(item.id, 'unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PCS">PCS</SelectItem>
                            <SelectItem value="PAIRS">PAIRS</SelectItem>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="YDS">YDS</SelectItem>
                            <SelectItem value="ROLLS">ROLLS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Country of Origin</Label>
                        <Select 
                          value={item.countryOfOrigin} 
                          onValueChange={(value) => updateItem(item.id, 'countryOfOrigin', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">USA</SelectItem>
                            <SelectItem value="China">China</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                            <SelectItem value="Vietnam">Vietnam</SelectItem>
                            <SelectItem value="Turkey">Turkey</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label>Unit Weight (kg)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitWeight}
                          onChange={(e) => updateItem(item.id, 'unitWeight', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Total Weight</Label>
                        <Input
                          value={`${item.totalWeight} kg`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Unit Value ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitValue}
                          onChange={(e) => updateItem(item.id, 'unitValue', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Total Value</Label>
                        <Input
                          value={`$${item.totalValue.toFixed(2)}`}
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

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="Handling instructions, certifications, etc."
                  value={packingList.notes}
                  onChange={(e) => setPackingList(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packing List Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Packing List Preview</span>
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
                      <h2 className="text-2xl font-bold text-gray-900">PACKING LIST</h2>
                      <p className="text-gray-600">#{packingList.packingListNumber}</p>
                      <p className="text-gray-600">Date: {new Date(packingList.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{packingList.exporter.name}</div>
                      <div className="text-gray-600 whitespace-pre-line">{packingList.exporter.address}</div>
                      <div className="text-gray-600">{packingList.exporter.email}</div>
                      <div className="text-gray-600">{packingList.exporter.phone}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Reference Numbers */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="space-y-1">
                        {packingList.invoiceNumber && (
                          <div className="flex justify-between">
                            <span className="font-medium">Invoice Number:</span>
                            <span>{packingList.invoiceNumber}</span>
                          </div>
                        )}
                        {packingList.awbNumber && (
                          <div className="flex justify-between">
                            <span className="font-medium">AWB/BL Number:</span>
                            <span>{packingList.awbNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium">Incoterms:</span>
                          <span>{packingList.shipment.incoterms}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Port of Loading:</span>
                          <span>{packingList.shipment.portOfLoading}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Port of Discharge:</span>
                          <span>{packingList.shipment.portOfDischarge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total Packages:</span>
                          <span>{packingList.shipment.totalPackages} {packingList.shipment.packageType}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Consignee */}
                  <div>
                    <h3 className="font-semibold mb-2">Consignee:</h3>
                    <div className="text-gray-700">
                      <div className="font-medium">{packingList.consignee.name}</div>
                      <div className="whitespace-pre-line">{packingList.consignee.address}</div>
                      <div>{packingList.consignee.phone}</div>
                      <div>{packingList.consignee.email}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Items Table */}
                  <div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Item #</th>
                          <th className="text-left py-2">Description</th>
                          <th className="text-left py-2">HS Code</th>
                          <th className="text-right py-2">Qty</th>
                          <th className="text-right py-2">Unit Wt</th>
                          <th className="text-right py-2">Total Wt</th>
                          <th className="text-right py-2">Value</th>
                          <th className="text-left py-2">Origin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packingList.items.map((item, index) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2 font-mono">{item.itemNumber}</td>
                            <td className="py-2">{item.description}</td>
                            <td className="py-2 font-mono">{item.hsCode}</td>
                            <td className="text-right py-2">{item.quantity} {item.unit}</td>
                            <td className="text-right py-2">{item.unitWeight} kg</td>
                            <td className="text-right py-2">{item.totalWeight} kg</td>
                            <td className="text-right py-2">${item.totalValue.toFixed(2)}</td>
                            <td className="text-left py-2">{item.countryOfOrigin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Total Quantity:</span>
                        <span className="font-medium">{totalQuantity} pieces</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Weight:</span>
                        <span className="font-medium">{totalWeight.toFixed(2)} kg</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-base">
                        <span>Total Value:</span>
                        <span>{packingList.shipment.currency} {totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {packingList.notes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Notes:</h3>
                        <p className="text-gray-700 whitespace-pre-line">{packingList.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Weight className="h-5 w-5" />
                Shipment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{packingList.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">{totalQuantity} pieces</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Weight:</span>
                  <span className="font-medium">{totalWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Packages:</span>
                  <span className="font-medium">{packingList.shipment.totalPackages} {packingList.shipment.packageType}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Value:</span>
                  <span>{packingList.shipment.currency} {totalValue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}