'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  ExternalLink,
  Plane,
  Ship,
  FileText,
  Download,
  Upload,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Weight,
  Ruler,
  Globe,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  FileImage,
  Receipt,
  CreditCard,
  Shield,
  Zap,
  Plus
} from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import { useState } from 'react'

// Enhanced shipment data
interface ShipmentEvent {
  id: string
  timestamp: Date
  location: string
  status: string
  description: string
  type: 'pickup' | 'transit' | 'customs' | 'delivery' | 'exception'
}

interface ShipmentDocument {
  id: string
  name: string
  type: 'airway_bill' | 'invoice' | 'packing_list' | 'customs_declaration' | 'insurance' | 'other'
  url: string
  uploadedAt: Date
  size: string
}

interface EnhancedShipment {
  id: string
  shipmentId: string
  orderId?: string
  sampleId?: string
  type: 'sample' | 'production' | 'parcel' | 'freight'
  mode: 'air' | 'sea' | 'ground' | 'express'
  carrier: string
  trackingNumber: string
  status: 'pending' | 'picked_up' | 'in_transit' | 'customs_clearance' | 'out_for_delivery' | 'delivered' | 'delayed' | 'exception'
  
  // Origin and destination
  origin: {
    address: string
    city: string
    country: string
    contact: string
    phone: string
  }
  destination: {
    address: string
    city: string
    country: string
    contact: string
    phone: string
  }
  
  // Dates
  pickupDate: Date
  estimatedDelivery: Date
  actualDelivery?: Date
  
  // Cargo details
  items: number
  weight: number
  weightUnit: 'kg' | 'lbs'
  dimensions: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
  volume: number
  volumeUnit: 'cbm' | 'cft'
  
  // Financial details
  freightCost: number
  insuranceCost: number
  customsDuties?: number
  totalCost: number
  currency: 'USD' | 'EUR'
  
  // Tracking
  events: ShipmentEvent[]
  currentLocation?: string
  progress: number
  
  // Documents
  documents: ShipmentDocument[]
  
  // Additional info
  specialInstructions?: string
  declaredValue: number
  insuranceAmount: number
  customsValue: number
}

