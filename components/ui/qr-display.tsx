"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface QRDisplayProps {
  value: string
  size?: number
  className?: string
}

export function QRDisplay({ value, size = 128, className }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
    }
  }, [value, size])

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = `qr-${value}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <canvas ref={canvasRef} className="border rounded" />
      <Button onClick={downloadQR} size="sm" variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Download PNG
      </Button>
    </div>
  )
}
