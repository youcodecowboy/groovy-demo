"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Building2,
    Package,
    MessageSquare,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    Factory,
    MapPin,
    Calendar,
    DollarSign,
    Users,
    Activity,
    Globe,
    Truck,
    AlertCircle,
    TrendingDown,
    Eye,
    FileText,
    CreditCard,
    Target,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from "lucide-react"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { BrandWelcomeBanner } from "@/components/brand/brand-welcome-banner"

// Enhanced mock data for the new dashboard
const mockProductionOverview = {
  pendingSamples: 8,
  pendingPOs: 3,
  acceptedPOs: 12,
  totalOpenValue: 285000,
  nextDelivery: "2024-12-15",
  onTimePercentage: 87,
  aheadOfSchedule: 4,
  onTrack: 8,
  behindSchedule: 2
}

const mockActiveOrders = [
  {
    id: "PO-2024-001",
    factory: "Factory A - Textile Production",
    factoryId: "factory-a",
    location: "Bangladesh",
    status: "in_production",
    items: 50,
    value: 12500,
    dueDate: "2024-12-15",
    progress: 65,
    stage: "Cutting & Sewing",
    priority: "high",
    scheduleStatus: "on_track", // ahead, on_track, behind
    nextMilestone: "Quality Check",
    nextMilestoneDate: "2024-12-12",
    itemsCompleted: 32,
    itemsInStage: 18,
    timeInStage: "3 days",
    defects: 2,
    reworks: 1
  },
  {
    id: "PO-2024-002", 
    factory: "Factory B - Garment Assembly",
    factoryId: "factory-b",
    location: "Vietnam",
    status: "in_production",
    items: 25,
    value: 8200,
    dueDate: "2024-12-10",
    progress: 85,
    stage: "Final Assembly",
    priority: "medium",
    scheduleStatus: "ahead",
    nextMilestone: "Packaging",
    nextMilestoneDate: "2024-12-08",
    itemsCompleted: 21,
    itemsInStage: 4,
    timeInStage: "1 day",
    defects: 0,
    reworks: 0
  },
  {
    id: "PO-2024-003",
    factory: "Factory C - Quality Control", 
    factoryId: "factory-c",
    location: "India",
    status: "pending_review",
    items: 100,
    value: 25000,
    dueDate: "2024-12-20",
    progress: 0,
    stage: "Pending Review",
    priority: "high",
    scheduleStatus: "behind",
    nextMilestone: "Production Start",
    nextMilestoneDate: "2024-12-05",
    itemsCompleted: 0,
    itemsInStage: 0,
    timeInStage: "5 days",
    defects: 0,
    reworks: 0
  },
  {
    id: "PO-2024-004",
    factory: "Factory A - Textile Production",
    factoryId: "factory-a", 
    location: "Bangladesh",
    status: "in_production",
    items: 30,
    value: 7500,
    dueDate: "2024-12-18",
    progress: 45,
    stage: "Fabric Preparation",
    priority: "medium",
    scheduleStatus: "on_track",
    nextMilestone: "Cutting",
    nextMilestoneDate: "2024-12-10",
    itemsCompleted: 13,
    itemsInStage: 17,
    timeInStage: "2 days",
    defects: 1,
    reworks: 0
  },
  {
    id: "PO-2024-005",
    factory: "Factory B - Garment Assembly",
    factoryId: "factory-b",
    location: "Vietnam",
    status: "in_production", 
    items: 40,
    value: 12000,
    dueDate: "2024-12-22",
    progress: 20,
    stage: "Pattern Making",
    priority: "low",
    scheduleStatus: "ahead",
    nextMilestone: "Cutting",
    nextMilestoneDate: "2024-12-09",
    itemsCompleted: 8,
    itemsInStage: 32,
    timeInStage: "1 day",
    defects: 0,
    reworks: 0
  }
]

const mockFactoryLocations = [
  { id: "factory-a", name: "Factory A", location: "Dhaka, Bangladesh", lat: 23.8103, lng: 90.4125, activeOrders: 2, status: "active" },
  { id: "factory-b", name: "Factory B", location: "Ho Chi Minh City, Vietnam", lat: 10.8231, lng: 106.6297, activeOrders: 2, status: "active" },
  { id: "factory-c", name: "Factory C", location: "Mumbai, India", lat: 19.0760, lng: 72.8777, activeOrders: 1, status: "active" }
]

