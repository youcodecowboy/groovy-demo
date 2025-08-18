"use client"

import { Badge } from "@/components/ui/badge"
import { Circle } from "lucide-react"

interface RYGStatusProps {
  status: "red" | "yellow" | "green"
  label: string
  showIcon?: boolean
}

export default function RYGStatus({ 
  status, 
  label, 
  showIcon = true 
}: RYGStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case "red":
        return "bg-red-100 text-red-800 border-red-200"
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "green":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getIconColor = () => {
    switch (status) {
      case "red":
        return "text-red-500"
      case "yellow":
        return "text-yellow-500"
      case "green":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Badge className={getStatusColor()}>
      {showIcon && <Circle className={`w-3 h-3 mr-1 ${getIconColor()}`} />}
      {label}
    </Badge>
  )
}
