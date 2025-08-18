"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  QrCode, 
  Download, 
  Scan,
  Copy
} from "lucide-react"
import { QRDisplay } from "@/components/ui/qr-display"
import { useToast } from "@/hooks/use-toast"

interface DiscoQRCardProps {
  qrData: string
  itemId: string
  onTestScan?: () => void
}

export function DiscoQRCard({ qrData, itemId, onTestScan }: DiscoQRCardProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadQR = async () => {
    setIsGenerating(true)
    try {
      // Mock download - in real app this would generate and download the QR
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "QR Downloaded",
        description: "QR code has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download QR code",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      toast({
        title: "Copied!",
        description: "QR data copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy QR data",
        variant: "destructive",
      })
    }
  }

  const handleTestScan = () => {
    onTestScan?.()
    toast({
      title: "Test scan",
      description: "QR scanner opened for testing",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="h-4 w-4" />
          QR Code
          <Badge variant="outline" className="ml-auto text-xs">
            #{itemId}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <QRDisplay 
              data={qrData} 
              size={120}
              className="w-30 h-30"
            />
          </div>
        </div>

        {/* QR Data */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">QR Data</div>
          <div className="font-mono text-sm bg-gray-50 p-2 rounded border break-all">
            {qrData}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQR}
            disabled={isGenerating}
            className="h-10"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copyQRData}
            className="h-10"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>

        {/* Test Scan Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestScan}
          className="w-full h-10"
        >
          <Scan className="h-4 w-4 mr-2" />
          Test Scan
        </Button>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Generating download...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
