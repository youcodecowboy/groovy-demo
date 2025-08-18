"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  QrCode, 
  Download, 
  Scan,
  FileText,
  Image,
  FileDown,
  Eye
} from "lucide-react"
import { QRDisplay } from "@/components/ui/qr-display"
import { useToast } from "@/hooks/use-toast"

interface QRCardProps {
  qrData: string
  itemId: string
  onTestScan?: () => void
}

export function QRCard({ qrData, itemId, onTestScan }: QRCardProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadQR = async (format: 'png' | 'svg' | 'pdf') => {
    setIsGenerating(true)
    try {
      // Mock download - in real app this would generate and download the file
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "QR Code downloaded",
        description: `QR code has been downloaded as ${format.toUpperCase()}`,
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

  const handleTestScan = () => {
    onTestScan?.()
    toast({
      title: "Test scan initiated",
      description: "QR scanner modal opened for testing",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code
          <Badge variant="outline" className="ml-auto">
            {itemId}
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

        {/* Download Options */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Download Options</div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQR('png')}
              disabled={isGenerating}
              className="flex-1"
            >
              <Image className="h-4 w-4 mr-2" />
              PNG
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQR('svg')}
              disabled={isGenerating}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              SVG
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  className="flex-1"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => downloadQR('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadQR('png')}>
                  <Image className="h-4 w-4 mr-2" />
                  High Res PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Test Scan */}
        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestScan}
            className="w-full"
          >
            <Scan className="h-4 w-4 mr-2" />
            Test Scan
          </Button>
        </div>

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
