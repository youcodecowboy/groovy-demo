"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Activity,
    Bell,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Clock,
    User,
    Package,
    Workflow,
    Settings,
    Filter,
    RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ActivityPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("activity")
  const [filterType, setFilterType] = useState<string>("all")

  // Fetch data
  const activityLog = useQuery(api.activity.getActivityLog, { limit: 100 })
  const notifications = useQuery(api.notifications.getNotifications, { 
    userId: "admin@demo", 
    limit: 50 
  })
  const messages = useQuery(api.messages.getConversations, { userId: "admin@demo" })
  const tasks = useQuery(api.tasks.getAllTasks, { limit: 50 })
  const users = useQuery(api.users.getAll)
  const items = useQuery(api.items.getAll)
  const activityStats = useQuery(api.activity.getActivityStats)

  // Mutations
  const markNotificationAsRead = useMutation(api.notifications.markNotificationAsRead)
  const markAllNotificationsAsRead = useMutation(api.notifications.markAllNotificationsAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead({ 
        notificationId: notificationId as any, 
        userId: "admin@demo" 
      })
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead({ userId: "admin@demo" })
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification({ 
        notificationId: notificationId as any, 
        userId: "admin@demo" 
      })
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "item_created":
      case "item_updated":
      case "item_completed":
        return <Package className="h-4 w-4" />
      case "workflow_created":
      case "workflow_updated":
        return <Workflow className="h-4 w-4" />
      case "user_created":
      case "user_updated":
        return <User className="h-4 w-4" />
      case "task_created":
      case "task_updated":
        return <CheckCircle className="h-4 w-4" />
      case "message_sent":
      case "message_received":
        return <MessageSquare className="h-4 w-4" />
      case "notification_created":
        return <Bell className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "item_assigned":
      case "item_completed":
        return <Package className="h-4 w-4" />
      case "item_defective":
      case "item_flagged":
        return <AlertTriangle className="h-4 w-4" />
      case "stage_completed":
        return <CheckCircle className="h-4 w-4" />
      case "message_received":
        return <MessageSquare className="h-4 w-4" />
      case "task_assigned":
        return <Clock className="h-4 w-4" />
      case "system_alert":
        return <Settings className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-blue-500"
      case "low":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
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

  const filteredActivity = activityLog?.filter(activity => {
    if (filterType === "all") return true
    return activity.entityType === filterType
  }) || []

  const filteredNotifications = notifications?.filter(notification => {
    if (filterType === "all") return true
    return notification.type === filterType
  }) || []

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity & Notifications</h1>
            <p className="text-muted-foreground">
              Monitor system activity and manage notifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats?.totalActivities || 0}</div>
              <p className="text-xs text-muted-foreground">
                {activityStats?.recentActivities || 0} in last 24h
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications?.filter(n => !n.isRead).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {notifications?.length || 0} total notifications
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {items?.filter(i => i.status === "active").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {items?.length || 0} total items
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {users?.filter(u => u.role === "admin").length || 0} admins
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>
                  Recent system activities and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredActivity.map((activity) => (
                      <div key={activity._id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          {activity.userId && (
                            <p className="text-xs text-muted-foreground">
                              by {activity.userId}
                            </p>
                          )}
                          <Badge variant="secondary" className="mt-1">
                            {activity.entityType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      System notifications and alerts
                    </CardDescription>
                  </div>
                  <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                    Mark all as read
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`flex items-start space-x-3 p-3 rounded-lg border ${
                          !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">
                              {notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="default" className="bg-blue-500">
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMarkNotificationAsRead(notification._id)}
                            >
                              Mark as read
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteNotification(notification._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Direct messages and conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {messages?.map((conversation) => (
                      <div key={conversation.partnerId} className="flex items-center space-x-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{conversation.partnerId}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="mt-1">
                              {conversation.unreadCount} unread
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Assigned tasks and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {tasks?.map((task) => (
                      <div key={task._id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0 mt-1">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{task.title}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(task.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">
                              {task.status}
                            </Badge>
                            <Badge variant="outline">
                              {task.priority}
                            </Badge>
                            {task.assignedTo && (
                              <Badge variant="outline">
                                Assigned to {task.assignedTo}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminSidebar>
  )
} 