"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Warehouse, 
  MapPin, 
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
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  Truck,
  Box,
  Ruler,
  Thermometer,
  Shield,
  Activity
} from "lucide-react"

// Mock data for storage tracking
const mockWarehouses = [
  {
    id: 1,
    name: "Main Distribution Center",
    location: "Los Angeles, CA",
    status: "active",
    capacity: 50000,
    utilized: 42000,
    efficiency: 94,
    temperature: "18°C",
    humidity: "45%",
    security: "high",
    lastInspection: "2024-02-01",
    nextInspection: "2024-03-01",
    staff: 24,
    activeOrders: 156,
    value: "$2.4M"
  },
  {
    id: 2,
    name: "East Coast Hub",
    location: "New York, NY",
    status: "active",
    capacity: 35000,
    utilized: 28000,
    efficiency: 88,
    temperature: "20°C",
    humidity: "50%",
    security: "high",
    lastInspection: "2024-01-28",
    nextInspection: "2024-02-28",
    staff: 18,
    activeOrders: 98,
    value: "$1.8M"
  },
  {
    id: 3,
    name: "Regional Storage",
    location: "Chicago, IL",
    status: "maintenance",
    capacity: 25000,
    utilized: 15000,
    efficiency: 75,
    temperature: "22°C",
    humidity: "55%",
    security: "medium",
    lastInspection: "2024-01-15",
    nextInspection: "2024-02-15",
    staff: 12,
    activeOrders: 67,
    value: "$1.2M"
  },
  {
    id: 4,
    name: "Cold Storage Facility",
    location: "Miami, FL",
    status: "active",
    capacity: 15000,
    utilized: 12000,
    efficiency: 92,
    temperature: "4°C",
    humidity: "30%",
    security: "high",
    lastInspection: "2024-02-05",
    nextInspection: "2024-03-05",
    staff: 8,
    activeOrders: 45,
    value: "$800K"
  }
]

const mockStorageAreas = [
  {
    id: 1,
    name: "Zone A - Raw Materials",
    warehouse: "Main Distribution Center",
    capacity: 10000,
    utilized: 8500,
    status: "active",
    temperature: "18°C",
    humidity: "45%",
    items: 234,
    lastUpdated: "2024-02-08 14:30"
  },
  {
    id: 2,
    name: "Zone B - Finished Goods",
    warehouse: "Main Distribution Center",
    capacity: 15000,
    utilized: 12000,
    status: "active",
    temperature: "18°C",
    humidity: "45%",
    items: 456,
    lastUpdated: "2024-02-08 15:45"
  },
  {
    id: 3,
    name: "Zone C - Returns",
    warehouse: "Main Distribution Center",
    capacity: 5000,
    utilized: 3200,
    status: "active",
    temperature: "18°C",
    humidity: "45%",
    items: 89,
    lastUpdated: "2024-02-08 16:20"
  },
  {
    id: 4,
    name: "Cold Storage - Perishables",
    warehouse: "Cold Storage Facility",
    capacity: 8000,
    utilized: 6500,
    status: "active",
    temperature: "4°C",
    humidity: "30%",
    items: 123,
    lastUpdated: "2024-02-08 17:10"
  }
]

const mockInventory = [
  {
    id: 1,
    sku: "SKU-001",
    name: "Denim Jacket Blue",
    category: "Outerwear",
    location: "Zone B - Aisle 3 - Shelf 2",
    quantity: 150,
    reserved: 25,
    available: 125,
    value: "$45,000",
    lastMovement: "2024-02-08 14:30",
    status: "in-stock"
  },
  {
    id: 2,
    sku: "SKU-002",
    name: "Cotton T-Shirt White",
    category: "Tops",
    location: "Zone B - Aisle 1 - Shelf 1",
    quantity: 500,
    reserved: 100,
    available: 400,
    value: "$25,000",
    lastMovement: "2024-02-08 15:45",
    status: "in-stock"
  },
  {
    id: 3,
    sku: "SKU-003",
    name: "Wool Sweater Gray",
    category: "Knitwear",
    location: "Zone B - Aisle 2 - Shelf 3",
    quantity: 75,
    reserved: 15,
    available: 60,
    value: "$18,750",
    lastMovement: "2024-02-08 16:20",
    status: "low-stock"
  },
  {
    id: 4,
    sku: "SKU-004",
    name: "Leather Bag Brown",
    category: "Accessories",
    location: "Zone B - Aisle 4 - Shelf 1",
    quantity: 30,
    reserved: 8,
    available: 22,
    value: "$12,000",
    lastMovement: "2024-02-08 17:10",
    status: "low-stock"
  }
]

