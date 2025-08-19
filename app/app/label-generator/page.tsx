"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tag, Download, Eye, Plus, Trash2, RefreshCw, Settings, QrCode, Barcode } from "lucide-react"

interface LabelData {
  id: string
  name: string
  template: 'shipping' | 'product' | 'inventory' | 'address' | 'custom'
  size: 'small' | 'medium' | 'large' | 'custom'
  width: number
  height: number
  fields: Record<string, string>
  includeQR: boolean
  includeBarcode: boolean
  qrContent: string
  barcodeContent: string
  backgroundColor: string
  textColor: string
  borderColor: string
  fontSize: number
  timestamp: string
}

interface LabelTemplate {
  id: string
  name: string
  description: string
  size: { width: number; height: number }
  fields: string[]
  includeQR?: boolean
  includeBarcode?: boolean
}

const labelTemplates: LabelTemplate[] = [
  {
    id: 'shipping',
    name: 'Shipping Label',
    description: 'Standard shipping label with addresses and tracking',
    size: { width: 400, height: 300 },
    fields: ['From Name', 'From Address', 'To Name', 'To Address', 'Tracking Number', 'Weight'],
    includeQR: true,
    includeBarcode: true
  },
  {
    id: 'product',
    name: 'Product Label',
    description: 'Product information label with SKU and description',
    size: { width: 300, height: 200 },
    fields: ['Product Name', 'SKU', 'Description', 'Price', 'Barcode'],
    includeBarcode: true
  },
  {
    id: 'inventory',
    name: 'Inventory Label',
    description: 'Warehouse inventory label with location and quantity',
    size: { width: 250, height: 150 },
    fields: ['Item Name', 'Location', 'Quantity', 'Date Received', 'Lot Number'],
    includeQR: true
  },
  {
    id: 'address',
    name: 'Address Label',
    description: 'Simple address label for mailing',
    size: { width: 300, height: 100 },
    fields: ['Name', 'Address Line 1', 'Address Line 2', 'City State ZIP']
  },
  {
    id: 'custom',
    name: 'Custom Label',
    description: 'Create your own custom label format',
    size: { width: 300, height: 200 },
    fields: ['Title', 'Content', 'Footer']
  }
]

