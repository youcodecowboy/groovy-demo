"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tag, Download, Eye, Plus, Trash2, RefreshCw, Settings, QrCode, Barcode, FileText, Image } from "lucide-react"
import { toast } from "sonner"

interface LabelData {
  id: string
  name: string
  template: 'product' | 'shipping' | 'brand' | 'custom'
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
  defaultFields?: Record<string, string>
}

const labelTemplates: LabelTemplate[] = [
  {
    id: 'product',
    name: 'Product Label',
    description: 'Brand product label with SKU and description',
    size: { width: 300, height: 200 },
    fields: ['Product Name', 'SKU', 'Description', 'Price', 'Brand Name'],
    includeBarcode: true,
    defaultFields: {
      'Product Name': '',
      'SKU': '',
      'Description': '',
      'Price': '$0.00',
      'Brand Name': 'Groovy Brand Solutions'
    }
  },
  {
    id: 'shipping',
    name: 'Shipping Label',
    description: 'Brand shipping label with addresses and tracking',
    size: { width: 400, height: 300 },
    fields: ['From Name', 'From Address', 'To Name', 'To Address', 'Tracking Number', 'Weight'],
    includeQR: true,
    includeBarcode: true,
    defaultFields: {
      'From Name': 'Groovy Brand Solutions',
      'From Address': '123 Brand Street, Fashion District, NY 10001',
      'To Name': '',
      'To Address': '',
      'Tracking Number': '',
      'Weight': '2.5 lbs'
    }
  },
  {
    id: 'brand',
    name: 'Brand Label',
    description: 'Custom brand label for marketing and identification',
    size: { width: 350, height: 250 },
    fields: ['Brand Name', 'Campaign', 'Description', 'Contact Info', 'Website'],
    includeQR: true,
    defaultFields: {
      'Brand Name': 'Groovy Brand Solutions',
      'Campaign': '',
      'Description': '',
      'Contact Info': 'info@groovybrand.com',
      'Website': 'www.groovybrand.com'
    }
  },
  {
    id: 'custom',
    name: 'Custom Label',
    description: 'Fully customizable label for any purpose',
    size: { width: 300, height: 200 },
    fields: ['Title', 'Content', 'Additional Info'],
    defaultFields: {
      'Title': '',
      'Content': '',
      'Additional Info': ''
    }
  }
]

