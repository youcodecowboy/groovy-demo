"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { QRScanner } from "@/components/ui/qr-scanner"
import {
    Package,
    MapPin,
    CheckCircle,
    ArrowRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MoveItemDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function MoveItemDialog({ isOpen, onClose }: MoveItemDialogProps) {
  const { toast } = useToast()
  const updateItemLocation = useMutation(api.items.updateLocation)
  
  const [step, setStep] = useState<"scan-item" | "scan-location" | "complete">("scan-item")
  const [scannedItem, setScannedItem] = useState<string>("")
  const [scannedLocation, setScannedLocation] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleItemScan = (data: string) => {
    // Extract item ID from QR data (format: item:ITEM-ID)
    const itemId = data.replace("item:", "")
    setScannedItem(itemId)
    setStep("scan-location")
    
    toast({
      title: "✅ Item Scanned",
      description: `Item: ${itemId}`,
    })
  }

  const handleLocationScan = async (data: string) => {
    // Extract location ID from QR data (format: location:LOCATION-ID)
    const locationId = data.replace("location:", "")
    setScannedLocation(locationId)
    setStep("complete")
    
    toast({
      title: "✅ Location Scanned",
      description: `Location: ${locationId}`,
    })

    // Process the move
    await processMove()
  }

  const processMove = async () => {
    if (!scannedItem || !scannedLocation) return

    setIsProcessing(true)
    try {
      await updateItemLocation({
        itemId: scannedItem,
        locationId: scannedLocation,
        movedBy: "floor@demo"
      })

      toast({
        title: "✅ Move Complete",
        description: `Item ${scannedItem} moved to ${scannedLocation}`,
      })

      // Reset and close
      setTimeout(() => {
        resetAndClose()
      }, 2000)
    } catch (error) {
      toast({
        title: "❌ Move Failed",
        description: "Failed to update item location",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetAndClose = () => {
    setStep("scan-item")
    setScannedItem("")
    setScannedLocation("")
    setIsProcessing(false)
    onClose()
  }

  const handleClose = () => {
    if (step === "complete" && !isProcessing) {
      resetAndClose()
    } else if (step === "scan-location") {
      // Go back to item scan
      setStep("scan-item")
      setScannedItem("")
    } else {
      resetAndClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6" />
            Move Item
          </DialogTitle>
          <DialogDescription className="text-base">
            {step === "scan-item" && "Scan the item QR code first"}
            {step === "scan-location" && "Now scan the location QR code"}
            {step === "complete" && "Move completed successfully"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === "scan-item" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step === "scan-item" ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 border-gray-300"
              }`}>
                <Package className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Item</span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400" />
            
            <div className={`flex items-center gap-2 ${step === "scan-location" ? "text-blue-600" : step === "complete" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step === "scan-location" || step === "complete" ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 border-gray-300"
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Location</span>
            </div>
          </div>

          {/* Current Step Content */}
          {step === "scan-item" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-4xl">📦</div>
                <h3 className="text-xl font-semibold">Scan Item</h3>
                <p className="text-gray-600">
                  Point camera at the item QR code
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <QRScanner 
                    onScan={handleItemScan}
                    className="w-64 h-64"
                  />
                </div>
              </div>
            </div>
          )}

          {step === "scan-location" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-4xl">📍</div>
                <h3 className="text-xl font-semibold">Scan Location</h3>
                <p className="text-gray-600">
                  Point camera at the location QR code
                </p>
              </div>
              
              {/* Show scanned item */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-blue-900">Item: {scannedItem}</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <QRScanner 
                    onScan={handleLocationScan}
                    className="w-64 h-64"
                  />
                </div>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                {isProcessing ? (
                  <>
                    <div className="text-4xl">⏳</div>
                    <h3 className="text-xl font-semibold">Processing Move...</h3>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl">✅</div>
                    <h3 className="text-xl font-semibold text-green-600">Move Complete!</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-green-900">{scannedItem}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 justify-center">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-blue-900">{scannedLocation}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="px-6"
            >
              {step === "complete" ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 