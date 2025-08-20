"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  WashingMachine, 
  Thermometer, 
  Clock, 
  Package, 
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
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  Droplets,
  Zap,
  Activity,
  FileText,
  Star,
  Shield,
  Target
} from "lucide-react"

// Mock data for wash management
const mockWashProcesses = [
  {
    id: 1,
    name: "Denim Stone Wash",
    batchNumber: "BW-2024-001",
    status: "in-progress",
    priority: "high",
    startTime: "2024-02-08 08:00",
    estimatedEnd: "2024-02-08 16:00",
    actualEnd: null,
    progress: 65,
    quantity: 500,
    completed: 325,
    temperature: "35°C",
    humidity: "75%",
    chemicals: ["Enzyme", "Softener", "Bleach"],
    operator: "Sarah Johnson",
    qualityScore: 94,
    issues: []
  },
  {
    id: 2,
    name: "Cotton Soft Wash",
    batchNumber: "BW-2024-002",
    status: "completed",
    priority: "medium",
    startTime: "2024-02-07 10:00",
    estimatedEnd: "2024-02-07 18:00",
    actualEnd: "2024-02-07 17:45",
    progress: 100,
    quantity: 300,
    completed: 300,
    temperature: "40°C",
    humidity: "70%",
    chemicals: ["Softener", "Fabric Conditioner"],
    operator: "Mike Chen",
    qualityScore: 96,
    issues: []
  },
  {
    id: 3,
    name: "Wool Gentle Wash",
    batchNumber: "BW-2024-003",
    status: "on-hold",
    priority: "low",
    startTime: "2024-02-08 09:00",
    estimatedEnd: "2024-02-08 17:00",
    actualEnd: null,
    progress: 25,
    quantity: 150,
    completed: 38,
    temperature: "25°C",
    humidity: "60%",
    chemicals: ["Wool Detergent", "Conditioner"],
    operator: "Lisa Rodriguez",
    qualityScore: 89,
    issues: ["Temperature fluctuation detected"]
  },
  {
    id: 4,
    name: "Synthetic Quick Wash",
    batchNumber: "BW-2024-004",
    status: "scheduled",
    priority: "medium",
    startTime: "2024-02-09 08:00",
    estimatedEnd: "2024-02-09 14:00",
    actualEnd: null,
    progress: 0,
    quantity: 400,
    completed: 0,
    temperature: "30°C",
    humidity: "65%",
    chemicals: ["Synthetic Detergent", "Anti-static"],
    operator: "David Wilson",
    qualityScore: null,
    issues: []
  }
]

const mockWashMachines = [
  {
    id: 1,
    name: "Industrial Washer A",
    type: "Front Load",
    capacity: "500 kg",
    status: "active",
    efficiency: 95,
    temperature: "35°C",
    humidity: "75%",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-02-15",
    currentBatch: "BW-2024-001",
    operator: "Sarah Johnson"
  },
  {
    id: 2,
    name: "Industrial Washer B",
    type: "Top Load",
    capacity: "300 kg",
    status: "maintenance",
    efficiency: 88,
    temperature: "40°C",
    humidity: "70%",
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-03-01",
    currentBatch: null,
    operator: null
  },
  {
    id: 3,
    name: "Gentle Wash Machine",
    type: "Front Load",
    capacity: "200 kg",
    status: "active",
    efficiency: 92,
    temperature: "25°C",
    humidity: "60%",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-02-20",
    currentBatch: "BW-2024-003",
    operator: "Lisa Rodriguez"
  }
]

const mockChemicalInventory = [
  {
    id: 1,
    name: "Enzyme Detergent",
    type: "Detergent",
    quantity: 150,
    unit: "L",
    minLevel: 50,
    supplier: "ChemCorp Industries",
    lastOrder: "2024-01-25",
    nextOrder: "2024-02-25",
    status: "in-stock"
  },
  {
    id: 2,
    name: "Fabric Softener",
    type: "Softener",
    quantity: 75,
    unit: "L",
    minLevel: 30,
    supplier: "SoftCare Solutions",
    lastOrder: "2024-02-01",
    nextOrder: "2024-03-01",
    status: "low-stock"
  },
  {
    id: 3,
    name: "Bleach Solution",
    type: "Bleach",
    quantity: 200,
    unit: "L",
    minLevel: 100,
    supplier: "BrightChem Ltd",
    lastOrder: "2024-01-30",
    nextOrder: "2024-02-28",
    status: "in-stock"
  }
]

