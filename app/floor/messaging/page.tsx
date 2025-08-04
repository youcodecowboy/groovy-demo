"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FactoryHeader } from "@/components/factory/factory-header"
import { FactoryFooter } from "@/components/factory/factory-footer"
import { MessageNotifications } from "@/components/message-notifications"
import {
    Send, User,
    Bot,
    Clock,
    CheckCheck,
    Search,
    Package,
    X,
    ChevronDown,
    Mail,
    Paperclip,
    Plus,
    Inbox
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Message {
  _id: string
  senderId: string
  content: string
  createdAt: number
  isRead: boolean
  recipientId: string
  messageType: string
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

export default function FloorMessagingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedView, setSelectedView] = useState<"compose" | "inbox">("inbox")
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [messageBody, setMessageBody] = useState("")
  const [attachedItemId, setAttachedItemId] = useState<string>("")
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false)
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [quickReplyAttachedItemId, setQuickReplyAttachedItemId] = useState("")

  // Get itemId from URL params if present
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const itemIdFromUrl = searchParams.get('itemId')
  
  // Set attached item if provided in URL
  useEffect(() => {
    if (itemIdFromUrl) {
      setAttachedItemId(itemIdFromUrl)
      setSelectedView("compose")
      setSelectedRecipient("admin@demo") // Default to admin
    }
  }, [itemIdFromUrl])
  
  const currentUserId = "floor@demo"
  
  // Mutations
  const sendMessage = useMutation(api.messages.send)
  
  // Queries
  const users = useQuery(api.users.getAll)
  const items = useQuery(api.items.getAll)
  const conversations = useQuery(api.messages.getConversations, { userId: currentUserId })
  const messages = useQuery(api.messages.getConversation, {
    userId: currentUserId,
    otherUserId: selectedRecipient || "admin@demo"
  })
  
  const unreadCount = useQuery(api.messages.getUnreadCount, {
    userId: currentUserId
  })

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
        senderId: currentUserId,
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

  const handleSendQuickMessage = async () => {
    if (!newMessage.trim() || !selectedRecipient) return

    try {
      await sendMessage({
        senderId: currentUserId,
        recipientId: selectedRecipient,
        content: JSON.stringify({
          subject: "Quick Message",
          body: newMessage.trim(),
          attachedItemId: quickReplyAttachedItemId || null
        }),
      })

      setNewMessage("")
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendQuickMessage()
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

  const handleItemClick = (itemId: string) => {
    if (!itemId) {
      toast({
        title: "Error",
        description: "Item ID not found",
        variant: "destructive",
      })
      return
    }
    
    console.log("Navigating to item:", itemId)
    router.push(`/floor/items/${itemId}`)
  }

  // Mark messages as read when conversation is opened
  const markAsRead = useMutation(api.messages.markAsRead)
  
  const handleConversationSelect = (recipientId: string) => {
    setSelectedRecipient(recipientId)
    setSelectedView("inbox")
    
    // Mark unread messages as read
    if (messages && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => msg.recipientId === currentUserId && !msg.isRead)
        .map(msg => msg._id)
      
      if (unreadMessageIds.length > 0) {
        markAsRead({ messageIds: unreadMessageIds })
      }
    }
  }

  const handleScan = async (data: string) => {
    router.push(`/floor/items/${data}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MessageNotifications currentUserId={currentUserId} />
      <FactoryHeader />
      <div className="container mx-auto px-4 py-6">
        <div className="flex h-[calc(100vh-200px)]">
          {/* Sidebar - Conversations List */}
          <div className="w-80 border-r bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Messages
                  {unreadCount && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </h2>
                <Button
                  size="sm"
                  onClick={() => setSelectedView("compose")}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-2">
                {conversations?.map((conversation) => (
                  <div
                    key={conversation.otherUserId}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedRecipient === conversation.otherUserId
                        ? "bg-blue-100 border-blue-200"
                        : conversation.unreadCount > 0
                          ? "bg-red-50 border-red-200 hover:bg-red-100"
                          : "hover:bg-gray-100 border-transparent"
                    }`}
                    onClick={() => handleConversationSelect(conversation.otherUserId)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-green-500 text-white">
                          {conversation.otherUserId.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {conversation.otherUserId}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {parseMessageContent(conversation.lastMessage.content).subject || "No Subject"}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col ml-6">
            {selectedView === "compose" ? (
              /* Compose View */
              <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Compose Message
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedView("inbox")}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-6">
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
                            <CommandEmpty>No users found.</CommandEmpty>
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
              </div>
            ) : (
              /* Inbox View */
              <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Inbox className="w-5 h-5" />
                      Inbox
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedView("compose")}
                    >
                      Compose
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  {selectedRecipient ? (
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
                      <ScrollArea className="h-96 border rounded-lg p-4">
                        <div className="space-y-4">
                          {messages?.map((message) => {
                            const parsedContent = parseMessageContent(message.content)
                            const isOwnMessage = message.senderId === currentUserId
                            return (
                              <div
                                key={message._id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
                                  isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                                }`}>
                                  {/* Avatar */}
                                  <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarFallback className={`${getSenderColor(message.senderId)} text-white`}>
                                      {getSenderAvatar(message.senderId)}
                                    </AvatarFallback>
                                  </Avatar>

                                  {/* Message Bubble */}
                                  <div className={`rounded-lg px-3 py-2 ${
                                    isOwnMessage 
                                      ? 'bg-green-500 text-white' 
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
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const item = items?.find(i => i._id === parsedContent.attachedItemId)
                                              console.log("Attached item:", item)
                                              console.log("Item ID to navigate to:", item?.itemId)
                                              handleItemClick(item?.itemId || '')
                                            }}
                                            className="text-xs p-1 h-auto"
                                          >
                                            View
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Timestamp */}
                                    <div className={`flex items-center gap-1 mt-1 ${
                                      isOwnMessage ? 'text-green-100' : 'text-gray-500'
                                    }`}>
                                      <Clock className="w-3 h-3" />
                                      <span className="text-xs">{formatTime(message.createdAt)}</span>
                                      {isOwnMessage && (
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
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleSendQuickMessage}
                            disabled={!newMessage.trim()}
                            size="sm"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Mail className="w-16 h-16 text-gray-300 mx-auto" />
                        <h3 className="text-lg font-semibold text-gray-600">No Conversation Selected</h3>
                        <p className="text-gray-500">Select a conversation from the sidebar or compose a new message.</p>
                        <Button onClick={() => setSelectedView("compose")}>
                          <Plus className="w-4 h-4 mr-2" />
                          Compose Message
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FactoryFooter onScan={handleScan} />
    </div>
  )
} 