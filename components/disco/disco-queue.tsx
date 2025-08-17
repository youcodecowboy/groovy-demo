"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { QRScanner } from "@/components/ui/qr-scanner"
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
  AlertTriangle,
  Eye,
  Play,
  Settings,
  Zap,
  ArrowRight,
  Timer,
  Target
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import React from "react"

interface DiscoQueueProps {
  teamId: string
  factoryId?: string
  onItemAction: (action: string, itemId: string) => void
}

type TabType = "queue" | "completed" | "upcoming"

interface ActionState {
  [actionId: string]: {
    completed: boolean
    data?: any
  }
}

const actionIcons = {
  scan: Zap,
  photo: AlertCircle,
  note: Package,
  measurement: Target,
  inspection: CheckCircle,
  approval: Flag,
}

export function DiscoQueue({ teamId, factoryId, onItemAction }: DiscoQueueProps) {
  const [activeTab, setActiveTab] = useState<TabType>("queue")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [actionStates, setActionStates] = useState<ActionState>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [currentScanAction, setCurrentScanAction] = useState<any>(null)
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

  const handleAdvanceClick = (item: any) => {
    setSelectedItem(item)
    setActionStates({})
    setAdvanceModalOpen(true)
  }

  const updateActionState = (actionId: string, completed: boolean, data?: any) => {
    setActionStates((prev) => ({
      ...prev,
      [actionId]: { completed, data },
    }))
  }

  const renderActionInput = (action: any) => {
    const state = actionStates[action.id]
    const IconComponent = actionIcons[action.type as keyof typeof actionIcons] || Settings

    switch (action.type) {
      case "scan":
        return (
          <div className="space-y-2">
            <Input
              placeholder="Scan or enter code manually"
              value={state?.data || ""}
              onChange={(e) => updateActionState(action.id, !!e.target.value, e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCurrentScanAction(action)
                setShowScanner(true)
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Scan Now
            </Button>
          </div>
        )

      case "note":
        return (
          <Textarea
            placeholder="Enter notes..."
            value={state?.data || ""}
            onChange={(e) => updateActionState(action.id, !!e.target.value, e.target.value)}
            rows={3}
          />
        )

      case "measurement":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Enter measurement value"
              value={state?.data || ""}
              onChange={(e) => updateActionState(action.id, !!e.target.value, e.target.value)}
            />
            {action.config?.unit && (
              <span className="text-sm text-gray-500">Unit: {action.config.unit}</span>
            )}
          </div>
        )

      case "approval":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`approval-${action.id}`}
              checked={state?.data || false}
              onCheckedChange={(checked) => updateActionState(action.id, checked as boolean, checked)}
            />
            <label htmlFor={`approval-${action.id}`} className="text-sm">
              I approve this item
            </label>
          </div>
        )

      case "photo":
        return (
          <div className="space-y-2">
            <Button variant="outline" size="sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <span className="text-sm text-gray-500">Photo capture functionality</span>
          </div>
        )

      case "inspection":
        return (
          <div className="space-y-2">
            <Input
              placeholder="Inspection result"
              value={state?.data || ""}
              onChange={(e) => updateActionState(action.id, !!e.target.value, e.target.value)}
            />
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-500">
            Action type: {action.type}
          </div>
        )
    }
  }

  const handleAdvanceSubmit = async () => {
    if (!selectedItem) return

    setIsSubmitting(true)
    try {
      const completedActions = Object.entries(actionStates)
        .filter(([_, state]) => state.completed)
        .map(([actionId, state]) => ({
          id: actionId,
          type: selectedItem.requiredActions?.find((a: any) => a.id === actionId)?.type || "note",
          label: selectedItem.requiredActions?.find((a: any) => a.id === actionId)?.label || "Action",
          data: state.data
        }))

      const result = await advanceItem({
        itemId: selectedItem._id,
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

      setAdvanceModalOpen(false)
      setSelectedItem(null)
      setActionStates({})
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to advance item",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickAction = async (action: string, item: any) => {
    try {
      if (action === "flag-issue") {
        onItemAction(action, item.itemId)
        toast({
          title: "⚠️ Item Flagged",
          description: "Item has been flagged for review",
        })
      } else if (action === "view-details") {
        window.location.href = `/disco/items/${item.itemId}`
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process action",
        variant: "destructive",
      })
    }
  }

  // Filter items based on active tab
  const filteredItems = items?.filter((item) => {
    switch (activeTab) {
      case "queue":
        return item.status === "active" || item.status === "paused"
      case "completed":
        return item.status === "completed"
      case "upcoming":
        return item.status === "error"
      default:
        return true
    }
  }) || []

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
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: "queue", label: "Queue", count: items.filter(i => i.status === "active" || i.status === "paused").length },
            { id: "completed", label: "Completed", count: items.filter(i => i.status === "completed").length },
            { id: "upcoming", label: "Issues", count: items.filter(i => i.status === "error").length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <Badge variant="secondary" className="ml-2 text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const timeAtStage = calculateTimeAtStage(item.startedAt)
          const dueInfo = calculateDueTime(item.startedAt, item.currentStage?.estimatedDuration)
          const orderNumber = item.metadata?.purchaseOrderId || "N/A"
          const customer = item.metadata?.brand || "Unknown"
          const location = item.currentLocationId || "Unassigned"
          const workflowName = (item.workflow as any)?.name || "Unknown Workflow"

          return (
            <Card 
              key={item._id}
              className="rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-4">
                {/* Main Row */}
                <div className="flex items-center justify-between">
                  {/* Left Section - Item Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Item ID & Order */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-sm font-medium text-gray-900">#{item.itemId}</span>
                      <span className="text-xs text-gray-500 truncate">PO: {orderNumber}</span>
                    </div>

                    {/* Current Stage */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-900">{item.currentStage?.name || "Unknown"}</span>
                      <span className="text-xs text-gray-500">{workflowName}</span>
                    </div>

                    {/* Location - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{location}</span>
                    </div>

                    {/* Customer - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span className="truncate">{customer}</span>
                    </div>
                  </div>

                  {/* Right Section - Status & Actions */}
                  <div className="flex items-center gap-3">
                    {/* Time & Status - Hidden on mobile */}
                    <div className="hidden sm:flex flex-col items-end text-xs">
                      <span className="text-gray-600">{timeAtStage}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTrackStatusColor(dueInfo.isOnTrack)}`}
                      >
                        {dueInfo.isOnTrack ? "On Track" : "Late"}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction("view-details", item)}
                        variant="outline"
                        className="h-8 px-2"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {activeTab === "queue" && (
                        <Button
                          size="sm"
                          onClick={() => handleAdvanceClick(item)}
                          className="h-8 px-2 bg-green-600 hover:bg-green-700"
                          disabled={!item.canAdvance}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction("flag-issue", item)}
                        className="h-8 px-2"
                      >
                        <Flag className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Expand Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpanded(item._id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedItems.has(item._id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedItems.has(item._id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Additional Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Est. Duration</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.currentStage?.estimatedDuration || 4}h
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Assigned To</span>
                        </div>
                        <p className="text-sm text-gray-600">{item.assignedTo || "Unassigned"}</p>
                      </div>

                      {/* Mobile-only info moved here */}
                      <div className="space-y-2 md:hidden">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Location</span>
                        </div>
                        <p className="text-sm text-gray-600">{location}</p>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Customer</span>
                        </div>
                        <p className="text-sm text-gray-600">{customer}</p>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Time at Stage</span>
                        </div>
                        <p className="text-sm text-gray-600">{timeAtStage}</p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Status</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTrackStatusColor(dueInfo.isOnTrack)}`}
                          >
                            {dueInfo.isOnTrack ? "On Track" : "Late"}
                          </Badge>
                        </div>
                      </div>

                      {/* Required Actions */}
                      {item.requiredActions && item.requiredActions.length > 0 && (
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700">Required Actions</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.requiredActions.map((action: any) => (
                              <Badge 
                                key={action.id}
                                variant="outline" 
                                className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                              >
                                {action.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} items</h3>
          <p className="text-gray-600">No items found for this team</p>
        </div>
      )}

      {/* Advance Item Modal */}
      <Dialog open={advanceModalOpen} onOpenChange={setAdvanceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Advance Item #{selectedItem?.itemId}</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">Current Stage: {selectedItem.currentStage?.name}</div>
                  <div className="text-gray-600">Workflow: {(selectedItem.workflow as any)?.name}</div>
                </div>
              </div>

              {selectedItem.requiredActions && selectedItem.requiredActions.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium">Required Actions</h4>
                  {selectedItem.requiredActions.map((action: any) => (
                    <div key={action.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {actionIcons[action.type as keyof typeof actionIcons] && 
                          React.createElement(actionIcons[action.type as keyof typeof actionIcons], { className: "w-4 h-4" })
                        }
                        <span className="text-sm font-medium">{action.label}</span>
                      </div>
                      {renderActionInput(action)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No actions required for this stage
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setAdvanceModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdvanceSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Advancing..." : "Advance Item"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <QRScanner
              onScan={(result) => {
                if (currentScanAction) {
                  updateActionState(currentScanAction.id, true, result)
                }
                setShowScanner(false)
                setCurrentScanAction(null)
              }}
              className="w-full"
            />
            <Button
              variant="outline"
              onClick={() => setShowScanner(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
