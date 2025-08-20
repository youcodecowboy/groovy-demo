"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  Users, 
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Route,
  Globe,
  Phone,
  Mail,
  FileText,
  BarChart3
} from "lucide-react"

// Mock data for logistics tracking
const mockShipments = [
  {
    id: 1,
    trackingNumber: "TRK-2024-001",
    origin: "Shanghai, China",
    destination: "Los Angeles, CA",
    status: "in-transit",
    priority: "high",
    createdAt: "2024-02-01",
    estimatedDelivery: "2024-02-15",
    actualDelivery: null,
    carrier: "FedEx",
    service: "Express",
    weight: "2,500 kg",
    dimensions: "120x80x60 cm",
    value: "$45,000",
    items: 150,
    currentLocation: "Honolulu, HI",
    lastUpdate: "2024-02-08 14:30",
    progress: 65,
    alerts: ["Weather delay expected"]
  },
  {
    id: 2,
    trackingNumber: "TRK-2024-002",
    origin: "Mumbai, India",
    destination: "New York, NY",
    status: "delivered",
    priority: "medium",
    createdAt: "2024-01-25",
    estimatedDelivery: "2024-02-10",
    actualDelivery: "2024-02-09",
    carrier: "DHL",
    service: "Standard",
    weight: "1,800 kg",
    dimensions: "100x70x50 cm",
    value: "$28,000",
    items: 120,
    currentLocation: "Delivered",
    lastUpdate: "2024-02-09 10:15",
    progress: 100,
    alerts: []
  },
  {
    id: 3,
    trackingNumber: "TRK-2024-003",
    origin: "Istanbul, Turkey",
    destination: "Chicago, IL",
    status: "pending",
    priority: "low",
    createdAt: "2024-02-05",
    estimatedDelivery: "2024-02-20",
    actualDelivery: null,
    carrier: "UPS",
    service: "Ground",
    weight: "3,200 kg",
    dimensions: "150x90x70 cm",
    value: "$52,000",
    items: 200,
    currentLocation: "Istanbul, Turkey",
    lastUpdate: "2024-02-05 16:45",
    progress: 10,
    alerts: ["Customs clearance required"]
  },
  {
    id: 4,
    trackingNumber: "TRK-2024-004",
    origin: "Bangkok, Thailand",
    destination: "Miami, FL",
    status: "delayed",
    priority: "high",
    createdAt: "2024-01-30",
    estimatedDelivery: "2024-02-12",
    actualDelivery: null,
    carrier: "FedEx",
    service: "Express",
    weight: "1,500 kg",
    dimensions: "80x60x40 cm",
    value: "$35,000",
    items: 80,
    currentLocation: "Panama City, Panama",
    lastUpdate: "2024-02-08 09:20",
    progress: 45,
    alerts: ["Port congestion", "Weather delay"]
  }
]

const mockCarriers = [
  { id: 1, name: "FedEx", status: "active", shipments: 45, rating: 4.8, onTimeDelivery: 92 },
  { id: 2, name: "DHL", status: "active", shipments: 38, rating: 4.6, onTimeDelivery: 89 },
  { id: 3, name: "UPS", status: "active", shipments: 32, rating: 4.7, onTimeDelivery: 91 },
  { id: 4, name: "USPS", status: "maintenance", shipments: 28, rating: 4.2, onTimeDelivery: 85 }
]

const mockRoutes = [
  { id: 1, name: "Asia-Pacific Express", origin: "Shanghai", destination: "LAX", frequency: "Daily", avgTime: "3.2 days", cost: "$2,500" },
  { id: 2, name: "Europe Standard", origin: "Istanbul", destination: "ORD", frequency: "3x/week", avgTime: "5.8 days", cost: "$1,800" },
  { id: 3, name: "South America Route", origin: "São Paulo", destination: "MIA", frequency: "2x/week", avgTime: "4.5 days", cost: "$2,200" }
]

