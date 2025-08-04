"use client"

import { useState } from "react"
import { QRScanner } from "@/components/ui/qr-scanner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
    Camera,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function TestQRScanningPage() {
  const { toast } = useToast()
  const logScan = useMutation(api.scans.logScan)
  const [scanHistory, setScanHistory] = useState<Array<{
    qrData: string
    success: boolean
    timestamp: number
    errorMessage?: string
  }>>([])

  const handleScan = async (data: string) => {
    try {
      // Log the scan attempt
      await logScan({
        qrData: data,
        scanType: "item_lookup",
        success: true,
        userId: "test@demo",
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      })

      // Add to local history
      setScanHistory(prev => [{
        qrData: data,
        success: true,
        timestamp: Date.now(),
      }, ...prev.slice(0, 9)]) // Keep last 10 scans

      toast({
        title: "✅ QR Code Scanned",
        description: `Successfully scanned: ${data}`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      // Log failed scan
      await logScan({
        qrData: data,
        scanType: "item_lookup",
        success: false,
        errorMessage,
        userId: "test@demo",
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      })

      // Add to local history
      setScanHistory(prev => [{
        qrData: data,
        success: false,
        timestamp: Date.now(),
        errorMessage,
      }, ...prev.slice(0, 9)])

      toast({
        title: "❌ Scan Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
            <h1 className="text-3xl font-bold mt-2">QR Scanner Test</h1>
            <p className="text-gray-600 mt-1">
              Test the QR scanning functionality with real-time logging and rate limiting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                QR Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QRScanner 
                onScan={handleScan}
                userId="test@demo"
                className="w-full"
              />
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click "Start Scanning" to activate the camera</li>
                  <li>• Point the camera at a QR code or any dark pattern</li>
                  <li>• The scanner will detect patterns and simulate QR codes</li>
                  <li>• Rate limiting prevents excessive scanning (max 30/min)</li>
                  <li>• All scans are logged to the database</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Scan History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No scans yet</p>
                    <p className="text-sm">Start scanning to see results here</p>
                  </div>
                ) : (
                  scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {scan.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {scan.qrData}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTimestamp(scan.timestamp)}
                          </div>
                          {scan.errorMessage && (
                            <div className="text-sm text-red-600">
                              Error: {scan.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={scan.success ? "default" : "destructive"}>
                        {scan.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>QR Scanning Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Real QR Detection</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Uses jsQR library for accurate QR code detection from camera feed
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold">Rate Limiting</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Prevents excessive scanning with configurable limits (30 scans/minute)
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Scan Logging</h3>
                </div>
                <p className="text-sm text-gray-600">
                  All scans are logged to database with metadata and device info
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 