"use client"

import { useState, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { QRDisplay } from "@/components/ui/qr-display"
import {
    MapPin,
    Package, Factory,
    Printer, Copy, Plus, Grid3X3,
    Layers, Shelf,
    Rack
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LocationFormData {
  name: string
  description: string
  type: "bin" | "shelf" | "rack" | "area" | "zone"
  floor: string
  area: string
  section: string
  capacity: number
  qrCode: string
  locationId: string
}

interface FactoryFloor {
  id: string
  name: string
  areas: FactoryArea[]
}

interface FactoryArea {
  id: string
  name: string
  sections: string[]
}

const FACTORY_LAYOUT: FactoryFloor[] = [
  {
    id: "floor-1",
    name: "Ground Floor",
    areas: [
      {
        id: "area-a",
        name: "Assembly Area A",
        sections: ["A1", "A2", "A3", "A4", "A5"]
      },
      {
        id: "area-b", 
        name: "Assembly Area B",
        sections: ["B1", "B2", "B3", "B4", "B5"]
      },
      {
        id: "area-c",
        name: "Quality Control",
        sections: ["QC1", "QC2", "QC3"]
      },
      {
        id: "area-d",
        name: "Packaging",
        sections: ["PKG1", "PKG2", "PKG3"]
      }
    ]
  },
  {
    id: "floor-2", 
    name: "Second Floor",
    areas: [
      {
        id: "area-e",
        name: "Storage Area E",
        sections: ["E1", "E2", "E3", "E4"]
      },
      {
        id: "area-f",
        name: "Storage Area F", 
        sections: ["F1", "F2", "F3", "F4"]
      }
    ]
  }
]

const LOCATION_TYPES = [
  { value: "bin", label: "Bin", icon: Package, color: "bg-blue-500" },
  { value: "shelf", label: "Shelf", icon: Shelf, color: "bg-green-500" },
  { value: "rack", label: "Rack", icon: Rack, color: "bg-purple-500" },
  { value: "area", label: "Area", icon: Grid3X3, color: "bg-orange-500" },
  { value: "zone", label: "Zone", icon: Layers, color: "bg-red-500" }
]

export function EnhancedLocationCreator() {
  const { toast } = useToast()
  const createLocation = useMutation(api.locations.create)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationFormData | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    description: "",
    type: "bin",
    floor: "",
    area: "",
    section: "",
    capacity: 1,
    qrCode: "",
    locationId: ""
  })

  const generateLocationId = (data: Partial<LocationFormData>) => {
    if (!data.floor || !data.area || !data.section || !data.type) return ""
    
    const floorCode = data.floor.split(" ")[0].toUpperCase()
    const areaCode = data.area.split(" ")[0].toUpperCase()
    const sectionCode = data.section
    const typeCode = data.type.toUpperCase()
    
    return `${floorCode}-${areaCode}-${sectionCode}-${typeCode}`
  }

  const generateQRCode = (locationId: string) => {
    return `location:${locationId}`
  }

  const handleFormChange = (field: keyof LocationFormData, value: string | number) => {
    const updatedData = { ...formData, [field]: value }
    
    // Auto-generate location ID and QR code
    if (field === "floor" || field === "area" || field === "section" || field === "type") {
      const locationId = generateLocationId(updatedData)
      const qrCode = generateQRCode(locationId)
      updatedData.locationId = locationId
      updatedData.qrCode = qrCode
    }
    
    setFormData(updatedData)
  }

  const handleCreateLocation = async () => {
    if (!formData.locationId) {
      toast({
        title: "Missing Information",
        description: "Please select floor, area, and section to generate location ID",
        variant: "destructive"
      })
      return
    }

    try {
      await createLocation({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        qrCode: formData.qrCode,
        capacity: formData.capacity,
        createdBy: "admin"
      })

      setSelectedLocation(formData)
      setIsDialogOpen(false)
      setIsPrintDialogOpen(true)
      
      toast({
        title: "Location Created",
        description: `Location ${formData.locationId} created successfully`
      })
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create location",
        variant: "destructive"
      })
    }
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Location QR Code - ${selectedLocation?.locationId}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .print-container { max-width: 400px; margin: 0 auto; text-align: center; }
                .qr-code { margin: 20px 0; }
                .location-info { margin: 20px 0; }
                .location-id { font-size: 24px; font-weight: bold; margin: 10px 0; }
                .location-details { font-size: 14px; color: #666; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="print-container">
                <h1>Location QR Code</h1>
                <div class="qr-code">
                  <img src="${selectedLocation?.qrCode ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedLocation.qrCode)}` : ''}" alt="QR Code" />
                </div>
                <div class="location-info">
                  <div class="location-id">${selectedLocation?.locationId}</div>
                  <div class="location-details">
                    <div>${selectedLocation?.name}</div>
                    <div>${selectedLocation?.floor} - ${selectedLocation?.area} - ${selectedLocation?.section}</div>
                    <div>Type: ${selectedLocation?.type}</div>
                    <div>Capacity: ${selectedLocation?.capacity}</div>
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
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Location ID copied to clipboard"
    })
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Create New Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsDialogOpen(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Location
          </Button>
        </CardContent>
      </Card>

      {/* Location Creation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5" />
              Create New Location
            </DialogTitle>
            <DialogDescription>
              Select the location details and we'll auto-generate the QR code and location ID
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="e.g., Assembly Bin, Quality Shelf"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Optional description of this location"
                />
              </div>

              <div>
                <Label htmlFor="type">Location Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "bin" | "shelf" | "rack" | "area" | "zone") =>
                    handleFormChange("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="floor">Floor</Label>
                <Select
                  value={formData.floor}
                  onValueChange={(value) => handleFormChange("floor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACTORY_LAYOUT.map((floor) => (
                      <SelectItem key={floor.id} value={floor.name}>
                        {floor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="area">Area</Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) => handleFormChange("area", value)}
                  disabled={!formData.floor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.floor && FACTORY_LAYOUT
                      .find(f => f.name === formData.floor)
                      ?.areas.map((area) => (
                        <SelectItem key={area.id} value={area.name}>
                          {area.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section">Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => handleFormChange("section", value)}
                  disabled={!formData.area}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.area && FACTORY_LAYOUT
                      .find(f => f.name === formData.floor)
                      ?.areas.find(a => a.name === formData.area)
                      ?.sections.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleFormChange("capacity", parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.locationId ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Label>Location ID</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {formData.locationId}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(formData.locationId)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>QR Code</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {formData.qrCode}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(formData.qrCode)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="text-center">
                          <QRDisplay 
                            data={formData.qrCode}
                            size={120}
                            className="mx-auto"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{formData.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Floor:</span>
                          <span className="font-medium">{formData.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium">{formData.area}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Section:</span>
                          <span className="font-medium">{formData.section}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{formData.capacity}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Select floor, area, and section to generate location ID</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLocation}
              disabled={!formData.locationId}
            >
              Create Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Print QR Code
            </DialogTitle>
            <DialogDescription>
              Print the QR code for the newly created location
            </DialogDescription>
          </DialogHeader>

          {selectedLocation && (
            <div ref={printRef} className="space-y-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="mb-4">
                  <QRDisplay 
                    data={selectedLocation.qrCode}
                    size={200}
                    className="mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-bold">{selectedLocation.locationId}</div>
                  <div className="text-sm text-gray-600">{selectedLocation.name}</div>
                  <div className="text-xs text-gray-500">
                    {selectedLocation.floor} - {selectedLocation.area} - {selectedLocation.section}
                  </div>
                  <div className="text-xs text-gray-500">
                    Type: {selectedLocation.type} | Capacity: {selectedLocation.capacity}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 