export default function LabelGeneratorPage() {
  const [labels, setLabels] = useState<LabelData[]>([])
  const [currentLabel, setCurrentLabel] = useState<Partial<LabelData>>({
    name: "",
    template: 'product',
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
    borderColor: '#E5E7EB',
    fontSize: 14
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const getTemplateFields = (templateId: string) => {
    const template = labelTemplates.find(t => t.id === templateId)
    return template?.fields || []
  }

  const updateTemplate = (templateId: string) => {
    const template = labelTemplates.find(t => t.id === templateId)
    if (template) {
      setCurrentLabel(prev => ({
        ...prev,
        template: templateId as any,
        width: template.size.width,
        height: template.size.height,
        fields: template.defaultFields || {},
        includeQR: template.includeQR || false,
        includeBarcode: template.includeBarcode || false
      }))
    }
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

  const generateLabel = async () => {
    if (!currentLabel.name) {
      toast.error("Please enter a label name")
      return
    }

    setIsGenerating(true)
    try {
      const newLabel: LabelData = {
        id: Date.now().toString(),
        name: currentLabel.name,
        template: currentLabel.template || 'product',
        size: currentLabel.size || 'medium',
        width: currentLabel.width || 300,
        height: currentLabel.height || 200,
        fields: currentLabel.fields || {},
        includeQR: currentLabel.includeQR || false,
        includeBarcode: currentLabel.includeBarcode || false,
        qrContent: currentLabel.qrContent || "",
        barcodeContent: currentLabel.barcodeContent || "",
        backgroundColor: currentLabel.backgroundColor || '#FFFFFF',
        textColor: currentLabel.textColor || '#000000',
        borderColor: currentLabel.borderColor || '#E5E7EB',
        fontSize: currentLabel.fontSize || 14,
        timestamp: new Date().toISOString()
      }

      setLabels(prev => [newLabel, ...prev])
      setCurrentLabel(prev => ({ 
        ...prev, 
        name: '', 
        fields: {},
        qrContent: '',
        barcodeContent: ''
      }))
      toast.success("Label generated successfully!")
    } catch (error) {
      toast.error("Failed to generate label")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteLabel = (id: string) => {
    setLabels(prev => prev.filter(label => label.id !== id))
    toast.success("Label deleted")
  }

  const downloadLabel = (label: LabelData) => {
    // In a real implementation, this would generate and download the actual label
    toast.success(`Label "${label.name}" downloaded`)
  }

  const getSizeDimensions = (size: string) => {
    switch (size) {
      case 'small': return { width: 200, height: 150 }
      case 'medium': return { width: 300, height: 200 }
      case 'large': return { width: 400, height: 300 }
      default: return { width: 300, height: 200 }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Tag className="h-8 w-8 text-amber-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Label Generator</h1>
          <p className="text-gray-600">Create professional labels for brand products, shipping, and marketing materials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Label Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={currentLabel.template} 
                onValueChange={updateTemplate}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {labelTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Label Configuration */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Label Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Label Name</Label>
                <Input
                  id="name"
                  placeholder="Enter label name"
                  value={currentLabel.name}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="size">Label Size</Label>
                <Select 
                  value={currentLabel.size} 
                  onValueChange={(value: 'small' | 'medium' | 'large' | 'custom') => {
                    const dimensions = getSizeDimensions(value)
                    setCurrentLabel(prev => ({ 
                      ...prev, 
                      size: value,
                      width: dimensions.width,
                      height: dimensions.height
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (200×150)</SelectItem>
                    <SelectItem value="medium">Medium (300×200)</SelectItem>
                    <SelectItem value="large">Large (400×300)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentLabel.size === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="100"
                      max="800"
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
                      max="600"
                      value={currentLabel.height}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, height: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="backgroundColor">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={currentLabel.backgroundColor}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={currentLabel.backgroundColor}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={currentLabel.textColor}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={currentLabel.textColor}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, textColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="8"
                  max="32"
                  value={currentLabel.fontSize}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeQR"
                    checked={currentLabel.includeQR}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, includeQR: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="includeQR">Include QR Code</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeBarcode"
                    checked={currentLabel.includeBarcode}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, includeBarcode: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="includeBarcode">Include Barcode</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Label Fields */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Label Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getTemplateFields(currentLabel.template || 'product').map((field) => (
                <div key={field}>
                  <Label htmlFor={field}>{field}</Label>
                  <Input
                    id={field}
                    placeholder={`Enter ${field.toLowerCase()}`}
                    value={currentLabel.fields?.[field] || ''}
                    onChange={(e) => updateField(field, e.target.value)}
                  />
                </div>
              ))}

              {currentLabel.includeQR && (
                <div>
                  <Label htmlFor="qrContent">QR Code Content</Label>
                  <Input
                    id="qrContent"
                    placeholder="Enter content for QR code"
                    value={currentLabel.qrContent}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, qrContent: e.target.value }))}
                  />
                </div>
              )}

              {currentLabel.includeBarcode && (
                <div>
                  <Label htmlFor="barcodeContent">Barcode Content</Label>
                  <Input
                    id="barcodeContent"
                    placeholder="Enter content for barcode"
                    value={currentLabel.barcodeContent}
                    onChange={(e) => setCurrentLabel(prev => ({ ...prev, barcodeContent: e.target.value }))}
                  />
                </div>
              )}

              <Button 
                onClick={generateLabel} 
                className="w-full" 
                disabled={!currentLabel.name || isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Tag className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Label'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated Labels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Controls */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Generated Labels ({labels.length})</span>
                <div className="flex gap-2">
                  {labels.length > 0 && (
                    <Button variant="outline" onClick={() => setLabels([])}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Labels Grid */}
          {labels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {labels.map((label) => (
                <Card key={label.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{label.name}</div>
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
                    <div 
                      className="border rounded-lg p-4"
                      style={{
                        width: `${label.width}px`,
                        height: `${label.height}px`,
                        backgroundColor: label.backgroundColor,
                        color: label.textColor,
                        borderColor: label.borderColor,
                        fontSize: `${label.fontSize}px`,
                        maxWidth: '100%',
                        maxHeight: '200px',
                        overflow: 'hidden'
                      }}
                    >
                      <div className="space-y-2">
                        {Object.entries(label.fields).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                        {label.includeQR && label.qrContent && (
                          <div className="text-center">
                            <QrCode className="h-8 w-8 mx-auto" />
                            <div className="text-xs">QR: {label.qrContent}</div>
                          </div>
                        )}
                        {label.includeBarcode && label.barcodeContent && (
                          <div className="text-center">
                            <Barcode className="h-8 w-8 mx-auto" />
                            <div className="text-xs">Barcode: {label.barcodeContent}</div>
                          </div>
                        )}
                      </div>
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
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
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
                  <p className="text-gray-600">Generate your first label using the controls on the left</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
