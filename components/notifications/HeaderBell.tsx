"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Bell, CheckCheck, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/components/ui/mock-auth-components"
import { NotificationRow } from "./NotificationRow"
import { useRouter } from "next/navigation"

export function HeaderBell() {
  const { toast } = useToast()
  const { user } = useUser()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const currentUserId = user?.emailAddresses?.[0]?.emailAddress || ""
  const isAuthed = currentUserId.length > 0

  const unreadCount = useQuery(
    api.notifications.getUnreadNotificationCount,
    isAuthed ? { userId: currentUserId } : ("skip" as any)
  )

  const recentNotifications = useQuery(
    api.notifications.getNotifications,
    isAuthed ? { userId: currentUserId, limit: 10 } : ("skip" as any)
  )

  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead)

  const handleMarkAllAsRead = async () => {
    if (!isAuthed) return
    
    try {
      await markAllAsRead({ userId: currentUserId })
      toast({ title: "Marked all as read", description: "All notifications have been marked as read" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark notifications as read", variant: "destructive" })
    }
  }

  const handleViewAllNotifications = () => {
    setIsOpen(false)
    router.push("/app/messages?tab=notifications")
  }

  const handleNotificationClick = (notification: any) => {
    setIsOpen(false)
    
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

  const displayCount = unreadCount || 0
  const badgeText = displayCount > 9 ? "9+" : displayCount.toString()

  if (!isAuthed) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="h-5 w-5" />
          {displayCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
            >
              {badgeText}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={displayCount === 0}
            className="h-8 px-2"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
        
        <ScrollArea className="max-h-96">
          {recentNotifications && recentNotifications.length > 0 ? (
            <div className="p-2">
              {recentNotifications.map((notification) => (
                <div key={notification._id} className="mb-2">
                  <NotificationRow
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    compact
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </ScrollArea>
        
        {recentNotifications && recentNotifications.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAllNotifications}
              className="w-full"
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
