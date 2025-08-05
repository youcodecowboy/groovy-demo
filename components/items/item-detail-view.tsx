"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRDisplay } from "@/components/ui/qr-display"
import { StageBadge } from "@/components/ui/stage-badge"
import { ActiveStageComponent } from "@/components/factory/active-stage-component"
import { StageActionModal } from "@/components/factory/stage-action-modal"
import { ItemActions } from "@/components/items/item-actions"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Item, Workflow, Stage } from "@/types/schema"
import {
    ArrowLeft,
    Clock,
    User,
    Package,
    WorkflowIcon,
    Calendar,
    Tag,
    Building2,
    Palette,
    Ruler,
    Shirt, CheckCircle, Pause,
    AlertCircle,
    MapPin,
    MessageSquare,
    Send
} from "lucide-react"

interface ItemDetailViewProps {
  item: Item
  workflow: Workflow
  onBack: () => void
  onActivateItem?: (itemId: string) => void
  onAdvanceItem?: (itemId: string, toStageId: string, completedActions: any[]) => void
  onStageCompletionWithScan?: (qrData: string) => Promise<void>
  onScanLog?: (scanData: any) => Promise<void>
  onMessageAboutItem?: (itemId: string) => void
  currentUserId?: string
}

const statusConfig = {
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Pause },
  active: { label: "Active", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  paused: { label: "Paused", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertCircle },
}

