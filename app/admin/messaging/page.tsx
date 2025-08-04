"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { MessageNotifications } from "@/components/message-notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Send, Search,
    Plus, Mail, Paperclip,
    Package, ChevronDown,
    X,
    Clock,
    CheckCheck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function MessagingPage() {
  const { toast } = useToast()
  const [view, setView] = useState<"inbox" | "compose">("inbox")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipient: "",
    subject: "",
    message: "",
    attachedItemId: "",
    attachedTaskId: ""
  })
  const [quickReplyMessage, setQuickReplyMessage] = useState("")
  const [quickReplyAttachedItemId, setQuickReplyAttachedItemId] = useState("")

  const currentUserId = "admin@demo"

  // Fetch data
  const conversations = useQuery(api.messages.getConversations, { userId: currentUserId })
  const users = useQuery(api.users.getAll)
  const items = useQuery(api.items.getAll)
  const messages = useQuery(
    api.messages.getConversation, 
    selectedConversation 
      ? { userId: currentUserId, otherUserId: selectedConversation }
      : "skip"
  )

  // Mutations
  const sendMessage = useMutation(api.messages.send)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!composeForm.recipient || !composeForm.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a recipient and enter a message",
        variant: "destructive"
      })
      return
    }

    try {
      const messageContent = JSON.stringify({
        subject: composeForm.subject || "No Subject",
        body: composeForm.message,
        attachedItemId: composeForm.attachedItemId || null,
        attachedTaskId: composeForm.attachedTaskId || null
      })

      await sendMessage({
        senderId: currentUserId,
        recipientId: composeForm.recipient,
        content: messageContent,
      })

      // Reset form
      setComposeForm({
        recipient: "",
        subject: "",
        message: "",
        attachedItemId: "",
        attachedTaskId: ""
      })

      // Switch back to inbox
      setView("inbox")
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const handleSendQuickReply = async () => {
    if (!quickReplyMessage.trim() || !selectedConversation) return

    try {
      const messageContent = JSON.stringify({
        subject: "Quick Reply",
        body: quickReplyMessage.trim(),
        attachedItemId: quickReplyAttachedItemId || null,
        attachedTaskId: null
      })

      await sendMessage({
        senderId: currentUserId,
        recipientId: selectedConversation,
        content: messageContent,
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

  const formatTimestamp = (timestamp: number) => {
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

  const parseMessageContent = (content: string) => {
    try {
      return JSON.parse(content)
    } catch {
      return { subject: "No Subject", body: content, attachedItemId: null, attachedTaskId: null }
    }
  }

  const getSelectedUser = () => {
    return users?.find(user => user.email === composeForm.recipient)
  }

  const getAttachedItem = () => {
    return items?.find(item => item._id === composeForm.attachedItemId)
  }

  // Mark messages as read when conversation is opened
  const markAsRead = useMutation(api.messages.markAsRead)
  
  const handleConversationSelect = (recipientId: string) => {
    setSelectedConversation(recipientId)
    setView("inbox")
    
    // Mark unread messages as read
    if (messages && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => msg.recipientId === "admin@demo" && !msg.isRead)
        .map(msg => msg._id)
      
      if (unreadMessageIds.length > 0) {
        markAsRead({ messageIds: unreadMessageIds })
      }
    }
  }

  const filteredConversations = conversations?.filter(conversation => {
    if (!searchQuery) return true
    return conversation.otherUserId.toLowerCase().includes(searchQuery.toLowerCase())
  }) || []

  const selectedConversationData = conversations?.find(c => c.otherUserId === selectedConversation)

  return (
    <AdminSidebar>
      <MessageNotifications currentUserId="admin@demo" />
      <div className="flex-1 h-screen flex">
        {/* Sidebar - Conversations List */}
        <div className="w-80 border-r bg-gray-50/50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button
                size="sm"
                onClick={() => setView("compose")}
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
          
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.otherUserId}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedConversation === conversation.otherUserId
                      ? "bg-blue-100 border-blue-200"
                      : conversation.unreadCount > 0
                        ? "bg-red-50 border-red-200 hover:bg-red-100"
                        : "hover:bg-gray-100 border-transparent"
                  }`}
                  onClick={() => handleConversationSelect(conversation.otherUserId)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {conversation.otherUserId.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {conversation.otherUserId}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.lastMessage.createdAt)}
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
        <div className="flex-1 flex flex-col">
          {view === "compose" ? (
            /* Compose View */
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Compose Message
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setView("inbox")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-6 space-y-6">
                {/* To Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">To:</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {composeForm.recipient ? getSelectedUser()?.name || composeForm.recipient : "Select recipient..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandList>
                          <CommandEmpty>No users found.</CommandEmpty>
                          <CommandGroup>
                            {users?.map((user) => (
                              <CommandItem
                                key={user._id}
                                value={user.email}
                                onSelect={() => setComposeForm({...composeForm, recipient: user.email})}
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
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                    placeholder="Enter subject..."
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Attach Item (Optional):</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {composeForm.attachedItemId ? getAttachedItem()?.itemId : "Search and attach item..."}
                          <Paperclip className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search items..." />
                          <CommandList>
                            <CommandEmpty>No items found.</CommandEmpty>
                            <CommandGroup>
                              {items?.map((item) => (
                                <CommandItem
                                  key={item._id}
                                  value={item.itemId}
                                  onSelect={() => setComposeForm({...composeForm, attachedItemId: item._id})}
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
                  {composeForm.attachedItemId && (
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
                        onClick={() => setComposeForm({...composeForm, attachedItemId: ""})}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Message:</label>
                  <Textarea
                    value={composeForm.message}
                    onChange={(e) => setComposeForm({...composeForm, message: e.target.value})}
                    placeholder="Type your message..."
                    className="min-h-[300px] resize-none"
                  />
                </div>

                {/* Send Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!composeForm.recipient || !composeForm.message.trim()}
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
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-green-500 text-white">
                            {selectedConversation.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedConversation}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversationData?.unreadCount || 0} unread messages
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setView("compose")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Message
                      </Button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
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
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className={`${isOwnMessage ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                                  {isOwnMessage ? 'A' : 'U'}
                                </AvatarFallback>
                              </Avatar>

                              <div className={`rounded-lg px-3 py-2 ${
                                isOwnMessage 
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
                                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs">{formatTimestamp(message.createdAt)}</span>
                                  {isOwnMessage && (
                                    <CheckCheck className="w-3 h-3 ml-1" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input Area */}
                  <div className="p-4 border-t bg-white">
                    {/* Attachment Control Panel */}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 border-b rounded-t-lg">
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
                          if (e.key === 'Enter' && !e.shiftKey) {
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
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto" />
                    <h3 className="text-lg font-semibold text-gray-600">No Conversation Selected</h3>
                    <p className="text-gray-500">Select a conversation from the sidebar or compose a new message.</p>
                    <Button onClick={() => setView("compose")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Compose Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  )
} 