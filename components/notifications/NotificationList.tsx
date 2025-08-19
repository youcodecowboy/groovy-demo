"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CheckCheck, Trash2, SelectAll, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/components/ui/mock-auth-components"
import { NotificationRow } from "./NotificationRow"
import { NotificationFilters } from "./NotificationFilters"
import { useRouter } from "next/navigation"

interface NotificationListProps {
  filters?: {
    search: string
    kinds: string[]
    severity: string
    unreadOnly: boolean
    dateFrom: Date | undefined
    dateTo: Date | undefined
  }
}

export function NotificationList({ filters: initialFilters }: NotificationListProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const router = useRouter()
  
  const [filters, setFilters] = useState(initialFilters || {
    search: "",
    kinds: [],
    severity: "",
    unreadOnly: false,
    dateFrom: undefined,
    dateTo: undefined,
  })
  
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const currentUserId = user?.emailAddresses?.[0]?.emailAddress || ""
  const isAuthed = currentUserId.length > 0

  const notifications = useQuery(
    api.notifications.getNotifications,
    isAuthed ? { userId: currentUserId } : ("skip" as any)
  )

  const markAsRead = useMutation(api.notifications.markNotificationAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead)

  // Filter notifications based on current filters
  const filteredNotifications = useMemo(() => {
    if (!notifications) return []

    return notifications.filter((notification) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Kind filter
      if (filters.kinds.length > 0) {
        if (!filters.kinds.includes(notification.type)) return false
      }

      // Severity filter
      if (filters.severity) {
        if (notification.priority !== filters.severity) return false
      }

      // Unread only filter
      if (filters.unreadOnly && notification.isRead) return false

      // Date range filter
      if (filters.dateFrom) {
        const notificationDate = new Date(notification.createdAt)
        if (notificationDate < filters.dateFrom) return false
      }

      if (filters.dateTo) {
        const notificationDate = new Date(notification.createdAt)
        const endOfDay = new Date(filters.dateTo)
        endOfDay.setHours(23, 59, 59, 999)
        if (notificationDate > endOfDay) return false
      }

      return true
    })
  }, [notifications, filters])

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead({ 
        notificationId: notification._id, 
        userId: notification.userId 
      })
    }

    // Navigate to the source entity
    if (notification.itemId) {
      router.push(`/app/items/${notification.itemId}`)
    } else if (notification.orderId) {
      router.push(`/app/orders/${notification.orderId}`)
    } else if (notification.workflowId) {
      router.push(`/app/workflows/${notification.workflowId}`)
    } else {
      // Default to messages page
      router.push("/app/messages")
    }
  }

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId])
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(filteredNotifications.map(n => n._id))
      setSelectAll(true)
    } else {
      setSelectedNotifications([])
      setSelectAll(false)
    }
  }

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return

    try {
      for (const notificationId of selectedNotifications) {
        await markAsRead({ 
          notificationId, 
          userId: currentUserId 
        })
      }
      setSelectedNotifications([])
      setSelectAll(false)
      toast({ title: "Marked as read", description: `${selectedNotifications.length} notifications marked as read` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark notifications as read", variant: "destructive" })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return

    try {
      for (const notificationId of selectedNotifications) {
        await deleteNotification({ 
          notificationId, 
          userId: currentUserId 
        })
      }
      setSelectedNotifications([])
      setSelectAll(false)
      toast({ title: "Deleted", description: `${selectedNotifications.length} notifications deleted` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete notifications", variant: "destructive" })
    }
  }

  const clearSelection = () => {
    setSelectedNotifications([])
    setSelectAll(false)
  }

  if (!isAuthed) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to view notifications.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <NotificationFilters filters={filters} onFiltersChange={setFilters} />

      {/* Bulk actions */}
      {selectedNotifications.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedNotifications.length} selected
            </span>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkMarkAsRead}
              className="flex items-center gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Mark as read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="border rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm font-medium">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredNotifications.filter(n => !n.isRead).length} unread
            </Badge>
          </div>
        </div>

        {/* List */}
        <ScrollArea className="max-h-96">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div key={notification._id} className="relative">
                  <div className="flex items-start gap-3 p-4">
                    <Checkbox
                      checked={selectedNotifications.includes(notification._id)}
                      onCheckedChange={(checked) => 
                        handleSelectNotification(notification._id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <NotificationRow
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        showActions={true}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-sm">
                {filters.search || filters.kinds.length > 0 || filters.severity || filters.unreadOnly || filters.dateFrom || filters.dateTo
                  ? "No notifications match your current filters."
                  : "You're all caught up! No notifications to show."
                }
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
