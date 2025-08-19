"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    Package,
    MessageSquare,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Search,
    Filter,
    Factory,
    MapPin,
    Calendar,
    DollarSign,
    Users,
    Activity
} from "lucide-react"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { BrandWelcomeBanner } from "@/components/brand/brand-welcome-banner"

// Mock data for enhanced dashboard
const mockFactories = [
  {
    id: "factory-a",
    name: "Factory A - Textile Production",
    location: "Bangladesh",
    status: "active",
    capacity: 85,
    activeOrders: 3,
    totalItems: 150,
    lastActivity: "2 hours ago"
  },
  {
    id: "factory-b", 
    name: "Factory B - Garment Assembly",
    location: "Vietnam",
    status: "active",
    capacity: 92,
    activeOrders: 2,
    totalItems: 75,
    lastActivity: "4 hours ago"
  },
  {
    id: "factory-c",
    name: "Factory C - Quality Control",
    location: "India",
    status: "active", 
    capacity: 78,
    activeOrders: 1,
    totalItems: 200,
    lastActivity: "1 hour ago"
  }
]

const mockActiveOrders = [
  {
    id: "PO-2024-001",
    factory: "Factory A - Textile Production",
    factoryId: "factory-a",
    status: "in_production",
    items: 50,
    value: 12500,
    dueDate: "2024-12-15",
    progress: 65,
    stage: "Cutting & Sewing",
    priority: "high"
  },
  {
    id: "PO-2024-002", 
    factory: "Factory B - Garment Assembly",
    factoryId: "factory-b",
    status: "completed",
    items: 25,
    value: 8200,
    dueDate: "2024-12-10",
    progress: 100,
    stage: "Completed",
    priority: "medium"
  },
  {
    id: "PO-2024-003",
    factory: "Factory C - Quality Control", 
    factoryId: "factory-c",
    status: "pending_review",
    items: 100,
    value: 25000,
    dueDate: "2024-12-20",
    progress: 0,
    stage: "Pending Review",
    priority: "high"
  },
  {
    id: "PO-2024-004",
    factory: "Factory A - Textile Production",
    factoryId: "factory-a", 
    status: "in_production",
    items: 30,
    value: 7500,
    dueDate: "2024-12-18",
    progress: 45,
    stage: "Fabric Preparation",
    priority: "medium"
  },
  {
    id: "PO-2024-005",
    factory: "Factory B - Garment Assembly",
    factoryId: "factory-b",
    status: "in_production", 
    items: 40,
    value: 12000,
    dueDate: "2024-12-22",
    progress: 20,
    stage: "Pattern Making",
    priority: "low"
  }
]

const mockRecentActivity = [
  {
    id: 1,
    type: "order_completed",
    message: "Order #PO-2024-002 completed at Factory B",
    timestamp: "2 hours ago",
    factory: "Factory B",
    color: "green"
  },
  {
    id: 2,
    type: "message_received", 
    message: "New message from Factory A regarding PO-2024-001",
    timestamp: "4 hours ago",
    factory: "Factory A",
    color: "blue"
  },
  {
    id: 3,
    type: "stage_progress",
    message: "Item SKU-123 moved to Stage 3 at Factory C",
    timestamp: "6 hours ago", 
    factory: "Factory C",
    color: "purple"
  },
  {
    id: 4,
    type: "order_created",
    message: "New order PO-2024-005 created for Factory B",
    timestamp: "8 hours ago",
    factory: "Factory B", 
    color: "orange"
  },
  {
    id: 5,
    type: "quality_check",
    message: "Quality inspection completed for PO-2024-004",
    timestamp: "10 hours ago",
    factory: "Factory A",
    color: "cyan"
  }
]

export default function BrandDashboard() {
  const { toast } = useToast()
  const seedDemoData = useMutation(api.seed.seedDemoData)

  const handleSeedData = async () => {
    try {
      await seedDemoData()
      toast({
        title: "Success",
        description: "Demo data created successfully with brands and factories",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create demo data",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_production': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending_review': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_production': return <Clock className="w-3 h-3 mr-1" />
      case 'completed': return <CheckCircle className="w-3 h-3 mr-1" />
      case 'pending_review': return <AlertCircle className="w-3 h-3 mr-1" />
      default: return <Clock className="w-3 h-3 mr-1" />
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_completed': return <CheckCircle className="w-4 h-4" />
      case 'message_received': return <MessageSquare className="w-4 h-4" />
      case 'stage_progress': return <TrendingUp className="w-4 h-4" />
      case 'order_created': return <Plus className="w-4 h-4" />
      case 'quality_check': return <AlertCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const totalOrders = mockActiveOrders.length
  const totalItems = mockActiveOrders.reduce((sum, order) => sum + order.items, 0)
  const totalValue = mockActiveOrders.reduce((sum, order) => sum + order.value, 0)
  const activeFactories = mockFactories.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Banner */}
        <BrandWelcomeBanner />
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Dashboard</h1>
            <p className="text-gray-600">Monitor your production network across {activeFactories} active factories</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSeedData} variant="outline" size="sm">
              Seed Demo Data
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">Across all factories</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Items in Production</p>
                  <p className="text-3xl font-bold text-gray-900">{totalItems.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Total units</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connected Factories</p>
                  <p className="text-3xl font-bold text-gray-900">{activeFactories}</p>
                  <p className="text-xs text-gray-500 mt-1">Active production</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">In production</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Factory Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5" />
              Factory Network Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockFactories.map((factory) => (
                <div key={factory.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{factory.name}</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {factory.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{factory.capacity}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Orders:</span>
                      <span className="font-medium">{factory.activeOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">{factory.totalItems}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Last activity: {factory.lastActivity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Active Purchase Orders
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    placeholder="Search orders..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActiveOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{order.id}</p>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{order.factory}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {order.items} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(order.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.value.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${order.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{order.progress}%</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        {order.stage}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.factory}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Purchase Order
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message to Factory
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  View Production Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Factory Network
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 