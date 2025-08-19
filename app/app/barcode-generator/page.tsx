"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Barcode, Download, Copy, Plus, Trash2, RefreshCw, Settings, Image, FileText } from "lucide-react"
import { toast } from "sonner"

interface BarcodeData {
  id: string
  content: string
  type: 'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF14' | 'MSI'
  width: number
  height: number
  displayValue: boolean
  fontSize: number
  textAlign: 'left' | 'center' | 'right'
  textPosition: 'bottom' | 'top'
  background: string
  lineColor: string
  label: string
  timestamp: string
  dataUrl?: string
}

interface BatchBarcodeConfig {
  prefix: string
  startNumber: number
  count: number
  numberLength: number
  type: 'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF14' | 'MSI'
}

export default function BarcodeGeneratorPage() {
  const [barcodes, setBarcodes] = useState<BarcodeData[]>([])
  const [currentBarcode, setCurrentBarcode] = useState<Partial<BarcodeData>>({
    content: "",
    type: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 20,
    textAlign: 'center',
    textPosition: 'bottom',
    background: '#FFFFFF',
    lineColor: '#000000',
    label: ""
  })
  const [batchConfig, setBatchConfig] = useState<BatchBarcodeConfig>({
    prefix: "SKU",
    startNumber: 1,
    count: 10,
    numberLength: 6,
    type: 'CODE128'
  })
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [isGenerating, setIsGenerating] = useState(false)

  const getBarcodeTypeDescription = (type: string) => {
    switch (type) {
      case 'CODE128': return 'Alphanumeric, high density'
      case 'EAN13': return '13-digit European Article Number'
      case 'UPC': return '12-digit Universal Product Code'
      case 'CODE39': return 'Alphanumeric, widely supported'
      case 'ITF14': return '14-digit shipping container code'
      case 'MSI': return 'Numeric, used in retail'
      default: return 'Standard barcode format'
    }
  }

  const validateBarcodeContent = (content: string, type: string): boolean => {
    switch (type) {
      case 'EAN13':
        return /^\d{12,13}$/.test(content)
      case 'UPC':
        return /^\d{11,12}$/.test(content)
      case 'ITF14':
        return /^\d{14}$/.test(content)
      case 'MSI':
        return /^\d+$/.test(content)
      case 'CODE39':
        return /^[A-Z0-9\-. $\/+%]+$/.test(content)
      case 'CODE128':
        return content.length > 0
      default:
        return true
    }
  }

  const generateCheckDigit = (content: string, type: string): string => {
    switch (type) {
      case 'EAN13':
        if (content.length === 12) {
          let sum = 0
          for (let i = 0; i < 12; i++) {
            sum += parseInt(content[i]) * (i % 2 === 0 ? 1 : 3)
          }
          return content + ((10 - (sum % 10)) % 10).toString()
        }
        return content
      case 'UPC':
        if (content.length === 11) {
          let sum = 0
          for (let i = 0; i < 11; i++) {
            sum += parseInt(content[i]) * (i % 2 === 0 ? 3 : 1)
          }
          return content + ((10 - (sum % 10)) % 10).toString()
        }
        return content
      default:
        return content
    }
  }

  const generateBarcodeDataURL = async (barcode: BarcodeData): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Set canvas size
        const totalWidth = barcode.content.length * 10 * barcode.width + 40
        const totalHeight = barcode.height + (barcode.displayValue ? barcode.fontSize + 10 : 0) + 20
        
        canvas.width = totalWidth
        canvas.height = totalHeight

        // Fill background
        ctx.fillStyle = barcode.background
        ctx.fillRect(0, 0, totalWidth, totalHeight)

        // Generate barcode using jsbarcode
        const JsBarcode = (await import('jsbarcode')).default
        JsBarcode(canvas, barcode.content, {
          format: barcode.type,
          width: barcode.width,
          height: barcode.height,
          displayValue: barcode.displayValue,
          fontSize: barcode.fontSize,
          textAlign: barcode.textAlign,
          textPosition: barcode.textPosition,
          background: barcode.background,
          lineColor: barcode.lineColor,
          margin: 10
        })

        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        reject(error)
      }
    })
  }

  const generateSingleBarcode = async () => {
    if (!currentBarcode.content) {
      toast.error("Please enter content for the barcode")
      return
    }

    const content = generateCheckDigit(currentBarcode.content, currentBarcode.type || 'CODE128')
    
    if (!validateBarcodeContent(content, currentBarcode.type || 'CODE128')) {
      toast.error(`Invalid content for ${currentBarcode.type} barcode format`)
      return
    }

    setIsGenerating(true)
    try {
      const newBarcode: BarcodeData = {
        id: Date.now().toString(),
        content,
        type: currentBarcode.type || 'CODE128',
        width: currentBarcode.width || 2,
        height: currentBarcode.height || 100,
        displayValue: currentBarcode.displayValue ?? true,
        fontSize: currentBarcode.fontSize || 20,
        textAlign: currentBarcode.textAlign || 'center',
        textPosition: currentBarcode.textPosition || 'bottom',
        background: currentBarcode.background || '#FFFFFF',
        lineColor: currentBarcode.lineColor || '#000000',
        label: currentBarcode.label || '',
        timestamp: new Date().toISOString()
      }

      // Generate actual barcode data URL
      const dataUrl = await generateBarcodeDataURL(newBarcode)
      newBarcode.dataUrl = dataUrl

      setBarcodes(prev => [newBarcode, ...prev])
      setCurrentBarcode(prev => ({ ...prev, content: '', label: '' }))
      toast.success("Barcode generated successfully!")
    } catch (error) {
      toast.error("Failed to generate barcode")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateBatchBarcodes = async () => {
    if (batchConfig.count > 50) {
      toast.error("Batch size cannot exceed 50 barcodes")
      return
    }

    setIsGenerating(true)
    try {
      const newBarcodes: BarcodeData[] = []
      
      for (let i = 0; i < batchConfig.count; i++) {
        const number = batchConfig.startNumber + i
        const paddedNumber = number.toString().padStart(batchConfig.numberLength, '0')
        const content = `${batchConfig.prefix}${paddedNumber}`
        
        const barcode: BarcodeData = {
          id: `batch-${Date.now()}-${i}`,
          content,
          type: batchConfig.type,
          width: currentBarcode.width || 2,
          height: currentBarcode.height || 100,
          displayValue: currentBarcode.displayValue ?? true,
          fontSize: currentBarcode.fontSize || 20,
          textAlign: currentBarcode.textAlign || 'center',
          textPosition: currentBarcode.textPosition || 'bottom',
          background: currentBarcode.background || '#FFFFFF',
          lineColor: currentBarcode.lineColor || '#000000',
          label: content,
          timestamp: new Date().toISOString()
        }

        // Generate actual barcode data URL
        const dataUrl = await generateBarcodeDataURL(barcode)
        barcode.dataUrl = dataUrl

        newBarcodes.push(barcode)
      }

      setBarcodes(prev => [...newBarcodes, ...prev])
      toast.success(`Generated ${batchConfig.count} barcodes successfully!`)
    } catch (error) {
      toast.error("Failed to generate batch barcodes")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteBarcode = (id: string) => {
    setBarcodes(prev => prev.filter(barcode => barcode.id !== id))
    toast.success("Barcode deleted")
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Content copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const downloadBarcode = async (barcode: BarcodeData) => {
    try {
      if (!barcode.dataUrl) {
        toast.error("Barcode data not available")
        return
      }

      const link = document.createElement('a')
      link.href = barcode.dataUrl
      link.download = `barcode-${barcode.label || barcode.content.substring(0, 10)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Barcode downloaded successfully")
    } catch (error) {
      toast.error("Failed to download barcode")
      console.error(error)
    }
  }

  const downloadAllBarcodes = async () => {
    try {
      for (let i = 0; i < barcodes.length; i++) {
        await downloadBarcode(barcodes[i])
        // Small delay to prevent browser from blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      toast.success("All barcodes downloaded")
    } catch (error) {
      toast.error("Failed to download some barcodes")
    }
  }

  const clearAllBarcodes = () => {
    setBarcodes([])
    toast.success("All barcodes cleared")
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Barcode className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Barcode Generator</h1>
          <p className="text-gray-600">Generate barcodes for inventory, products, and tracking systems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mode Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Generation Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'single' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('single')}
                  className="flex-1"
                >
                  Single Barcode
                </Button>
                <Button
                  variant={activeTab === 'batch' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('batch')}
                  className="flex-1"
                >
                  Batch Barcode
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Barcode Configuration */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Barcode Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Barcode Type</Label>
                <Select 
                  value={currentBarcode.type} 
                  onValueChange={(value: 'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF14' | 'MSI') => setCurrentBarcode(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE128">CODE128 - Alphanumeric</SelectItem>
                    <SelectItem value="EAN13">EAN13 - 13-digit</SelectItem>
                    <SelectItem value="UPC">UPC - 12-digit</SelectItem>
                    <SelectItem value="CODE39">CODE39 - Alphanumeric</SelectItem>
                    <SelectItem value="ITF14">ITF14 - 14-digit</SelectItem>
                    <SelectItem value="MSI">MSI - Numeric</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {getBarcodeTypeDescription(currentBarcode.type || 'CODE128')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="width">Bar Width</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    max="10"
                    value={currentBarcode.width}
                    onChange={(e) => setCurrentBarcode(prev => ({ ...prev, width: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="50"
                    max="300"
                    value={currentBarcode.height}
                    onChange={(e) => setCurrentBarcode(prev => ({ ...prev, height: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    min="10"
                    max="50"
                    value={currentBarcode.fontSize}
                    onChange={(e) => setCurrentBarcode(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="textPosition">Text Position</Label>
                  <Select 
                    value={currentBarcode.textPosition} 
                    onValueChange={(value: 'bottom' | 'top') => setCurrentBarcode(prev => ({ ...prev, textPosition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lineColor">Bar Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="lineColor"
                      type="color"
                      value={currentBarcode.lineColor}
                      onChange={(e) => setCurrentBarcode(prev => ({ ...prev, lineColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={currentBarcode.lineColor}
                      onChange={(e) => setCurrentBarcode(prev => ({ ...prev, lineColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="background">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background"
                      type="color"
                      value={currentBarcode.background}
                      onChange={(e) => setCurrentBarcode(prev => ({ ...prev, background: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={currentBarcode.background}
                      onChange={(e) => setCurrentBarcode(prev => ({ ...prev, background: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="displayValue"
                  checked={currentBarcode.displayValue}
                  onChange={(e) => setCurrentBarcode(prev => ({ ...prev, displayValue: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="displayValue">Display Text Value</Label>
              </div>
            </CardContent>
          </Card>

          {/* Content Input */}
          {activeTab === 'single' ? (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Barcode Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">Content/Data</Label>
                  <Input
                    id="content"
                    placeholder="Enter barcode content"
                    value={currentBarcode.content}
                    onChange={(e) => setCurrentBarcode(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    placeholder="Barcode label for identification"
                    value={currentBarcode.label}
                    onChange={(e) => setCurrentBarcode(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={generateSingleBarcode} 
                  className="w-full" 
                  disabled={!currentBarcode.content || isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Barcode className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Barcode'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Batch Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input
                    id="prefix"
                    placeholder="SKU"
                    value={batchConfig.prefix}
                    onChange={(e) => setBatchConfig(prev => ({ ...prev, prefix: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startNumber">Start Number</Label>
                    <Input
                      id="startNumber"
                      type="number"
                      min="1"
                      value={batchConfig.startNumber}
                      onChange={(e) => setBatchConfig(prev => ({ ...prev, startNumber: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="count">Count</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="50"
                      value={batchConfig.count}
                      onChange={(e) => setBatchConfig(prev => ({ ...prev, count: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="numberLength">Number Length</Label>
                  <Input
                    id="numberLength"
                    type="number"
                    min="1"
                    max="10"
                    value={batchConfig.numberLength}
                    onChange={(e) => setBatchConfig(prev => ({ ...prev, numberLength: Number(e.target.value) }))}
                  />
                </div>
                <Button 
                  onClick={generateBatchBarcodes} 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : `Generate ${batchConfig.count} Barcodes`}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generated Barcodes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Controls */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Generated Barcodes ({barcodes.length})</span>
                <div className="flex gap-2">
                  {barcodes.length > 0 && (
                    <>
                      <Button variant="outline" onClick={downloadAllBarcodes} disabled={isGenerating}>
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                      <Button variant="outline" onClick={clearAllBarcodes}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Barcodes Grid */}
          {barcodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {barcodes.map((barcode) => (
                <Card key={barcode.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {barcode.label || barcode.content.substring(0, 20)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(barcode.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBarcode(barcode.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Barcode Preview */}
                    <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                      {barcode.dataUrl ? (
                        <img 
                          src={barcode.dataUrl} 
                          alt={`Barcode for ${barcode.label || barcode.content}`}
                          className="max-w-full max-h-[120px] object-contain"
                        />
                      ) : (
                        <div 
                          className="border rounded bg-white p-4"
                          style={{
                            width: '200px',
                            height: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Barcode className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Barcode Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Type:</span>
                        <Badge variant="outline" className="text-xs">
                          {barcode.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Size:</span>
                        <span>{barcode.width}px × {barcode.height}px</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Text:</span>
                        <span>{barcode.displayValue ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Content:</div>
                      <div className="text-xs bg-gray-50 p-2 rounded border max-h-20 overflow-y-auto break-all">
                        {barcode.content}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyToClipboard(barcode.content)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadBarcode(barcode)}
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
                  <Barcode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Barcodes Generated</h3>
                  <p className="text-gray-600">Generate your first barcode using the controls on the left</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
