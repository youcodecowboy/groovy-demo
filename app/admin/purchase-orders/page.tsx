"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Eye,
    Check,
    X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AcceptPOModal } from "@/components/admin/accept-po-modal"
import Link from "next/link"

export default function FactoryPurchaseOrders() {
  const { toast } = useToast()
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)
  
  // Get the first factory (demo setup)
  const factories = useQuery(api.factories.listFactories)
  const factoryId = factories?.[0]?._id
  
  const purchaseOrders = useQuery(
    api.purchaseOrders.listPurchaseOrdersByFactory, 
    factoryId ? { factoryId } : "skip"
  )
  const acceptPO = useMutation(api.purchaseOrders.acceptPurchaseOrder)
  const rejectPO = useMutation(api.purchaseOrders.rejectPurchaseOrder)

  const handleAcceptPO = async (poId: string, workflowId: string, startDate: number) => {
    try {
      await acceptPO({
        poId: poId as any,
        acceptedBy: "factory-admin",
        workflowId: workflowId as any,
        startDate,
        notes: "Accepted by factory admin",
      })
      toast({
        title: "Purchase Order Accepted",
        description: "Items have been created and scheduled for production",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept purchase order",
        variant: "destructive",
      })
    }
  }

  const openAcceptModal = (po: any) => {
    setSelectedPO(po)
    setIsAcceptModalOpen(true)
  }

  const handleRejectPO = async (poId: string) => {
    try {
      await rejectPO({
        poId: poId as any,
        rejectedBy: "factory-admin",
        notes: "Rejected by factory admin",
      })
      toast({
        title: "Purchase Order Rejected",
        description: "The purchase order has been rejected",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject purchase order",
        variant: "destructive",
      })
    }
  }

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
          Accepted
        </Badge>
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
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

  if (!purchaseOrders) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading purchase orders...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
          <p className="text-gray-600">Review and manage incoming purchase orders from brands</p>
        </div>

        <div className="space-y-4">
          {purchaseOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No Purchase Orders</p>
                  <p className="text-sm">No pending purchase orders from brands</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            purchaseOrders.map((po) => (
              <Card key={po._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{po.poNumber}</h3>
                          <p className="text-sm text-gray-600">Brand: Demo Brand</p>
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(po.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(po.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Value</p>
                          <p className="text-lg font-semibold">${po.totalValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Items</p>
                          <p className="text-lg font-semibold">
                            {po.items.reduce((total, item) => total + item.quantity, 0)} total
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Delivery Date</p>
                          <p className="text-lg font-semibold">
                            {new Date(po.requestedDeliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Order Items:</p>
                        {po.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 text-sm">
                            <span className="font-medium">{item.sku}</span>
                            <span className="text-gray-600">x{item.quantity}</span>
                            <span className="text-gray-600">{item.description}</span>
                          </div>
                        ))}
                      </div>

                      {po.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 mb-1">Notes:</p>
                          <p className="text-sm text-gray-700">{po.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                                             {po.status === "pending" && (
                         <>
                           <Button
                             size="sm"
                             onClick={() => openAcceptModal(po)}
                             className="bg-green-600 hover:bg-green-700"
                           >
                             <Check className="w-4 h-4 mr-1" />
                             Accept
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleRejectPO(po._id)}
                           >
                             <X className="w-4 h-4 mr-1" />
                             Reject
                           </Button>
                         </>
                       )}
                                             <Button size="sm" variant="outline" asChild>
                         <Link href={`/admin/purchase-orders/${po._id}`}>
                           <Eye className="w-4 h-4 mr-1" />
                           View Details
                         </Link>
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Accept PO Modal */}
      <AcceptPOModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        purchaseOrder={selectedPO}
        onAccept={handleAcceptPO}
      />
    </AdminSidebar>
  )
} 