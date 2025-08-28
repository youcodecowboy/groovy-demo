"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, MessageSquare, AlertTriangle, Send, Bot } from "lucide-react"

export default function TestDiscoNotifications() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testType, setTestType] = useState<'message' | 'notification'>('message')
  const [recipient, setRecipient] = useState('admin@demo')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [notificationType, setNotificationType] = useState('system_alert')

  const testMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Missing message",
        description: "Please enter a message to send",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/disco/chat/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId: 'demo-factory',
          userId: 'disco-user',
          action: {
            type: 'send_message',
            payload: {
              to: recipient,
              text: message,
              priority: priority.toUpperCase()
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      toast({
        title: "Message sent!",
        description: "Check the Groovy mission control header bell for the notification",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const testNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both title and message",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/disco/chat/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId: 'demo-factory',
          userId: 'disco-user',
          action: {
            type: 'send_notification',
            payload: {
              to: recipient,
              title,
              message,
              type: notificationType,
              priority
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }

      const result = await response.json()
      toast({
        title: "Notification sent!",
        description: "Check the Groovy mission control header bell for the notification",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const quickTests = [
    {
      name: "Quality Issue Alert",
      type: 'notification' as const,
      title: "Quality Issue Detected",
      message: "Item SKU-123 has been flagged for quality review. Defect found in stitching.",
      priority: 'high' as const,
      notificationType: 'item_flagged'
    },
    {
      name: "Production Update",
      type: 'notification' as const,
      title: "Production Milestone Reached",
      message: "Batch B-2024-001 has completed cutting stage. 150 items ready for sewing.",
      priority: 'medium' as const,
      notificationType: 'stage_completed'
    },
    {
      name: "Urgent Message",
      type: 'message' as const,
      title: "",
      message: "URGENT: Machine maintenance required on Line 3. Please check immediately.",
      priority: 'urgent' as const,
      notificationType: 'system_alert'
    }
  ]

  const runQuickTest = (test: typeof quickTests[0]) => {
    setTestType(test.type)
    setTitle(test.title)
    setMessage(test.message)
    setPriority(test.priority)
    setNotificationType(test.notificationType)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Disco → Groovy Notification Test</h1>
        <p className="text-muted-foreground">
          Test the integration between Disco chatbot and Groovy mission control notifications
        </p>
      </div>

      {/* Quick Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Quick Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickTests.map((test, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => runQuickTest(test)}
                className="h-auto p-4 flex flex-col items-start gap-2"
              >
                <div className="flex items-center gap-2">
                  {test.type === 'message' ? <MessageSquare className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  <span className="font-medium">{test.name}</span>
                </div>
                <Badge variant={test.priority === 'urgent' ? 'destructive' : 'secondary'}>
                  {test.priority}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Custom Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Test Type</label>
              <Select value={testType} onValueChange={(value: 'message' | 'notification') => setTestType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">Message (with notification)</SelectItem>
                  <SelectItem value="notification">Direct Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Recipient</label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="admin@demo"
              />
            </div>
          </div>

          {testType === 'notification' && (
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
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
            {testType === 'notification' && (
              <div>
                <label className="text-sm font-medium">Notification Type</label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system_alert">System Alert</SelectItem>
                    <SelectItem value="item_flagged">Item Flagged</SelectItem>
                    <SelectItem value="item_defective">Item Defective</SelectItem>
                    <SelectItem value="stage_completed">Stage Completed</SelectItem>
                    <SelectItem value="message_received">Message Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            onClick={testType === 'message' ? testMessage : testNotification}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send {testType === 'message' ? 'Message' : 'Notification'}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Click a quick test button or fill out the custom form above</p>
          <p>2. Send a message or notification from Disco</p>
          <p>3. Navigate to the Groovy mission control (factory side)</p>
          <p>4. Check the header bell icon for new notifications</p>
          <p>5. Click on notifications to see the full details</p>
        </CardContent>
      </Card>
    </div>
  )
}
