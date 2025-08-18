"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"

interface PaymentBadgeProps {
  totalPaid: number
  orderValue: number
  paymentTerms?: string
  dueDate?: number
}

export default function PaymentBadge({ 
  totalPaid, 
  orderValue, 
  paymentTerms, 
  dueDate 
}: PaymentBadgeProps) {
  const percentage = orderValue > 0 ? (totalPaid / orderValue) * 100 : 0
  const isOverdue = dueDate && Date.now() > dueDate && totalPaid < orderValue
  
  const getStatusColor = () => {
    if (isOverdue) return "bg-red-100 text-red-800 border-red-200"
    if (percentage >= 100) return "bg-green-100 text-green-800 border-green-200"
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getIcon = () => {
    if (isOverdue) return <AlertCircle className="w-3 h-3 mr-1" />
    if (percentage >= 100) return <CheckCircle className="w-3 h-3 mr-1" />
    return null
  }

  return (
    <Badge className={getStatusColor()}>
      {getIcon()}
      ${totalPaid.toLocaleString()}/${orderValue.toLocaleString()}
      {paymentTerms && ` (${paymentTerms})`}
    </Badge>
  )
}
