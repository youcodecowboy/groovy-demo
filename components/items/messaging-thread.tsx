"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Send, 
  User,
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
  attachments?: string[]
}

interface MessagingThreadProps {
  messages: Message[]
  onSendMessage?: (text: string, recipients: string[]) => Promise<void>
  currentUser?: string
  itemId: string
}

export function MessagingThread({ 
  messages, 
  onSendMessage, 
  currentUser = "admin@demo",
  itemId
}: MessagingThreadProps) {
  const { toast } = useToast()
  const [newMessage, setNewMessage] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      await onSendMessage?.(newMessage.trim(), selectedRecipients)
      setNewMessage("")
      setSelectedRecipients([])
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMessageTypeColor = (type: Message['type']) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'alert': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAuthorInitials = (author: string) => {
    return author.split('@')[0].substring(0, 2).toUpperCase()
  }

  const toggleRecipient = (recipient: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipient) 
        ? prev.filter(r => r !== recipient)
        : [...prev, recipient]
    )
  }

  // Mock recipients - in real app this would come from the system
  const availableRecipients = [
    { id: 'floor@demo', name: 'Floor Team' },
    { id: 'qc@demo', name: 'QC Team' },
    { id: 'admin@demo', name: 'Admin Team' },
    { id: 'shipping@demo', name: 'Shipping Team' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messaging Thread
          <Badge variant="outline" className="ml-auto">
            {messages.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getAuthorInitials(message.author)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.author.split('@')[0]}
                    </span>
                    {message.type !== 'user' && (
                      <Badge className={`text-xs ${getMessageTypeColor(message.type)}`}>
                        {message.type}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {message.text}
                  </div>
                  
                  {message.recipients && message.recipients.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      To: {message.recipients.join(', ')}
                    </div>
                  )}
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {message.attachments.map((attachment, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          📎 {attachment}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No messages yet</h4>
              <p className="text-gray-600">Start a conversation about this item</p>
            </div>
          )}
        </div>

        {/* Message Composer */}
        <div className="border-t pt-4">
          <div className="space-y-3">
            {/* Recipients */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Recipients
              </label>
              <div className="flex flex-wrap gap-2">
                {availableRecipients.map((recipient) => (
                  <Button
                    key={recipient.id}
                    variant={selectedRecipients.includes(recipient.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleRecipient(recipient.id)}
                    className="h-6 text-xs"
                  >
                    {recipient.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] resize-none"
                disabled={isSending}
              />
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      // Add QR link to message
                      const qrLink = `QR: ${itemId}`
                      setNewMessage(prev => prev + (prev ? '\n' : '') + qrLink)
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    Add QR
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending || selectedRecipients.length === 0}
                    size="sm"
                    className="h-8"
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
