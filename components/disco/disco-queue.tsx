"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Clock, Flag } from "lucide-react"

interface DiscoQueueProps {
  teamId: string
  onItemAction: (action: string, itemId: string) => void
}

// Mock data - will be replaced with real data from Convex
const mockItems = [
  {
    id: "ITEM-001",
    sku: "TSH-001",
    stage: "Cutting",
    priority: "high",
    dueTime: "14:30",
    status: "in-progress",
    qrCode: "ITEM-001",
  },
  {
    id: "ITEM-002", 
    sku: "TSH-002",
    stage: "Sewing",
    priority: "medium",
    dueTime: "15:45",
    status: "ready",
    qrCode: "ITEM-002",
  },
  {
    id: "ITEM-003",
    sku: "TSH-003", 
    stage: "Quality Control",
    priority: "low",
    dueTime: "16:00",
    status: "ready",
    qrCode: "ITEM-003",
  },
  {
    id: "ITEM-004",
    sku: "TSH-004",
    stage: "Packaging", 
    priority: "high",
    dueTime: "13:15",
    status: "in-progress",
    qrCode: "ITEM-004",
  },
]

export function DiscoQueue({ teamId, onItemAction }: DiscoQueueProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

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

  const handleQuickAction = (action: string, itemId: string) => {
    onItemAction(action, itemId)
    if (action === "mark-done") {
      // Remove item from queue with animation
      setTimeout(() => {
        setSelectedItem(null)
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

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockItems.map((item) => (
          <Card 
            key={item.id}
            className={`
              transition-all duration-200 hover:shadow-md cursor-pointer
              ${selectedItem === item.id ? 'ring-2 ring-blue-500' : ''}
            `}
            onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-600">#{item.sku}</span>
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(item.priority)}
                  >
                    {item.priority}
                  </Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(item.status)}
                >
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Stage */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{item.stage}</span>
              </div>
              
              {/* Due Time */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Due:</span>
                <span className="font-mono text-sm font-medium">{item.dueTime}</span>
              </div>

              {/* Quick Actions */}
              {selectedItem === item.id && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("mark-done", item.id)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction("flag-issue", item.id)
                    }}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
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
