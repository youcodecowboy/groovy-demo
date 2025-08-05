"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
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
import { BrandHeader } from "@/components/brand/brand-header"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function BrandPODetails() {
  const params = useParams()
  const router = useRouter()
  const poId = params.poId as string
  
  // Get the demo brand ID
  const brands = useQuery(api.brands.listBrands)
  const brandId = brands?.[0]?._id
  
  // Get purchase order details
  const purchaseOrder = useQuery(api.purchaseOrders.getPurchaseOrder, { poId: poId as any })
  
  // Get items for this PO
  const items = useQuery(api.items.listItemsByPO, { purchaseOrderId: poId as any })
  
  // Get factories for reference
  const factories = useQuery(api.factories.listFactories)
  
  // Get workflows for reference
  const workflows = useQuery(api.workflows.getActive)

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
    if (!items) return {}
    
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
        <BrandHeader />
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
      <BrandHeader />
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
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Production Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm text-gray-600">{breakdown.completed}/{breakdown.total} items</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{breakdown.active}</div>
                    <div className="text-gray-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{breakdown.paused}</div>
                    <div className="text-gray-600">Paused</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{breakdown.completed}</div>
                    <div className="text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{breakdown.error}</div>
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">PO Number</p>
                  <p className="font-semibold">{purchaseOrder.poNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(purchaseOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Factory</p>
                  <p className="font-semibold">{factoryName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="font-semibold">${purchaseOrder.totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Requested Delivery</p>
                  <p className="font-semibold">
                    {new Date(purchaseOrder.requestedDeliveryDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="font-semibold">
                    {new Date(purchaseOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {purchaseOrder.acceptedAt && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Accepted</p>
                      <p className="font-semibold">
                        {new Date(purchaseOrder.acceptedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Accepted By</p>
                      <p className="font-semibold">{purchaseOrder.acceptedBy || "Unknown"}</p>
                    </div>
                    {purchaseOrder.workflowId && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Workflow</p>
                        <p className="font-semibold">{workflowName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                 {purchaseOrder.items.map((item, index) => (
                   <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                     <div>
                       <p className="font-medium">{item.sku}</p>
                       <p className="text-sm text-gray-600">{item.description}</p>
                       <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-semibold">${(item.unitPrice || 0).toLocaleString()}</p>
                       <p className="text-sm text-gray-600">Total: ${((item.unitPrice || 0) * (item.quantity || 0)).toLocaleString()}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        {items && items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Production Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{item.itemId}</p>
                        <p className="text-sm text-gray-600">
                          SKU: {item.metadata?.sku || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Started: {new Date(item.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getItemStatusBadge(item.status)}
                      <Link href={`/floor/items/${item.itemId}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Factory
            </Button>
            <Button className="bg-black hover:bg-gray-800">
              <FileText className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 