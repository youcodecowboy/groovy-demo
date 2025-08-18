"use client"

import React, { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import OrdersHeader from "@/components/orders/OrdersHeader"
import OrdersTable from "@/components/orders/OrdersTable"
import OrdersInbox from "@/components/orders/OrdersInbox"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  // State for filters and view
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [factoryFilter, setFactoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [viewMode, setViewMode] = useState<"table" | "cards" | "kanban">("table")

  // Data queries - temporarily using getAll until new functions are deployed
  const allOrders = useQuery(api.purchaseOrders.getAll) || []

  // Temporarily using getAll and filtering client-side until new functions are deployed
  const allOrdersData = useQuery(api.purchaseOrders.getAll) || []
  const pendingOrders = allOrdersData.filter(order => order.status === "pending")
  const activeOrders = allOrdersData.filter(order => order.status === "in_production")
  const acceptedOrders = allOrdersData.filter(order => order.status === "accepted")
  
  const brands = useQuery(api.brands.getAll) || []
  const factories = useQuery(api.factories.getAll) || []
  const workflows = useQuery(api.workflows.getAll) || []

  // Combine active orders (in_production + accepted)
  const combinedActiveOrders = [...activeOrders, ...acceptedOrders]

  // Get orders based on active tab
  const getOrdersForTab = () => {
    switch (activeTab) {
      case "inbox":
        return pendingOrders
      case "active":
        return combinedActiveOrders
      case "all":
        return allOrders
      default:
        return allOrders
    }
  }

  const currentOrders = getOrdersForTab()

  // Apply additional client-side filtering for date range
  const filteredOrders = currentOrders.filter(order => {
    if (dateRange.from && dateRange.to) {
      const orderDate = new Date(order.submittedAt)
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      return orderDate >= fromDate && orderDate <= toDate
    }
    return true
  })

  return (
    <div className="space-y-6">
      <OrdersHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        brandFilter={brandFilter}
        onBrandFilterChange={setBrandFilter}
        factoryFilter={factoryFilter}
        onFactoryFilterChange={setFactoryFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        brands={brands}
        factories={factories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content based on active tab */}
      {activeTab === "inbox" && (
        <OrdersInbox
          orders={pendingOrders}
          brands={brands}
          factories={factories}
          workflows={workflows}
        />
      )}

      {activeTab === "active" && (
        <div>
          {viewMode === "table" ? (
            <OrdersTable
              orders={combinedActiveOrders}
              brands={brands}
              factories={factories}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combinedActiveOrders.map((order) => (
                <OrderCard key={order._id} order={order} brands={brands} factories={factories} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "all" && (
        <div>
          {viewMode === "table" ? (
            <OrdersTable
              orders={filteredOrders}
              brands={brands}
              factories={factories}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} brands={brands} factories={factories} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "import" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Orders</h3>
            <p className="text-gray-600 text-center mb-6">
              Import purchase orders from CSV or Excel files.
            </p>
            <p className="text-gray-500 text-sm text-center">
              This feature is coming soon. For now, create orders manually or use the API.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {filteredOrders.length === 0 && activeTab !== "import" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 text-center">
              {searchQuery || statusFilter !== "all" || brandFilter !== "all" || factoryFilter !== "all"
                ? "Try adjusting your filters to see more orders."
                : "Get started by creating your first purchase order."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// OrderCard component for card view
function OrderCard({ order, brands, factories }: any) {
  const getBrandName = (brandId: string) => {
    const brand = brands.find((b: any) => b._id === brandId)
    return brand?.name || "Unknown Brand"
  }

  const getFactoryName = (factoryId: string) => {
    const factory = factories.find((f: any) => f._id === factoryId)
    return factory?.name || "Unknown Factory"
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { 
          label: "Pending", 
          color: "bg-yellow-100 text-yellow-800 border-yellow-200"
        }
      case "accepted":
        return { 
          label: "Accepted", 
          color: "bg-blue-100 text-blue-800 border-blue-200"
        }
      case "in_production":
        return { 
          label: "In Production", 
          color: "bg-green-100 text-green-800 border-green-200"
        }
      case "paused":
        return { 
          label: "Paused", 
          color: "bg-orange-100 text-orange-800 border-orange-200"
        }
      case "completed":
        return { 
          label: "Completed", 
          color: "bg-green-100 text-green-800 border-green-200"
        }
      case "cancelled":
        return { 
          label: "Cancelled", 
          color: "bg-red-100 text-red-800 border-red-200"
        }
      default:
        return { 
          label: "Unknown", 
          color: "bg-gray-100 text-gray-800 border-gray-200"
        }
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getTotalItems = (order: any) => {
    return order.items.reduce((total: number, item: any) => total + item.quantity, 0)
  }

  const statusConfig = getStatusConfig(order.status)
  const brandName = getBrandName(order.brandId)
  const factoryName = getFactoryName(order.factoryId)
  const totalItems = getTotalItems(order)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {order.poNumber}
              </h3>
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{brandName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {factoryName}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{totalItems} items</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{formatCurrency(order.totalValue)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Due {formatDate(order.requestedDeliveryDate)}</span>
            </div>
          </div>

          {order.progress && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Progress: {order.progress.completedItems} of {order.progress.totalItems} items
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(order.progress.completedItems / order.progress.totalItems) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
