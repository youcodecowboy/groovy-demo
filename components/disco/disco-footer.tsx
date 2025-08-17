"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/ui/qr-scanner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScanLine, CheckCircle } from "lucide-react"

interface DiscoFooterProps {
  onScan: (data: string) => void
  isScannerOpen: boolean
  onScannerToggle: () => void
}

export function DiscoFooter({ onScan, isScannerOpen, onScannerToggle }: DiscoFooterProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleScan = async (data: string) => {
    setIsProcessing(true)
    try {
      await onScan(data)
      // Show success feedback
      setTimeout(() => {
        setIsProcessing(false)
        onScannerToggle()
      }, 1000)
    } catch (error) {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center">
            {/* QR Scan Button - Floating Action Button Style */}
            <Button
              size="lg"
              onClick={onScannerToggle}
              disabled={isProcessing}
              className={`
                rounded-full w-16 h-16 shadow-lg transition-all duration-200
                ${isProcessing 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                }
              `}
            >
              {isProcessing ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <ScanLine className="w-8 h-8 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={onScannerToggle}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Scan QR Code
            </DialogTitle>
            <DialogDescription>
              Point your camera at a QR code to advance an item
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <QRScanner onScan={handleScan} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