const mockRecentActivity = [
  {
    id: 1,
    type: "order_completed",
    message: "Order #PO-2024-002 completed at Factory B",
    timestamp: "2 hours ago",
    factory: "Factory B",
    color: "green",
    impact: "positive"
  },
  {
    id: 2,
    type: "message_received", 
    message: "New message from Factory A regarding PO-2024-001",
    timestamp: "4 hours ago",
    factory: "Factory A",
    color: "blue",
    impact: "neutral"
  },
  {
    id: 3,
    type: "stage_progress",
    message: "Item SKU-123 moved to Stage 3 at Factory C",
    timestamp: "6 hours ago", 
    factory: "Factory C",
    color: "purple",
    impact: "positive"
  },
  {
    id: 4,
    type: "quality_alert",
    message: "Quality alert: 3 defects detected in PO-2024-004",
    timestamp: "8 hours ago",
    factory: "Factory A", 
    color: "red",
    impact: "negative"
  },
  {
    id: 5,
    type: "delivery_update",
    message: "Shipment ETA updated for PO-2024-003",
    timestamp: "10 hours ago",
    factory: "Factory C",
    color: "orange",
    impact: "neutral"
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

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600 bg-green-50'
      case 'on_track': return 'text-blue-600 bg-blue-50'
      case 'behind': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getScheduleStatusIcon = (status: string) => {
    switch (status) {
      case 'ahead': return <ArrowUpRight className="w-4 h-4" />
      case 'on_track': return <Minus className="w-4 h-4" />
      case 'behind': return <ArrowDownRight className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_completed': return <CheckCircle className="w-4 h-4" />
      case 'message_received': return <MessageSquare className="w-4 h-4" />
      case 'stage_progress': return <TrendingUp className="w-4 h-4" />
      case 'quality_alert': return <AlertCircle className="w-4 h-4" />
      case 'delivery_update': return <Truck className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Banner */}
        <BrandWelcomeBanner />
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Overview</h1>
            <p className="text-gray-600">Real-time visibility into your global manufacturing network</p>
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

        {/* Primary Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Samples</p>
                  <p className="text-3xl font-bold text-gray-900">{mockProductionOverview.pendingSamples}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending POs</p>
                  <p className="text-3xl font-bold text-gray-900">{mockProductionOverview.pendingPOs}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting acceptance</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{mockProductionOverview.acceptedPOs}</p>
                  <p className="text-xs text-gray-500 mt-1">In production</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Value</p>
                  <p className="text-3xl font-bold text-gray-900">${(mockProductionOverview.totalOpenValue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500 mt-1">At risk</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Adherence Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Schedule Adherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{mockProductionOverview.aheadOfSchedule}</div>
                <div className="text-sm text-gray-600">Ahead of Schedule</div>
                <div className="text-xs text-green-500 mt-1">+{mockProductionOverview.aheadOfSchedule} orders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{mockProductionOverview.onTrack}</div>
                <div className="text-sm text-gray-600">On Track</div>
                <div className="text-xs text-blue-500 mt-1">On schedule</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{mockProductionOverview.behindSchedule}</div>
                <div className="text-sm text-gray-600">Behind Schedule</div>
                <div className="text-xs text-red-500 mt-1">Requires attention</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{mockProductionOverview.onTimePercentage}%</div>
                <div className="text-sm text-gray-600">On-Time Rate</div>
                <div className="text-xs text-purple-500 mt-1">Overall performance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Production Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Global Production Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Visualization */}
              <div className="lg:col-span-2">
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Interactive Production Map</p>
                    <p className="text-sm text-gray-500">Showing {mockFactoryLocations.length} active factories</p>
                  </div>
                </div>
              </div>
              
              {/* Factory List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Active Factories</h3>
                {mockFactoryLocations.map((factory) => (
                  <div key={factory.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">{factory.name}</p>
                        <p className="text-xs text-gray-600">{factory.location}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {factory.activeOrders} orders
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders Progress Cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Active Orders Progress
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
            <div className="space-y-6">
              {mockActiveOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{order.id}</h3>
                        <Badge className={getScheduleStatusColor(order.scheduleStatus)}>
                          {getScheduleStatusIcon(order.scheduleStatus)}
                          {order.scheduleStatus.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={
                          order.priority === 'high' ? 'border-red-200 text-red-600' :
                          order.priority === 'medium' ? 'border-orange-200 text-orange-600' :
                          'border-gray-200 text-gray-600'
                        }>
                          {order.priority} priority
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Factory className="h-4 w-4" />
                          <span>{order.factory}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{order.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${order.value.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{order.items} items</div>
                    </div>
                  </div>

                  {/* Progress and Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Production Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Production Progress</span>
                        <span className="text-sm text-gray-600">{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {order.itemsCompleted}/{order.items} items completed
                      </div>
                    </div>

                    {/* Current Stage */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Current Stage</span>
                      <div className="text-lg font-semibold text-gray-900">{order.stage}</div>
                      <div className="text-xs text-gray-500">
                        {order.itemsInStage} items in stage • {order.timeInStage}
                      </div>
                    </div>

                    {/* Next Milestone */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Next Milestone</span>
                      <div className="text-lg font-semibold text-gray-900">{order.nextMilestone}</div>
                      <div className="text-xs text-gray-500">
                        Due {new Date(order.nextMilestoneDate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Quality</span>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Defects</span>
                          <span className={`text-sm font-medium ${order.defects > 2 ? 'text-red-600' : 'text-green-600'}`}>
                            {order.defects}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Reworks</span>
                          <span className={`text-sm font-medium ${order.reworks > 1 ? 'text-orange-600' : 'text-green-600'}`}>
                            {order.reworks}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Factory
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                      </Button>
                      <Button variant="outline" size="sm">
                        <Truck className="h-4 w-4 mr-2" />
                        Track Shipment
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity and Quick Actions */}
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
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getActivityIcon(activity.type)}
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <span className={`text-xs ${getImpactColor(activity.impact)}`}>
                          {activity.impact}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
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
                <Zap className="w-5 h-5" />
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
                  <Package className="w-4 h-4 mr-2" />
                  Request Sample
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message to Factory
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
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