const mockShipments: EnhancedShipment[] = [
  {
    id: 'ship-001',
    shipmentId: 'AWB-2024-001',
    orderId: 'PO-2024-001',
    type: 'production',
    mode: 'air',
    carrier: 'DHL Express',
    trackingNumber: 'DHL123456789',
    status: 'in_transit',
    
    origin: {
      address: 'Factory A, Industrial Zone 3',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
      contact: 'Nguyen Thi Mai',
      phone: '+84-28-382-0124'
    },
    destination: {
      address: 'Brand HQ, 123 Fashion Ave',
      city: 'New York',
      country: 'USA',
      contact: 'Sarah Johnson',
      phone: '+1-555-0123'
    },
    
    pickupDate: new Date('2024-12-08T10:00:00Z'),
    estimatedDelivery: addDays(new Date('2024-12-08T10:00:00Z'), 3),
    
    items: 750,
    weight: 125,
    weightUnit: 'kg',
    dimensions: {
      length: 120,
      width: 80,
      height: 60,
      unit: 'cm'
    },
    volume: 0.576,
    volumeUnit: 'cbm',
    
    freightCost: 850,
    insuranceCost: 125,
    totalCost: 975,
    currency: 'USD',
    
    events: [
      {
        id: 'evt-1',
        timestamp: new Date('2024-12-08T10:00:00Z'),
        location: 'Ho Chi Minh City, Vietnam',
        status: 'Picked up',
        description: 'Shipment picked up from factory',
        type: 'pickup'
      },
      {
        id: 'evt-2',
        timestamp: new Date('2024-12-08T14:30:00Z'),
        location: 'Ho Chi Minh City, Vietnam',
        status: 'In transit',
        description: 'Arrived at DHL facility',
        type: 'transit'
      },
      {
        id: 'evt-3',
        timestamp: new Date('2024-12-09T08:15:00Z'),
        location: 'Hong Kong',
        status: 'In transit',
        description: 'Departed from Hong Kong hub',
        type: 'transit'
      }
    ],
    currentLocation: 'Hong Kong',
    progress: 60,
    
    documents: [
      {
        id: 'doc-1',
        name: 'Airway Bill DHL123456789',
        type: 'airway_bill',
        url: '/documents/awb-dhl123456789.pdf',
        uploadedAt: new Date('2024-12-08T09:00:00Z'),
        size: '245 KB'
      },
      {
        id: 'doc-2',
        name: 'Commercial Invoice',
        type: 'invoice',
        url: '/documents/invoice-po-2024-001.pdf',
        uploadedAt: new Date('2024-12-08T09:30:00Z'),
        size: '156 KB'
      },
      {
        id: 'doc-3',
        name: 'Packing List',
        type: 'packing_list',
        url: '/documents/packing-list-po-2024-001.pdf',
        uploadedAt: new Date('2024-12-08T09:45:00Z'),
        size: '89 KB'
      }
    ],
    
    specialInstructions: 'Handle with care - premium garments',
    declaredValue: 12500,
    insuranceAmount: 12500,
    customsValue: 12500
  },
  {
    id: 'ship-002',
    shipmentId: 'AWB-2024-002',
    sampleId: 'sample-001',
    type: 'sample',
    mode: 'express',
    carrier: 'FedEx International',
    trackingNumber: 'FDX987654321',
    status: 'delivered',
    
    origin: {
      address: 'Textile Excellence Ltd.',
      city: 'Dhaka',
      country: 'Bangladesh',
      contact: 'Ahmed Khan',
      phone: '+880-2-955-0123'
    },
    destination: {
      address: 'Brand Design Studio',
      city: 'Los Angeles',
      country: 'USA',
      contact: 'Mike Chen',
      phone: '+1-555-0124'
    },
    
    pickupDate: new Date('2024-12-05T08:00:00Z'),
    estimatedDelivery: new Date('2024-12-08T17:00:00Z'),
    actualDelivery: new Date('2024-12-08T14:30:00Z'),
    
    items: 5,
    weight: 2.5,
    weightUnit: 'kg',
    dimensions: {
      length: 30,
      width: 25,
      height: 15,
      unit: 'cm'
    },
    volume: 0.011,
    volumeUnit: 'cbm',
    
    freightCost: 45,
    insuranceCost: 5,
    totalCost: 50,
    currency: 'USD',
    
    events: [
      {
        id: 'evt-1',
        timestamp: new Date('2024-12-05T08:00:00Z'),
        location: 'Dhaka, Bangladesh',
        status: 'Picked up',
        description: 'Sample package picked up',
        type: 'pickup'
      },
      {
        id: 'evt-2',
        timestamp: new Date('2024-12-06T10:00:00Z'),
        location: 'Dubai, UAE',
        status: 'In transit',
        description: 'Arrived at FedEx hub',
        type: 'transit'
      },
      {
        id: 'evt-3',
        timestamp: new Date('2024-12-08T14:30:00Z'),
        location: 'Los Angeles, USA',
        status: 'Delivered',
        description: 'Package delivered to recipient',
        type: 'delivery'
      }
    ],
    progress: 100,
    
    documents: [
      {
        id: 'doc-1',
        name: 'Airway Bill FDX987654321',
        type: 'airway_bill',
        url: '/documents/awb-fdx987654321.pdf',
        uploadedAt: new Date('2024-12-05T07:30:00Z'),
        size: '198 KB'
      }
    ],
    
    declaredValue: 450,
    insuranceAmount: 450,
    customsValue: 450
  },
  {
    id: 'ship-003',
    shipmentId: 'AWB-2024-003',
    orderId: 'PO-2024-003',
    type: 'production',
    mode: 'sea',
    carrier: 'Maersk Line',
    trackingNumber: 'MAEU123456789',
    status: 'customs_clearance',
    
    origin: {
      address: 'Luxury Textiles International',
      city: 'Istanbul',
      country: 'Turkey',
      contact: 'Mehmet Yilmaz',
      phone: '+90-212-555-0126'
    },
    destination: {
      address: 'Brand Distribution Center',
      city: 'Miami',
      country: 'USA',
      contact: 'David Kim',
      phone: '+1-555-0125'
    },
    
    pickupDate: new Date('2024-11-25T12:00:00Z'),
    estimatedDelivery: addDays(new Date('2024-11-25T12:00:00Z'), 21),
    
    items: 1200,
    weight: 200,
    weightUnit: 'kg',
    dimensions: {
      length: 200,
      width: 120,
      height: 100,
      unit: 'cm'
    },
    volume: 2.4,
    volumeUnit: 'cbm',
    
    freightCost: 1200,
    insuranceCost: 200,
    customsDuties: 1500,
    totalCost: 2900,
    currency: 'USD',
    
    events: [
      {
        id: 'evt-1',
        timestamp: new Date('2024-11-25T12:00:00Z'),
        location: 'Istanbul, Turkey',
        status: 'Picked up',
        description: 'Container loaded at factory',
        type: 'pickup'
      },
      {
        id: 'evt-2',
        timestamp: new Date('2024-11-28T08:00:00Z'),
        location: 'Istanbul Port',
        status: 'In transit',
        description: 'Container loaded on vessel',
        type: 'transit'
      },
      {
        id: 'evt-3',
        timestamp: new Date('2024-12-10T14:00:00Z'),
        location: 'Miami Port',
        status: 'Customs clearance',
        description: 'Container arrived, undergoing customs clearance',
        type: 'customs'
      }
    ],
    currentLocation: 'Miami Port',
    progress: 85,
    
    documents: [
      {
        id: 'doc-1',
        name: 'Bill of Lading MAEU123456789',
        type: 'airway_bill',
        url: '/documents/bl-maeu123456789.pdf',
        uploadedAt: new Date('2024-11-25T11:00:00Z'),
        size: '456 KB'
      },
      {
        id: 'doc-2',
        name: 'Commercial Invoice',
        type: 'invoice',
        url: '/documents/invoice-po-2024-003.pdf',
        uploadedAt: new Date('2024-11-25T11:30:00Z'),
        size: '234 KB'
      },
      {
        id: 'doc-3',
        name: 'Customs Declaration',
        type: 'customs_declaration',
        url: '/documents/customs-declaration-po-2024-003.pdf',
        uploadedAt: new Date('2024-12-10T10:00:00Z'),
        size: '178 KB'
      }
    ],
    
    declaredValue: 25000,
    insuranceAmount: 25000,
    customsValue: 25000
  }
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  picked_up: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-purple-100 text-purple-800',
  customs_clearance: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  delayed: 'bg-red-100 text-red-800',
  exception: 'bg-red-100 text-red-800'
}

