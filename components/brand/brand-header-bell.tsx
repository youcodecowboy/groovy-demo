'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandNotification } from '@/lib/brand-mock-data'
import { formatDistanceToNow } from 'date-fns'

const notificationTypeLabels = {
  'order.status': 'Order Update',
  'message.inbound': 'New Message',
  'shipment.update': 'Shipment Update',
  'invoice.issued': 'Invoice Issued',
  'sample.status': 'Sample Update'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800'
}

export function BrandHeaderBell() {
  const [notifications, setNotifications] = useState<BrandNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      const allNotifications = await brandAdapter.getNotifications()
      const unread = await brandAdapter.getNotifications(true)
      setNotifications(allNotifications)
      setUnreadCount(unread.length)
    }

    loadNotifications()

    // Simulate real-time updates
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = async (notification: BrandNotification) => {
    if (!notification.isRead) {
      await brandAdapter.markNotificationAsRead(notification.id)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      )
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600">{unreadCount} unread</p>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {notificationTypeLabels[notification.type]}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${priorityColors[notification.priority]}`}
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {notifications.length > 10 && (
          <div className="border-t p-3">
            <Button variant="ghost" size="sm" className="w-full">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