export default function LabelGeneratorPage() {
  const [labels, setLabels] = useState<LabelData[]>([])
  const [currentLabel, setCurrentLabel] = useState<Partial<LabelData>>({
    name: "",
    template: 'shipping',
    size: 'medium',
    width: 300,
    height: 200,
    fields: {},
    includeQR: false,
    includeBarcode: false,
    qrContent: "",
    barcodeContent: "",
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    borderColor: '#CCCCCC',
    fontSize: 12
  })
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate>(labelTemplates[0])
  const [showPreview, setShowPreview] = useState(true)

  const handleTemplateChange = (templateId: string) => {
    const template = labelTemplates.find(t => t.id === templateId) || labelTemplates[0]
    setSelectedTemplate(template)
    
    // Initialize fields for the template
    const initialFields: Record<string, string> = {}
    template.fields.forEach(field => {
      initialFields[field] = ''
    })
    
    setCurrentLabel(prev => ({
      ...prev,
      template: templateId as any,
      width: template.size.width,
      height: template.size.height,
      fields: initialFields,
      includeQR: template.includeQR || false,
      includeBarcode: template.includeBarcode || false
    }))
  }

  const updateField = (fieldName: string, value: string) => {
    setCurrentLabel(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: value
      }
    }))
  }

  const generateLabel = () => {
    if (!currentLabel.name) return

    const newLabel: LabelData = {
      id: Date.now().toString(),
      name: currentLabel.name,
      template: currentLabel.template || 'shipping',
      size: currentLabel.size || 'medium',
      width: currentLabel.width || 300,
      height: currentLabel.height || 200,
      fields: currentLabel.fields || {},
      includeQR: currentLabel.includeQR || false,
      includeBarcode: currentLabel.includeBarcode || false,
      qrContent: currentLabel.qrContent || '',
      barcodeContent: currentLabel.barcodeContent || '',
      backgroundColor: currentLabel.backgroundColor || '#FFFFFF',
      textColor: currentLabel.textColor || '#000000',
      borderColor: currentLabel.borderColor || '#CCCCCC',
      fontSize: currentLabel.fontSize || 12,
      timestamp: new Date().toISOString()
    }

    setLabels(prev => [newLabel, ...prev])
    setCurrentLabel(prev => ({ ...prev, name: '', fields: {} }))
  }

  const deleteLabel = (id: string) => {
    setLabels(prev => prev.filter(label => label.id !== id))
  }

  const downloadLabel = (label: LabelData) => {
    // Mock download - generate label as canvas
    const canvas = document.createElement('canvas')
    canvas.width = label.width
    canvas.height = label.height
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Fill background
      ctx.fillStyle = label.backgroundColor
      ctx.fillRect(0, 0, label.width, label.height)
      
      // Draw border
      ctx.strokeStyle = label.borderColor
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, label.width - 2, label.height - 2)
      
      // Draw text fields
      ctx.fillStyle = label.textColor
      ctx.font = `${label.fontSize}px Arial`
      
      let yPosition = 30
      const lineHeight = label.fontSize + 5
      
      Object.entries(label.fields).forEach(([fieldName, value]) => {
        if (value) {
          ctx.fillText(`${fieldName}: ${value}`, 10, yPosition)
          yPosition += lineHeight
        }
      })
      
      // Draw QR code placeholder if enabled
      if (label.includeQR) {
        ctx.strokeStyle = label.textColor
        ctx.strokeRect(label.width - 80, 10, 60, 60)
        ctx.fillText('QR', label.width - 55, 45)
      }
      
      // Draw barcode placeholder if enabled
      if (label.includeBarcode) {
        const barcodeY = label.includeQR ? 80 : 10
        ctx.strokeRect(label.width - 100, barcodeY, 80, 20)
        ctx.fillText('|||||||||||', label.width - 95, barcodeY + 15)
      }
    }

    // Download the canvas as image
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `label-${label.name.replace(/\s+/g, '_')}.png`
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

  const renderLabelPreview = (label: Partial<LabelData>) => {
    return (
      <div 
        className="border-2 p-4 bg-white text-black relative"
        style={{
          width: `${Math.min(label.width || 300, 300)}px`,
          height: `${Math.min(label.height || 200, 200)}px`,
          backgroundColor: label.backgroundColor,
          borderColor: label.borderColor,
          color: label.textColor,
          fontSize: `${Math.min(label.fontSize || 12, 14)}px`
        }}
      >
        {/* Fields */}
        <div className="space-y-1">
          {Object.entries(label.fields || {}).map(([fieldName, value]) => (
            value && (
              <div key={fieldName} className="truncate">
                <span className="font-semibold">{fieldName}:</span> {value}
              </div>
            )
          ))}
        </div>
        
        {/* QR Code */}
        {label.includeQR && (
          <div className="absolute top-2 right-2">
            <QrCode className="h-12 w-12 border" />
          </div>
        )}
        
        {/* Barcode */}
        {label.includeBarcode && (
          <div className="absolute bottom-2 right-2">
            <Barcode className="h-6 w-16 border" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Tag className="h-8 w-8 text-amber-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Label Generator</h1>
          <p className="text-gray-600">Create custom labels for shipping, inventory, and product identification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Label Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Label Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Template Type</Label>
                <Select 
                  value={currentLabel.template} 
                  onValueChange={handleTemplateChange}
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
                  {selectedTemplate.description}
                </p>
              </div>

              <div>
                <Label htmlFor="labelName">Label Name</Label>
                <Input
                  id="labelName"
                  placeholder="Enter label name"
                  value={currentLabel.name}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Label Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Label Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    min="100"
                    max="600"
                    value={currentLabel.width}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, width: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="50"
                    max="400"
                    value={currentLabel.height}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, height: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="8"
                  max="24"
                  value={currentLabel.fontSize}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="backgroundColor">Background</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={currentLabel.backgroundColor}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="textColor">Text</Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={currentLabel.textColor}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, textColor: e.target.value }))}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="borderColor">Border</Label>
                  <Input
                    id="borderColor"
                    type="color"
                    value={currentLabel.borderColor}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, borderColor: e.target.value }))}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeQR"
                    checked={currentLabel.includeQR}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, includeQR: e.target.checked }))}
                  />
                  <Label htmlFor="includeQR">Include QR Code</Label>
                </div>

                {currentLabel.includeQR && (
                  <div>
                    <Label htmlFor="qrContent">QR Content</Label>
                    <Input
                      id="qrContent"
                      placeholder="QR code content"
                      value={currentLabel.qrContent}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, qrContent: e.target.value }))}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeBarcode"
                    checked={currentLabel.includeBarcode}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, includeBarcode: e.target.checked }))}
                  />
                  <Label htmlFor="includeBarcode">Include Barcode</Label>
                </div>

                {currentLabel.includeBarcode && (
                  <div>
                    <Label htmlFor="barcodeContent">Barcode Content</Label>
                    <Input
                      id="barcodeContent"
                      placeholder="Barcode content"
                      value={currentLabel.barcodeContent}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, barcodeContent: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Field Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Label Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedTemplate.fields.map(fieldName => (
                <div key={fieldName}>
                  <Label htmlFor={fieldName}>{fieldName}</Label>
                  <Input
                    id={fieldName}
                    placeholder={`Enter ${fieldName.toLowerCase()}`}
                    value={currentLabel.fields?.[fieldName] || ''}
                    onChange={(e) => updateField(fieldName, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={generateLabel} className="w-full" disabled={!currentLabel.name}>
            <Tag className="h-4 w-4 mr-2" />
            Generate Label
          </Button>
        </div>

        {/* Preview & Generated Labels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Label Preview</span>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </CardTitle>
            </CardHeader>
            {showPreview && (
              <CardContent>
                <div className="flex justify-center">
                  {renderLabelPreview(currentLabel)}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Generated Labels */}
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
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {labels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labels.map((label) => (
                <Card key={label.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {label.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(label.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLabel(label.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Label Preview */}
                    <div className="flex justify-center">
                      {renderLabelPreview(label)}
                    </div>

                    {/* Label Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Template:</span>
                        <Badge variant="outline" className="text-xs">
                          {label.template}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Size:</span>
                        <span>{label.width}×{label.height}px</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Features:</span>
                        <div className="flex gap-1">
                          {label.includeQR && <Badge variant="outline" className="text-xs">QR</Badge>}
                          {label.includeBarcode && <Badge variant="outline" className="text-xs">Barcode</Badge>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadLabel(label)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Labels Generated</h3>
                  <p className="text-gray-600">Create your first label using the configuration panel</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
