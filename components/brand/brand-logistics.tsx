'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Truck, Package, MapPin, Clock, ExternalLink } from 'lucide-react'
import { format, addDays } from 'date-fns'

// Mock shipment data
const mockShipments = [
  {
    id: 'ship-001',
    orderId: 'ord-001',
    carrier: 'DHL Express',
    trackingNumber: 'DHL123456789',
    status: 'in_transit',
    origin: 'Ho Chi Minh City, Vietnam',
    destination: 'New York, NY, USA',
    estimatedDelivery: addDays(new Date(), 3),
    items: 750,
    weight: '125 kg'
  },
  {
    id: 'ship-002',
    orderId: 'ord-003',
    carrier: 'FedEx International',
    trackingNumber: 'FDX987654321',
    status: 'delivered',
    origin: 'Istanbul, Turkey',
    destination: 'Los Angeles, CA, USA',
    estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    items: 1200,
    weight: '200 kg'
  }
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  delayed: 'bg-red-100 text-red-800'
}

export function BrandLogistics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Logistics</h1>
        <Button variant="outline" size="sm">
          <MapPin className="h-4 w-4 mr-2" />
          Track All Shipments
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered This Month</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Transit Time</p>
                <p className="text-2xl font-bold">8.5 days</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockShipments.map((shipment) => (
              <div key={shipment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Order {shipment.orderId}</h4>
                      <Badge className={statusColors[shipment.status]}>
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{shipment.carrier} - {shipment.trackingNumber}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Origin</p>
                    <p className="font-medium">{shipment.origin}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Destination</p>
                    <p className="font-medium">{shipment.destination}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-medium">{shipment.items} units ({shipment.weight})</p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      {shipment.status === 'delivered' ? 'Delivered' : 'ETA'}
                    </p>
                    <p className="font-medium">{format(shipment.estimatedDelivery, 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}