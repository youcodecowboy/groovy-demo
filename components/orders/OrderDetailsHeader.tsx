"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Edit3, 
  MessageSquare, 
  Download, 
  CheckCircle, 
  MoreHorizontal,
  Building2,
  Package
} from "lucide-react"
import { useRouter } from "next/navigation"
import ProgressBar from "./shared/ProgressBar"
import LeadTimeBadge from "./shared/LeadTimeBadge"

interface Order {
  _id: string
  poNumber: string
  status: string
  totalValue: number
  requestedDeliveryDate: number
  promisedDeliveryDate?: number
  progress?: {
    totalItems: number
    completedItems: number
    defectiveItems: number
    reworkItems: number
  }
  leadTime?: {
    promisedDays: number
    actualDays?: number
    status?: "ahead" | "on_track" | "behind"
  }
}

interface OrderDetailsHeaderProps {
  order: Order
  brandName: string
  factoryName: string
}

export default function OrderDetailsHeader({ order, brandName, factoryName }: OrderDetailsHeaderProps) {
  const router = useRouter()

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const statusConfig = getStatusConfig(order.status)

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.poNumber}</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                {brandName}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Package className="w-4 h-4" />
                {factoryName}
              </div>
            </div>
          </div>
          
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Center Section - Progress and Lead Time */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {order.progress && (
            <div className="min-w-[200px]">
              <ProgressBar
                completed={order.progress.completedItems}
                total={order.progress.totalItems}
                showPercentage={false}
              />
            </div>
          )}
          
          {order.leadTime && (
            <div>
              <LeadTimeBadge
                promisedDays={order.leadTime.promisedDays}
                actualDays={order.leadTime.actualDays}
                status={order.leadTime.status}
              />
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/app/orders/${order._id}/edit`)}
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/app/orders/${order._id}?tab=messaging`)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Message
          </Button>
          
          <Button
            size="sm"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          
          {order.status === "in_production" && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Order Value */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Order Value: <span className="font-semibold text-gray-900">{formatCurrency(order.totalValue)}</span>
          </div>
          
          <div className="text-sm text-gray-600">
            Due: <span className="font-semibold text-gray-900">
              {new Date(order.requestedDeliveryDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
