"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  Clock,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  List,
  PieChart,
  LineChart,
  Calendar,
  Target,
  Zap,
  Settings,
  Trash2,
  Edit3,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  Bell,
  FileText,
  Database,
  Workflow,
  Star,
  Filter,
} from "lucide-react"
import { DashboardWidget } from '@/types/dashboard'

interface SimpleWidgetProps {
  widget: DashboardWidget
  isEditMode?: boolean
  onRemove?: () => void
  onEdit?: () => void
}

export function SimpleWidget({ widget, isEditMode = false, onRemove, onEdit }: SimpleWidgetProps) {
  // Get real data
  const items = useQuery(api.items.getAll)
  const workflows = useQuery(api.workflows.getAll)
  const completedItems = useQuery(api.items.getCompleted)
  const scans = useQuery(api.scans.getAllScans, {})

  const getWidgetData = () => {
    if (!items || !workflows || !completedItems || !scans) {
      return { value: 0, trend: 0, metadata: {} }
    }

    switch (widget.type) {
      case "active-items-card":
        const activeItems = items.filter(item => item.status === 'active')
        return {
          value: activeItems.length,
          trend: 0, // Could calculate trend here
          metadata: { totalItems: items.length }
        }

      case "on-time-card":
        const totalCompleted = completedItems.length
        const onTimeCompleted = Math.floor(totalCompleted * 0.85) // Mock calculation
        const onTimePercentage = totalCompleted > 0 ? (onTimeCompleted / totalCompleted) * 100 : 0
        const onTimeCompletedToday = completedItems.filter(item => {
          const today = new Date()
          const completedDate = new Date(item.completedAt)
          return completedDate.toDateString() === today.toDateString()
        })
        return {
          value: onTimePercentage,
          trend: 0,
          metadata: { completedToday: onTimeCompletedToday.length, totalCompleted }
        }

      case "open-tasks-card":
        const pausedItems = items.filter(item => item.status === 'paused')
        return {
          value: pausedItems.length,
          trend: 0,
          metadata: { activeItems: items.filter(item => item.status === 'active').length }
        }

      case "completion-rate-card":
        const completionRateCompletedToday = completedItems.filter(item => {
          const today = new Date()
          const completedDate = new Date(item.completedAt)
          return completedDate.toDateString() === today.toDateString()
        })
        const completionRate = items.length > 0 ? (completionRateCompletedToday.length / items.length) * 100 : 0
        return {
          value: completionRate,
          trend: 0,
          metadata: { completedToday: completionRateCompletedToday.length, totalItems: items.length }
        }

      case "defective-items-card":
        const defectiveItems = items.filter(item => item.isDefective)
        return {
          value: defectiveItems.length,
          trend: 0,
          metadata: { totalItems: items.length }
        }

      case "total-revenue-card":
        // Mock revenue calculation
        const revenue = completedItems.length * 150 // Mock $150 per completed item
        return {
          value: revenue,
          trend: 0,
          metadata: { completedItems: completedItems.length }
        }

      case "recent-activity-feed":
        const recentScans = scans
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10)
        return {
          value: recentScans,
          trend: 0,
          metadata: { totalScans: scans.length }
        }

      case "team-activity-feed":
        // Mock team activity data
        return {
          value: [
            { user: "John", action: "Completed item TEST-1", time: "2 min ago" },
            { user: "Sarah", action: "Started workflow Production", time: "5 min ago" },
            { user: "Mike", action: "Scanned item TEST-3", time: "8 min ago" },
            { user: "Lisa", action: "Flagged item for review", time: "12 min ago" },
            { user: "Tom", action: "Updated workflow settings", time: "15 min ago" },
          ],
          trend: 0,
          metadata: { teamMembers: 5 }
        }

      case "messages-preview":
        // Mock messages data
        return {
          value: [
            { sender: "System", message: "New item created: PROD-001", time: "1 min ago", type: "info" },
            { sender: "Quality Team", message: "Item flagged for review", time: "5 min ago", type: "warning" },
            { sender: "Production", message: "Workflow completed successfully", time: "10 min ago", type: "success" },
            { sender: "Admin", message: "System maintenance scheduled", time: "1 hour ago", type: "info" },
          ],
          trend: 0,
          metadata: { unreadCount: 2 }
        }

      case "alerts-feed":
        // Mock alerts data
        return {
          value: [
            { type: "error", message: "Item TEST-5 failed quality check", time: "2 min ago" },
            { type: "warning", message: "Low inventory alert", time: "15 min ago" },
            { type: "info", message: "New workflow template available", time: "1 hour ago" },
          ],
          trend: 0,
          metadata: { criticalAlerts: 1 }
        }

      case "upcoming-deadlines":
        // Mock deadline data
        return {
          value: [
            { item: "PROD-001", deadline: "Today", status: "urgent" },
            { item: "PROD-002", deadline: "Tomorrow", status: "warning" },
            { item: "PROD-003", deadline: "Dec 15", status: "normal" },
            { item: "PROD-004", deadline: "Dec 16", status: "normal" },
          ],
          trend: 0,
          metadata: { totalDeadlines: 4 }
        }

      case "flagged-items":
        // Mock flagged items
        return {
          value: [
            { item: "PROD-001", reason: "Quality issue", flaggedBy: "John", time: "2 hours ago" },
            { item: "PROD-003", reason: "Missing documentation", flaggedBy: "Sarah", time: "4 hours ago" },
            { item: "PROD-005", reason: "Delay in production", flaggedBy: "Mike", time: "6 hours ago" },
          ],
          trend: 0,
          metadata: { totalFlagged: 3 }
        }

      case "quality-control":
        // Mock quality control items
        return {
          value: [
            { item: "PROD-001", status: "Under Review", reviewer: "John", time: "1 hour ago" },
            { item: "PROD-003", status: "Pending Approval", reviewer: "Sarah", time: "3 hours ago" },
            { item: "PROD-005", status: "Rejected", reviewer: "Mike", time: "5 hours ago" },
          ],
          trend: 0,
          metadata: { inReview: 2, approved: 0, rejected: 1 }
        }

      case "items-table":
        return {
          value: items.slice(0, 10),
          trend: 0,
          metadata: { totalItems: items.length, page: 1 }
        }

      case "workflows-table":
        return {
          value: workflows.slice(0, 10),
          trend: 0,
          metadata: { totalWorkflows: workflows.length, page: 1 }
        }

      case "activity-log":
        const activityLog = scans
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 15)
        return {
          value: activityLog,
          trend: 0,
          metadata: { totalActivities: scans.length, page: 1 }
        }

      default:
        return { value: 0, trend: 0, metadata: {} }
    }
  }

  const getWidgetIcon = () => {
    switch (widget.type) {
      case "active-items-card": return Package
      case "on-time-card": return Clock
      case "open-tasks-card": return CheckSquare
      case "completion-rate-card": return Target
      case "defective-items-card": return AlertTriangle
      case "total-revenue-card": return DollarSign
      case "recent-activity-feed": return Activity
      case "team-activity-feed": return Users
      case "messages-preview": return MessageSquare
      case "alerts-feed": return Bell
      case "upcoming-deadlines": return Calendar
      case "flagged-items": return Star
      case "quality-control": return Filter
      case "items-table": return Database
      case "workflows-table": return Workflow
      case "activity-log": return FileText
      default: return Settings
    }
  }

  const getWidgetColor = () => {
    switch (widget.type) {
      case "active-items-card": return "blue"
      case "on-time-card": return "green"
      case "open-tasks-card": return "purple"
      case "completion-rate-card": return "orange"
      case "defective-items-card": return "red"
      case "total-revenue-card": return "emerald"
      case "recent-activity-feed": return "blue"
      case "team-activity-feed": return "green"
      case "messages-preview": return "purple"
      case "alerts-feed": return "red"
      case "upcoming-deadlines": return "red"
      case "flagged-items": return "yellow"
      case "quality-control": return "orange"
      case "items-table": return "blue"
      case "workflows-table": return "green"
      case "activity-log": return "purple"
      default: return "gray"
    }
  }

  const renderWidgetContent = () => {
    const data = getWidgetData()
    const Icon = getWidgetIcon()
    const color = getWidgetColor()

    switch (widget.type) {
      case "active-items-card":
      case "on-time-card":
      case "open-tasks-card":
      case "completion-rate-card":
      case "defective-items-card":
      case "total-revenue-card":
        return (
          <div className="flex-1 flex flex-col justify-center items-center text-center min-h-[120px]">
            <div className={`text-3xl font-bold text-${color}-600`}>
              {widget.type === "total-revenue-card" ? "$" : ""}
              {typeof data.value === 'number' ? data.value.toFixed(1) : String(data.value)}
              {widget.type === "on-time-card" || widget.type === "completion-rate-card" ? "%" : ""}
            </div>
            {data.metadata.completedToday && (
              <div className="text-xs text-gray-500 mt-1">
                {data.metadata.completedToday} completed today
              </div>
            )}
            {data.metadata.totalItems && (
              <div className="text-xs text-gray-500">
                of {data.metadata.totalItems} total items
              </div>
            )}
            {data.metadata.completedItems && (
              <div className="text-xs text-gray-500">
                from {data.metadata.completedItems} completed items
              </div>
            )}
          </div>
        )

      case "recent-activity-feed":
        const recentScans = Array.isArray(data.value) ? data.value : []
        return (
          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="flex-1 overflow-y-auto space-y-2">
              {recentScans.length > 0 ? (
                recentScans.map((scan: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 text-xs">
                      <div className="font-medium">
                        {scan.scanType === 'item_lookup' ? 'Item Scanned' : 'Activity'}
                      </div>
                      <div className="text-gray-500">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {scan.success ? '✓' : '✗'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        )

      case "team-activity-feed":
        const teamActivities = Array.isArray(data.value) ? data.value : []
        return (
          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="flex-1 overflow-y-auto space-y-2">
              {teamActivities.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 text-xs">
                    <div className="font-medium">{activity.user}</div>
                    <div className="text-gray-500">{activity.action}</div>
                  </div>
                  <div className="text-xs text-gray-400">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case "messages-preview":
        const messages = Array.isArray(data.value) ? data.value : []
        return (
          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((message: any, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    message.type === 'error' ? 'bg-red-500' : 
                    message.type === 'warning' ? 'bg-yellow-500' : 
                    message.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 text-xs">
                    <div className="font-medium">{message.sender}</div>
                    <div className="text-gray-600">{message.message}</div>
                  </div>
                  <div className="text-xs text-gray-400">{message.time}</div>
                </div>
              ))}
            </div>
            {data.metadata?.unreadCount && data.metadata.unreadCount > 0 && (
              <div className="text-xs text-blue-600 font-medium mt-2">
                {data.metadata.unreadCount} unread messages
              </div>
            )}
          </div>
        )

      case "alerts-feed":
        const alerts = Array.isArray(data.value) ? data.value : []
        return (
          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="flex-1 overflow-y-auto space-y-2">
              {alerts.map((alert: any, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'error' ? 'bg-red-500' : 
                    alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 text-xs">
                    <div className="font-medium">{alert.type.toUpperCase()}</div>
                    <div className="text-gray-600">{alert.message}</div>
                  </div>
                  <div className="text-xs text-gray-400">{alert.time}</div>
                </div>
              ))}
            </div>
            {data.metadata?.criticalAlerts && data.metadata.criticalAlerts > 0 && (
              <div className="text-xs text-red-600 font-medium mt-2">
                {data.metadata.criticalAlerts} critical alert{data.metadata.criticalAlerts > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )

      case "upcoming-deadlines":
        const deadlines = Array.isArray(data.value) ? data.value : []
        return (
          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="flex-1 overflow-y-auto space-y-2">
              {deadlines.map((deadline: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                  <div className="text-xs">
                    <div className="font-medium">{deadline.item}</div>
                    <div className="text-gray-500">Due {deadline.deadline}</div>
                  </div>
                  <Badge 
                    variant={deadline.status === 'urgent' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {deadline.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )

      case "flagged-items":
        const flaggedItems = Array.isArray(data.value) ? data.value : []
        return (
          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="flex-1 overflow-y-auto space-y-2">
              {flaggedItems.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-gray-50">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1 text-xs">
                    <div className="font-medium">{item.item}</div>
                    <div className="text-gray-600">{item.reason}</div>
                    <div className="text-gray-500">by {item.flaggedBy}</div>
                  </div>
                  <div className="text-xs text-gray-400">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case "quality-control":
        const qualityItems = Array.isArray(data.value) ? data.value : []
        return (
          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="flex-1 overflow-y-auto space-y-2">
              {qualityItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                  <div className="text-xs">
                    <div className="font-medium">{item.item}</div>
                    <div className="text-gray-500">{item.status}</div>
                    <div className="text-gray-400">by {item.reviewer}</div>
                  </div>
                  <Badge 
                    variant={
                      item.status === 'Rejected' ? 'destructive' : 
                      item.status === 'Pending Approval' ? 'secondary' : 'default'
                    }
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            {data.metadata && (
              <div className="text-xs text-gray-500 mt-2">
                {data.metadata.inReview} in review, {data.metadata.approved} approved, {data.metadata.rejected} rejected
              </div>
            )}
          </div>
        )

      case "items-table":
      case "workflows-table":
      case "activity-log":
        const tableData = Array.isArray(data.value) ? data.value : []
        return (
          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="text-sm font-medium mb-2">
              {widget.type === "items-table" && `${data.metadata.totalItems} Items`}
              {widget.type === "workflows-table" && `${data.metadata.totalWorkflows} Workflows`}
              {widget.type === "activity-log" && `${data.metadata.totalActivities} Activities`}
            </div>
            <div className="flex-1 overflow-y-auto">
              {tableData.length > 0 ? (
                <div className="space-y-1">
                  {tableData.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50 text-xs">
                      <div className="font-medium">
                        {item.itemId || item.id || item._id || `Item ${index + 1}`}
                      </div>
                      <div className="text-gray-500">
                        {item.status || item.scanType || 'Active'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  No data available
                </div>
              )}
            </div>
            {tableData.length > 5 && (
              <div className="text-xs text-gray-500 text-center mt-2">
                +{tableData.length - 5} more items
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="flex-1 flex items-center justify-center text-gray-500 min-h-[120px]">
            <div className="text-center">
              <Icon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Widget not implemented</p>
            </div>
          </div>
        )
    }
  }

  const Icon = getWidgetIcon()
  const color = getWidgetColor()

  return (
    <Card className="hover:shadow-md transition-shadow h-full min-h-[200px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
              <Icon className={`w-4 h-4 text-${color}-600`} />
            </div>
            <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onRemove}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          {renderWidgetContent()}
        </div>
      </CardContent>
    </Card>
  )
}
