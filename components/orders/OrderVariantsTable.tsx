"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Package } from "lucide-react"

interface OrderVariantsTableProps {
  order: any
  items: any[]
}

export default function OrderVariantsTable({ order, items }: OrderVariantsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Items & Variants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Items & Variants</h3>
          <p className="text-gray-600 mb-6">
            View and manage items by variant with detailed progress tracking.
          </p>
          <p className="text-gray-500 text-sm">
            This feature is coming soon. For now, view items in the main items section.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
