"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface LeadTimeBadgeProps {
  promisedDays: number
  actualDays?: number
  status?: "ahead" | "on_track" | "behind"
  dueDate?: number
}

export default function LeadTimeBadge({ 
  promisedDays, 
  actualDays, 
  status, 
  dueDate 
}: LeadTimeBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case "ahead":
        return "bg-green-100 text-green-800 border-green-200"
      case "behind":
        return "bg-red-100 text-red-800 border-red-200"
      case "on_track":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getIcon = () => {
    switch (status) {
      case "ahead":
        return <TrendingUp className="w-3 h-3 mr-1" />
      case "behind":
        return <TrendingDown className="w-3 h-3 mr-1" />
      case "on_track":
      default:
        return <Minus className="w-3 h-3 mr-1" />
    }
  }

  const getLabel = () => {
    if (actualDays !== undefined) {
      const diff = actualDays - promisedDays
      if (diff < 0) return `${Math.abs(diff)} days ahead`
      if (diff > 0) return `${diff} days behind`
      return "On track"
    }
    return `${promisedDays} days`
  }

  return (
    <Badge className={getStatusColor()}>
      {getIcon()}
      {getLabel()}
    </Badge>
  )
}
