"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Package,
  Building2
} from "lucide-react"

interface Order {
  _id: string
  poNumber: string
  status: string
  submittedAt: number
  acceptedAt?: number
  productionStartDate?: number
  completedAt?: number
  requestedDeliveryDate: number
  promisedDeliveryDate?: number
  progress?: {
    totalItems: number
    completedItems: number
    defectiveItems: number
    reworkItems: number
  }
  leadTime?: {
    promisedDays: number
    actualDays?: number
    status?: "ahead" | "on_track" | "behind"
  }
  assignedTeam?: string
  orderOwner?: string
  notes?: string
  attachments?: Array<{
    name: string
    url: string
    type: string
    uploadedAt: number
    uploadedBy: string
  }>
}

interface Item {
  _id: string
  itemId: string
  status: string
  currentStageId: string
  startedAt: number
  completedAt?: number
  isDefective?: boolean
  defectNotes?: string
}

interface OrderOverviewProps {
  order: Order
  items: Item[]
  brandName: string
  factoryName: string
}

export default function OrderOverview({ order, items, brandName, factoryName }: OrderOverviewProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMilestoneStatus = (milestone: string) => {
    switch (milestone) {
      case "submitted":
        return { completed: true, date: order.submittedAt }
      case "accepted":
        return { completed: !!order.acceptedAt, date: order.acceptedAt }
      case "production":
        return { completed: !!order.productionStartDate, date: order.productionStartDate }
      case "completed":
        return { completed: !!order.completedAt, date: order.completedAt }
      default:
        return { completed: false, date: undefined }
    }
  }

  const getThroughputData = () => {
    const completedItems = items.filter(item => item.status === "completed")
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    
    const completedToday = completedItems.filter(item => 
      item.completedAt && item.completedAt >= todayStart
    ).length

    return {
      total: order.progress?.totalItems || 0,
      completed: order.progress?.completedItems || 0,
      today: completedToday,
      rate: order.progress?.totalItems ? (order.progress.completedItems / order.progress.totalItems) * 100 : 0
    }
  }

  const getBottlenecks = () => {
    // This would typically come from workflow stage analysis
    // For now, we'll show a placeholder
    return [
      { stage: "Cutting", avgTime: "2.5 days", items: 15 },
      { stage: "Sewing", avgTime: "4.2 days", items: 23 },
      { stage: "Quality Check", avgTime: "1.1 days", items: 8 }
    ]
  }

  const throughput = getThroughputData()
  const bottlenecks = getBottlenecks()

  return (
    <div className="space-y-6">
      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Order Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {[
              { key: "submitted", label: "Submitted", icon: FileText },
              { key: "accepted", label: "Accepted", icon: CheckCircle },
              { key: "production", label: "In Production", icon: Package },
              { key: "completed", label: "Completed", icon: CheckCircle }
            ].map((milestone, index) => {
              const status = getMilestoneStatus(milestone.key)
              const Icon = milestone.icon
              
              return (
                <div key={milestone.key} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    status.completed 
                      ? "bg-green-100 text-green-600" 
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{milestone.label}</div>
                    {status.date && (
                      <div className="text-xs text-gray-500">
                        {formatDate(status.date)}
                      </div>
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mt-4 ${
                      status.completed ? "bg-green-200" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Throughput and Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{throughput.completed}</div>
                <div className="text-sm text-gray-600">Items Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{throughput.today}</div>
                <div className="text-sm text-gray-600">Completed Today</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(throughput.rate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${throughput.rate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottlenecks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottlenecks.map((bottleneck, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{bottleneck.stage}</div>
                    <div className="text-sm text-gray-600">{bottleneck.avgTime} avg time</div>
                  </div>
                  <Badge variant="secondary">{bottleneck.items} items</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* People and Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* People */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              People
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Order Owner</div>
              <div className="text-sm text-gray-900">{order.orderOwner || "Not assigned"}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700">Assigned Team</div>
              <div className="text-sm text-gray-900">{order.assignedTeam || "Not assigned"}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700">Brand</div>
              <div className="text-sm text-gray-900">{brandName}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700">Factory</div>
              <div className="text-sm text-gray-900">{factoryName}</div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Key Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Submitted</div>
              <div className="text-sm text-gray-900">{formatDateTime(order.submittedAt)}</div>
            </div>
            
            {order.acceptedAt && (
              <div>
                <div className="text-sm font-medium text-gray-700">Accepted</div>
                <div className="text-sm text-gray-900">{formatDateTime(order.acceptedAt)}</div>
              </div>
            )}
            
            {order.productionStartDate && (
              <div>
                <div className="text-sm font-medium text-gray-700">Production Started</div>
                <div className="text-sm text-gray-900">{formatDateTime(order.productionStartDate)}</div>
              </div>
            )}
            
            <div>
              <div className="text-sm font-medium text-gray-700">Requested Delivery</div>
              <div className="text-sm text-gray-900">{formatDate(order.requestedDeliveryDate)}</div>
            </div>
            
            {order.promisedDeliveryDate && (
              <div>
                <div className="text-sm font-medium text-gray-700">Promised Delivery</div>
                <div className="text-sm text-gray-900">{formatDate(order.promisedDeliveryDate)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes and Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.notes ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">{order.notes}</p>
                <Button size="sm" variant="outline">
                  Add Note
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 italic">No notes yet</p>
                <Button size="sm" variant="outline">
                  Add Note
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.attachments && order.attachments.length > 0 ? (
              <div className="space-y-3">
                {order.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      Download
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline">
                  Upload File
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 italic">No attachments</p>
                <Button size="sm" variant="outline">
                  Upload File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
