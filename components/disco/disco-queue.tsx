"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
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
  Calendar,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DiscoQueueProps {
  teamId: string
  factoryId?: string
  onItemAction: (action: string, itemId: string) => void
}

export function DiscoQueue({ teamId, factoryId, onItemAction }: DiscoQueueProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Get real items from Convex
  const items = useQuery(api.items.getItemsByTeam, { 
    teamId
  })

  // Mutations
  const advanceItem = useMutation(api.items.advanceItemWithValidation)

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

  const calculateTimeAtStage = (startedAt: number) => {
    const now = Date.now()
    const diff = now - startedAt
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const calculateDueTime = (startedAt: number, estimatedDuration: number = 4) => {
    const dueTime = startedAt + (estimatedDuration * 60 * 60 * 1000)
    const now = Date.now()
    const isOnTrack = now <= dueTime
    const dueDate = new Date(dueTime)
    return {
      time: dueDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      isOnTrack
    }
  }

  const handleQuickAction = async (action: string, item: any) => {
    try {
      if (action === "mark-done") {
        // Check if item has required actions
        const requiredActions = item.requiredActions?.filter((a: any) => a.required) || []
        
        if (requiredActions.length > 0) {
          // Show required actions modal or validation
          toast({
            title: "Required Actions",
            description: `Complete required actions: ${requiredActions.map((a: any) => a.label).join(", ")}`,
            variant: "destructive",
          })
          return
        }

        // Advance item with basic scan action
        const completedActions = [{
          id: "basic-scan",
          type: "scan" as const,
          label: "QR Code Scan",
          data: { scannedValue: item.itemId }
        }]

        const result = await advanceItem({
          itemId: item._id,
          userId: "disco-floor",
          completedActions,
          notes: "Advanced via Disco Floor App"
        })

        if (result.status === "completed") {
          toast({
            title: "✅ Item Completed",
            description: "Item has been completed successfully",
          })
        } else {
          toast({
            title: "✅ Item Advanced",
            description: `Advanced to ${result.nextStage?.name}`,
          })
        }

        // Remove from expanded view
        setTimeout(() => {
          setExpandedItems(prev => {
            const newSet = new Set(prev)
            newSet.delete(item._id)
            return newSet
          })
        }, 500)

      } else if (action === "flag-issue") {
        onItemAction(action, item.itemId)
        toast({
          title: "⚠️ Item Flagged",
          description: "Item has been flagged for review",
        })
      } else if (action === "view-details") {
        onItemAction(action, item.itemId)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process action",
        variant: "destructive",
      })
    }
  }

  // Loading state
  if (!items) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Queue</h2>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Queue</h2>
        <Badge variant="outline" className="bg-gray-50">
          {items.length} items
        </Badge>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item) => {
          const timeAtStage = calculateTimeAtStage(item.startedAt)
          const dueInfo = calculateDueTime(item.startedAt, item.currentStage?.estimatedDuration)
          const orderNumber = item.metadata?.purchaseOrderId || "N/A"
          const customer = item.metadata?.brand || "Unknown"
          const location = item.currentLocationId || "Unassigned"

          return (
            <Card 
              key={item._id}
              className="transition-all duration-200 hover:shadow-md"
            >
              {/* Main Row */}
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleExpanded(item._id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Expand/Collapse Icon */}
                    {expandedItems.has(item._id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    
                    {/* Item Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-gray-600">#{item.itemId}</span>
                        <span className="text-xs text-gray-500">{orderNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.currentStage?.name || "Unknown"}</span>
                        <span className="text-xs text-gray-500">{location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(item.status)}
                    >
                      {item.status}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getTrackStatusColor(dueInfo.isOnTrack)}
                    >
                      {dueInfo.isOnTrack ? "On Track" : "Late"}
                    </Badge>
                    <span className="text-sm text-gray-600">{dueInfo.time}</span>
                  </div>
                </div>
              </CardHeader>
              
              {/* Expanded Details */}
              {expandedItems.has(item._id) && (
                <CardContent className="pt-0 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                    {/* Customer & Order Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Customer</span>
                      </div>
                      <p className="text-sm text-gray-600">{customer}</p>
                      
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Order</span>
                      </div>
                      <p className="text-sm text-gray-600">{orderNumber}</p>
                    </div>

                    {/* Location & Assignment */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Location</span>
                      </div>
                      <p className="text-sm text-gray-600">{location}</p>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Assigned To</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.assignedTo || "Unassigned"}</p>
                    </div>

                    {/* Time & Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Time at Stage</span>
                      </div>
                      <p className="text-sm text-gray-600">{timeAtStage}</p>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Est. Duration</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.currentStage?.estimatedDuration || 4}h
                      </p>
                    </div>
                  </div>

                  {/* Required Actions */}
                  {item.requiredActions && item.requiredActions.length > 0 && (
                    <div className="border-t pt-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-700">Required Actions</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.requiredActions.map((action: any) => (
                          <Badge 
                            key={action.id}
                            variant="outline" 
                            className="bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {action.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickAction("mark-done", item)
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={!item.canAdvance}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {item.canAdvance ? "Mark Done" : "Complete"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickAction("flag-issue", item)
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
                        handleQuickAction("view-details", item)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Queue Empty</h3>
          <p className="text-gray-600">No items in queue for this team</p>
        </div>
      )}
    </div>
  )
}
