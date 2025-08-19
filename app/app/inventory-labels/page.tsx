"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PackageCheck, Download, QrCode, Barcode, MapPin, Calendar, Package, Hash } from "lucide-react"

interface InventoryLabel {
  id: string
  itemName: string
  sku: string
  location: string
  binLocation: string
  quantity: number
  unit: string
  receivedDate: string
  expiryDate: string
  lotNumber: string
  supplier: string
  category: 'fabric' | 'trim' | 'accessory' | 'packaging' | 'finished'
  qrCode: string
  barcode: string
  labelSize: 'small' | 'medium' | 'large'
  includeQR: boolean
  includeBarcode: boolean
  timestamp: string
}

interface LabelTemplate {
  id: string
  name: string
  size: { width: number; height: number }
  fields: string[]
}

const labelTemplates: LabelTemplate[] = [
  {
    id: 'standard',
    name: 'Standard Inventory',
    size: { width: 300, height: 200 },
    fields: ['itemName', 'sku', 'location', 'quantity', 'receivedDate', 'lotNumber']
  },
  {
    id: 'fabric',
    name: 'Fabric Roll',
    size: { width: 400, height: 150 },
    fields: ['itemName', 'sku', 'location', 'quantity', 'supplier', 'lotNumber', 'expiryDate']
  },
  {
    id: 'small',
    name: 'Small Item',
    size: { width: 200, height: 150 },
    fields: ['itemName', 'sku', 'location', 'quantity']
  },
  {
    id: 'bin',
    name: 'Bin Location',
    size: { width: 250, height: 100 },
    fields: ['location', 'binLocation', 'category']
  }
]

const categories = [
  { id: 'fabric', name: 'Fabric', color: 'bg-blue-100 text-blue-800' },
  { id: 'trim', name: 'Trim', color: 'bg-green-100 text-green-800' },
  { id: 'accessory', name: 'Accessory', color: 'bg-purple-100 text-purple-800' },
  { id: 'packaging', name: 'Packaging', color: 'bg-orange-100 text-orange-800' },
  { id: 'finished', name: 'Finished Goods', color: 'bg-red-100 text-red-800' }
]

