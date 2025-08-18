"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Send, 
  Clock,
  Plus,
  QrCode
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  text: string
  author: string
  timestamp: number
  type: 'user' | 'system' | 'alert'
  recipients?: string[]
}

interface DiscoMessagingProps {
  messages: Message[]
  onSendMessage?: (text: string, recipients: string[]) => Promise<void>
  currentUser?: string
  itemId: string
}

export function DiscoMessaging({ 
  messages, 
  onSendMessage, 
  currentUser = "disco-user",
  itemId
}: DiscoMessagingProps) {
  const { toast } = useToast()
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      await onSendMessage?.(newMessage.trim(), ['admin@demo']) // Default to admin
      setNewMessage("")
      setShowAddForm(false)
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      })
    } catch (error) {
      toast({
        title: "Send failed",
        description: "Could not send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMessageTypeColor = (type: Message['type']) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800'
      case 'alert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const addQRToMessage = () => {
    const qrLink = `QR: ${itemId}`
    setNewMessage(prev => prev + (prev ? '\n' : '') + qrLink)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Messages
          <Badge variant="outline" className="ml-auto text-xs">
            {messages.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {message.author.split('@')[0]}
                  </span>
                  {message.type !== 'user' && (
                    <Badge className={`text-xs ${getMessageTypeColor(message.type)}`}>
                      {message.type}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700">
                  {message.text}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-600">No messages yet</p>
            </div>
          )}
        </div>

        {/* Add Message Section */}
        {showAddForm ? (
          <div className="space-y-3 border-t pt-4">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isSending}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addQRToMessage}
                className="flex-1"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Add QR
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewMessage("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                size="sm"
                className="flex-1"
              >
                {isSending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