export function ItemDetailView({ 
  item, 
  workflow, 
  onBack, 
  onActivateItem, 
  onAdvanceItem, 
  onStageCompletionWithScan,
  onScanLog,
  onMessageAboutItem,
  currentUserId = "admin@demo"
}: ItemDetailViewProps) {
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  
  // Load item history from Convex
  const itemHistory = useQuery(api.items.getHistory, { itemId: item.sku })
  const completedItemHistory = useQuery(api.items.getCompletedHistory, { itemId: item.sku })
  
  // Combine active and completed history
  const history = itemHistory || completedItemHistory || []
  
  // Mock notes data - in real app this would come from Convex
  const [notes, setNotes] = useState([
    {
      id: "1",
      text: "Item needs special attention during quality check",
      author: "floor@demo",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: "2", 
      text: "Fabric looks good, ready for next stage",
      author: "admin@demo",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    }
  ])

  const currentStage = workflow.stages.find((s) => s.id === item.currentStageId)
  const statusInfo = statusConfig[item.status]
  const StatusIcon = statusInfo.icon

  const getStageByIdOrName = (id: string): Stage | undefined => {
    return workflow.stages.find((s) => s.id === id || s.name === id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeSince = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than 1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  const handleAdvanceItem = () => {
    setActionModalOpen(true)
  }

  const handleActionModalComplete = async (completedActions: any[]) => {
    if (!onAdvanceItem || !currentStage) return

    // Check if there are any scan actions that need to be handled
    const scanActions = completedActions.filter(action => action.data && action.data.startsWith('item:'))
    
    if (scanActions.length > 0 && onStageCompletionWithScan) {
      // Handle scan completion
      for (const scanAction of scanActions) {
        await onStageCompletionWithScan(scanAction.data)
      }
      setActionModalOpen(false)
      return
    }

    const nextStages = workflow.stages.filter((s) => currentStage.allowedNextStageIds.includes(s.id))

    if (nextStages.length > 0) {
      await onAdvanceItem(item.id, nextStages[0].id, completedActions)
      setActionModalOpen(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    
    setIsAddingNote(true)
    try {
      // In real app, this would be a Convex mutation
      const note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        author: currentUserId,
        timestamp: new Date().toISOString(),
      }
      
      setNotes(prev => [note, ...prev])
      setNewNote("")
    } catch (error) {
      console.error("Failed to add note:", error)
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddNote()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Single Line Layout */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Left Side - Back Button */}
        <Button onClick={onBack} variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Center - Title and Info */}
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{item.sku}</h1>
          
          {/* Stage Badge */}
          {currentStage && (
            <StageBadge stage={currentStage} className="text-xs" />
          )}
          
          {/* Status */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </div>
          
          {/* Last Updated */}
          <div className="text-xs text-gray-500">
            Updated {getTimeSince(item.activatedAt || item.createdAt)}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2">
          {/* Flag Item Button */}
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-200 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Flag
          </Button>
          
          {/* Send Message Button */}
          {onMessageAboutItem && (
            <Button 
              onClick={() => onMessageAboutItem(item.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          )}
        </div>
      </div>

      {/* Active Stage Component - Prominent at top */}
      <ActiveStageComponent 
        item={item} 
        workflow={workflow} 
        onAdvanceItem={handleAdvanceItem}
        onMessageAboutItem={onMessageAboutItem}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Item Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">SKU</label>
                    <p className="text-lg font-semibold text-gray-900">{item.sku}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unique ID</label>
                    <p className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{item.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusInfo.label}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Stage</label>
                    {currentStage ? (
                      <div className="mt-1">
                        <StageBadge stage={currentStage} />
                      </div>
                    ) : (
                      <Badge variant="outline" className="mt-1">
                        {item.status === "inactive" ? "Pending Activation" : "No Stage"}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Workflow</label>
                    <div className="flex items-center gap-2 mt-1">
                      <WorkflowIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{workflow.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{getTimeSince(item.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Location</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {item.currentLocationId ? item.currentLocationId : "No location assigned"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Item Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ItemActions
                itemId={item.id}
                currentUserId={currentUserId}
                isDefective={item.metadata?.isDefective}
                defectNotes={item.metadata?.defectNotes}
                flaggedBy={item.metadata?.flaggedBy}
                flaggedAt={item.metadata?.flaggedAt}
                assignedTo={item.metadata?.assignedTo}
                onUpdate={() => {
                  // Refresh the page or trigger a refetch
                  window.location.reload()
                }}
              />
            </CardContent>
          </Card>

          {/* Product Details */}
          {item.metadata && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {item.metadata.brand && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Brand</p>
                        <p className="text-sm font-medium text-gray-900">{item.metadata.brand}</p>
                      </div>
                    </div>
                  )}
                  {item.metadata.style && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Style</p>
                        <p className="text-sm font-medium text-gray-900">{item.metadata.style}</p>
                      </div>
                    </div>
                  )}
                  {item.metadata.color && (
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Color</p>
                        <p className="text-sm font-medium text-gray-900">{item.metadata.color}</p>
                      </div>
                    </div>
                  )}
                  {item.metadata.size && (
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Size</p>
                        <p className="text-sm font-medium text-gray-900">{item.metadata.size}</p>
                      </div>
                    </div>
                  )}
                  {item.metadata.fabricCode && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">Fabric Code</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">{item.metadata.fabricCode}</p>
                    </div>
                  )}
                  {item.metadata.season && (
                    <div>
                      <p className="text-xs text-gray-600">Season</p>
                      <p className="text-sm font-medium text-gray-900">{item.metadata.season}</p>
                    </div>
                  )}
                </div>
                {item.metadata.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600 mb-2">Production Notes</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{item.metadata.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Production History */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Production History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No production history yet</p>
                  <p className="text-sm">Item has not been activated or moved through stages</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, index) => {
                    const isLatest = index === history.length - 1
                    const actionData = entry.metadata?.actionData

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          isLatest ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {/* Stage Information */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {entry.stageName}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {entry.action}
                            </Badge>
                          </div>
                          {isLatest && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>

                        {/* Action Data Display */}
                        {actionData && actionData.length > 0 && (
                          <div className="mb-3 p-3 bg-white rounded border">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Stage Actions:</h4>
                            <div className="space-y-2">
                              {actionData.map((action: any, actionIndex: number) => (
                                <div key={actionIndex} className="text-sm">
                                  <div className="font-medium text-gray-600">{action.label}:</div>
                                  {action.type === "note" && action.data && (
                                    <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                                      "{action.data}"
                                    </div>
                                  )}
                                  {action.type === "measurement" && action.data && (
                                    <div className="mt-1 text-gray-700">
                                      {action.data} units
                                    </div>
                                  )}
                                  {action.type === "inspection" && action.data && (
                                    <div className="mt-1 text-gray-700">
                                      {action.data.length} items checked
                                    </div>
                                  )}
                                  {action.type === "photo" && action.data && (
                                    <div className="mt-1 text-gray-700">
                                      {action.data.length} photos taken
                                    </div>
                                  )}
                                  {action.type === "scan" && action.data && (
                                    <div className="mt-1 text-gray-700">
                                      Scanned: {action.data}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes Display */}
                        {entry.notes && (
                          <div className="mb-3 p-3 bg-white rounded border">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                            <div className="text-sm text-gray-600">{entry.notes}</div>
                          </div>
                        )}

                        {/* Timestamp and User */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {formatDate(new Date(entry.timestamp).toISOString())}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            {entry.userId || "Unknown"}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - QR Code & Quick Actions */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">QR Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <QRDisplay value={item.qrData} size={200} />
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">QR Data</p>
                <p className="text-sm font-mono text-gray-900">{item.qrData}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">{getTimeSince(item.createdAt)}</span>
              </div>
              {item.activatedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Activated</span>
                  <span className="font-medium">{getTimeSince(item.activatedAt)}</span>
                </div>
              )}
              {item.completedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{getTimeSince(item.completedAt)}</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Stages</span>
                  <span className="font-medium">{workflow.stages.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed Stages</span>
                  <span className="font-medium">{item.history.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Item Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Note Form */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a note about this item..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isAddingNote ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Add Note
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No notes yet</p>
                    <p className="text-xs">Add the first note about this item</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {note.author.split('@')[0].charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {note.author}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getTimeSince(note.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{note.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Overview */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Workflow Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workflow.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage, index) => {
                    const isCompleted = item.history.some((h) => h.to === stage.id)
                    const isCurrent = item.currentStageId === stage.id

                    return (
                      <div
                        key={stage.id}
                        className={`flex items-center gap-2 p-2 rounded ${
                          isCurrent
                            ? "bg-blue-50 border border-blue-200"
                            : isCompleted
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isCurrent ? "bg-blue-500" : isCompleted ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span className="text-sm font-medium">{stage.name}</span>
                        </div>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {isCompleted && !isCurrent && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stage Action Modal */}
      <StageActionModal
        item={item}
        workflow={workflow}
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onComplete={handleActionModalComplete}
        onScanLog={onScanLog}
      />
    </div>
  )
}
