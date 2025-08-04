"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Send, User,
    Bot,
    Clock,
    CheckCheck, Package,
    X,
    ChevronDown,
    Mail,
    Paperclip
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MessageNotifications } from "@/components/message-notifications"

interface Message {
  _id: string
  senderId: string
  content: string
  createdAt: number
  isRead: boolean
  recipientId: string
  messageType: string
  subject?: string
  attachedItemId?: string
}

interface User {
  _id: string
  email: string
  name: string
  role: string
}

interface Item {
  _id: string
  itemId: string
  currentStageId: string
  status: string
  metadata?: any
}

export function AdminMessages() {
  const { toast } = useToast()
  const [selectedView, setSelectedView] = useState<"compose" | "inbox">("compose")
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [messageBody, setMessageBody] = useState("")
  const [attachedItemId, setAttachedItemId] = useState<string>("")
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false)
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [quickReplyMessage, setQuickReplyMessage] = useState("")
  const [quickReplyAttachedItemId, setQuickReplyAttachedItemId] = useState("")
  
  // Mutations
  const sendMessage = useMutation(api.messages.send)
  const createTestUsers = useMutation(api.seed.createTestUsers)
  
  // Queries
  const users = useQuery(api.users.getAll)
  const items = useQuery(api.items.getAll)
  const conversations = useQuery(api.messages.getConversations, { userId: "admin@demo" })
  const messages = useQuery(api.messages.getConversation, {
    userId: "admin@demo",
    otherUserId: selectedRecipient || "floor@demo"
  })
  
  const unreadCount = useQuery(api.messages.getUnreadCount, {
    userId: "admin@demo"
  })

  // Debug logging
  console.log("Users loaded:", users)
  console.log("Users count:", users?.length)
  console.log("Users data:", users?.map(u => ({ email: u.email, name: u.name, role: u.role })))

  // Filter users based on search
  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Filter items based on search
  const filteredItems = items?.filter(item => 
    item.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.metadata?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.metadata?.color?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleCreateTestUsers = async () => {
    try {
      const result = await createTestUsers()
      console.log("Create test users result:", result)
      toast({
        title: "Test Users Created",
        description: `Admin and floor users have been created. Admin: ${result.adminExists ? 'exists' : 'created'}, Floor: ${result.floorExists ? 'exists' : 'created'}`,
      })
    } catch (error) {
      console.error("Error creating test users:", error)
      toast({
        title: "Error",
        description: "Failed to create test users",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    if (!selectedRecipient || !messageBody.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a recipient and enter a message",
        variant: "destructive"
      })
      return
    }

    try {
      await sendMessage({
        senderId: "admin@demo",
        recipientId: selectedRecipient,
        content: JSON.stringify({
          subject: subject || "No Subject",
          body: messageBody,
          attachedItemId: attachedItemId || null
        }),
      })

      // Reset form
      setSelectedRecipient("")
      setSubject("")
      setMessageBody("")
      setAttachedItemId("")
      
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

  const handleSendQuickReply = async () => {
    if (!quickReplyMessage.trim() || !selectedRecipient) return

    try {
      await sendMessage({
        senderId: "admin@demo",
        recipientId: selectedRecipient,
        content: JSON.stringify({
          subject: "Quick Reply",
          body: quickReplyMessage.trim(),
          attachedItemId: quickReplyAttachedItemId || null
        }),
      })

      setQuickReplyMessage("")
      setQuickReplyAttachedItemId("")
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
    return message.senderId === "admin@demo"
  }

  const parseMessageContent = (content: string) => {
    try {
      return JSON.parse(content)
    } catch {
      return { subject: "No Subject", body: content, attachedItemId: null }
    }
  }

  const getSelectedUser = () => {
    return users?.find(user => user.email === selectedRecipient)
  }

  const getAttachedItem = () => {
    return items?.find(item => item._id === attachedItemId)
  }

  return (
    <Card className="w-full max-w-4xl">
      <MessageNotifications currentUserId="admin@demo" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Admin Messaging Suite
            {unreadCount && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {(!users || users.length === 0) && (
            <Button 
              size="sm" 
              onClick={handleCreateTestUsers}
              variant="outline"
            >
              Create Test Users
            </Button>
          )}
          
          <div className="flex gap-2">
            <Button
              variant={selectedView === "compose" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedView("compose")}
            >
              Compose
            </Button>
            <Button
              variant={selectedView === "inbox" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedView("inbox")}
            >
              Inbox
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {selectedView === "compose" ? (
          /* Compose View */
          <div className="space-y-4">
            {/* To Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To:</label>
              <Popover open={isUserPopoverOpen} onOpenChange={setIsUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isUserPopoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedRecipient ? getSelectedUser()?.name || selectedRecipient : "Select recipient..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search users..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {users && users.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-2">No users found</p>
                            <Button 
                              size="sm" 
                              onClick={handleCreateTestUsers}
                              variant="outline"
                            >
                              Create Test Users
                            </Button>
                          </div>
                        ) : (
                          "No users found."
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredUsers.map((user) => (
                          <CommandItem
                            key={user._id}
                            value={user.email}
                            onSelect={() => {
                              setSelectedRecipient(user.email)
                              setIsUserPopoverOpen(false)
                              setSearchQuery("")
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {user.name?.charAt(0) || user.email.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name || user.email}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject:</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject..."
              />
            </div>

            {/* Attach Item Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Attach Item (Optional):</label>
              <Popover open={isItemPopoverOpen} onOpenChange={setIsItemPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isItemPopoverOpen}
                    className="w-full justify-between"
                  >
                    {attachedItemId ? getAttachedItem()?.itemId : "Search and attach item..."}
                    <Paperclip className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search items..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No items found.</CommandEmpty>
                      <CommandGroup>
                        {filteredItems.map((item) => (
                          <CommandItem
                            key={item._id}
                            value={item.itemId}
                            onSelect={() => {
                              setAttachedItemId(item._id)
                              setIsItemPopoverOpen(false)
                              setSearchQuery("")
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-500" />
                              <div>
                                <div className="font-medium">{item.itemId}</div>
                                <div className="text-xs text-gray-500">
                                  {item.metadata?.brand} {item.metadata?.color} | {item.status}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Attached Item Display */}
            {attachedItemId && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Package className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">{getAttachedItem()?.itemId}</div>
                  <div className="text-xs text-gray-600">
                    {getAttachedItem()?.metadata?.brand} {getAttachedItem()?.metadata?.color}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachedItemId("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Message Body */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message:</label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[200px]"
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSendMessage}
                disabled={!selectedRecipient || !messageBody.trim()}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </div>
          </div>
        ) : (
          /* Inbox View */
          <div className="space-y-4">
            {/* Recipient Selector for Inbox */}
            <div className="flex gap-2">
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select conversation..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user._id} value={user.email}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-green-500 text-white">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || user.email}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Messages Area */}
            <ScrollArea className="h-72 border rounded-lg p-4">
              <div className="space-y-4">
                {messages?.map((message) => {
                  const parsedContent = parseMessageContent(message.content)
                  return (
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
                          {/* Subject */}
                          {parsedContent.subject && (
                            <div className="font-semibold text-sm mb-1">
                              {parsedContent.subject}
                            </div>
                          )}
                          
                          {/* Body */}
                          <div className="text-sm">{parsedContent.body}</div>
                          
                          {/* Attached Item */}
                          {parsedContent.attachedItemId && (
                            <div className="mt-2 p-2 bg-white/20 rounded border border-white/30">
                              <div className="flex items-center gap-2">
                                <Package className="w-3 h-3" />
                                <span className="text-xs font-medium">
                                  Item: {items?.find(i => i._id === parsedContent.attachedItemId)?.itemId}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Timestamp */}
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
                  )
                })}
              </div>
            </ScrollArea>

            {/* Message Input Area */}
            <div className="border-t bg-white">
              {/* Attachment Control Panel */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 border-b">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Paperclip className="w-4 h-4 mr-1" />
                      Attach Item
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <Command>
                      <CommandInput placeholder="Search items..." />
                      <CommandList>
                        <CommandEmpty>No items found.</CommandEmpty>
                        <CommandGroup>
                          {items?.map((item) => (
                            <CommandItem
                              key={item._id}
                              value={item.itemId}
                              onSelect={() => {
                                setQuickReplyAttachedItemId(item._id)
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-500" />
                                <div>
                                  <div className="font-medium">{item.itemId}</div>
                                  <div className="text-xs text-gray-500">
                                    {item.metadata?.brand} {item.metadata?.color} | {item.status}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Attached Item Display */}
              {quickReplyAttachedItemId && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg m-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">{items?.find(i => i._id === quickReplyAttachedItemId)?.itemId}</div>
                    <div className="text-xs text-gray-600">
                      {items?.find(i => i._id === quickReplyAttachedItemId)?.metadata?.brand} {items?.find(i => i._id === quickReplyAttachedItemId)?.metadata?.color}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuickReplyAttachedItemId("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-2 p-2">
                <Input
                  value={quickReplyMessage}
                  onChange={(e) => setQuickReplyMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendQuickReply()
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendQuickReply}
                  disabled={!quickReplyMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 