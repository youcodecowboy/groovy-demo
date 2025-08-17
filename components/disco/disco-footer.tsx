"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { QRScanner } from '@/components/ui/qr-scanner'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { 
  ScanLine, 
  Menu, 
  MessageSquare, 
  Bell, 
  Send, 
  Target, 
  User, 
  Package, 
  Search, 
  X, 
  AlertTriangle, 
  Flag, 
  Clock, 
  CheckCircle, 
  FileText, 
  Calendar 
} from 'lucide-react'

interface DiscoFooterProps {
  onScan: (data: string) => Promise<void>
  isScannerOpen: boolean
  onScannerToggle: () => void
  currentTeam?: string
}

interface Message {
  _id: string
  senderId: string
  recipientId: string
  content: string
  messageType: string
  isRead: boolean
  createdAt: number
  readAt?: number
  metadata?: {
    priority: string
    attachedItems?: string[]
    isTeamMessage?: boolean
    teamName?: string
  }
}

interface Task {
  _id: string
  title: string
  description: string
  assignedTo: string
  assignedBy: string
  status: string
  priority: string
  dueDate?: number
  itemId?: string
  workflowId?: string
  stageId?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
  notes?: string
}

export function DiscoFooter({ onScan, isScannerOpen, onScannerToggle, currentTeam = "production" }: DiscoFooterProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'inbox' | 'messages' | 'notifications'>('inbox')
  const [viewMode, setViewMode] = useState<'inbox' | 'compose'>('inbox')
  const [newMessage, setNewMessage] = useState('')
  const [newAssignment, setNewAssignment] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [messagePriority, setMessagePriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const { toast } = useToast()

  // Get real data from Convex
  const users = useQuery(api.users.getAll) || []
  const items = useQuery(api.items.getItemsByTeam, { teamId: currentTeam }) || []
  
  // Get current user from the current team (in real app, this would come from auth)
  const teamUsers = users.filter(user => user.team === currentTeam)
  const currentUserId = teamUsers.length > 0 ? teamUsers[0]._id : "demo-user"
  
  const messages = useQuery(api.messages.getMessages, { 
    userId: currentUserId,
    teamId: currentTeam,
    limit: 50
  }) || []
  const tasks = useQuery(api.tasks.getTasks, { 
    userId: currentUserId,
    teamId: currentTeam,
    limit: 50
  }) || []
  
  const unreadMessageCount = useQuery(api.messages.getUnreadMessageCount, { 
    userId: currentUserId,
    teamId: currentTeam
  }) || 0
  const unreadTaskCount = useQuery(api.tasks.getUnreadTaskCount, { 
    userId: currentUserId,
    teamId: currentTeam
  }) || 0

  // Debug info
  console.log('Disco Footer Debug:', {
    currentTeam,
    currentUserId,
    teamUsersCount: teamUsers.length,
    allUsersCount: users.length,
    messagesCount: messages.length,
    tasksCount: tasks.length,
    unreadMessageCount,
    unreadTaskCount,
    messages: messages.slice(0, 2), // Show first 2 messages for debugging
    tasks: tasks.slice(0, 2), // Show first 2 tasks for debugging
    teamUsers: teamUsers.map(u => ({ id: u._id, name: u.name, team: u.team })), // Show team users
    allUsers: users.map(u => ({ id: u._id, name: u.name, team: u.team })) // Show all users
  })

  // Mutations
  const createMessage = useMutation(api.messages.createMessage)
  const createTask = useMutation(api.tasks.createTask)
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead)
  const markMessageAsReadOnView = useMutation(api.messages.markMessageAsReadOnView)
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus)

  // Filter users by team and search
  const filteredTeamUsers = users.filter(user => 
    user.team === currentTeam && 
    user.isActive &&
    (userSearch === '' || 
     user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
     user.email.toLowerCase().includes(userSearch.toLowerCase()))
  )

  // Filter items by search
  const filteredItems = items.filter(item => 
    itemSearch === '' || 
    item.itemId.toLowerCase().includes(itemSearch.toLowerCase()) ||
    (item.currentStage?.name || '').toLowerCase().includes(itemSearch.toLowerCase())
  )

  const getTeamColors = (teamId: string) => {
    const colors: Record<string, { bg: string; border: string; accent: string; text: string }> = {
      production: { bg: "bg-blue-600", border: "border-blue-700", accent: "bg-blue-500", text: "text-blue-600" },
      cutting: { bg: "bg-red-600", border: "border-red-700", accent: "bg-red-500", text: "text-red-600" },
      sewing: { bg: "bg-orange-600", border: "border-orange-700", accent: "bg-orange-500", text: "text-orange-600" },
      quality: { bg: "bg-purple-600", border: "border-purple-700", accent: "bg-purple-500", text: "text-purple-600" },
      packaging: { bg: "bg-green-600", border: "border-green-700", accent: "bg-green-500", text: "text-green-600" },
    }
    return colors[teamId] || colors.production
  }

  const teamColors = getTeamColors(currentTeam)

  const handleScan = async (data: string) => {
    setIsProcessing(true)
    try {
      await onScan(data)
      // Show success feedback
      setTimeout(() => {
        setIsProcessing(false)
        onScannerToggle()
      }, 1000)
    } catch (error) {
      setIsProcessing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || selectedUsers.length === 0) return
    
    try {
      await createMessage({
        senderId: currentUserId,
        recipientIds: selectedUsers,
        content: newMessage,
        priority: messagePriority,
        attachedItems: selectedItems.length > 0 ? selectedItems : undefined,
      })
      
      setNewMessage('')
      setSelectedUsers([])
      setSelectedItems([])
      setMessagePriority('medium')
      setViewMode('inbox')
      toast({
        title: "Message Sent",
        description: `Message sent to ${selectedUsers.length} recipient(s)`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendAssignment = async () => {
    if (!newAssignment.trim() || selectedUsers.length === 0) return
    
    try {
      await createTask({
        title: "New Task Assignment",
        description: newAssignment,
        assignedById: currentUserId,
        assignedToIds: selectedUsers,
        priority: taskPriority,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        attachedItems: selectedItems.length > 0 ? selectedItems : undefined,
      })
      
      setNewAssignment('')
      setSelectedUsers([])
      setSelectedItems([])
      setTaskPriority('medium')
      setDueDate('')
      setViewMode('inbox')
      toast({
        title: "Task Assigned",
        description: `Task assigned to ${selectedUsers.length} team member(s)`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high': return <Flag className="w-4 h-4 text-orange-600" />
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  // Helper function to get sender name
  const getSenderName = (senderId: string) => {
    const sender = users.find(user => user._id === senderId)
    return sender?.name || 'Unknown User'
  }

  // Helper function to get assigned user name
  const getAssignedUserName = (assignedTo: string) => {
    const user = users.find(user => user._id === assignedTo)
    return user?.name || 'Unknown User'
  }

  return (
    <>
      {/* Sticky Footer */}
      <div className={`fixed bottom-0 left-0 right-0 ${teamColors.bg} ${teamColors.border} border-t shadow-lg z-50 transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20 rounded-full w-12 h-12 p-0 relative"
                >
                  <Menu className="w-6 h-6" />
                  {(unreadMessageCount > 0 || unreadTaskCount > 0) && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 border-2 border-white">
                      {unreadMessageCount + unreadTaskCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[95vh] max-h-[800px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <Menu className="w-5 h-5" />
                    Team Communications
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 flex flex-col p-4 pb-6">
                  {/* Navigation */}
                  {viewMode === 'inbox' ? (
                    <>
                      {/* Tabs */}
                      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
                        <button
                          onClick={() => setActiveTab('inbox')}
                          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'inbox'
                              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 inline mr-2" />
                          Inbox
                          {(unreadMessageCount > 0 || unreadTaskCount > 0) && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {unreadMessageCount + unreadTaskCount}
                            </Badge>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab('messages')}
                          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'messages'
                              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 inline mr-2" />
                          Messages
                          {unreadMessageCount > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {unreadMessageCount}
                            </Badge>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab('notifications')}
                          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'notifications'
                              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Bell className="w-4 h-4 inline mr-2" />
                          Tasks
                          {unreadTaskCount > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {unreadTaskCount}
                            </Badge>
                          )}
                        </button>
                      </div>

                      {/* Inbox View */}
                      {activeTab === 'inbox' && (
                        <div className="flex-1 space-y-4">
                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => {
                                setViewMode('compose')
                                setActiveTab('messages')
                              }}
                              className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                              <div className="text-center">
                                <Send className="w-6 h-6 mx-auto mb-1" />
                                <span className="text-sm font-medium">New Message</span>
                              </div>
                            </Button>
                            <Button
                              onClick={() => {
                                setViewMode('compose')
                                setActiveTab('notifications')
                              }}
                              className="h-20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                            >
                              <div className="text-center">
                                <Target className="w-6 h-6 mx-auto mb-1" />
                                <span className="text-sm font-medium">New Task</span>
                              </div>
                            </Button>
                          </div>

                          {/* Recent Messages */}
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                              Recent Messages
                            </h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {messages.length > 0 ? (
                                messages.slice(0, 3).map((message) => (
                                  <Card key={message._id} className={`${!message.isRead ? "border-blue-200 bg-blue-50" : ""} hover:shadow-md transition-shadow cursor-pointer`}>
                                    <CardContent className="p-3">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                          {getPriorityIcon(message.metadata?.priority || 'medium')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{getSenderName(message.senderId)}</span>
                                            <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                                            <Badge variant="outline" className={`text-xs ${getPriorityColor(message.metadata?.priority || 'medium')}`}>
                                              {message.metadata?.priority || 'medium'}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-700 truncate">{message.content}</p>
                                        </div>
                                        {!message.isRead && (
                                          <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <Card className="border-dashed border-gray-300 bg-gray-50">
                                  <CardContent className="p-4 text-center">
                                    <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No messages yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Send a message to get started</p>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </div>

                          {/* Recent Tasks */}
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Bell className="w-4 h-4 text-orange-500" />
                              Recent Tasks
                            </h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {tasks.length > 0 ? (
                                tasks.slice(0, 3).map((task) => (
                                  <Card key={task._id} className={`${task.status === 'pending' ? "border-orange-200 bg-orange-50" : ""} hover:shadow-md transition-shadow cursor-pointer`}>
                                    <CardContent className="p-3">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                          {getPriorityIcon(task.priority)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{task.title}</span>
                                            <span className="text-xs text-gray-500">{formatTime(task.createdAt)}</span>
                                            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                              {task.priority}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-700 truncate">{task.description}</p>
                                        </div>
                                        {task.status === 'pending' && (
                                          <Badge className="bg-orange-500 text-white text-xs">New</Badge>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <Card className="border-dashed border-gray-300 bg-gray-50">
                                  <CardContent className="p-4 text-center">
                                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No tasks yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Create a task to get started</p>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Messages List */}
                      {activeTab === 'messages' && (
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                              Messages
                            </h3>
                            <Button
                              onClick={() => {
                                setViewMode('compose')
                                setActiveTab('messages')
                              }}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              New Message
                            </Button>
                          </div>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {messages.map((message) => (
                              <Card key={message._id} className={`${!message.isRead ? "border-blue-200 bg-blue-50" : ""} hover:shadow-md transition-shadow`}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      {getPriorityIcon(message.metadata?.priority || 'medium')}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-gray-900">{getSenderName(message.senderId)}</span>
                                        <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                                        <Badge variant="outline" className={`text-xs ${getPriorityColor(message.metadata?.priority || 'medium')}`}>
                                          {message.metadata?.priority || 'medium'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-700">{message.content}</p>
                                      {message.metadata?.attachedItems && message.metadata.attachedItems.length > 0 && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                          <Package className="w-3 h-3" />
                                          Attached: {message.metadata.attachedItems.length} item(s)
                                        </div>
                                      )}
                                    </div>
                                    {!message.isRead && (
                                      <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tasks List */}
                      {activeTab === 'notifications' && (
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Bell className="w-4 h-4 text-orange-500" />
                              Tasks
                            </h3>
                            <Button
                              onClick={() => {
                                setViewMode('compose')
                                setActiveTab('notifications')
                              }}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Target className="w-4 h-4 mr-1" />
                              New Task
                            </Button>
                          </div>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {tasks.map((task) => (
                              <Card key={task._id} className={`${task.status === 'pending' ? "border-orange-200 bg-orange-50" : ""} hover:shadow-md transition-shadow`}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      {getPriorityIcon(task.priority)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-gray-900">{task.title}</span>
                                        <span className="text-xs text-gray-500">{formatTime(task.createdAt)}</span>
                                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                          {task.priority}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-gray-500 mb-1">
                                        Assigned to: {getAssignedUserName(task.assignedTo)}
                                      </div>
                                      <p className="text-sm text-gray-700">{task.description}</p>
                                      {task.dueDate && (
                                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                          <Calendar className="w-3 h-3" />
                                          Due: {new Date(task.dueDate).toLocaleString()}
                                        </div>
                                      )}
                                      {task.notes && (
                                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                          <Package className="w-3 h-3" />
                                          {task.notes}
                                        </div>
                                      )}
                                    </div>
                                    {task.status === 'pending' && (
                                      <Badge className="bg-orange-500 text-white text-xs">New</Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Compose Mode */}
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode('inbox')}
                          className="text-gray-600"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Back to Inbox
                        </Button>
                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          {activeTab === 'messages' ? (
                            <>
                              <Send className="w-4 h-4 text-blue-500" />
                              New Message
                            </>
                          ) : (
                            <>
                              <Target className="w-4 h-4 text-orange-500" />
                              New Task
                            </>
                          )}
                        </h3>
                      </div>

                      {/* Messages Tab */}
                      {activeTab === 'messages' && (
                        <div className="flex-1 flex flex-col space-y-4">
                          {/* Send Message */}
                          <Card className="flex-1 flex flex-col">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Send className="w-4 h-4 text-blue-500" />
                                Send Message
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col space-y-4">
                              {/* Recipients */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Recipients</label>
                                <div className="relative">
                                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                                {userSearch && (
                                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                                    {filteredTeamUsers.map((user) => (
                                      <div key={user._id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`user-${user._id}`}
                                          checked={selectedUsers.includes(user._id)}
                                          onCheckedChange={() => toggleUserSelection(user._id)}
                                        />
                                        <label htmlFor={`user-${user._id}`} className="text-sm flex items-center gap-1 flex-1">
                                          <User className="w-3 h-3" />
                                          <span className="font-medium">{user.name}</span>
                                          <span className="text-gray-500">({user.role})</span>
                                          {user.lastLogin && Date.now() - user.lastLogin < 1000 * 60 * 5 && (
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          )}
                                        </label>
                                      </div>
                                    ))}
                                    {filteredTeamUsers.length === 0 && (
                                      <div className="text-sm text-gray-500 text-center py-2">
                                        No users found
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Team Selection Buttons */}
                                <div className="flex flex-wrap gap-2">
                                  {['production', 'cutting', 'sewing', 'quality', 'packaging'].map((team) => (
                                    <Button
                                      key={team}
                                      variant={selectedUsers.includes(`team-${team}`) ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => toggleUserSelection(`team-${team}`)}
                                      className="text-xs capitalize"
                                    >
                                      {team} Team
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {/* Priority */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={messagePriority} onValueChange={(value: any) => setMessagePriority(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Message */}
                              <div className="space-y-2 flex-1 flex flex-col">
                                <label className="text-sm font-medium">Message</label>
                                <Textarea
                                  placeholder="Type your message..."
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  className="flex-1 min-h-[200px] resize-none"
                                />
                              </div>
                            </CardContent>
                            {/* Send Button - Always Visible */}
                            <div className="p-4 border-t">
                              <Button 
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || selectedUsers.length === 0}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}

                      {/* Tasks Tab */}
                      {activeTab === 'notifications' && (
                        <div className="flex-1 flex flex-col space-y-4">
                          {/* Send Task */}
                          <Card className="flex-1 flex flex-col">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Target className="w-4 h-4 text-orange-500" />
                                Create Task
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col space-y-4">
                              {/* Assignees */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Assign To</label>
                                <div className="relative">
                                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                                {userSearch && (
                                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                                    {filteredTeamUsers.map((user) => (
                                      <div key={user._id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`assignee-${user._id}`}
                                          checked={selectedUsers.includes(user._id)}
                                          onCheckedChange={() => toggleUserSelection(user._id)}
                                        />
                                        <label htmlFor={`assignee-${user._id}`} className="text-sm flex items-center gap-1 flex-1">
                                          <User className="w-3 h-3" />
                                          <span className="font-medium">{user.name}</span>
                                          <span className="text-gray-500">({user.role})</span>
                                          {user.lastLogin && Date.now() - user.lastLogin < 1000 * 60 * 5 && (
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          )}
                                        </label>
                                      </div>
                                    ))}
                                    {filteredTeamUsers.length === 0 && (
                                      <div className="text-sm text-gray-500 text-center py-2">
                                        No users found
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Team Selection Buttons */}
                                <div className="flex flex-wrap gap-2">
                                  {['production', 'cutting', 'sewing', 'quality', 'packaging'].map((team) => (
                                    <Button
                                      key={team}
                                      variant={selectedUsers.includes(`team-${team}`) ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => toggleUserSelection(`team-${team}`)}
                                      className="text-xs capitalize"
                                    >
                                      {team} Team
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {/* Priority */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={taskPriority} onValueChange={(value: any) => setTaskPriority(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Due Date */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Due Date (Optional)</label>
                                <Input
                                  type="datetime-local"
                                  value={dueDate}
                                  onChange={(e) => setDueDate(e.target.value)}
                                />
                              </div>

                              {/* Task Description */}
                              <div className="space-y-2 flex-1 flex flex-col">
                                <label className="text-sm font-medium">Task Description</label>
                                <Textarea
                                  placeholder="Enter task description..."
                                  value={newAssignment}
                                  onChange={(e) => setNewAssignment(e.target.value)}
                                  className="flex-1 min-h-[200px] resize-none"
                                />
                              </div>
                            </CardContent>
                            {/* Send Button - Always Visible */}
                            <div className="p-4 border-t">
                              <Button 
                                onClick={handleSendAssignment}
                                disabled={!newAssignment.trim() || selectedUsers.length === 0}
                                className="w-full bg-orange-600 hover:bg-orange-700"
                              >
                                <Target className="w-4 h-4 mr-2" />
                                Create Task
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* QR Scan Button - Floating Action Button Style */}
            <Button
              size="lg"
              onClick={onScannerToggle}
              disabled={isProcessing}
              className={`
                rounded-full w-16 h-16 shadow-lg transition-all duration-200
                ${isProcessing 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-white text-gray-800 hover:bg-gray-100 hover:scale-105'
                }
              `}
            >
              {isProcessing ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <ScanLine className="w-8 h-8" />
              )}
            </Button>

            {/* Spacer to center the QR button */}
            <div className="w-12 h-12"></div>
          </div>
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={onScannerToggle}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Scan QR Code
            </DialogTitle>
            <DialogDescription>
              Point your camera at a QR code to advance an item
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <QRScanner onScan={handleScan} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}