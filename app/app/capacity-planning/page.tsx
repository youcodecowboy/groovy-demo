"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"

// Mock data for capacity planning
const mockResources = [
  {
    id: 1,
    name: "Cutting Station 1",
    type: "Machine",
    capacity: 100,
    utilized: 85,
    status: "active",
    efficiency: 92,
    nextMaintenance: "2024-02-15"
  },
  {
    id: 2,
    name: "Sewing Line A",
    type: "Production Line",
    capacity: 200,
    utilized: 180,
    status: "active",
    efficiency: 88,
    nextMaintenance: "2024-02-20"
  },
  {
    id: 3,
    name: "Finishing Station",
    type: "Machine",
    capacity: 150,
    utilized: 120,
    status: "active",
    efficiency: 95,
    nextMaintenance: "2024-02-10"
  },
  {
    id: 4,
    name: "Quality Control",
    type: "Station",
    capacity: 80,
    utilized: 75,
    status: "active",
    efficiency: 89,
    nextMaintenance: "2024-02-25"
  }
]

const mockWorkers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Machine Operator",
    department: "Production",
    availability: 95,
    currentTask: "Cutting Station 1",
    efficiency: 94,
    hoursWorked: 38
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Line Supervisor",
    department: "Production",
    availability: 100,
    currentTask: "Sewing Line A",
    efficiency: 96,
    hoursWorked: 40
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    role: "Quality Inspector",
    department: "Quality Control",
    availability: 90,
    currentTask: "QC Station",
    efficiency: 98,
    hoursWorked: 36
  }
]

const mockProductionSchedule = [
  {
    id: 1,
    orderId: "ORD-001",
    product: "Denim Jacket",
    quantity: 500,
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    status: "in-progress",
    priority: "high",
    assignedResources: ["Cutting Station 1", "Sewing Line A"],
    progress: 65
  },
  {
    id: 2,
    orderId: "ORD-002",
    product: "Cotton T-Shirt",
    quantity: 1000,
    startDate: "2024-02-03",
    endDate: "2024-02-08",
    status: "scheduled",
    priority: "medium",
    assignedResources: ["Sewing Line A", "Finishing Station"],
    progress: 0
  },
  {
    id: 3,
    orderId: "ORD-003",
    product: "Wool Sweater",
    quantity: 300,
    startDate: "2024-02-06",
    endDate: "2024-02-10",
    status: "pending",
    priority: "low",
    assignedResources: ["Cutting Station 1", "Finishing Station"],
    progress: 0
  }
]

export default function CapacityPlanningPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'resources' | 'schedule' | 'workers'>('overview')
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Capacity Planning</h1>
          <p className="text-gray-600">Optimize resource scheduling and production capacity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: TrendingUp },
          { key: 'resources', label: 'Resources', icon: Settings },
          { key: 'schedule', label: 'Schedule', icon: Calendar },
          { key: 'workers', label: 'Workers', icon: Users }
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

      {/* Overview Dashboard */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">530 units/day</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
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
              <Progress value={87} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                +5% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24/30</div>
              <p className="text-xs text-muted-foreground">
                80% availability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91%</div>
              <p className="text-xs text-muted-foreground">
                +3% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resources View */}
      {selectedView === 'resources' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Production Resources</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockResources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    <Badge className={getStatusColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </div>
                  <CardDescription>{resource.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilization</span>
                      <span>{resource.utilized}/{resource.capacity} units</span>
                    </div>
                    <Progress value={(resource.utilized / resource.capacity) * 100} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Efficiency</span>
                      <div className="font-medium">{resource.efficiency}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Maintenance</span>
                      <div className="font-medium">{resource.nextMaintenance}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Schedule View */}
      {selectedView === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Production Schedule</h2>
            <div className="flex items-center gap-2">
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {mockProductionSchedule.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.orderId}</CardTitle>
                      <CardDescription>{order.product} - {order.quantity} units</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      <Badge variant={order.status === 'in-progress' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className={getProgressColor(order.progress)} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start Date</span>
                        <div className="font-medium">{order.startDate}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date</span>
                        <div className="font-medium">{order.endDate}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">Assigned Resources</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {order.assignedResources.map((resource, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit Schedule
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Workers View */}
      {selectedView === 'workers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workforce Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWorkers.map((worker) => (
              <Card key={worker.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{worker.name}</CardTitle>
                    <Badge variant="outline">{worker.role}</Badge>
                  </div>
                  <CardDescription>{worker.department}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Availability</span>
                      <span>{worker.availability}%</span>
                    </div>
                    <Progress value={worker.availability} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Efficiency</span>
                      <div className="font-medium">{worker.efficiency}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hours Worked</span>
                      <div className="font-medium">{worker.hoursWorked}h</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Current Task</span>
                    <div className="font-medium text-sm mt-1">{worker.currentTask}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Schedule
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Performance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
