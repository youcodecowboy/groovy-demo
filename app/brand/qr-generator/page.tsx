'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  QrCode, 
  Download, 
  Copy, 
  Settings,
  Package,
  Hash,
  Tag
} from 'lucide-react'

export default function QRGeneratorPage() {
  const [qrData, setQrData] = useState('')
  const [qrType, setQrType] = useState('product')
  const [qrSize, setQrSize] = useState('medium')
  const [generatedQR, setGeneratedQR] = useState('')

  const qrTypes = [
    { value: 'product', label: 'Product QR', description: 'Link to product details' },
    { value: 'batch', label: 'Batch QR', description: 'Link to batch information' },
    { value: 'order', label: 'Order QR', description: 'Link to order tracking' },
    { value: 'sample', label: 'Sample QR', description: 'Link to sample details' }
  ]

  const qrSizes = [
    { value: 'small', label: 'Small (100x100)' },
    { value: 'medium', label: 'Medium (200x200)' },
    { value: 'large', label: 'Large (300x300)' }
  ]

  const generateQR = () => {
    if (qrData.trim()) {
      // In a real app, this would call a QR generation API
      setGeneratedQR(`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize === 'small' ? '100x100' : qrSize === 'medium' ? '200x200' : '300x300'}&data=${encodeURIComponent(qrData)}`)
    }
  }

  const downloadQR = () => {
    if (generatedQR) {
      const link = document.createElement('a')
      link.href = generatedQR
      link.download = `qr-${qrType}-${Date.now()}.png`
      link.click()
    }
  }

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Code Generator</h1>
          <p className="text-gray-600">Generate QR codes for products, batches, orders, and samples</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Generate QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-type">QR Type</Label>
              <Select value={qrType} onValueChange={setQrType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select QR type" />
                </SelectTrigger>
                <SelectContent>
                  {qrTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-data">Data / URL</Label>
              <Input
                id="qr-data"
                placeholder="Enter URL or data for QR code..."
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-size">Size</Label>
              <Select value={qrSize} onValueChange={setQrSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {qrSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateQR} className="w-full" disabled={!qrData.trim()}>
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQR ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={generatedQR} 
                    alt="Generated QR Code" 
                    className="border rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={downloadQR} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={copyQRData}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Data
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Type:</strong> {qrTypes.find(t => t.value === qrType)?.label}</p>
                  <p><strong>Size:</strong> {qrSizes.find(s => s.value === qrSize)?.label}</p>
                  <p><strong>Data:</strong> {qrData}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Generate a QR code to see preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col"
              onClick={() => {
                setQrType('product')
                setQrData('https://groovy.com/product/SKU-001')
              }}
            >
              <Package className="h-8 w-8 mb-2" />
              <span className="font-medium">Product QR</span>
              <span className="text-sm text-gray-600">Link to product page</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col"
              onClick={() => {
                setQrType('batch')
                setQrData('https://groovy.com/batch/BATCH-2024-001')
              }}
            >
              <Hash className="h-8 w-8 mb-2" />
              <span className="font-medium">Batch QR</span>
              <span className="text-sm text-gray-600">Link to batch info</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col"
              onClick={() => {
                setQrType('order')
                setQrData('https://groovy.com/order/PO-2024-001')
              }}
            >
              <Tag className="h-8 w-8 mb-2" />
              <span className="font-medium">Order QR</span>
              <span className="text-sm text-gray-600">Link to order tracking</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col"
              onClick={() => {
                setQrType('sample')
                setQrData('https://groovy.com/sample/SAMPLE-001')
              }}
            >
              <QrCode className="h-8 w-8 mb-2" />
              <span className="font-medium">Sample QR</span>
              <span className="text-sm text-gray-600">Link to sample details</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}