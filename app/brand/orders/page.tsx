"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle, Package,
    Factory,
    Calendar
} from "lucide-react"
import { BrandHeader } from "@/components/brand/brand-header"
import Link from "next/link"

export default function BrandOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Get the demo brand ID (we'll use the first brand for now)
  const brands = useQuery(api.brands.listBrands)
  const brandId = brands?.[0]?._id
  
  // Get purchase orders for this brand
  const purchaseOrders = useQuery(
    api.purchaseOrders.listPurchaseOrdersByBrand, 
    { brandId: brandId as any }
  )
  
  // Get factories for reference
  const factories = useQuery(api.factories.listFactories)
  
  // Get items for each PO to show production status
  const items = useQuery(api.items.listItemsByBrand, { brandId: brandId as any })

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

  const getFactoryName = (factoryId: string) => {
    const factory = factories?.find(f => f._id === factoryId)
    return factory?.name || "Unknown Factory"
  }

  const getItemsForPO = (poId: string) => {
    return items?.filter(item => item.purchaseOrderId === poId) || []
  }

  const getProductionProgress = (poId: string) => {
    const poItems = getItemsForPO(poId)
    if (poItems.length === 0) return { total: 0, completed: 0, active: 0 }
    
    const completed = poItems.filter(item => item.status === "completed").length
    const active = poItems.filter(item => item.status === "active").length
    return { total: poItems.length, completed, active }
  }

  const filteredOrders = purchaseOrders?.filter(po => 
    po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getFactoryName(po.factoryId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (!brandId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BrandHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading brand data...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
            <p className="text-gray-600">Manage your production orders and track their status</p>
          </div>
          <Button asChild className="bg-black hover:bg-gray-800">
            <Link href="/brand/orders/new">
              <Plus className="w-4 h-4 mr-2" />
              Create New Order
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Search orders by PO number, factory, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders</h3>
                <p className="text-gray-600 mb-4">Create your first purchase order to get started</p>
                <Button asChild className="bg-black hover:bg-gray-800">
                  <Link href="/brand/orders/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Order
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((po) => {
              const progress = getProductionProgress(po._id)
              const factoryName = getFactoryName(po.factoryId)
              
              return (
                <Card key={po._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{po.poNumber}</h3>
                            {getStatusBadge(po.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Factory className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{factoryName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {progress.total} items • ${po.totalValue.toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Due: {new Date(po.requestedDeliveryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Production Progress for Accepted POs */}
                          {po.status === "accepted" && progress.total > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Production Progress</span>
                                <span className="font-medium">
                                  {progress.completed}/{progress.total} completed
                                </span>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2">
                            Submitted: {new Date(po.createdAt).toLocaleDateString()}
                            {po.acceptedAt && ` • Accepted: ${new Date(po.acceptedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/brand/orders/${po._id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Message Factory
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
} 