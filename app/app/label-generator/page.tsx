"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tag, Download, Eye, Plus, Trash2, RefreshCw, Settings, QrCode, Barcode, FilePdf, Image } from "lucide-react"
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from "sonner"

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
  dataUrl?: string
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
    id: 'shipping',
    name: 'Shipping Label',
    description: 'Standard shipping label with addresses and tracking',
    size: { width: 400, height: 300 },
    fields: ['From Name', 'From Address', 'To Name', 'To Address', 'Tracking Number', 'Weight'],
    includeQR: true,
    includeBarcode: true,
    defaultFields: {
      'From Name': 'Skywalker Textiles',
      'From Address': '123 Factory Lane, Tatooine, OR 12345',
      'To Name': '',
      'To Address': '',
      'Tracking Number': '',
      'Weight': '2.5 lbs'
    }
  },
  {
    id: 'product',
    name: 'Product Label',
    description: 'Product information label with SKU and description',
    size: { width: 300, height: 200 },
    fields: ['Product Name', 'SKU', 'Description', 'Price', 'Barcode'],
    includeBarcode: true,
    defaultFields: {
      'Product Name': '',
      'SKU': '',
      'Description': '',
      'Price': '$0.00',
      'Barcode': ''
    }
  },
  {
    id: 'inventory',
    name: 'Inventory Label',
    description: 'Warehouse inventory label with location and quantity',
    size: { width: 250, height: 150 },
    fields: ['Item Name', 'Location', 'Quantity', 'Date Received', 'Lot Number'],
    includeQR: true,
    defaultFields: {
      'Item Name': '',
      'Location': 'A1-B2-C3',
      'Quantity': '1',
      'Date Received': new Date().toLocaleDateString(),
      'Lot Number': ''
    }
  },
  {
    id: 'address',
    name: 'Address Label',
    description: 'Simple address label for mailing',
    size: { width: 300, height: 100 },
    fields: ['Name', 'Address Line 1', 'Address Line 2', 'City State ZIP'],
    defaultFields: {
      'Name': '',
      'Address Line 1': '',
      'Address Line 2': '',
      'City State ZIP': ''
    }
  },
  {
    id: 'custom',
    name: 'Custom Label',
    description: 'Create your own custom label format',
    size: { width: 300, height: 200 },
    fields: ['Title', 'Content', 'Footer'],
    defaultFields: {
      'Title': 'Custom Label',
      'Content': 'Enter your content here',
      'Footer': 'Footer text'
    }
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
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const labelRef = useRef<HTMLDivElement>(null)

  const loadTemplate = (template: LabelTemplate) => {
    setCurrentLabel(prev => ({
      ...prev,
      template: template.id as any,
      width: template.size.width,
      height: template.size.height,
      fields: template.defaultFields || {},
      includeQR: template.includeQR || false,
      includeBarcode: template.includeBarcode || false
    }))
    toast.success(`Loaded ${template.name} template`)
  }

  const generateLabelDataURL = async (label: LabelData): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        canvas.width = label.width
        canvas.height = label.height

        // Fill background
        ctx.fillStyle = label.backgroundColor
        ctx.fillRect(0, 0, label.width, label.height)

        // Draw border
        ctx.strokeStyle = label.borderColor
        ctx.lineWidth = 2
        ctx.strokeRect(1, 1, label.width - 2, label.height - 2)

        // Set text properties
        ctx.fillStyle = label.textColor
        ctx.font = `${label.fontSize}px Arial, sans-serif`
        ctx.textAlign = 'left'

        let yOffset = label.fontSize + 10

        // Draw fields
        Object.entries(label.fields).forEach(([key, value]) => {
          if (value) {
            ctx.fillText(`${key}: ${value}`, 10, yOffset)
            yOffset += label.fontSize + 5
          }
        })

        // Generate QR code if needed
        if (label.includeQR && label.qrContent) {
          const qrCanvas = document.createElement('canvas')
          QRCode.toCanvas(qrCanvas, label.qrContent, {
            width: 80,
            margin: 1,
            color: {
              dark: label.textColor,
              light: label.backgroundColor
            }
          }, (error) => {
            if (!error) {
              ctx.drawImage(qrCanvas, label.width - 90, 10, 80, 80)
            }
          })
        }

        // Generate barcode if needed
        if (label.includeBarcode && label.barcodeContent) {
          const barcodeCanvas = document.createElement('canvas')
          JsBarcode(barcodeCanvas, label.barcodeContent, {
            format: 'CODE128',
            width: 2,
            height: 40,
            displayValue: true,
            fontSize: 12,
            margin: 5,
            background: label.backgroundColor,
            lineColor: label.textColor
          })
          ctx.drawImage(barcodeCanvas, 10, label.height - 60, label.width - 20, 50)
        }

        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        reject(error)
      }
    })
  }

  const generateLabel = async () => {
    if (!currentLabel.name?.trim()) {
      toast.error("Please enter a label name")
      return
    }

    setIsGenerating(true)
    try {
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

      // Generate actual label data URL
      const dataUrl = await generateLabelDataURL(newLabel)
      newLabel.dataUrl = dataUrl

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

  const downloadLabel = async (label: LabelData) => {
    try {
      if (!label.dataUrl) {
        toast.error("Label data not available")
        return
      }

      const link = document.createElement('a')
      link.href = label.dataUrl
      link.download = `label-${label.name}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Label downloaded successfully")
    } catch (error) {
      toast.error("Failed to download label")
      console.error(error)
    }
  }

  const downloadAllLabels = async () => {
    try {
      for (let i = 0; i < labels.length; i++) {
        await downloadLabel(labels[i])
        // Small delay to prevent browser from blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      toast.success("All labels downloaded")
    } catch (error) {
      toast.error("Failed to download some labels")
    }
  }

  const generatePDF = async () => {
    if (!labelRef.current) {
      toast.error("Label preview not available")
      return
    }

    setIsGenerating(true)
    try {
      // Show preview if hidden
      if (!showPreview) {
        setShowPreview(true)
        // Wait for preview to render
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const element = labelRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
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

      const fileName = currentLabel.name || `labels-${Date.now()}`
      pdf.save(`${fileName}.pdf`)
      toast.success("PDF generated successfully!")
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error("Failed to generate PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  const clearAllLabels = () => {
    setLabels([])
    toast.success("All labels cleared")
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

  const getCurrentTemplate = () => {
    return labelTemplates.find(t => t.id === currentLabel.template)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Tag className="h-8 w-8 text-amber-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Label Generator</h1>
          <p className="text-gray-600">Create professional labels for shipping, products, and inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Label Templates */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Label Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {labelTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadTemplate(template)}
                    >
                      Load
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                  <div className="text-xs text-gray-500">
                    {template.size.width}×{template.size.height}px • {template.fields.length} fields
                    {template.includeQR && ' • QR'}
                    {template.includeBarcode && ' • Barcode'}
                  </div>
                </div>
              ))}
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
                <Label htmlFor="labelName">Label Name</Label>
                <Input
                  id="labelName"
                  placeholder="e.g., Shipping Label #1"
                  value={currentLabel.name}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

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

              <div>
                <Label htmlFor="fontSize">Font Size (px)</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="8"
                  max="24"
                  value={currentLabel.fontSize}
                  onChange={(e) => setCurrentLabel(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                <div>
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="borderColor"
                      type="color"
                      value={currentLabel.borderColor}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, borderColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={currentLabel.borderColor}
                      onChange={(e) => setCurrentLabel(prev => ({ ...prev, borderColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
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
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={generateLabel} 
                className="w-full"
                disabled={!currentLabel.name?.trim() || isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Tag className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Label'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button 
                onClick={generatePDF} 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FilePdf className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Export PDF'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Label Fields and Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Label Fields */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Label Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getCurrentTemplate()?.fields.map((fieldName) => (
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
              </div>
            </CardContent>
          </Card>

          {/* Label Preview */}
          {showPreview && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Label Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={labelRef}
                  className="border rounded-lg p-4 bg-white"
                  style={{
                    width: `${currentLabel.width}px`,
                    height: `${currentLabel.height}px`,
                    backgroundColor: currentLabel.backgroundColor,
                    color: currentLabel.textColor,
                    borderColor: currentLabel.borderColor,
                    fontSize: `${currentLabel.fontSize}px`,
                    position: 'relative'
                  }}
                >
                  {/* Label Content */}
                  <div style={{ position: 'relative', height: '100%' }}>
                    {/* Fields */}
                    <div style={{ padding: '10px' }}>
                      {Object.entries(currentLabel.fields || {}).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '5px' }}>
                          {value && <span>{key}: {value}</span>}
                        </div>
                      ))}
                    </div>

                    {/* QR Code */}
                    {currentLabel.includeQR && currentLabel.qrContent && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <QrCode className="h-16 w-16" style={{ color: currentLabel.textColor }} />
                      </div>
                    )}

                    {/* Barcode */}
                    {currentLabel.includeBarcode && currentLabel.barcodeContent && (
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}>
                        <Barcode className="h-8 w-full" style={{ color: currentLabel.textColor }} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Labels */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Generated Labels ({labels.length})</span>
                <div className="flex gap-2">
                  {labels.length > 0 && (
                    <>
                      <Button variant="outline" onClick={downloadAllLabels} disabled={isGenerating}>
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
            <CardContent>
              {labels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {labels.map((label) => (
                    <Card key={label.id} className="overflow-hidden">
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
                        <div className="flex justify-center p-2 bg-gray-50 rounded">
                          {label.dataUrl ? (
                            <img 
                              src={label.dataUrl} 
                              alt={`Label: ${label.name}`}
                              className="max-w-full max-h-[120px] object-contain"
                            />
                          ) : (
                            <div 
                              className="border rounded bg-white p-2"
                              style={{
                                width: '120px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Tag className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Label Details */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Size:</span>
                            <span>{label.width}×{label.height}px</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Template:</span>
                            <Badge variant="outline" className="text-xs">
                              {label.template}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Features:</span>
                            <div className="flex gap-1">
                              {label.includeQR && <Badge variant="secondary" className="text-xs">QR</Badge>}
                              {label.includeBarcode && <Badge variant="secondary" className="text-xs">Barcode</Badge>}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
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
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Labels Generated</h3>
                    <p className="text-gray-600">Generate your first label using the controls on the left</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
