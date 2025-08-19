"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { 
  Flag, 
  AlertTriangle, 
  TimerOff, 
  Mail, 
  CheckCircle2, 
  CalendarClock, 
  PackageMinus, 
  PackagePlus, 
  BellRing,
  Clock,
  MoreHorizontal,
  Check,
  Snooze,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface NotificationRowProps {
  notification: any
  onClick?: () => void
  compact?: boolean
  showActions?: boolean
}

const iconMap = {
  "item.flagged": Flag,
  "item.defective": AlertTriangle,
  "item.stuck": TimerOff,
  "message.inbound": Mail,
  "order.completed": CheckCircle2,
  "order.behind": CalendarClock,
  "materials.lowstock": PackageMinus,
  "materials.received": PackagePlus,
  "system.alert": BellRing,
  // Legacy types
  "item_assigned": Flag,
  "item_completed": CheckCircle2,
  "item_defective": AlertTriangle,
  "item_flagged": Flag,
  "stage_completed": CheckCircle2,
  "message_received": Mail,
  "task_assigned": Flag,
  "system_alert": BellRing,
}

const severityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500", 
  high: "bg-orange-500",
  urgent: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  success: "bg-green-500",
}

export function NotificationRow({ notification, onClick, compact = false, showActions = true }: NotificationRowProps) {
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)

  const markAsRead = useMutation(api.notifications.markNotificationAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)

  const IconComponent = iconMap[notification.type as keyof typeof iconMap] || BellRing
  const severityColor = severityColors[notification.priority as keyof typeof severityColors] || "bg-gray-500"

  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp)
    const now = new Date()
    const m = (now.getTime() - d.getTime()) / 60000
    const h = m / 60
    const days = h / 24
    
    if (m < 1) return "Just now"
    if (m < 60) return `${Math.floor(m)}m ago`
    if (h < 24) return `${Math.floor(h)}h ago`
    if (days < 7) return `${Math.floor(days)}d ago`
    return d.toLocaleDateString()
  }

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await markAsRead({ 
        notificationId: notification._id, 
        userId: notification.userId 
      })
      toast({ title: "Marked as read", description: "Notification marked as read" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark as read", variant: "destructive" })
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteNotification({ 
        notificationId: notification._id, 
        userId: notification.userId 
      })
      toast({ title: "Deleted", description: "Notification deleted" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" })
    }
  }

  const handleSnooze = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement snooze functionality
    toast({ title: "Snoozed", description: "Notification snoozed for 1 hour" })
  }

  const getEntityBadge = () => {
    if (notification.itemId) {
      return <Badge variant="outline" className="text-xs">Item</Badge>
    }
    if (notification.orderId) {
      return <Badge variant="outline" className="text-xs">Order</Badge>
    }
    if (notification.workflowId) {
      return <Badge variant="outline" className="text-xs">Workflow</Badge>
    }
    return null
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
          notification.isRead ? "bg-gray-50" : "bg-blue-50",
          "hover:bg-gray-100"
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={cn("w-2 h-2 rounded-full", severityColor)} />
          <IconComponent className="h-4 w-4 text-gray-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{notification.title}</p>
              <p className="text-xs text-gray-500 truncate">{notification.message}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {getEntityBadge()}
              <span className="text-xs text-gray-400">{formatTimestamp(notification.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border transition-colors",
        notification.isRead ? "bg-white" : "bg-blue-50 border-blue-200",
        "hover:bg-gray-50"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={cn("w-3 h-3 rounded-full", severityColor)} />
        <IconComponent className="h-5 w-5 text-gray-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold truncate">{notification.title}</h4>
              {getEntityBadge()}
            </div>
            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(notification.createdAt)}
              </span>
              {notification.priority && (
                <Badge 
                  variant={notification.priority === "urgent" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {notification.priority}
                </Badge>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSnooze}>
                    <Snooze className="h-4 w-4 mr-2" />
                    Snooze
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
