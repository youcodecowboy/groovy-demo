"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"

interface OrderMaterialsProps {
  order: any
  items: any[]
}

export default function OrderMaterials({ order, items }: OrderMaterialsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Materials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials Tracking</h3>
          <p className="text-gray-600 mb-6">
            Track material consumption, availability, and wastage.
          </p>
          <p className="text-gray-500 text-sm">
            This feature is coming soon. For now, track materials in the main materials section.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
