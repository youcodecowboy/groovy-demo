"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { QrCode, Download, Copy, Plus, Trash2, RefreshCw, Settings, Palette, FileText, Image, FilePdf } from "lucide-react"
import QRCode from 'qrcode'
import { toast } from "sonner"

interface QRCodeData {
  id: string
  content: string
  size: number
  format: 'png' | 'svg' | 'pdf'
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  margin: number
  foregroundColor: string
  backgroundColor: string
  label: string
  timestamp: string
  dataUrl?: string
}

interface BatchQRConfig {
  prefix: string
  startNumber: number
  count: number
  includeTimestamp: boolean
  template: string
}

export default function QRGeneratorPage() {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([])
  const [currentQR, setCurrentQR] = useState<Partial<QRCodeData>>({
    content: "",
    size: 200,
    format: 'png',
    errorCorrection: 'M',
    margin: 4,
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    label: ""
  })
  const [batchConfig, setBatchConfig] = useState<BatchQRConfig>({
    prefix: "ITEM-",
    startNumber: 1,
    count: 10,
    includeTimestamp: false,
    template: "{{prefix}}{{number}}"
  })
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCodeDataURL = async (qr: QRCodeData): Promise<string> => {
    try {
      const options = {
        errorCorrectionLevel: qr.errorCorrection,
        type: qr.format === 'svg' ? 'svg' : 'image/png',
        quality: 0.92,
        margin: qr.margin,
        color: {
          dark: qr.foregroundColor,
          light: qr.backgroundColor
        },
        width: qr.size
      }

      if (qr.format === 'svg') {
        return await QRCode.toString(qr.content, options)
      } else {
        return await QRCode.toDataURL(qr.content, options)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw error
    }
  }

  const generateSingleQR = async () => {
    if (!currentQR.content) {
      toast.error("Please enter content for the QR code")
      return
    }

    setIsGenerating(true)
    try {
      const newQR: QRCodeData = {
        id: Date.now().toString(),
        content: currentQR.content,
        size: currentQR.size || 200,
        format: currentQR.format || 'png',
        errorCorrection: currentQR.errorCorrection || 'M',
        margin: currentQR.margin || 4,
        foregroundColor: currentQR.foregroundColor || '#000000',
        backgroundColor: currentQR.backgroundColor || '#FFFFFF',
        label: currentQR.label || '',
        timestamp: new Date().toISOString()
      }

      // Generate actual QR code data URL
      const dataUrl = await generateQRCodeDataURL(newQR)
      newQR.dataUrl = dataUrl

      setQRCodes(prev => [newQR, ...prev])
      setCurrentQR(prev => ({ ...prev, content: '', label: '' }))
      toast.success("QR code generated successfully!")
    } catch (error) {
      toast.error("Failed to generate QR code")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateBatchQR = async () => {
    if (batchConfig.count > 50) {
      toast.error("Batch size cannot exceed 50 QR codes")
      return
    }

    setIsGenerating(true)
    try {
      const newQRs: QRCodeData[] = []
      
      for (let i = 0; i < batchConfig.count; i++) {
        const number = batchConfig.startNumber + i
        let content = batchConfig.template
          .replace('{{prefix}}', batchConfig.prefix)
          .replace('{{number}}', number.toString().padStart(3, '0'))
        
        if (batchConfig.includeTimestamp) {
          content += `-${Date.now()}`
        }

        const qr: QRCodeData = {
          id: `batch-${Date.now()}-${i}`,
          content,
          size: currentQR.size || 200,
          format: currentQR.format || 'png',
          errorCorrection: currentQR.errorCorrection || 'M',
          margin: currentQR.margin || 4,
          foregroundColor: currentQR.foregroundColor || '#000000',
          backgroundColor: currentQR.backgroundColor || '#FFFFFF',
          label: `${batchConfig.prefix}${number.toString().padStart(3, '0')}`,
          timestamp: new Date().toISOString()
        }

        // Generate actual QR code data URL
        const dataUrl = await generateQRCodeDataURL(qr)
        qr.dataUrl = dataUrl

        newQRs.push(qr)
      }

      setQRCodes(prev => [...newQRs, ...prev])
      toast.success(`Generated ${batchConfig.count} QR codes successfully!`)
    } catch (error) {
      toast.error("Failed to generate batch QR codes")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteQR = (id: string) => {
    setQRCodes(prev => prev.filter(qr => qr.id !== id))
    toast.success("QR code deleted")
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Content copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const downloadQR = async (qr: QRCodeData) => {
    try {
      if (!qr.dataUrl) {
        toast.error("QR code data not available")
        return
      }

      if (qr.format === 'svg') {
        // Download SVG
        const blob = new Blob([qr.dataUrl], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `qr-${qr.label || qr.content.substring(0, 10)}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else if (qr.format === 'pdf') {
        // Convert to PDF using canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          canvas.width = qr.size
          canvas.height = qr.size
          ctx?.drawImage(img, 0, 0, qr.size, qr.size)
          
          // For now, download as PNG since PDF generation requires additional libraries
          canvas.toBlob(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `qr-${qr.label || qr.content.substring(0, 10)}.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            }
          })
        }
        
        img.src = qr.dataUrl
      } else {
        // Download PNG
        const link = document.createElement('a')
        link.href = qr.dataUrl
        link.download = `qr-${qr.label || qr.content.substring(0, 10)}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      toast.success("QR code downloaded successfully")
    } catch (error) {
      toast.error("Failed to download QR code")
      console.error(error)
    }
  }

  const downloadAllQRs = async () => {
    try {
      for (let i = 0; i < qrCodes.length; i++) {
        await downloadQR(qrCodes[i])
        // Small delay to prevent browser from blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      toast.success("All QR codes downloaded")
    } catch (error) {
      toast.error("Failed to download some QR codes")
    }
  }

  const clearAllQRs = () => {
    setQRCodes([])
    toast.success("All QR codes cleared")
  }

  const getErrorCorrectionDescription = (level: string) => {
    switch (level) {
      case 'L': return 'Low (~7%)'
      case 'M': return 'Medium (~15%)'
      case 'Q': return 'Quartile (~25%)'
      case 'H': return 'High (~30%)'
      default: return 'Medium (~15%)'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
          <p className="text-gray-600">Generate QR codes for items, locations, and inventory tracking</p>
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
                  Single QR
                </Button>
                <Button
                  variant={activeTab === 'batch' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('batch')}
                  className="flex-1"
                >
                  Batch QR
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QR Configuration */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                QR Code Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="size">Size (px)</Label>
                  <Input
                    id="size"
                    type="number"
                    min="100"
                    max="1000"
                    value={currentQR.size}
                    onChange={(e) => setCurrentQR(prev => ({ ...prev, size: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="margin">Margin</Label>
                  <Input
                    id="margin"
                    type="number"
                    min="0"
                    max="20"
                    value={currentQR.margin}
                    onChange={(e) => setCurrentQR(prev => ({ ...prev, margin: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="errorCorrection">Error Correction</Label>
                <Select 
                  value={currentQR.errorCorrection} 
                  onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setCurrentQR(prev => ({ ...prev, errorCorrection: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (~7%)</SelectItem>
                    <SelectItem value="M">Medium (~15%)</SelectItem>
                    <SelectItem value="Q">Quartile (~25%)</SelectItem>
                    <SelectItem value="H">High (~30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">Output Format</Label>
                <Select 
                  value={currentQR.format} 
                  onValueChange={(value: 'png' | 'svg' | 'pdf') => setCurrentQR(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        PNG
                      </div>
                    </SelectItem>
                    <SelectItem value="svg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        SVG
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FilePdf className="h-4 w-4" />
                        PDF
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="foregroundColor">Foreground</Label>
                  <div className="flex gap-2">
                    <Input
                      id="foregroundColor"
                      type="color"
                      value={currentQR.foregroundColor}
                      onChange={(e) => setCurrentQR(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={currentQR.foregroundColor}
                      onChange={(e) => setCurrentQR(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="backgroundColor">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={currentQR.backgroundColor}
                      onChange={(e) => setCurrentQR(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={currentQR.backgroundColor}
                      onChange={(e) => setCurrentQR(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Input */}
          {activeTab === 'single' ? (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>QR Code Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">Content/Data</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter text, URL, or data to encode"
                    value={currentQR.content}
                    onChange={(e) => setCurrentQR(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    placeholder="QR code label for identification"
                    value={currentQR.label}
                    onChange={(e) => setCurrentQR(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={generateSingleQR} 
                  className="w-full" 
                  disabled={!currentQR.content || isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
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
                    placeholder="ITEM-"
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
                  <Label htmlFor="template">Template</Label>
                  <Input
                    id="template"
                    value={batchConfig.template}
                    onChange={(e) => setBatchConfig(prev => ({ ...prev, template: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {`{{prefix}}`} and {`{{number}}`} as placeholders
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeTimestamp"
                    checked={batchConfig.includeTimestamp}
                    onChange={(e) => setBatchConfig(prev => ({ ...prev, includeTimestamp: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="includeTimestamp">Include Timestamp</Label>
                </div>
                <Button 
                  onClick={generateBatchQR} 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : `Generate ${batchConfig.count} QR Codes`}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generated QR Codes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Controls */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Generated QR Codes ({qrCodes.length})</span>
                <div className="flex gap-2">
                  {qrCodes.length > 0 && (
                    <>
                      <Button variant="outline" onClick={downloadAllQRs} disabled={isGenerating}>
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                      <Button variant="outline" onClick={clearAllQRs}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* QR Codes Grid */}
          {qrCodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {qrCodes.map((qr) => (
                <Card key={qr.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {qr.label || qr.content.substring(0, 20)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(qr.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQR(qr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* QR Code Preview */}
                    <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                      {qr.dataUrl ? (
                        qr.format === 'svg' ? (
                          <div 
                            className="border rounded bg-white p-2"
                            style={{ maxWidth: '150px', maxHeight: '150px' }}
                            dangerouslySetInnerHTML={{ __html: qr.dataUrl }}
                          />
                        ) : (
                          <img 
                            src={qr.dataUrl} 
                            alt={`QR Code for ${qr.label || qr.content}`}
                            className="max-w-[150px] max-h-[150px] object-contain"
                          />
                        )
                      ) : (
                        <div 
                          className="border rounded bg-white p-4"
                          style={{
                            width: '150px',
                            height: '150px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <QrCode className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* QR Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Size:</span>
                        <span>{qr.size}px</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Format:</span>
                        <Badge variant="outline" className="text-xs">
                          {qr.format.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Error Correction:</span>
                        <span>{getErrorCorrectionDescription(qr.errorCorrection)}</span>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Content:</div>
                      <div className="text-xs bg-gray-50 p-2 rounded border max-h-20 overflow-y-auto break-all">
                        {qr.content}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyToClipboard(qr.content)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadQR(qr)}
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
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Codes Generated</h3>
                  <p className="text-gray-600">Generate your first QR code using the controls on the left</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