export default function StorageTrackingPage() {
  const [selectedView, setSelectedView] = useState<'warehouses' | 'areas' | 'inventory' | 'analytics'>('warehouses')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSecurityColor = (security: string) => {
    switch (security) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800'
      case 'low-stock': return 'bg-yellow-100 text-yellow-800'
      case 'out-of-stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredWarehouses = mockWarehouses.filter(warehouse => {
    if (selectedStatus !== 'all' && warehouse.status !== selectedStatus) return false
    if (searchQuery && !warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Tracking</h1>
          <p className="text-gray-600">Warehouse and storage facility management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'warehouses', label: 'Warehouses', icon: Warehouse },
          { key: 'areas', label: 'Storage Areas', icon: MapPin },
          { key: 'inventory', label: 'Inventory', icon: Package },
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

      {/* Warehouses View */}
      {selectedView === 'warehouses' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search warehouses..."
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
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredWarehouses.map((warehouse) => (
              <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <CardDescription>
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {warehouse.location}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(warehouse.status)}>
                        {warehouse.status}
                      </Badge>
                      <Badge className={getSecurityColor(warehouse.security)}>
                        {warehouse.security}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Capacity and Utilization */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilization</span>
                      <span>{warehouse.utilized.toLocaleString()}/{warehouse.capacity.toLocaleString()} sq ft</span>
                    </div>
                    <Progress value={(warehouse.utilized / warehouse.capacity) * 100} />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Efficiency</span>
                      <div className="font-medium">{warehouse.efficiency}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Staff</span>
                      <div className="font-medium">{warehouse.staff}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temperature</span>
                      <div className="font-medium">{warehouse.temperature}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity</span>
                      <div className="font-medium">{warehouse.humidity}</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Active Orders</span>
                      <div className="font-medium">{warehouse.activeOrders}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Value</span>
                      <div className="font-medium">{warehouse.value}</div>
                    </div>
                  </div>

                  {/* Inspection Info */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Next Inspection</span>
                    <div className="font-medium">{warehouse.nextInspection}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Storage Areas View */}
      {selectedView === 'areas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Storage Areas</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Storage Area
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStorageAreas.map((area) => (
              <Card key={area.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{area.name}</CardTitle>
                      <CardDescription>{area.warehouse}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(area.status)}>
                      {area.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Utilization */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilization</span>
                      <span>{area.utilized.toLocaleString()}/{area.capacity.toLocaleString()} sq ft</span>
                    </div>
                    <Progress value={(area.utilized / area.capacity) * 100} />
                  </div>

                  {/* Environment */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Temperature</span>
                      <div className="font-medium">{area.temperature}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity</span>
                      <div className="font-medium">{area.humidity}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Items Stored</span>
                    <div className="font-medium">{area.items}</div>
                  </div>

                  {/* Last Update */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <div className="font-medium">{area.lastUpdated}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Items
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inventory View */}
      {selectedView === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Inventory Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {mockInventory.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.sku} • {item.category}</p>
                        <p className="text-sm text-gray-500">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Quantity</div>
                        <div className="font-semibold">{item.quantity}</div>
                        <div className="text-xs text-gray-500">
                          {item.available} available, {item.reserved} reserved
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Value</div>
                        <div className="font-semibold">{item.value}</div>
                      </div>
                      <Badge className={getInventoryStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Last movement: {item.lastMovement}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Truck className="h-4 w-4 mr-1" />
                        Move
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {selectedView === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Storage Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125,000 sq ft</div>
                <p className="text-xs text-muted-foreground">
                  Across 4 warehouses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  +3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$6.2M</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">62</div>
                <p className="text-xs text-muted-foreground">
                  4 warehouses
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWarehouses.map((warehouse) => (
                    <div key={warehouse.id} className="flex items-center justify-between">
                      <span className="text-sm">{warehouse.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(warehouse.utilized / warehouse.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round((warehouse.utilized / warehouse.capacity) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Area Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStorageAreas.map((area) => (
                    <div key={area.id} className="flex items-center justify-between">
                      <span className="text-sm">{area.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(area.utilized / area.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round((area.utilized / area.capacity) * 100)}%</span>
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
