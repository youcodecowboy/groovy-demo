"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface OrderTimelineAuditProps {
  order: any
}

export default function OrderTimelineAudit({ order }: OrderTimelineAuditProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline & Audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline & Audit</h3>
          <p className="text-gray-600 mb-6">
            View the complete timeline and audit trail for this order.
          </p>
          <p className="text-gray-500 text-sm">
            This feature is coming soon. For now, view timeline data in the overview section.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
