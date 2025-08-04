"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRDisplay } from "@/components/ui/qr-display"
import { StageBadge } from "@/components/ui/stage-badge"
import { ActiveStageComponent } from "@/components/factory/active-stage-component"
import { StageActionModal } from "@/components/factory/stage-action-modal"
import { ItemActions } from "@/components/items/item-actions"
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
    Shirt,
    ArrowRight,
    CheckCircle,
    Play,
    Pause,
    AlertCircle,
    MapPin,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{item.sku}</h1>
          <p className="text-gray-600">Item Details & Production History</p>
        </div>
        {item.status === "inactive" && onActivateItem && (
          <Button onClick={() => onActivateItem(item.id)} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Activate Item
          </Button>
        )}
      </div>

      {/* Active Stage Component - Prominent at top */}
      {item.status === "active" && (
                  <ActiveStageComponent 
            item={item} 
            workflow={workflow} 
            onAdvanceItem={handleAdvanceItem}
            onMessageAboutItem={onMessageAboutItem}
          />
      )}

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
              {item.history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No production history yet</p>
                  <p className="text-sm">Item has not been activated or moved through stages</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {item.history.map((entry, index) => {
                    const fromStage = entry.from ? getStageByIdOrName(entry.from) : null
                    const toStage = getStageByIdOrName(entry.to)
                    const isLatest = index === item.history.length - 1

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          isLatest ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {fromStage ? (
                            <>
                              <StageBadge stage={fromStage} className="text-xs" />
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </>
                          ) : (
                            <span className="text-sm text-gray-600 px-2 py-1 bg-white rounded border">Started</span>
                          )}
                          {toStage && <StageBadge stage={toStage} className="text-xs" />}
                          {isLatest && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(entry.at)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            {entry.user}
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
