"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  QrCode, 
  Printer, 
  CheckCircle, 
  AlertCircle,
  BarChart3
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import BatchQRGenerator from "./BatchQRGenerator"

interface OrderVariantsTableProps {
  order: any
  items: any[]
}

export default function OrderVariantsTable({ order, items }: OrderVariantsTableProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("qr-generator")

  const handleQRGenerated = (itemIds: string[]) => {
    toast({
      title: "QR Codes Generated",
      description: `Successfully generated QR codes for ${itemIds.length} items.`,
    })
    // In a real app, this would refresh the data
  }

  const handleQRPrinted = (itemIds: string[]) => {
    toast({
      title: "QR Codes Printed",
      description: `Successfully marked ${itemIds.length} items as printed.`,
    })
    // In a real app, this would refresh the data
  }

  // Calculate summary statistics
  const totalItems = items.length
  const itemsWithQR = items.filter(item => item.qrCode).length
  const itemsPrinted = items.filter(item => item.qrPrinted).length
  const itemsNeedingQR = totalItems - itemsWithQR

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalItems}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <QrCode className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{itemsWithQR}</div>
                <div className="text-sm text-gray-600">With QR Codes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Printer className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{itemsPrinted}</div>
                <div className="text-sm text-gray-600">Printed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{itemsNeedingQR}</div>
                <div className="text-sm text-gray-600">Need QR Codes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-blue-50 p-1 border border-blue-200">
          <TabsTrigger 
            value="qr-generator"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 font-medium"
          >
            <QrCode className="w-4 h-4 mr-2" />
            QR Generator
          </TabsTrigger>
          <TabsTrigger 
            value="variants"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 font-medium"
          >
            <Package className="w-4 h-4 mr-2" />
            Variants View
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:text-blue-800 font-medium"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr-generator" className="mt-6">
          <BatchQRGenerator
            items={items}
            onQRGenerated={handleQRGenerated}
            onQRPrinted={handleQRPrinted}
          />
        </TabsContent>

        <TabsContent value="variants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Variants Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Variants View</h3>
                <p className="text-gray-600 mb-6">
                  Detailed breakdown of items by variant with progress tracking.
                </p>
                <p className="text-gray-500 text-sm">
                  This feature is coming soon. Use the QR Generator tab for now.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Production Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-6">
                  Production metrics, efficiency tracking, and performance insights.
                </p>
                <p className="text-gray-500 text-sm">
                  This feature is coming soon. Use the QR Generator tab for now.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
