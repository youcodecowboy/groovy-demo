"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

interface OrderMessagingProps {
  order: any
}

export default function OrderMessaging({ order }: OrderMessagingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messaging
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Messaging</h3>
          <p className="text-gray-600 mb-6">
            Communicate with team members and stakeholders about this order.
          </p>
          <p className="text-gray-500 text-sm">
            This feature is coming soon. For now, use the main messaging section.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
