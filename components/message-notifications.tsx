"use client"

import { useEffect, useRef } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"

interface MessageNotificationsProps {
  currentUserId: string
}

export function MessageNotifications({ currentUserId }: MessageNotificationsProps) {
  const { toast } = useToast()
  const previousUnreadCount = useRef<number>(0)
  const previousMessages = useRef<string[]>([])

  // Get unread count and recent unread messages
  const unreadCount = useQuery(api.messages.getUnreadCount, { userId: currentUserId })
  const recentUnreadMessages = useQuery(api.messages.getRecentUnreadMessages, { 
    userId: currentUserId, 
    limit: 5 
  })

  useEffect(() => {
    // Check if we have new unread messages
    if (unreadCount !== undefined && recentUnreadMessages !== undefined) {
      const currentUnreadCount = unreadCount
      const currentMessageIds = recentUnreadMessages.map(msg => msg._id)

      // If unread count increased and we have new messages
      if (currentUnreadCount > previousUnreadCount.current && recentUnreadMessages.length > 0) {
        // Find new messages (not in previous list)
        const newMessages = recentUnreadMessages.filter(msg => 
          !previousMessages.current.includes(msg._id)
        )

        // Show toast for each new message
        newMessages.forEach(message => {
          const senderName = message.senderId === "admin@demo" ? "Admin" : "Floor Worker"
          
          toast({
            title: "New Message",
            description: `You have a new message from ${senderName}`,
            duration: 4000,
          })
        })
      }

      // Update refs
      previousUnreadCount.current = currentUnreadCount
      previousMessages.current = currentMessageIds
    }
  }, [unreadCount, recentUnreadMessages, toast])

  // This component doesn't render anything, it just handles notifications
  return null
} 