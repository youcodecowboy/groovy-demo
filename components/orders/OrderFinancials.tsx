"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

interface OrderFinancialsProps {
  order: any
  items: any[]
}

export default function OrderFinancials({ order, items }: OrderFinancialsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Tracking</h3>
          <p className="text-gray-600 mb-6">
            Track costs, payments, and profitability for this order.
          </p>
          <p className="text-gray-500 text-sm">
            This feature is coming soon. For now, view financials in the main reports section.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
