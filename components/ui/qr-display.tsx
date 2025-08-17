"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"

interface QRDisplayProps {
  qrData: string
  title?: string
  description?: string
  showDownload?: boolean
  showShare?: boolean
}

export function QRDisplay({ 
  qrData, 
  title = "QR Code", 
  description,
  showDownload = true,
  showShare = true 
}: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !qrData) return

    // Simple QR code generation using a basic pattern
    // In production, you'd use a proper QR library like qrcode
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 200
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, size, size)

    // Draw a simple QR-like pattern (placeholder)
    ctx.fillStyle = 'black'
    const cellSize = size / 25
    
    // Draw border
    ctx.fillRect(0, 0, size, cellSize * 3)
    ctx.fillRect(0, 0, cellSize * 3, size)
    ctx.fillRect(size - cellSize * 3, 0, cellSize * 3, size)
    ctx.fillRect(0, size - cellSize * 3, size, cellSize * 3)

    // Draw some random cells to simulate QR code
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * 19) + 3
      const y = Math.floor(Math.random() * 19) + 3
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }, [qrData])

  const handleDownload = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || `Scan this QR code to view ${title}`,
          url: qrData,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(qrData)
        alert('QR code URL copied to clipboard!')
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 text-center">{description}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
          <canvas
            ref={canvasRef}
            className="block"
            style={{ width: '200px', height: '200px' }}
          />
        </div>
        
        <div className="flex gap-2">
          {showDownload && (
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          {showShare && (
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">Scan to visit profile</p>
          <p className="text-xs text-gray-400 break-all max-w-xs">{qrData}</p>
        </div>
      </CardContent>
    </Card>
  )
}