export default function LogisticsTrackingPage() {
  const [selectedView, setSelectedView] = useState<'shipments' | 'carriers' | 'routes' | 'analytics'>('shipments')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCarrier, setSelectedCarrier] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'in-transit': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in-transit': return <Truck className="h-4 w-4 text-blue-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'delayed': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredShipments = mockShipments.filter(shipment => {
    if (selectedStatus !== 'all' && shipment.status !== selectedStatus) return false
    if (selectedCarrier !== 'all' && shipment.carrier !== selectedCarrier) return false
    if (searchQuery && !shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logistics Tracking</h1>
          <p className="text-gray-600">End-to-end logistics and shipping management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Shipment
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'shipments', label: 'Shipments', icon: Package },
          { key: 'carriers', label: 'Carriers', icon: Truck },
          { key: 'routes', label: 'Routes', icon: Route },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedView(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shipments View */}
      {selectedView === 'shipments' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="in-transit">In Transit</option>
                <option value="pending">Pending</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Carrier:</span>
              <select 
                value={selectedCarrier} 
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Carriers</option>
                <option value="FedEx">FedEx</option>
                <option value="DHL">DHL</option>
                <option value="UPS">UPS</option>
                <option value="USPS">USPS</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Shipments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredShipments.map((shipment) => (
              <Card key={shipment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{shipment.trackingNumber}</CardTitle>
                      <CardDescription>{shipment.carrier} • {shipment.service}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(shipment.status)}
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                      <Badge className={getPriorityColor(shipment.priority)}>
                        {shipment.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Route Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{shipment.origin}</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{shipment.destination}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{shipment.progress}%</span>
                    </div>
                    <Progress value={shipment.progress} />
                  </div>

                  {/* Shipment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weight</span>
                      <div className="font-medium">{shipment.weight}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value</span>
                      <div className="font-medium">{shipment.value}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Items</span>
                      <div className="font-medium">{shipment.items}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dimensions</span>
                      <div className="font-medium">{shipment.dimensions}</div>
                    </div>
                  </div>

                  {/* Current Location */}
                  <div>
                    <span className="text-sm text-muted-foreground">Current Location</span>
                    <div className="font-medium text-sm mt-1">{shipment.currentLocation}</div>
                    <div className="text-xs text-gray-500 mt-1">Last update: {shipment.lastUpdate}</div>
                  </div>

                  {/* Alerts */}
                  {shipment.alerts.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Alerts</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {shipment.alerts.map((alert, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-red-600 border-red-200">
                            {alert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Track
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Carriers View */}
      {selectedView === 'carriers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Carrier Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Carrier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCarriers.map((carrier) => (
              <Card key={carrier.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{carrier.name}</CardTitle>
                    <Badge className={carrier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {carrier.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Active Shipments</span>
                      <div className="font-medium">{carrier.shipments}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{carrier.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>On-Time Delivery</span>
                      <span>{carrier.onTimeDelivery}%</span>
                    </div>
                    <Progress value={carrier.onTimeDelivery} />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Routes View */}
      {selectedView === 'routes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Route Optimization</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockRoutes.map((route) => (
              <Card key={route.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{route.name}</CardTitle>
                  <CardDescription>{route.origin} → {route.destination}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Frequency</span>
                      <div className="font-medium">{route.frequency}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Time</span>
                      <div className="font-medium">{route.avgTime}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost</span>
                      <div className="font-medium">{route.cost}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Route className="h-4 w-4 mr-1" />
                      Optimize
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Route Optimization Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Calculator</CardTitle>
                <CardDescription>Calculate optimal routes and costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Origin</label>
                      <input type="text" placeholder="City, Country" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Destination</label>
                      <input type="text" placeholder="City, Country" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weight (kg)</label>
                    <input type="number" placeholder="1000" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                  </div>
                  <Button className="w-full">Calculate Route</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Estimator</CardTitle>
                <CardDescription>Estimate shipping costs and delivery times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Service Type</label>
                    <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm">
                      <option>Express</option>
                      <option>Standard</option>
                      <option>Economy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Package Value</label>
                    <input type="number" placeholder="50000" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                  </div>
                  <Button className="w-full">Estimate Cost</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {selectedView === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Logistics Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">143</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Transit Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 days</div>
                <p className="text-xs text-muted-foreground">
                  -0.3 days from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.4M</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Delivered', count: 89, color: 'bg-green-500' },
                    { status: 'In Transit', count: 45, color: 'bg-blue-500' },
                    { status: 'Pending', count: 23, color: 'bg-yellow-500' },
                    { status: 'Delayed', count: 12, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.status}</span>
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Carrier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCarriers.map((carrier) => (
                    <div key={carrier.id} className="flex items-center justify-between">
                      <span className="text-sm">{carrier.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${carrier.onTimeDelivery}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{carrier.onTimeDelivery}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
