"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface OrderQAProps {
  order: any
  items: any[]
}

export default function OrderQA({ order, items }: OrderQAProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          QA & Defects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
          <p className="text-gray-600 mb-6">
            Track defects, rework, and quality metrics for this order.
          </p>
          <p className="text-gray-500 text-sm">
            This feature is coming soon. For now, view QA data in the main items section.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
