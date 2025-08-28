"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Plus,
  Search,
  Clock,
  User,
  Bot,
  Calendar,
  Edit3,
  Trash2,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface ChatSession {
  _id: Id<"chatSessions">
  title: string
  summary?: string
  messageCount: number
  lastMessageAt: number
  createdAt: number
  isActive: boolean
}

interface DiscoChatLibraryProps {
  userId: string
  factoryId: string
  isOpen: boolean
  onToggle: () => void
  onSelectSession: (sessionId: Id<"chatSessions">) => void
  currentSessionId?: Id<"chatSessions">
}

export function DiscoChatLibrary({ 
  userId, 
  factoryId, 
  isOpen, 
  onToggle,
  onSelectSession,
  currentSessionId
}: DiscoChatLibraryProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingSessionId, setEditingSessionId] = useState<Id<"chatSessions"> | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  // Fetch chat sessions
  const sessions = useQuery(api.disco3b.getChatSessions, {
    factoryId,
    userId,
    limit: 50,
  })

  // Mutations
  const createNewSession = useMutation(api.disco3b.createNewChatSession)
  const updateSessionTitle = useMutation(api.disco3b.updateChatSessionTitle)

  // Filter sessions based on search
  const filteredSessions = sessions?.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.summary && session.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || []

  const handleCreateNewSession = async () => {
    try {
      const sessionId = await createNewSession({
        factoryId,
        userId,
        title: `New Chat ${new Date().toLocaleTimeString()}`,
      })
      
      onSelectSession(sessionId)
      onToggle()
      
      toast({
        title: "New Chat Session",
        description: "Created a new chat session",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTitle = async (sessionId: Id<"chatSessions">) => {
    if (!editingTitle.trim()) return
    
    try {
      await updateSessionTitle({
        sessionId,
        title: editingTitle.trim(),
      })
      
      setEditingSessionId(null)
      setEditingTitle("")
      
      toast({
        title: "Title Updated",
        description: "Chat session title has been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive",
      })
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getSessionPreview = (session: ChatSession) => {
    if (session.summary) {
      return session.summary.length > 60 
        ? session.summary.substring(0, 60) + '...' 
        : session.summary
    }
    return `${session.messageCount} message${session.messageCount !== 1 ? 's' : ''}`
  }

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat Library
            </SheetTitle>
          </SheetHeader>

          {/* Search and New Chat */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleCreateNewSession}
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat Sessions List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No chat sessions found</p>
                  <p className="text-xs mt-1">Start a new conversation to see it here</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <Card 
                    key={session._id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentSessionId === session._id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      onSelectSession(session._id)
                      onToggle()
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {editingSessionId === session._id ? (
                            <div className="flex items-center gap-2 mb-1">
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateTitle(session._id)
                                  } else if (e.key === 'Escape') {
                                    setEditingSessionId(null)
                                    setEditingTitle("")
                                  }
                                }}
                                className="text-sm font-medium"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateTitle(session._id)}
                                className="h-6 px-2"
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingSessionId(null)
                                  setEditingTitle("")
                                }}
                                className="h-6 px-2"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium truncate">
                                {session.title}
                              </h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingSessionId(session._id)
                                  setEditingTitle(session.title)
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 truncate mb-2">
                            {getSessionPreview(session)}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(session.lastMessageAt)}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {session.messageCount}
                            </Badge>
                          </div>
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              {filteredSessions.length} chat session{filteredSessions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
