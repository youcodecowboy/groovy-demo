"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    ArrowLeft,
    Package, DollarSign,
    Clock,
    CheckCircle,
    AlertCircle, TrendingUp, FileText,
    MessageSquare
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

// Mock data for purchase order details
const mockPurchaseOrder = {
  _id: "po-001",
  poNumber: "PO-2024-001",
  factoryId: "fact-001",
  workflowId: "wf-001",
  status: "accepted",
  totalValue: 45000,
  requestedDeliveryDate: "2024-02-15",
  createdAt: "2024-01-15",
  acceptedAt: "2024-01-16"
}

const mockItems = [
  {
    _id: "item-001",
    name: "Cotton T-Shirt",
    status: "active",
    quantity: 500,
    completed: 350,
    purchaseOrderId: "po-001"
  },
  {
    _id: "item-002", 
    name: "Denim Jeans",
    status: "completed",
    quantity: 300,
    completed: 300,
    purchaseOrderId: "po-001"
  },
  {
    _id: "item-003",
    name: "Hoodie",
    status: "active", 
    quantity: 200,
    completed: 120,
    purchaseOrderId: "po-001"
  }
]

const mockFactories = [
  { _id: "fact-001", name: "Apex Manufacturing" },
  { _id: "fact-002", name: "Global Textiles Co." },
  { _id: "fact-003", name: "Premium Garments Ltd." }
]

const mockWorkflows = [
  { _id: "wf-001", name: "Standard Production" },
  { _id: "wf-002", name: "Premium Quality" },
  { _id: "wf-003", name: "Express Production" }
]

export default function BrandPODetails() {
  const params = useParams()
  const router = useRouter()
  const poId = params.poId as string
  
  // Use mock data instead of Convex queries
  const purchaseOrder = mockPurchaseOrder
  const items = mockItems
  const factories = mockFactories
  const workflows = mockWorkflows

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      case "accepted":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          In Production
        </Badge>
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Active</Badge>
      case "paused":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      case "error":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFactoryName = (factoryId: string) => {
    const factory = factories?.find(f => f._id === factoryId)
    return factory?.name || "Unknown Factory"
  }

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows?.find(w => w._id === workflowId)
    return workflow?.name || "Unknown Workflow"
  }

  const getStatusBreakdown = () => {
    if (!items) return {
      active: 0,
      paused: 0,
      completed: 0,
      error: 0,
      total: 0
    }
    
    const breakdown = {
      active: 0,
      paused: 0,
      completed: 0,
      error: 0,
      total: items.length
    }
    
    items.forEach(item => {
      breakdown[item.status as keyof typeof breakdown]++
    })
    
    return breakdown
  }

  const getProductionProgress = () => {
    const breakdown = getStatusBreakdown()
    if (breakdown.total === 0) return 0
    return Math.round((breakdown.completed / breakdown.total) * 100)
  }

  if (!purchaseOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading purchase order...</div>
          </div>
        </div>
      </div>
    )
  }

  const breakdown = getStatusBreakdown()
  const progress = getProductionProgress()
  const factoryName = getFactoryName(purchaseOrder.factoryId)
  const workflowName = getWorkflowName(purchaseOrder.workflowId || "")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Order Details</h1>
              <p className="text-gray-600">PO {purchaseOrder.poNumber}</p>
            </div>
          </div>
          {getStatusBadge(purchaseOrder.status)}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{breakdown.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{breakdown.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold">{progress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">${purchaseOrder.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Progress */}
        {purchaseOrder.status === "accepted" && breakdown.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Production Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{breakdown.active}</div>
                    <div className="text-gray-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{breakdown.paused}</div>
                    <div className="text-gray-600">Paused</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{breakdown.completed}</div>
                    <div className="text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{breakdown.error}</div>
                    <div className="text-gray-600">Error</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Factory:</span>
                <span className="font-medium">{factoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Workflow:</span>
                <span className="font-medium">{workflowName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Requested Delivery:</span>
                <span className="font-medium">{new Date(purchaseOrder.requestedDeliveryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{new Date(purchaseOrder.createdAt).toLocaleDateString()}</span>
              </div>
              {purchaseOrder.acceptedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Accepted:</span>
                  <span className="font-medium">{new Date(purchaseOrder.acceptedAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Factory
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Download PO
              </Button>
              <Button className="w-full" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.completed}/{item.quantity} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getItemStatusBadge(item.status)}
                    <div className="text-right">
                      <div className="font-medium">{Math.round((item.completed / item.quantity) * 100)}%</div>
                      <div className="text-sm text-gray-600">Progress</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 