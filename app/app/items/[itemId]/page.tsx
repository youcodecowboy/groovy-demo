"use client"

import React from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Package, 
  Workflow, 
  MapPin, 
  Clock, 
  Calendar,
  Tag,
  QrCode,
  User,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Edit3,
  History,
  BarChart3
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Label } from "@/components/ui/label"

export default function ItemDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const router = useRouter()
  const { itemId } = use(params)
  const item = useQuery(api.items.getById, { id: itemId as any })
  const workflow = useQuery(api.workflows.getById, item?.workflowId ? { id: item.workflowId } : "skip")
  const itemHistory = useQuery(api.items.getItemHistory, item?._id ? { itemId: item._id } : "skip")

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Item not found</h3>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/app/items")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Items
          </Button>
        </div>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { 
          label: "Active", 
          color: "bg-blue-100 text-blue-800 border-blue-200", 
          icon: Play,
          bgColor: "bg-blue-50"
        }
      case "paused":
        return { 
          label: "Paused", 
          color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
          icon: Pause,
          bgColor: "bg-yellow-50"
        }
      case "completed":
        return { 
          label: "Completed", 
          color: "bg-green-100 text-green-800 border-green-200", 
          icon: CheckCircle,
          bgColor: "bg-green-50"
        }
      case "error":
        return { 
          label: "Error", 
          color: "bg-red-100 text-red-800 border-red-200", 
          icon: AlertCircle,
          bgColor: "bg-red-50"
        }
      default:
        return { 
          label: "Unknown", 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          icon: AlertCircle,
          bgColor: "bg-gray-50"
        }
    }
  }

  const getCurrentStage = () => {
    if (!workflow || !item) return null
    return workflow.stages.find(stage => stage.id === item.currentStageId)
  }

  const getWorkflowProgress = () => {
    if (!workflow || !item) return 0
    const currentStageIndex = workflow.stages.findIndex(stage => stage.id === item.currentStageId)
    return ((currentStageIndex + 1) / workflow.stages.length) * 100
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statusConfig = getStatusConfig(item.status)
  const currentStage = getCurrentStage()
  const progress = getWorkflowProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="h-10 w-10 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">{item.itemId}</h1>
          <p className="text-gray-600 italic">Item details and progress tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/app/items/${item._id}/edit`)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Status & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={statusConfig.color}>
                  <statusConfig.icon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                <span className="text-sm text-gray-600">
                  Started {formatDate(item.startedAt)}
                </span>
              </div>

              {workflow && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Workflow Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {workflow.stages.findIndex(stage => stage.id === item.currentStageId) + 1} of {workflow.stages.length} stages
                  </div>
                </div>
              )}

              {currentStage && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Current Stage</span>
                  </div>
                  <div className="text-lg font-semibold">{currentStage.name}</div>
                  {currentStage.description && (
                    <p className="text-sm text-gray-600 mt-1">{currentStage.description}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Stages */}
          {workflow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Workflow Stages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflow.stages.map((stage, index) => {
                    const isCurrent = stage.id === item.currentStageId
                    const isCompleted = workflow.stages.findIndex(s => s.id === item.currentStageId) > index
                    const isUpcoming = workflow.stages.findIndex(s => s.id === item.currentStageId) < index

                    return (
                      <div 
                        key={stage.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isCurrent 
                            ? "bg-blue-50 border-blue-200" 
                            : isCompleted 
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCurrent 
                            ? "bg-blue-600 text-white" 
                            : isCompleted 
                            ? "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{stage.name}</div>
                          {stage.description && (
                            <div className="text-sm text-gray-600">{stage.description}</div>
                          )}
                        </div>
                        {isCurrent && (
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            Current
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Item History */}
          {itemHistory && itemHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Activity History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itemHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{entry.action}</div>
                        <div className="text-sm text-gray-600">
                          {entry.stageName} • {formatDate(entry.timestamp)}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Item ID</Label>
                <p className="text-sm text-gray-900 font-mono">{item.itemId}</p>
              </div>

              {item.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="text-sm text-gray-900">{item.description}</p>
                </div>
              )}

              {item.assignedTo && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                  <p className="text-sm text-gray-900">{item.assignedTo}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700">Started</Label>
                <p className="text-sm text-gray-900">{formatDate(item.startedAt)}</p>
              </div>

              {item.updatedAt !== item.startedAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="text-sm text-gray-900">{formatDate(item.updatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Item Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(item.metadata).map(([key, value]) => (
                  <div key={key}>
                    <Label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-sm text-gray-900">{String(value)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Workflow Information */}
          {workflow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Workflow Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Workflow</Label>
                  <p className="text-sm text-gray-900 font-medium">{workflow.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Total Stages</Label>
                  <p className="text-sm text-gray-900">{workflow.stages.length}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created</Label>
                  <p className="text-sm text-gray-900">{formatDate(workflow.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