export default function WashManagementPage() {
  const [selectedView, setSelectedView] = useState<'processes' | 'machines' | 'chemicals' | 'analytics'>('processes')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-gray-100 text-gray-800'
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

  const getMachineStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChemicalStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800'
      case 'low-stock': return 'bg-yellow-100 text-yellow-800'
      case 'out-of-stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProcesses = mockWashProcesses.filter(process => {
    if (selectedStatus !== 'all' && process.status !== selectedStatus) return false
    if (searchQuery && !process.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wash Management</h1>
          <p className="text-gray-600">Specialized wash and finishing process tracking</p>
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
            New Wash Process
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'processes', label: 'Processes', icon: WashingMachine },
          { key: 'machines', label: 'Machines', icon: Activity },
          { key: 'chemicals', label: 'Chemicals', icon: Droplets },
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

      {/* Processes View */}
      {selectedView === 'processes' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wash processes..."
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
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Processes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProcesses.map((process) => (
              <Card key={process.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{process.name}</CardTitle>
                      <CardDescription>{process.batchNumber} • {process.operator}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(process.status)}>
                        {process.status}
                      </Badge>
                      <Badge className={getPriorityColor(process.priority)}>
                        {process.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{process.completed}/{process.quantity} units</span>
                    </div>
                    <Progress value={process.progress} />
                  </div>

                  {/* Environment Conditions */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Temperature</span>
                      <div className="font-medium">{process.temperature}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity</span>
                      <div className="font-medium">{process.humidity}</div>
                    </div>
                  </div>

                  {/* Chemicals */}
                  <div>
                    <span className="text-sm text-muted-foreground">Chemicals Used</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {process.chemicals.map((chemical, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {chemical}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Time</span>
                      <div className="font-medium">{process.startTime}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. End</span>
                      <div className="font-medium">{process.estimatedEnd}</div>
                    </div>
                  </div>

                  {/* Quality Score */}
                  {process.qualityScore && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Quality Score</span>
                      <div className="font-medium">{process.qualityScore}%</div>
                    </div>
                  )}

                  {/* Issues */}
                  {process.issues.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Issues</span>
                      </div>
                      <ul className="text-sm text-yellow-700">
                        {process.issues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Machines View */}
      {selectedView === 'machines' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Wash Machines</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Machine
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWashMachines.map((machine) => (
              <Card key={machine.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{machine.name}</CardTitle>
                      <CardDescription>{machine.type} • {machine.capacity}</CardDescription>
                    </div>
                    <Badge className={getMachineStatusColor(machine.status)}>
                      {machine.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Efficiency */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Efficiency</span>
                      <span>{machine.efficiency}%</span>
                    </div>
                    <Progress value={machine.efficiency} />
                  </div>

                  {/* Environment */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Temperature</span>
                      <div className="font-medium">{machine.temperature}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity</span>
                      <div className="font-medium">{machine.humidity}</div>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Batch</span>
                      <div className="font-medium">{machine.currentBatch || "None"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Operator</span>
                      <div className="font-medium">{machine.operator || "None"}</div>
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Next Maintenance</span>
                    <div className="font-medium">{machine.nextMaintenance}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Monitor
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Chemicals View */}
      {selectedView === 'chemicals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chemical Inventory</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Chemical
            </Button>
          </div>

          <div className="space-y-4">
            {mockChemicalInventory.map((chemical) => (
              <Card key={chemical.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Droplets className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{chemical.name}</h3>
                        <p className="text-sm text-gray-600">{chemical.type} • {chemical.supplier}</p>
                        <p className="text-sm text-gray-500">
                          {chemical.quantity} {chemical.unit} remaining
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Stock Level</div>
                        <div className="font-semibold">{chemical.quantity} {chemical.unit}</div>
                        <div className="text-xs text-gray-500">
                          Min: {chemical.minLevel} {chemical.unit}
                        </div>
                      </div>
                      <Badge className={getChemicalStatusColor(chemical.status)}>
                        {chemical.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Last Order</span>
                      <div className="font-medium">{chemical.lastOrder}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Order</span>
                      <div className="font-medium">{chemical.nextOrder}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-1" />
                      Order
                    </Button>
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
          <h2 className="text-xl font-semibold">Wash Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
                <WashingMachine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  1 completed today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">93%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Machine Efficiency</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  +1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chemical Usage</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">425L</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Process Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Completed', count: 45, color: 'bg-green-500' },
                    { status: 'In Progress', count: 3, color: 'bg-blue-500' },
                    { status: 'On Hold', count: 1, color: 'bg-yellow-500' },
                    { status: 'Scheduled', count: 8, color: 'bg-gray-500' }
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
                <CardTitle>Machine Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWashMachines.map((machine) => (
                    <div key={machine.id} className="flex items-center justify-between">
                      <span className="text-sm">{machine.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${machine.efficiency}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{machine.efficiency}%</span>
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
