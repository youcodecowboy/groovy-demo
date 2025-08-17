"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Flag, 
  ChevronDown, 
  ChevronRight,
  MapPin,
  User,
  Package,
  Calendar
} from "lucide-react"

interface DiscoQueueProps {
  teamId: string
  onItemAction: (action: string, itemId: string) => void
}

// Mock data - will be replaced with real data from Convex
const mockItems = [
  {
    id: "ITEM-001",
    sku: "TSH-001",
    order: "PO-2024-001",
    customer: "Fashion Forward Inc",
    location: "Station A-3",
    stage: "Cutting",
    priority: "high",
    dueTime: "14:30",
    status: "in-progress",
    timeAtStage: "2h 15m",
    onTrack: true,
    qrCode: "ITEM-001",
    startedAt: "2024-12-17T10:15:00Z",
    estimatedDuration: "4h",
    assignedTo: "John Smith",
  },
  {
    id: "ITEM-002", 
    sku: "TSH-002",
    order: "PO-2024-002",
    customer: "Urban Style Co",
    location: "Station B-1",
    stage: "Sewing",
    priority: "medium",
    dueTime: "15:45",
    status: "ready",
    timeAtStage: "0h 30m",
    onTrack: true,
    qrCode: "ITEM-002",
    startedAt: "2024-12-17T13:15:00Z",
    estimatedDuration: "2h",
    assignedTo: "Maria Garcia",
  },
  {
    id: "ITEM-003",
    sku: "TSH-003", 
    order: "PO-2024-003",
    customer: "Premium Brands Ltd",
    location: "Station C-2",
    stage: "Quality Control",
    priority: "low",
    dueTime: "16:00",
    status: "ready",
    timeAtStage: "1h 45m",
    onTrack: false,
    qrCode: "ITEM-003",
    startedAt: "2024-12-17T12:15:00Z",
    estimatedDuration: "1h",
    assignedTo: "Sarah Johnson",
  },
  {
    id: "ITEM-004",
    sku: "TSH-004",
    order: "PO-2024-004",
    customer: "Global Fashion Group",
    location: "Station D-1",
    stage: "Packaging", 
    priority: "high",
    dueTime: "13:15",
    status: "in-progress",
    timeAtStage: "3h 20m",
    onTrack: false,
    qrCode: "ITEM-004",
    startedAt: "2024-12-17T09:55:00Z",
    estimatedDuration: "1.5h",
    assignedTo: "Mike Chen",
  },
]

export function DiscoQueue({ teamId, onItemAction }: DiscoQueueProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200"
      case "ready": return "bg-green-100 text-green-800 border-green-200"
      case "paused": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrackStatusColor = (onTrack: boolean) => {
    return onTrack 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-red-100 text-red-800 border-red-200"
  }

  const handleQuickAction = (action: string, itemId: string) => {
    onItemAction(action, itemId)
    if (action === "mark-done") {
      // Remove item from queue with animation
      setTimeout(() => {
        setExpandedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      }, 500)
    }
  }

  return (
    <div className="space-y-4">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Queue</h2>
        <Badge variant="outline" className="bg-gray-50">
          {mockItems.length} items
        </Badge>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {mockItems.map((item) => (
          <Card 
            key={item.id}
            className="transition-all duration-200 hover:shadow-md"
          >
            {/* Main Row */}
            <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleExpanded(item.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Expand/Collapse Icon */}
                  {expandedItems.has(item.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  
                  {/* Item Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-gray-600">#{item.sku}</span>
                      <span className="text-xs text-gray-500">{item.order}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.stage}</span>
                      <span className="text-xs text-gray-500">{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(item.priority)}
                  >
                    {item.priority}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(item.status)}
                  >
                    {item.status}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={getTrackStatusColor(item.onTrack)}
                  >
                    {item.onTrack ? "On Track" : "Late"}
                  </Badge>
                  <span className="text-sm text-gray-600">{item.dueTime}</span>
                </div>
              </div>
            </CardHeader>
            
            {/* Expanded Details */}
            {expandedItems.has(item.id) && (
              <CardContent className="pt-0 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                  {/* Customer & Order Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Customer</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.customer}</p>
                    
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Order</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.order}</p>
                  </div>

                  {/* Location & Assignment */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.location}</p>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Assigned To</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.assignedTo}</p>
                  </div>

                  {/* Time & Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Time at Stage</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.timeAtStage}</p>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Est. Duration</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.estimatedDuration}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("mark-done", item.id)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("flag-issue", item.id)
                    }}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Flag Issue
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("view-details", item.id)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockItems.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Queue Empty</h3>
          <p className="text-gray-600">No items in queue for this team</p>
        </div>
      )}
    </div>
  )
}
