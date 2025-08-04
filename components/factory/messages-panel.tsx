"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Send,
    MessageSquare,
    User,
    Bot,
    Clock, CheckCheck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MessagesPanelProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}

interface Message {
  _id: string
  senderId: string
  content: string
  createdAt: number
  isRead: boolean
  recipientId: string
  messageType: string
}

export function MessagesPanel({ isOpen, onClose, currentUserId }: MessagesPanelProps) {
  const { toast } = useToast()
  const [newMessage, setNewMessage] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState<string>("admin@demo")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Mutations
  const sendMessage = useMutation(api.messages.send)
  const markAsRead = useMutation(api.messages.markAsRead)
  
  // Queries
  const messages = useQuery(api.messages.getConversation, {
    userId: currentUserId,
    otherUserId: selectedRecipient
  })
  
  const unreadCount = useQuery(api.messages.getUnreadCount, {
    userId: currentUserId
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      await sendMessage({
        senderId: currentUserId,
        recipientId: selectedRecipient,
        content: newMessage.trim(),
      })

      setNewMessage("")
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      })
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    const diffInHours = diffInMinutes / 60
    const diffInDays = diffInHours / 24
    
    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getSenderAvatar = (senderId: string) => {
    if (senderId === "admin@demo") {
      return <Bot className="w-4 h-4" />
    }
    return <User className="w-4 h-4" />
  }

  const getSenderColor = (senderId: string) => {
    return senderId === "admin@demo" ? "bg-blue-500" : "bg-green-500"
  }

  const isOwnMessage = (message: Message) => {
    return message.senderId === currentUserId
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
                {unreadCount && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
            
            {/* Recipient Selector */}
            <div className="flex gap-2 mt-2">
              <Button
                variant={selectedRecipient === "admin@demo" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRecipient("admin@demo")}
                className="flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Admin
              </Button>
              <Button
                variant={selectedRecipient === "floor@demo" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRecipient("floor@demo")}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Floor
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages?.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
                      isOwnMessage(message) ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      {/* Avatar */}
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={`${getSenderColor(message.senderId)} text-white`}>
                          {getSenderAvatar(message.senderId)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Message Bubble */}
                      <div className={`rounded-lg px-3 py-2 ${
                        isOwnMessage(message) 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm">{message.content}</div>
                        <div className={`flex items-center gap-1 mt-1 ${
                          isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{formatTime(message.createdAt)}</span>
                          {isOwnMessage(message) && (
                            <CheckCheck className="w-3 h-3 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 