export default function InventoryLabelsPage() {
  const [labels, setLabels] = useState<InventoryLabel[]>([])
  const [currentLabel, setCurrentLabel] = useState<Partial<InventoryLabel>>({
    itemName: "",
    sku: "",
    location: "",
    binLocation: "",
    quantity: 1,
    unit: "PCS",
    receivedDate: new Date().toISOString().split('T')[0],
    expiryDate: "",
    lotNumber: "",
    supplier: "",
    category: 'fabric',
    labelSize: 'medium',
    includeQR: true,
    includeBarcode: true
  })
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate>(labelTemplates[0])
  const [batchMode, setBatchMode] = useState(false)
  const [batchCount, setBatchCount] = useState(10)
  const [batchPrefix, setBatchPrefix] = useState("ITEM-")

  const generateQRContent = (label: Partial<InventoryLabel>): string => {
    return JSON.stringify({
      sku: label.sku,
      location: label.location,
      lot: label.lotNumber,
      qty: label.quantity,
      date: label.receivedDate
    })
  }

  const generateBarcode = (sku: string): string => {
    // Simple barcode generation based on SKU
    return sku.replace(/[^A-Z0-9]/g, '').substring(0, 12).padEnd(12, '0')
  }

  const generateSingleLabel = () => {
    if (!currentLabel.itemName || !currentLabel.sku) return

    const qrContent = generateQRContent(currentLabel)
    const barcodeContent = generateBarcode(currentLabel.sku || '')

    const newLabel: InventoryLabel = {
      id: Date.now().toString(),
      itemName: currentLabel.itemName || '',
      sku: currentLabel.sku || '',
      location: currentLabel.location || '',
      binLocation: currentLabel.binLocation || '',
      quantity: currentLabel.quantity || 1,
      unit: currentLabel.unit || 'PCS',
      receivedDate: currentLabel.receivedDate || new Date().toISOString().split('T')[0],
      expiryDate: currentLabel.expiryDate || '',
      lotNumber: currentLabel.lotNumber || '',
      supplier: currentLabel.supplier || '',
      category: currentLabel.category || 'fabric',
      qrCode: qrContent,
      barcode: barcodeContent,
      labelSize: currentLabel.labelSize || 'medium',
      includeQR: currentLabel.includeQR ?? true,
      includeBarcode: currentLabel.includeBarcode ?? true,
      timestamp: new Date().toISOString()
    }

    setLabels(prev => [newLabel, ...prev])
    setCurrentLabel(prev => ({ ...prev, itemName: '', sku: '', lotNumber: '' }))
  }

  const generateBatchLabels = () => {
    if (!currentLabel.itemName) return

    const newLabels: InventoryLabel[] = []
    
    for (let i = 1; i <= batchCount; i++) {
      const sku = `${batchPrefix}${i.toString().padStart(3, '0')}`
      const itemName = `${currentLabel.itemName} #${i}`
      const lotNumber = `LOT-${Date.now()}-${i}`
      
      const qrContent = generateQRContent({ ...currentLabel, sku, lotNumber })
      const barcodeContent = generateBarcode(sku)

      const label: InventoryLabel = {
        id: `batch-${Date.now()}-${i}`,
        itemName,
        sku,
        location: currentLabel.location || '',
        binLocation: currentLabel.binLocation || '',
        quantity: currentLabel.quantity || 1,
        unit: currentLabel.unit || 'PCS',
        receivedDate: currentLabel.receivedDate || new Date().toISOString().split('T')[0],
        expiryDate: currentLabel.expiryDate || '',
        lotNumber,
        supplier: currentLabel.supplier || '',
        category: currentLabel.category || 'fabric',
        qrCode: qrContent,
        barcode: barcodeContent,
        labelSize: currentLabel.labelSize || 'medium',
        includeQR: currentLabel.includeQR ?? true,
        includeBarcode: currentLabel.includeBarcode ?? true,
        timestamp: new Date().toISOString()
      }

      newLabels.push(label)
    }

    setLabels(prev => [...newLabels, ...prev])
  }

  const downloadLabel = (label: InventoryLabel) => {
    const template = labelTemplates.find(t => t.id === selectedTemplate.id) || labelTemplates[0]
    
    // Create canvas for label
    const canvas = document.createElement('canvas')
    canvas.width = template.size.width
    canvas.height = template.size.height
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Fill background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw border
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
      
      // Draw text fields
      ctx.fillStyle = '#000000'
      ctx.font = '14px Arial'
      
      let yPosition = 25
      const lineHeight = 18
      
      // Item name (larger font)
      ctx.font = 'bold 16px Arial'
      ctx.fillText(label.itemName, 10, yPosition)
      yPosition += 25
      ctx.font = '12px Arial'
      
      // Other fields
      const fieldMap: Record<string, string> = {
        sku: `SKU: ${label.sku}`,
        location: `Location: ${label.location}`,
        binLocation: `Bin: ${label.binLocation}`,
        quantity: `Qty: ${label.quantity} ${label.unit}`,
        receivedDate: `Received: ${new Date(label.receivedDate).toLocaleDateString()}`,
        expiryDate: label.expiryDate ? `Expires: ${new Date(label.expiryDate).toLocaleDateString()}` : '',
        lotNumber: `Lot: ${label.lotNumber}`,
        supplier: `Supplier: ${label.supplier}`
      }
      
      template.fields.forEach(field => {
        if (fieldMap[field] && fieldMap[field] !== `${field.charAt(0).toUpperCase() + field.slice(1)}: `) {
          ctx.fillText(fieldMap[field], 10, yPosition)
          yPosition += lineHeight
        }
      })
      
      // Draw QR code placeholder
      if (label.includeQR) {
        const qrSize = 60
        const qrX = canvas.width - qrSize - 10
        const qrY = 10
        ctx.strokeRect(qrX, qrY, qrSize, qrSize)
        ctx.font = '10px Arial'
        ctx.fillText('QR', qrX + 25, qrY + 35)
      }
      
      // Draw barcode placeholder
      if (label.includeBarcode) {
        const barcodeWidth = 80
        const barcodeHeight = 20
        const barcodeX = canvas.width - barcodeWidth - 10
        const barcodeY = label.includeQR ? 80 : 10
        
        ctx.strokeRect(barcodeX, barcodeY, barcodeWidth, barcodeHeight)
        ctx.font = '8px monospace'
        ctx.fillText('|||||||||||', barcodeX + 5, barcodeY + 15)
      }
    }

    // Download the canvas as image
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `inventory-label-${label.sku}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    })
  }

  const downloadAllLabels = () => {
    labels.forEach((label, index) => {
      setTimeout(() => downloadLabel(label), index * 100)
    })
  }

  const clearAllLabels = () => {
    setLabels([])
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  const renderLabelPreview = (label: Partial<InventoryLabel>) => {
    const template = selectedTemplate
    return (
      <div 
        className="border-2 border-gray-300 bg-white p-3 relative"
        style={{
          width: `${Math.min(template.size.width / 2, 200)}px`,
          height: `${Math.min(template.size.height / 2, 150)}px`,
          fontSize: '10px'
        }}
      >
        {/* Item name */}
        <div className="font-bold text-xs mb-1 truncate">{label.itemName}</div>
        
        {/* Fields */}
        <div className="space-y-0.5 text-xs">
          {template.fields.includes('sku') && label.sku && (
            <div className="truncate">SKU: {label.sku}</div>
          )}
          {template.fields.includes('location') && label.location && (
            <div className="truncate">Loc: {label.location}</div>
          )}
          {template.fields.includes('quantity') && (
            <div className="truncate">Qty: {label.quantity} {label.unit}</div>
          )}
          {template.fields.includes('lotNumber') && label.lotNumber && (
            <div className="truncate">Lot: {label.lotNumber}</div>
          )}
        </div>
        
        {/* QR Code */}
        {label.includeQR && (
          <div className="absolute top-1 right-1">
            <QrCode className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Barcode */}
        {label.includeBarcode && (
          <div className="absolute bottom-1 right-1">
            <Barcode className="h-4 w-8 text-gray-400" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <PackageCheck className="h-8 w-8 text-teal-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Labels</h1>
          <p className="text-gray-600">Generate inventory labels with QR codes and barcodes for warehouse management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={!batchMode ? 'default' : 'outline'}
                  onClick={() => setBatchMode(false)}
                  className="flex-1"
                >
                  Single
                </Button>
                <Button
                  variant={batchMode ? 'default' : 'outline'}
                  onClick={() => setBatchMode(true)}
                  className="flex-1"
                >
                  Batch
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Label Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Template</Label>
                <Select 
                  value={selectedTemplate.id} 
                  onValueChange={(value) => {
                    const template = labelTemplates.find(t => t.id === value) || labelTemplates[0]
                    setSelectedTemplate(template)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {labelTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedTemplate.size.width}×{selectedTemplate.size.height}px
                </p>
              </div>

              <div className="flex justify-center">
                {renderLabelPreview(currentLabel)}
              </div>
            </CardContent>
          </Card>

          {/* Item Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  placeholder="Cotton Fabric - Navy Blue"
                  value={currentLabel.itemName}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, itemName: e.target.value }))}
                />
              </div>

              {!batchMode && (
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="FAB-COT-001"
                    value={currentLabel.sku}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, sku: e.target.value }))}
                  />
                </div>
              )}

              {batchMode && (
                <>
                  <div>
                    <Label htmlFor="batchPrefix">SKU Prefix</Label>
                    <Input
                      id="batchPrefix"
                      placeholder="ITEM-"
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchCount">Batch Count</Label>
                    <Input
                      id="batchCount"
                      type="number"
                      min="1"
                      max="100"
                      value={batchCount}
                      onChange={(e) => setBatchCount(Number(e.target.value))}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={currentLabel.quantity}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={currentLabel.unit} 
                    onValueChange={(value) => setCurrentLabel(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PCS">PCS</SelectItem>
                      <SelectItem value="M">Meters</SelectItem>
                      <SelectItem value="YDS">Yards</SelectItem>
                      <SelectItem value="KG">Kilograms</SelectItem>
                      <SelectItem value="ROLLS">Rolls</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={currentLabel.category} 
                  onValueChange={(value: any) => setCurrentLabel(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Warehouse Location</Label>
                <Input
                  id="location"
                  placeholder="A-01-02"
                  value={currentLabel.location}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="binLocation">Bin Location</Label>
                <Input
                  id="binLocation"
                  placeholder="Bin-A-15"
                  value={currentLabel.binLocation}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, binLocation: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Fabric Suppliers Inc."
                  value={currentLabel.supplier}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates & Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="receivedDate">Received Date</Label>
                <Input
                  id="receivedDate"
                  type="date"
                  value={currentLabel.receivedDate}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, receivedDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={currentLabel.expiryDate}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>

              {!batchMode && (
                <div>
                  <Label htmlFor="lotNumber">Lot Number</Label>
                  <Input
                    id="lotNumber"
                    placeholder="LOT-2024-001"
                    value={currentLabel.lotNumber}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, lotNumber: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Options */}
          <Card>
            <CardHeader>
              <CardTitle>Code Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeQR"
                  checked={currentLabel.includeQR}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, includeQR: e.target.checked }))}
                />
                <Label htmlFor="includeQR">Include QR Code</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeBarcode"
                  checked={currentLabel.includeBarcode}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, includeBarcode: e.target.checked }))}
                />
                <Label htmlFor="includeBarcode">Include Barcode</Label>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={batchMode ? generateBatchLabels : generateSingleLabel} 
            className="w-full" 
            disabled={!currentLabel.itemName}
          >
            <Hash className="h-4 w-4 mr-2" />
            Generate {batchMode ? `${batchCount} Labels` : 'Label'}
          </Button>
        </div>

        {/* Generated Labels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Labels ({labels.length})</span>
                <div className="flex gap-2">
                  {labels.length > 0 && (
                    <>
                      <Button variant="outline" onClick={downloadAllLabels}>
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                      <Button variant="outline" onClick={clearAllLabels}>
                        Clear All
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Labels Grid */}
          {labels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {labels.map((label) => {
                const categoryInfo = getCategoryInfo(label.category)
                return (
                  <Card key={label.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {label.itemName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {label.sku} • {new Date(label.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <Badge className={categoryInfo.color + ' text-xs'}>
                          {categoryInfo.name}
                        </Badge>
                      </div>

                      {/* Label Preview */}
                      <div className="flex justify-center mb-3">
                        {renderLabelPreview(label)}
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span>{label.location || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span>{label.quantity} {label.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lot:</span>
                          <span>{label.lotNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Features:</span>
                          <div className="flex gap-1">
                            {label.includeQR && <Badge variant="outline" className="text-xs">QR</Badge>}
                            {label.includeBarcode && <Badge variant="outline" className="text-xs">BC</Badge>}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => downloadLabel(label)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <PackageCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Labels Generated</h3>
                  <p className="text-gray-600">Configure your inventory items and generate labels for warehouse management</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
