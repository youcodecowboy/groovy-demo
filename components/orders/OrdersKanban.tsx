"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

interface OrdersKanbanProps {
  orders: any[]
  brands: Array<{ _id: string; name: string }>
  factories: Array<{ _id: string; name: string }>
}

export default function OrdersKanban({ orders, brands, factories }: OrdersKanbanProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Kanban View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Kanban Board</h3>
          <p className="text-gray-600 mb-6">
            View orders in a kanban board layout grouped by status.
          </p>
          <p className="text-gray-500 text-sm">
            This feature is coming soon. For now, use the table or cards view.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
