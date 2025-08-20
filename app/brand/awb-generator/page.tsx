"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plane, Download, Eye, Package, MapPin, Weight, Clock } from "lucide-react"

interface AWBData {
  awbNumber: string
  date: string
  carrier: string
  flightNumber: string
  departure: string
  destination: string
  shipper: {
    name: string
    address: string
    phone: string
    email: string
  }
  consignee: {
    name: string
    address: string
    phone: string
    email: string
  }
  shipment: {
    pieces: number
    weight: number
    weightUnit: 'kg' | 'lbs'
    dimensions: {
      length: number
      width: number
      height: number
      unit: 'cm' | 'in'
    }
    description: string
    value: number
    currency: string
  }
  service: 'express' | 'standard' | 'economy'
  insurance: boolean
  insuranceValue: number
  specialInstructions: string
}

export default function AWBGeneratorPage() {
  const [awb, setAWB] = useState<AWBData>({
    awbNumber: `AWB-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    carrier: "",
    flightNumber: "",
    departure: "",
    destination: "",
    shipper: {
      name: "Groovy Brand Solutions",
      address: "456 Brand Avenue\nInnovation District, Tech City 67890",
      phone: "+1 (555) 987-6543",
      email: "shipping@groovybrand.com"
    },
    consignee: {
      name: "",
      address: "",
      phone: "",
      email: ""
    },
    shipment: {
      pieces: 1,
      weight: 0,
      weightUnit: 'kg',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm'
      },
      description: "",
      value: 0,
      currency: 'USD'
    },
    service: 'standard',
    insurance: false,
    insuranceValue: 0,
    specialInstructions: ""
  })

  const [showPreview, setShowPreview] = useState(false)

  const calculateVolumetricWeight = () => {
    const { length, width, height, unit } = awb.shipment.dimensions
    if (length && width && height) {
      // Convert to cm if needed
      const l = unit === 'in' ? length * 2.54 : length
      const w = unit === 'in' ? width * 2.54 : width
      const h = unit === 'in' ? height * 2.54 : height
      
      // Volumetric weight = (L × W × H) / 5000 for air freight
      const volumetricWeight = (l * w * h) / 5000
      return Math.round(volumetricWeight * 100) / 100
    }
    return 0
  }

  const getChargeableWeight = () => {
    const actualWeight = awb.shipment.weight
    const volumetricWeight = calculateVolumetricWeight()
    return Math.max(actualWeight, volumetricWeight)
  }

  const getServiceBadge = (service: string) => {
    switch (service) {
      case 'express': return 'bg-red-100 text-red-800'
      case 'standard': return 'bg-blue-100 text-blue-800'
      case 'economy': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const generatePDF = () => {
    // Mock PDF generation
    const link = document.createElement('a')
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago...'
    link.download = `${awb.awbNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Plane className="h-8 w-8 text-cyan-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Air Waybill Generator</h1>
          <p className="text-gray-600">Create professional air waybills for brand shipments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AWB Form */}
        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Shipment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="awbNumber">AWB Number</Label>
                  <Input
                    id="awbNumber"
                    value={awb.awbNumber}
                    onChange={(e) => setAWB(prev => ({ ...prev, awbNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Shipment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={awb.date}
                    onChange={(e) => setAWB(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carrier">Carrier</Label>
                  <Select value={awb.carrier} onValueChange={(value) => setAWB(prev => ({ ...prev, carrier: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="emirates">Emirates SkyCargo</SelectItem>
                      <SelectItem value="lufthansa">Lufthansa Cargo</SelectItem>
                      <SelectItem value="cathay">Cathay Pacific Cargo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="flightNumber">Flight Number (Optional)</Label>
                  <Input
                    id="flightNumber"
                    placeholder="EK201"
                    value={awb.flightNumber}
                    onChange={(e) => setAWB(prev => ({ ...prev, flightNumber: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure">Departure Airport</Label>
                  <Input
                    id="departure"
                    placeholder="JFK - New York"
                    value={awb.departure}
                    onChange={(e) => setAWB(prev => ({ ...prev, departure: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination Airport</Label>
                  <Input
                    id="destination"
                    placeholder="LHR - London"
                    value={awb.destination}
                    onChange={(e) => setAWB(prev => ({ ...prev, destination: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consignee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Consignee (Ship To)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="consigneeName">Company/Name</Label>
                <Input
                  id="consigneeName"
                  placeholder="Client Company"
                  value={awb.consignee.name}
                  onChange={(e) => setAWB(prev => ({
                    ...prev,
                    consignee: { ...prev.consignee, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="consigneeAddress">Address</Label>
                <Textarea
                  id="consigneeAddress"
                  placeholder="Client Address"
                  value={awb.consignee.address}
                  onChange={(e) => setAWB(prev => ({
                    ...prev,
                    consignee: { ...prev.consignee, address: e.target.value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consigneePhone">Phone</Label>
                  <Input
                    id="consigneePhone"
                    placeholder="+1 (555) 123-4567"
                    value={awb.consignee.phone}
                    onChange={(e) => setAWB(prev => ({
                      ...prev,
                      consignee: { ...prev.consignee, phone: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="consigneeEmail">Email</Label>
                  <Input
                    id="consigneeEmail"
                    type="email"
                    placeholder="client@company.com"
                    value={awb.consignee.email}
                    onChange={(e) => setAWB(prev => ({
                      ...prev,
                      consignee: { ...prev.consignee, email: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pieces">Number of Pieces</Label>
                  <Input
                    id="pieces"
                    type="number"
                    min="1"
                    value={awb.shipment.pieces}
                    onChange={(e) => setAWB(prev => ({
                      ...prev,
                      shipment: { ...prev.shipment, pieces: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={awb.shipment.weight}
                      onChange={(e) => setAWB(prev => ({
                        ...prev,
                        shipment: { ...prev.shipment, weight: Number(e.target.value) }
                      }))}
                    />
                    <Select 
                      value={awb.shipment.weightUnit} 
                      onValueChange={(value: 'kg' | 'lbs') => setAWB(prev => ({
                        ...prev,
                        shipment: { ...prev.shipment, weightUnit: value }
                      }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label>Dimensions</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Length"
                    type="number"
                    min="0"
                    value={awb.shipment.dimensions.length}
                    onChange={(e) => setAWB(prev => ({
                      ...prev,
                      shipment: {
                        ...prev.shipment,
                        dimensions: { ...prev.shipment.dimensions, length: Number(e.target.value) }
                      }
                    }))}
                  />
                  <Input
                    placeholder="Width"
                    type="number"
                    min="0"
                    value={awb.shipment.dimensions.width}
                    onChange={(e) => setAWB(prev => ({
                      ...prev,
                      shipment: {
                        ...prev.shipment,
                        dimensions: { ...prev.shipment.dimensions, width: Number(e.target.value) }
                      }
                    }))}
                  />
                  <Input
                    placeholder="Height"
                    type="number"
                    min="0"
                    value={awb.shipment.dimensions.height}
                    onChange={(e) => setAWB(prev => ({
                      ...prev,
                      shipment: {
                        ...prev.shipment,
                        dimensions: { ...prev.shipment.dimensions, height: Number(e.target.value) }
                      }
                    }))}
                  />
                  <Select 
                    value={awb.shipment.dimensions.unit} 
                    onValueChange={(value: 'cm' | 'in') => setAWB(prev => ({
                      ...prev,
                      shipment: {
                        ...prev.shipment,
                        dimensions: { ...prev.shipment.dimensions, unit: value }
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description of Goods</Label>
                <Textarea
                  id="description"
                  placeholder="Brand materials, samples, marketing collateral"
                  value={awb.shipment.description}
                  onChange={(e) => setAWB(prev => ({
                    ...prev,
                    shipment: { ...prev.shipment, description: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Declared Value</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={awb.shipment.value}
                    onChange={(e) => setAWB(prev => ({
                      ...prev,
                      shipment: { ...prev.shipment, value: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="service">Service Type</Label>
                  <Select 
                    value={awb.service} 
                    onValueChange={(value: 'express' | 'standard' | 'economy') => setAWB(prev => ({ ...prev, service: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="express">Express (1-2 days)</SelectItem>
                      <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                      <SelectItem value="economy">Economy (5-7 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="insurance"
                  checked={awb.insurance}
                  onChange={(e) => setAWB(prev => ({ ...prev, insurance: e.target.checked }))}
                />
                <Label htmlFor="insurance">Add Insurance Coverage</Label>
              </div>
              {awb.insurance && (
                <div>
                  <Label htmlFor="insuranceValue">Insurance Value ($)</Label>
                  <Input
                    id="insuranceValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={awb.insuranceValue}
                    onChange={(e) => setAWB(prev => ({ ...prev, insuranceValue: Number(e.target.value) }))}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Handle with care, fragile items, brand protection requirements, etc."
                  value={awb.specialInstructions}
                  onChange={(e) => setAWB(prev => ({ ...prev, specialInstructions: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AWB Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Air Waybill Preview</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                  <Button onClick={generatePDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {showPreview && (
              <CardContent>
                <div className="bg-white border rounded-lg p-6 space-y-6 text-sm">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">AIR WAYBILL</h2>
                      <p className="text-gray-600">#{awb.awbNumber}</p>
                      <Badge className={`mt-2 ${getServiceBadge(awb.service)}`}>
                        {awb.service.toUpperCase()} SERVICE
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{awb.carrier}</div>
                      {awb.flightNumber && <div className="text-gray-600">Flight: {awb.flightNumber}</div>}
                      <div className="text-gray-600">{new Date(awb.date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Route */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        From:
                      </h3>
                      <div className="text-gray-700">{awb.departure}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        To:
                      </h3>
                      <div className="text-gray-700">{awb.destination}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipper & Consignee */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Shipper:</h3>
                      <div className="text-gray-700">
                        <div className="font-medium">{awb.shipper.name}</div>
                        <div className="whitespace-pre-line">{awb.shipper.address}</div>
                        <div>{awb.shipper.phone}</div>
                        <div>{awb.shipper.email}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Consignee:</h3>
                      <div className="text-gray-700">
                        <div className="font-medium">{awb.consignee.name}</div>
                        <div className="whitespace-pre-line">{awb.consignee.address}</div>
                        <div>{awb.consignee.phone}</div>
                        <div>{awb.consignee.email}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipment Details */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Shipment Details:
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between">
                          <span>Pieces:</span>
                          <span className="font-medium">{awb.shipment.pieces}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Actual Weight:</span>
                          <span className="font-medium">{awb.shipment.weight} {awb.shipment.weightUnit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volumetric Weight:</span>
                          <span className="font-medium">{calculateVolumetricWeight()} kg</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Chargeable Weight:</span>
                          <span>{getChargeableWeight()} kg</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span>Dimensions:</span>
                          <span className="font-medium">
                            {awb.shipment.dimensions.length} × {awb.shipment.dimensions.width} × {awb.shipment.dimensions.height} {awb.shipment.dimensions.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Declared Value:</span>
                          <span className="font-medium">${awb.shipment.value}</span>
                        </div>
                        {awb.insurance && (
                          <div className="flex justify-between">
                            <span>Insurance:</span>
                            <span className="font-medium">${awb.insuranceValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Description of Goods:</h3>
                    <p className="text-gray-700">{awb.shipment.description}</p>
                  </div>

                  {/* Special Instructions */}
                  {awb.specialInstructions && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Special Instructions:</h3>
                        <p className="text-gray-700 whitespace-pre-line">{awb.specialInstructions}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Weight Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Weight className="h-5 w-5" />
                Weight Calculation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual Weight:</span>
                  <span className="font-medium">{awb.shipment.weight} {awb.shipment.weightUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volumetric Weight:</span>
                  <span className="font-medium">{calculateVolumetricWeight()} kg</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Chargeable Weight:</span>
                  <span>{getChargeableWeight()} kg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Type:</span>
                  <Badge className={getServiceBadge(awb.service)}>
                    {awb.service.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carrier:</span>
                  <span className="font-medium">{awb.carrier || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <span className="font-medium">{awb.insurance ? `$${awb.insuranceValue}` : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Declared Value:</span>
                  <span className="font-medium">${awb.shipment.value}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
