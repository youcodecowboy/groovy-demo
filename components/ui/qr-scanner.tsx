"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Camera, CameraOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan: (data: string) => void
  className?: string
  userId?: string
  stageId?: string
  workflowId?: string
  onScanLog?: (scanData: any) => Promise<void>
}

export function QRScanner({ onScan, className, userId, stageId, workflowId, onScanLog }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [lastScanTime, setLastScanTime] = useState(0)
  const [scanCount, setScanCount] = useState(0)
  const { toast } = useToast()
  
  // Rate limiting: max 1 scan per 2 seconds
  const RATE_LIMIT_MS = 2000
  const MAX_SCANS_PER_MINUTE = 30

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Simple QR detection using jsQR (you'll need to install this)
    // For now, we'll use a basic pattern detection
    try {
      // This is a simplified QR detection - in production you'd use jsQR or similar
      const qrData = detectQRCode(imageData)
      
      if (qrData) {
        const now = Date.now()
        
        // Rate limiting check
        if (now - lastScanTime < RATE_LIMIT_MS) {
          toast({
            title: "Scan Rate Limited",
            description: "Please wait before scanning again",
            variant: "destructive",
          })
          return
        }

        // Check scan count per minute
        if (scanCount >= MAX_SCANS_PER_MINUTE) {
          toast({
            title: "Scan Limit Reached",
            description: "Too many scans. Please wait a minute.",
            variant: "destructive",
          })
          return
        }

        setLastScanTime(now)
        setScanCount(prev => prev + 1)
        
        // Call the scan handler
        onScan(qrData)
        
        // Log the scan for analytics (non-blocking)
        if (onScanLog && userId && stageId && workflowId) {
          onScanLog({
            qrData,
            userId,
            stageId,
            workflowId,
            timestamp: Date.now(),
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
            }
          }).catch(error => {
            console.error('Failed to log scan:', error)
          })
        }
        
        // Optional: stop scanning after successful scan
        // stopScanning()
      }
    } catch (err) {
      console.error("QR detection error:", err)
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(processFrame)
    }
  }, [isScanning, lastScanTime, scanCount, onScan, toast])

  // Real QR code detection using jsQR
  const detectQRCode = (imageData: ImageData): string | null => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })
      
      if (code) {
        return code.data
      }
    } catch (error) {
      console.error("QR detection error:", error)
    }
    
    return null
  }

  const startScanning = async () => {
    try {
      setError(null)
      setScanCount(0)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)

        // Start processing frames
        requestAnimationFrame(processFrame)
      }
    } catch (err) {
      setError("Camera access denied or not available")
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  // Reset scan count every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setScanCount(0)
    }, 60000) // 1 minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-80 h-60 bg-gray-100 rounded-lg border-2 border-gray-200 ${
            !isScanning ? "hidden" : ""
          }`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isScanning && (
          <div className="w-80 h-60 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
            <CameraOff className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-blue-500"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-blue-500"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-blue-500"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={isScanning ? stopScanning : startScanning}
          variant={isScanning ? "destructive" : "default"}
          size="lg"
          className="w-48"
        >
          <Camera className="w-4 h-4 mr-2" />
          {isScanning ? "Stop Scanning" : "Start Scanning"}
        </Button>

        {isScanning && (
          <div className="text-center">
            <p className="text-sm text-gray-600">Point camera at QR code to scan</p>
            <p className="text-xs text-gray-500 mt-1">
              Scans: {scanCount}/{MAX_SCANS_PER_MINUTE} per minute
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
