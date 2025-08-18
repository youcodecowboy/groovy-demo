"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Building2, 
  Package,
  Calendar,
  DollarSign,
  Paperclip,
  MessageSquare
} from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"

interface Order {
  _id: string
  poNumber: string
  brandId: string
  factoryId: string
  items: Array<{
    sku: string
    quantity: number
    description: string
    unitPrice?: number
  }>
  totalValue: number
  requestedDeliveryDate: number
  submittedAt: number
  notes?: string
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

interface OrdersInboxProps {
  orders: Order[]
  brands: Array<{ _id: string; name: string }>
  factories: Array<{ _id: string; name: string }>
  workflows: Array<{ _id: string; name: string; isActive: boolean }>
}

export default function OrdersInbox({ orders, brands, factories, workflows }: OrdersInboxProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState("")
  const [startDate, setStartDate] = useState("")
  const [acceptNotes, setAcceptNotes] = useState("")
  const [declineReason, setDeclineReason] = useState("")
  const [declineNotes, setDeclineNotes] = useState("")

  const acceptOrder = useMutation(api.purchaseOrders.acceptPurchaseOrder)
  const rejectOrder = useMutation(api.purchaseOrders.rejectPurchaseOrder)
  const router = useRouter()

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b._id === brandId)
    return brand?.name || "Unknown Brand"
  }

  const getFactoryName = (factoryId: string) => {
    const factory = factories.find(f => f._id === factoryId)
    return factory?.name || "Unknown Factory"
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getTotalItems = (order: Order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0)
  }

  const handleAccept = async () => {
    if (!selectedOrder || !selectedWorkflow || !startDate) return

    try {
      await acceptOrder({
        poId: selectedOrder._id,
        acceptedBy: "current-user", // TODO: Get from auth
        workflowId: selectedWorkflow,
        startDate: new Date(startDate).getTime(),
        notes: acceptNotes,
      })
      
      setAcceptDialogOpen(false)
      setSelectedOrder(null)
      setSelectedWorkflow("")
      setStartDate("")
      setAcceptNotes("")
      
      // Refresh the page or update the list
      window.location.reload()
    } catch (error) {
      console.error("Error accepting order:", error)
    }
  }

  const handleDecline = async () => {
    if (!selectedOrder || !declineReason) return

    try {
      await rejectOrder({
        poId: selectedOrder._id,
        rejectedBy: "current-user", // TODO: Get from auth
        reason: declineReason,
        notes: declineNotes,
      })
      
      setDeclineDialogOpen(false)
      setSelectedOrder(null)
      setDeclineReason("")
      setDeclineNotes("")
      
      // Refresh the page or update the list
      window.location.reload()
    } catch (error) {
      console.error("Error declining order:", error)
    }
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/app/orders/${orderId}`)
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending orders</h3>
          <p className="text-gray-600 text-center">
            All purchase orders have been processed.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const brandName = getBrandName(order.brandId)
          const factoryName = getFactoryName(order.factoryId)
          const totalItems = getTotalItems(order)
          
          return (
            <Card key={order._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {order.poNumber}
                    </CardTitle>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Pending Review
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewOrder(order._id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Brand & Factory */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{brandName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{factoryName}</span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{totalItems} items</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{formatCurrency(order.totalValue)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Due {formatDate(order.requestedDeliveryDate)}</span>
                  </div>
                </div>

                {/* Attachments */}
                {order.attachments && order.attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{order.attachments.length} attachment(s)</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Has notes</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedOrder(order)
                      setAcceptDialogOpen(true)
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedOrder(order)
                      setDeclineDialogOpen(true)
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Accept Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Select Workflow</label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a workflow" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.filter(w => w.isActive).map(workflow => (
                    <SelectItem key={workflow._id} value={workflow._id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Production Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <Textarea
                value={acceptNotes}
                onChange={(e) => setAcceptNotes(e.target.value)}
                placeholder="Add any notes about accepting this order..."
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAccept}
                disabled={!selectedWorkflow || !startDate}
                className="flex-1"
              >
                Accept Order
              </Button>
              <Button
                variant="outline"
                onClick={() => setAcceptDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Reason for Decline *</label>
              <Select value={declineReason} onValueChange={setDeclineReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="capacity">Insufficient Capacity</SelectItem>
                  <SelectItem value="timeline">Timeline Too Aggressive</SelectItem>
                  <SelectItem value="specifications">Specifications Unclear</SelectItem>
                  <SelectItem value="pricing">Pricing Issues</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Notes</label>
              <Textarea
                value={declineNotes}
                onChange={(e) => setDeclineNotes(e.target.value)}
                placeholder="Provide additional details..."
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleDecline}
                disabled={!declineReason}
                variant="destructive"
                className="flex-1"
              >
                Decline Order
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeclineDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
