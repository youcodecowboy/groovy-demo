"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  MessageSquare, 
  Download,
  MoreHorizontal,
  Building2,
  Package,
  Calendar,
  DollarSign
} from "lucide-react"
import { useRouter } from "next/navigation"
import PaymentBadge from "./shared/PaymentBadge"
import LeadTimeBadge from "./shared/LeadTimeBadge"
import ProgressBar from "./shared/ProgressBar"
import RYGStatus from "./shared/RYGStatus"

interface Order {
  _id: string
  poNumber: string
  status: string
  brandId: string
  factoryId: string
  totalValue: number
  requestedDeliveryDate: number
  promisedDeliveryDate?: number
  submittedAt: number
  acceptedAt?: number
  progress?: {
    totalItems: number
    completedItems: number
    defectiveItems: number
    reworkItems: number
  }
  financials?: {
    orderValue: number
    totalPaid: number
    paymentTerms?: string
  }
  leadTime?: {
    promisedDays: number
    actualDays?: number
    status?: "ahead" | "on_track" | "behind"
  }
  notes?: string
}

interface OrdersTableProps {
  orders: Order[]
  brands: Array<{ _id: string; name: string }>
  factories: Array<{ _id: string; name: string }>
}

export default function OrdersTable({ orders, brands, factories }: OrdersTableProps) {
  const router = useRouter()

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b._id === brandId)
    return brand?.name || "Unknown Brand"
  }

  const getFactoryName = (factoryId: string) => {
    const factory = factories.find(f => f._id === factoryId)
    return factory?.name || "Unknown Factory"
  }

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getDueDateStatus = (dueDate: number) => {
    const now = Date.now()
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) return { status: "red" as const, label: "Overdue" }
    if (daysUntilDue <= 7) return { status: "yellow" as const, label: "Due Soon" }
    return { status: "green" as const, label: "On Track" }
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/app/orders/${orderId}`)
  }

  const handleMessageOrder = (orderId: string) => {
    router.push(`/app/orders/${orderId}?tab=messaging`)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Lead Time</TableHead>
            <TableHead>Last Contact</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const brandName = getBrandName(order.brandId)
            const factoryName = getFactoryName(order.factoryId)
            const dueDateStatus = getDueDateStatus(order.requestedDeliveryDate)
            
            return (
              <TableRow key={order._id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{order.poNumber}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Building2 className="w-3 h-3" />
                      {brandName}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Package className="w-3 h-3" />
                      {factoryName}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  {order.progress ? (
                    <ProgressBar
                      completed={order.progress.completedItems}
                      total={order.progress.totalItems}
                      showPercentage={false}
                      className="w-32"
                    />
                  ) : (
                    <span className="text-gray-500">No progress</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {order.leadTime ? (
                    <LeadTimeBadge
                      promisedDays={order.leadTime.promisedDays}
                      actualDays={order.leadTime.actualDays}
                      status={order.leadTime.status}
                    />
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {order.acceptedAt ? formatDate(order.acceptedAt) : formatDate(order.submittedAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.acceptedAt ? "Accepted" : "Submitted"}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {order.financials ? (
                    <PaymentBadge
                      totalPaid={order.financials.totalPaid}
                      orderValue={order.financials.orderValue}
                      paymentTerms={order.financials.paymentTerms}
                      dueDate={order.requestedDeliveryDate}
                    />
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="font-medium">
                    {formatCurrency(order.totalValue)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {formatDate(order.requestedDeliveryDate)}
                    </div>
                    <RYGStatus
                      status={dueDateStatus.status}
                      label={dueDateStatus.label}
                    />
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMessageOrder(order._id)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
