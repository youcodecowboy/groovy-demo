"use client"

import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  FileText, 
  Edit3, 
  Eye, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Calendar,
  DollarSign,
  Package,
  Building2,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  
  const purchaseOrders = useQuery(api.purchaseOrders.getAll) || []
  const brands = useQuery(api.brands.getAll) || []
  const factories = useQuery(api.factories.getAll) || []
  const router = useRouter()

  // Filter orders based on search and filters
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesBrand = brandFilter === "all" || order.brandId === brandFilter
    
    return matchesSearch && matchesStatus && matchesBrand
  })

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b._id === brandId)
    return brand?.name || "Unknown Brand"
  }

  const getFactoryName = (factoryId: string) => {
    const factory = factories.find(f => f._id === factoryId)
    return factory?.name || "Unknown Factory"
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { 
          label: "Pending", 
          color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
          icon: Clock
        }
      case "accepted":
        return { 
          label: "Accepted", 
          color: "bg-green-100 text-green-800 border-green-200", 
          icon: CheckCircle
        }
      case "rejected":
        return { 
          label: "Rejected", 
          color: "bg-red-100 text-red-800 border-red-200", 
          icon: XCircle
        }
      case "completed":
        return { 
          label: "Completed", 
          color: "bg-blue-100 text-blue-800 border-blue-200", 
          icon: CheckCircle
        }
      default:
        return { 
          label: "Unknown", 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          icon: AlertCircle
        }
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getUniqueBrands = () => {
    return brands.map(brand => ({ id: brand._id, name: brand.name }))
  }

  const getTotalItems = (order: any) => {
    return order.items.reduce((total: number, item: any) => total + item.quantity, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-gray-600 italic">Manage production orders and track deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push("/app/orders/new")}
            className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
              >
                <option value="all">All Brands</option>
                {getUniqueBrands().map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 text-center mb-6">
              {searchQuery || statusFilter !== "all" || brandFilter !== "all"
                ? "Try adjusting your filters to see more orders."
                : "Get started by creating your first purchase order."}
            </p>
            <Button 
              onClick={() => router.push("/app/orders/new")}
              className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create First Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
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
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={statusConfig.color}>
                          <statusConfig.icon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/app/orders/${order._id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
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

                  {/* Timestamps */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Submitted {formatDate(order.submittedAt)}</span>
                    </div>
                    {order.acceptedAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Accepted {formatDate(order.acceptedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/app/orders/${order._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/app/orders/${order._id}/edit`)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
