"use client"

import React, { useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import OrderDetailsHeader from "@/components/orders/OrderDetailsHeader"
import OrderOverview from "@/components/orders/OrderOverview"
import OrderVariantsTable from "@/components/orders/OrderVariantsTable"
import OrderMaterials from "@/components/orders/OrderMaterials"
import OrderFinancials from "@/components/orders/OrderFinancials"
import OrderQA from "@/components/orders/OrderQA"
import OrderMessaging from "@/components/orders/OrderMessaging"
import OrderTimelineAudit from "@/components/orders/OrderTimelineAudit"

export default function OrderDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.orderId as string
  const defaultTab = searchParams.get("tab") || "overview"
  
  const [activeTab, setActiveTab] = useState(defaultTab)

  const order = useQuery(api.purchaseOrders.getPurchaseOrder, { poId: orderId })
  const brands = useQuery(api.brands.getAll) || []
  const factories = useQuery(api.factories.getAll) || []
  const items = useQuery(api.items.listItemsByPO, { purchaseOrderId: orderId }) || []

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading order...</h3>
          <p className="text-gray-600">Please wait while we load the order details.</p>
        </div>
      </div>
    )
  }

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b._id === brandId)
    return brand?.name || "Unknown Brand"
  }

  const getFactoryName = (factoryId: string) => {
    const factory = factories.find(f => f._id === factoryId)
    return factory?.name || "Unknown Factory"
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <OrderDetailsHeader
        order={order}
        brandName={getBrandName(order.brandId)}
        factoryName={getFactoryName(order.factoryId)}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-blue-50 p-1 border border-blue-200">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 text-xs font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="items"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 text-xs font-medium"
              >
                Items
              </TabsTrigger>
              <TabsTrigger 
                value="materials"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 text-xs font-medium"
              >
                Materials
              </TabsTrigger>
              <TabsTrigger 
                value="financials"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 text-xs font-medium"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger 
                value="qa"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 text-xs font-medium"
              >
                QA & Defects
              </TabsTrigger>
              <TabsTrigger 
                value="messaging"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 text-xs font-medium"
              >
                Messaging
              </TabsTrigger>
              <TabsTrigger 
                value="timeline"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 text-xs font-medium"
              >
                Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <OrderOverview
                order={order}
                items={items}
                brandName={getBrandName(order.brandId)}
                factoryName={getFactoryName(order.factoryId)}
              />
            </TabsContent>

            <TabsContent value="items" className="mt-6">
              <OrderVariantsTable
                order={order}
                items={items}
              />
            </TabsContent>

            <TabsContent value="materials" className="mt-6">
              <OrderMaterials
                order={order}
                items={items}
              />
            </TabsContent>

            <TabsContent value="financials" className="mt-6">
              <OrderFinancials
                order={order}
                items={items}
              />
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <OrderQA
                order={order}
                items={items}
              />
            </TabsContent>

            <TabsContent value="messaging" className="mt-6">
              <OrderMessaging
                order={order}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <OrderTimelineAudit
                order={order}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Context Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Update Progress</div>
                  <div className="text-sm text-gray-600">Mark items as completed</div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Record Payment</div>
                  <div className="text-sm text-gray-600">Add payment received</div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Flag Issues</div>
                  <div className="text-sm text-gray-600">Report defects or delays</div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Export Data</div>
                  <div className="text-sm text-gray-600">Download order report</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
