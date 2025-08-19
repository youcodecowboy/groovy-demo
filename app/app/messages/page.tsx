"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Search, Plus, Mail, Paperclip, Package, ChevronDown, X, Clock, CheckCheck, Bell, Settings } from "lucide-react"
import { useUser } from "@/components/ui/mock-auth-components"
import { useToast } from "@/hooks/use-toast"
import { NotificationList, NotificationRulesTable, NotificationPrefsForm } from "@/components/notifications"

export default function MessagesPage() {
  const { toast } = useToast()
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [view, setView] = useState<"inbox" | "compose">("inbox")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("threads")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle URL parameter for tab switching
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "notifications" || tab === "rules") {
      setActiveTab(tab)
    }
  }, [searchParams])

  const [composeForm, setComposeForm] = useState({
    recipient: "",
    subject: "",
    message: "",
    attachedItemId: "",
  })
  const [quickReplyMessage, setQuickReplyMessage] = useState("")
  const [quickReplyAttachedItemId, setQuickReplyAttachedItemId] = useState("")

  // Standardize on Clerk identity; until recipients are Clerk-synced, use email string keys
  const currentUserId = user?.emailAddresses?.[0]?.emailAddress || ""
  const isAuthed = currentUserId.length > 0

  const conversations = useQuery(
    api.messages.getConversations,
    isAuthed ? { userId: currentUserId } : ("skip" as any)
  )
  const users = useQuery(api.users.getAll)
  const items = useQuery(api.items.getAll)
  const messages = useQuery(
    api.messages.getMessages,
    selectedConversation && isAuthed ? { userId: currentUserId } : ("skip" as any)
  )

  const sendMessage = useMutation(api.messages.createMessage)
  const markAsRead = useMutation(api.messages.markMessageAsRead)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const handleSendMessage = async () => {
    if (!composeForm.recipient || !composeForm.message.trim()) {
      toast({ title: "Missing Information", description: "Select a recipient and enter a message", variant: "destructive" })
      return
    }
    const messageContent = JSON.stringify({ subject: composeForm.subject || "No Subject", body: composeForm.message, attachedItemId: composeForm.attachedItemId || null })
    await sendMessage({ 
      senderId: currentUserId, 
      recipientIds: [composeForm.recipient], 
      content: messageContent,
      priority: "medium"
    })
    setComposeForm({ recipient: "", subject: "", message: "", attachedItemId: "" })
    setView("inbox")
    toast({ title: "Message sent", description: "Your message has been sent" })
  }

  const handleSendQuickReply = async () => {
    if (!quickReplyMessage.trim() || !selectedConversation) return
    const messageContent = JSON.stringify({ subject: "Quick Reply", body: quickReplyMessage.trim(), attachedItemId: quickReplyAttachedItemId || null })
    await sendMessage({ 
      senderId: currentUserId, 
      recipientIds: [selectedConversation], 
      content: messageContent,
      priority: "medium"
    })
    setQuickReplyMessage("")
    setQuickReplyAttachedItemId("")
    toast({ title: "Message sent", description: "Your message has been sent" })
  }

  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp); const now = new Date(); const m = (now.getTime() - d.getTime()) / 60000; const h = m / 60; const days = h / 24
    if (m < 1) return "Just now"; if (m < 60) return `${Math.floor(m)}m ago`; if (h < 24) return `${Math.floor(h)}h ago`; if (days < 7) return `${Math.floor(days)}d ago`; return d.toLocaleDateString()
  }

  const parseMessageContent = (content: string) => { try { return JSON.parse(content) } catch { return { subject: "No Subject", body: content, attachedItemId: null } } }
  const getSelectedUser = () => users?.find(u => u.email === composeForm.recipient)
  const getAttachedItem = () => items?.find(i => i._id === composeForm.attachedItemId)

  const handleConversationSelect = (recipientId: string) => {
    setSelectedConversation(recipientId)
    setView("inbox")
    if (messages && messages.length > 0) {
      const unreadIds = messages.filter((msg: any) => msg.recipientId === currentUserId && !msg.isRead).map((msg: any) => msg._id)
      if (unreadIds.length > 0) {
        // Mark each message as read individually
        unreadIds.forEach((messageId: any) => {
          markAsRead({ messageId })
        })
      }
    }
  }

  const filteredConversations = conversations?.filter((c: any) => !searchQuery || c.participantId.toLowerCase().includes(searchQuery.toLowerCase())) || []
  const selectedConversationData = conversations?.find((c: any) => c.participantId === selectedConversation)

  if (!isAuthed) {
    return <div className="p-6">Please sign in to view messages.</div>
  }

  return (
    <div className="flex-1 h-screen flex">
      {/* Left rail */}
      <div className="w-80 border-r bg-gray-50/50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button size="sm" onClick={() => setView("compose")} className="h-8 w-8 p-0"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-2">
            {filteredConversations.map((conversation: any) => (
              <div key={conversation.participantId} className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedConversation === conversation.participantId ? "bg-blue-100 border-blue-200" : conversation.unreadCount > 0 ? "bg-red-50 border-red-200 hover:bg-red-100" : "hover:bg-gray-100 border-transparent"}`} onClick={() => handleConversationSelect(conversation.participantId)}>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10"><AvatarFallback className="bg-blue-500 text-white">{conversation.participantId.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{conversation.participantId}</p>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(conversation.lastMessage.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{parseMessageContent(conversation.lastMessage.content).subject || "No Subject"}</p>
                    {conversation.unreadCount > 0 && (<Badge variant="destructive" className="mt-1 text-xs">{conversation.unreadCount}</Badge>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {view === "compose" ? (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2"><Mail className="w-5 h-5" />Compose Message</h2>
                <Button variant="outline" onClick={() => setView("inbox")}>Cancel</Button>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">To:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
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
                            <CommandItem key={user._id} value={user.email} onSelect={() => setComposeForm({ ...composeForm, recipient: user.email })}>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6"><AvatarFallback className="bg-blue-500 text-white">{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback></Avatar>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject:</label>
                <Input value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} placeholder="Enter subject..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Attach Item (Optional):</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
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
                            <CommandItem key={item._id} value={item.itemId} onSelect={() => setComposeForm({ ...composeForm, attachedItemId: item._id })}>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-500" />
                                <div>
                                  <div className="font-medium">{item.itemId}</div>
                                  <div className="text-xs text-gray-500">{item.metadata?.brand} {item.metadata?.color} | {item.status}</div>
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
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Message:</label>
                <Textarea value={composeForm.message} onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })} placeholder="Type your message..." className="min-h-[300px] resize-none" />
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSendMessage} disabled={!composeForm.recipient || !composeForm.message.trim()} className="flex items-center gap-2"><Send className="w-4 h-4" />Send Message</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Tabs for Messages/Notifications */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <div className="border-b bg-white">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="threads" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Threads
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="rules" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Rules
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <TabsContent value="threads" className="flex-1 flex flex-col m-0">
              {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10"><AvatarFallback className="bg-green-500 text-white">{selectedConversation.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedConversation}</h3>
                        <p className="text-sm text-gray-500">{selectedConversationData?.unreadCount || 0} unread messages</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setView("compose")}><Plus className="w-4 h-4 mr-2" />New Message</Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages?.map((message: any) => {
                      const parsed = parseMessageContent(message.content); const isOwn = message.senderId === currentUserId
                      return (
                        <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className="w-8 h-8 flex-shrink-0"><AvatarFallback className={`${isOwn ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>{isOwn ? 'Y' : 'U'}</AvatarFallback></Avatar>
                            <div className={`rounded-lg px-3 py-2 ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                              {parsed.subject && (<div className="font-semibold text-sm mb-1">{parsed.subject}</div>)}
                              <div className="text-sm">{parsed.body}</div>
                              {parsed.attachedItemId && (
                                <div className="mt-2 p-2 bg-white/20 rounded border border-white/30">
                                  <div className="flex items-center gap-2"><Package className="w-3 h-3" /><span className="text-xs font-medium">Item: {items?.find(i => i._id === parsed.attachedItemId)?.itemId}</span></div>
                                </div>
                              )}
                              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                <Clock className="w-3 h-3" /><span className="text-xs">{formatTimestamp(message.createdAt)}</span>{isOwn && (<CheckCheck className="w-3 h-3 ml-1" />)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border-b rounded-t-lg">
                    <Popover>
                      <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-8 px-2"><Paperclip className="w-4 h-4 mr-1" />Attach Item</Button></PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput placeholder="Search items..." />
                          <CommandList>
                            <CommandEmpty>No items found.</CommandEmpty>
                            <CommandGroup>
                              {items?.map((item) => (
                                <CommandItem key={item._id} value={item.itemId} onSelect={() => { setQuickReplyAttachedItemId(item._id) }}>
                                  <div className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /><div><div className="font-medium">{item.itemId}</div><div className="text-xs text-gray-500">{item.metadata?.brand} {item.metadata?.color} | {item.status}</div></div></div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  {quickReplyAttachedItemId && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg m-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <div className="flex-1"><div className="font-medium">{items?.find(i => i._id === quickReplyAttachedItemId)?.itemId}</div><div className="text-xs text-gray-600">{items?.find(i => i._id === quickReplyAttachedItemId)?.metadata?.brand} {items?.find(i => i._id === quickReplyAttachedItemId)?.metadata?.color}</div></div>
                      <Button variant="ghost" size="sm" onClick={() => setQuickReplyAttachedItemId("")}><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                  <div className="flex gap-2 p-2">
                    <Input value={quickReplyMessage} onChange={(e) => setQuickReplyMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendQuickReply() } }} placeholder="Type your message..." className="flex-1" />
                    <Button onClick={handleSendQuickReply} disabled={!quickReplyMessage.trim()} size="sm"><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-600">No Conversation Selected</h3>
                  <p className="text-gray-500">Select a conversation from the sidebar or compose a new message.</p>
                  <Button onClick={() => setView("compose")}><Plus className="w-4 h-4 mr-2" />Compose Message</Button>
                </div>
              </div>
            )}
            </TabsContent>

            <TabsContent value="notifications" className="flex-1 m-0">
              <div className="p-4">
                <NotificationList />
              </div>
            </TabsContent>

            <TabsContent value="rules" className="flex-1 m-0">
              <div className="p-4">
                <Tabs value="rules-tab" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="rules-tab">Rules</TabsTrigger>
                    <TabsTrigger value="preferences-tab">Preferences</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="rules-tab" className="flex-1">
                    <NotificationRulesTable />
                  </TabsContent>
                  
                  <TabsContent value="preferences-tab" className="flex-1">
                    <NotificationPrefsForm />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}


