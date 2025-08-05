"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { QRDisplay } from "@/components/ui/qr-display"
import {
    MapPin,
    Package,
    Printer,
    Copy,
    Download,
    ExternalLink, Settings,
    Grid3X3,
    Layers,
    Package2,
    PackageCheck,
    QrCode
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"

interface Location {
  _id: string
  name: string
  description?: string
  type: "bin" | "shelf" | "rack" | "area" | "zone"
  qrCode: string
  capacity: number
  currentOccupancy: number
  isActive: boolean
  createdAt: number
  createdBy: string
}

interface EnhancedLocationDetailProps {
  location: Location
  onClose: () => void
}

const LOCATION_TYPE_ICONS = {
  bin: Package,
  shelf: Package2,
  rack: PackageCheck,
  area: Grid3X3,
  zone: Layers
}

const LOCATION_TYPE_COLORS = {
  bin: "bg-blue-500",
  shelf: "bg-green-500", 
  rack: "bg-purple-500",
  area: "bg-orange-500",
  zone: "bg-red-500"
}

export function EnhancedLocationDetail({ location, onClose }: EnhancedLocationDetailProps) {
  const { toast } = useToast()
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  
  const TypeIcon = LOCATION_TYPE_ICONS[location.type]
  const typeColor = LOCATION_TYPE_COLORS[location.type]

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`
    })
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Location QR Code - ${location.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .print-container { max-width: 400px; margin: 0 auto; text-align: center; }
              .qr-code { margin: 20px 0; }
              .location-info { margin: 20px 0; }
              .location-name { font-size: 24px; font-weight: bold; margin: 10px 0; }
              .location-details { font-size: 14px; color: #666; }
              .location-id { font-size: 18px; font-weight: bold; margin: 10px 0; color: #333; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>Location QR Code</h1>
              <div class="qr-code">
                <img src="${location.qrCode ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(location.qrCode)}` : ''}" alt="QR Code" />
              </div>
              <div class="location-info">
                <div class="location-name">${location.name}</div>
                <div class="location-id">${location.qrCode}</div>
                <div class="location-details">
                  <div>Type: ${location.type}</div>
                  <div>Capacity: ${location.capacity}</div>
                  <div>Current: ${location.currentOccupancy}</div>
                  <div>Created: ${new Date(location.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getOccupancyPercentage = () => {
    return Math.round((location.currentOccupancy / location.capacity) * 100)
  }

  const getOccupancyColor = () => {
    const percentage = getOccupancyPercentage()
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeColor} text-white`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{location.name}</h2>
              <p className="text-gray-600">{location.description || "No description"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={location.isActive ? "default" : "secondary"}>
              {location.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 border rounded-lg bg-gray-50">
                <QRDisplay 
                  data={location.qrCode}
                  size={200}
                  className="mx-auto mb-4"
                />
                <div className="space-y-2">
                  <div className="text-lg font-mono text-gray-700">{location.qrCode}</div>
                  <div className="text-sm text-gray-500">Scan to view location details</div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => copyToClipboard(location.qrCode, "QR Code")}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy QR
                </Button>
                <Button 
                  onClick={() => setIsPrintDialogOpen(true)}
                  className="flex-1"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${typeColor}`} />
                    <span className="font-medium capitalize">{location.type}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-600">Created</Label>
                  <div className="font-medium mt-1">
                    {new Date(location.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-600">Created By</Label>
                  <div className="font-medium mt-1">{location.createdBy}</div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge variant={location.isActive ? "default" : "secondary"}>
                      {location.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Capacity Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-gray-600">Capacity</Label>
                  <span className="font-medium">
                    {location.currentOccupancy} / {location.capacity}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getOccupancyColor()}`}
                    style={{
                      width: `${Math.min(100, getOccupancyPercentage())}%`,
                    }}
                  />
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    {getOccupancyPercentage()}% occupied
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={() => copyToClipboard(location._id, "Location ID")}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Location ID
                </Button>
                
                <Button 
                  onClick={() => copyToClipboard(location.name, "Location Name")}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Location Name
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16">
                <ExternalLink className="w-5 h-5 mr-2" />
                View Items
              </Button>
              <Button variant="outline" className="h-16">
                <Settings className="w-5 h-5 mr-2" />
                Edit Location
              </Button>
              <Button variant="outline" className="h-16">
                <Download className="w-5 h-5 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Print QR Code
            </DialogTitle>
            <DialogDescription>
              Print the QR code for this location
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="mb-4">
                <QRDisplay 
                  data={location.qrCode}
                  size={200}
                  className="mx-auto"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xl font-bold">{location.name}</div>
                <div className="text-lg font-mono">{location.qrCode}</div>
                <div className="text-sm text-gray-600">
                  Type: {location.type} | Capacity: {location.capacity}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 