const typeColors = {
  sample: 'bg-blue-100 text-blue-800',
  production: 'bg-green-100 text-green-800',
  parcel: 'bg-purple-100 text-purple-800',
  freight: 'bg-orange-100 text-orange-800'
}

const modeIcons = {
  air: Plane,
  sea: Ship,
  ground: Truck,
  express: Zap
}

export function BrandLogistics() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedShipment, setSelectedShipment] = useState<EnhancedShipment | null>(null)

  const filteredShipments = activeTab === 'all' 
    ? mockShipments 
    : mockShipments.filter(shipment => shipment.type === activeTab)

  const totalShipments = mockShipments.length
  const inTransit = mockShipments.filter(s => s.status === 'in_transit').length
  const delivered = mockShipments.filter(s => s.status === 'delivered').length
  const delayed = mockShipments.filter(s => s.status === 'delayed').length
  const totalValue = mockShipments.reduce((sum, s) => sum + s.declaredValue, 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle
      case 'delayed': return AlertTriangle
      case 'exception': return AlertTriangle
      default: return Clock
    }
  }

  const getDaysUntilDelivery = (estimatedDelivery: Date) => {
    const now = new Date()
    const diffTime = estimatedDelivery.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDeliveryStatus = (shipment: EnhancedShipment) => {
    if (shipment.status === 'delivered') {
      return { status: 'delivered', color: 'text-green-600', text: 'Delivered' }
    }
    
    const daysUntilDelivery = getDaysUntilDelivery(shipment.estimatedDelivery)
    if (daysUntilDelivery < 0) {
      return { status: 'overdue', color: 'text-red-600', text: 'Overdue' }
    }
    if (daysUntilDelivery <= 2) {
      return { status: 'urgent', color: 'text-orange-600', text: 'Due soon' }
    }
    return { status: 'on-track', color: 'text-green-600', text: 'On track' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Logistics</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Track All Shipments
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold">{totalShipments}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold">{inTransit}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold">{delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delayed</p>
                <p className="text-2xl font-bold">{delayed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Shipments</TabsTrigger>
          <TabsTrigger value="sample">Samples</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="parcel">Parcels</TabsTrigger>
          <TabsTrigger value="freight">Freight</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Shipments List */}
          <div className="space-y-4">
            {filteredShipments.map((shipment) => {
              const StatusIcon = getStatusIcon(shipment.status)
              const ModeIcon = modeIcons[shipment.mode]
              const deliveryStatus = getDeliveryStatus(shipment)
              
              return (
                <Card key={shipment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{shipment.shipmentId}</h3>
                          <Badge className={statusColors[shipment.status]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {shipment.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={typeColors[shipment.type]}>
                            {shipment.type}
                          </Badge>
                          <Badge variant="outline">
                            <ModeIcon className="w-3 h-3 mr-1" />
                            {shipment.mode}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {shipment.carrier} - {shipment.trackingNumber}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{shipment.origin.city} → {shipment.destination.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className={deliveryStatus.color}>
                              {shipment.actualDelivery 
                                ? `Delivered ${format(shipment.actualDelivery, 'MMM d, yyyy')}`
                                : `Due ${format(shipment.estimatedDelivery, 'MMM d, yyyy')}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${shipment.totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">{shipment.currency}</div>
                      </div>
                    </div>

                    {/* Cargo Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Items</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{shipment.items.toLocaleString()}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Weight</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {shipment.weight} {shipment.weightUnit}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Volume</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {shipment.volume} {shipment.volumeUnit}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Value</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          ${shipment.declaredValue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress and Current Status */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">{shipment.progress}%</span>
                      </div>
                      <Progress value={shipment.progress} className="h-2" />
                      {shipment.currentLocation && (
                        <p className="text-sm text-gray-600 mt-1">
                          Current location: {shipment.currentLocation}
                        </p>
                      )}
                    </div>

                    {/* Latest Event */}
                    {shipment.events.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Latest Update</span>
                        </div>
                        <p className="text-sm text-gray-900">
                          {shipment.events[shipment.events.length - 1].description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(shipment.events[shipment.events.length - 1].timestamp, 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    )}

                    {/* Documents */}
                    {shipment.documents.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Documents</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {shipment.documents.slice(0, 3).map((doc) => (
                            <Badge key={doc.id} variant="outline" className="text-xs">
                              {doc.name}
                            </Badge>
                          ))}
                          {shipment.documents.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{shipment.documents.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Track
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Documents
                        </Button>
                        <Button variant="outline" size="sm">
                          <Receipt className="h-4 w-4 mr-2" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredShipments.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab !== 'all' 
                    ? "No shipments of this type"
                    : "Get started by creating your first shipment"
                  }
                </p>
                {activeTab === 'all' && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Shipment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
