"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, Clock, AlertTriangle, MessageSquare, Zap, Settings, Save, RotateCcw } from "lucide-react"

export default function TestNotificationPreferences() {
  const { toast } = useToast()
  
  // Notification preferences state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [notificationFrequency, setNotificationFrequency] = useState("immediate")
  const [batchInterval, setBatchInterval] = useState(15)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietHoursStart, setQuietHoursStart] = useState("22:00")
  const [quietHoursEnd, setQuietHoursEnd] = useState("06:00")
  const [defaultRecipient, setDefaultRecipient] = useState("admin@demo")
  const [notificationTypes, setNotificationTypes] = useState({
    quality_issues: true,
    production_updates: true,
    machine_alerts: true,
    inventory_alerts: true,
    schedule_changes: true,
    general_messages: false
  })
  const [priorityThreshold, setPriorityThreshold] = useState("medium")

  const handleSavePreferences = async () => {
    try {
      const response = await fetch('/api/disco/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId: 'demo-factory',
          notificationsEnabled,
          notificationFrequency,
          batchInterval: notificationFrequency === "batched" ? batchInterval : undefined,
          quietHoursEnabled,
          quietHoursStart: quietHoursEnabled ? quietHoursStart : undefined,
          quietHoursEnd: quietHoursEnabled ? quietHoursEnd : undefined,
          defaultRecipient,
          notificationTypes,
          priorityThreshold,
        }),
      })

      if (response.ok) {
        toast({
          title: "Preferences saved",
          description: "Notification preferences have been updated successfully",
        })
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      })
    }
  }

  const handleResetPreferences = () => {
    setNotificationsEnabled(true)
    setNotificationFrequency("immediate")
    setBatchInterval(15)
    setQuietHoursEnabled(false)
    setQuietHoursStart("22:00")
    setQuietHoursEnd("06:00")
    setDefaultRecipient("admin@demo")
    setNotificationTypes({
      quality_issues: true,
      production_updates: true,
      machine_alerts: true,
      inventory_alerts: true,
      schedule_changes: true,
      general_messages: false
    })
    setPriorityThreshold("medium")

    toast({
      title: "Preferences reset",
      description: "Notification preferences have been reset to defaults",
    })
  }

  const testNotification = async () => {
    // Simulate sending a test notification
    toast({
      title: "Test notification sent",
      description: "A test notification has been sent to Groovy mission control",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Disco Notification Preferences</h1>
        <p className="text-muted-foreground">
          Configure when and how disco sends notifications to Groovy mission control
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <Switch
                id="notifications-enabled"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-frequency">Notification Frequency</Label>
              <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="batched">Batched (every {batchInterval} minutes)</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notificationFrequency === "batched" && (
              <div className="space-y-2">
                <Label htmlFor="batch-interval">Batch Interval (minutes)</Label>
                <Input
                  id="batch-interval"
                  type="number"
                  value={batchInterval}
                  onChange={(e) => setBatchInterval(Number(e.target.value))}
                  min={5}
                  max={120}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="default-recipient">Default Recipient</Label>
              <Input
                id="default-recipient"
                value={defaultRecipient}
                onChange={(e) => setDefaultRecipient(e.target.value)}
                placeholder="admin@demo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority-threshold">Minimum Priority Threshold</Label>
              <Select value={priorityThreshold} onValueChange={setPriorityThreshold}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (all notifications)</SelectItem>
                  <SelectItem value="medium">Medium and above</SelectItem>
                  <SelectItem value="high">High and urgent only</SelectItem>
                  <SelectItem value="urgent">Urgent only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Notification Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Object.entries(notificationTypes).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {key === 'quality_issues' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {key === 'production_updates' && <Zap className="w-4 h-4 text-blue-500" />}
                    {key === 'machine_alerts' && <Settings className="w-4 h-4 text-orange-500" />}
                    {key === 'inventory_alerts' && <Bell className="w-4 h-4 text-green-500" />}
                    {key === 'schedule_changes' && <Clock className="w-4 h-4 text-purple-500" />}
                    {key === 'general_messages' && <MessageSquare className="w-4 h-4 text-gray-500" />}
                    <Label htmlFor={`notify-${key}`} className="capitalize">
                      {key.replace('_', ' ')}
                    </Label>
                  </div>
                  <Switch
                    id={`notify-${key}`}
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      setNotificationTypes(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Quiet Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours-enabled">Enable Quiet Hours</Label>
              <Switch
                id="quiet-hours-enabled"
                checked={quietHoursEnabled}
                onCheckedChange={setQuietHoursEnabled}
              />
            </div>

            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                  />
                </div>
              </div>
            )}

            {quietHoursEnabled && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p>During quiet hours, only urgent notifications will be sent to Groovy mission control.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Current Settings Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications:</span>
                <Badge variant={notificationsEnabled ? "default" : "secondary"}>
                  {notificationsEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Frequency:</span>
                <Badge variant="outline">{notificationFrequency}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recipient:</span>
                <span className="text-sm text-gray-600">{defaultRecipient}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priority Threshold:</span>
                <Badge variant="outline">{priorityThreshold}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quiet Hours:</span>
                <Badge variant={quietHoursEnabled ? "default" : "secondary"}>
                  {quietHoursEnabled ? `${quietHoursStart} - ${quietHoursEnd}` : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enabled Types:</span>
                <span className="text-sm text-gray-600">
                  {Object.values(notificationTypes).filter(Boolean).length} of {Object.keys(notificationTypes).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button variant="outline" onClick={handleResetPreferences}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSavePreferences}>
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
        <Button variant="secondary" onClick={testNotification}>
          <Bell className="w-4 h-4 mr-2" />
          Test Notification
        </Button>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Notification Frequency:</strong> Controls how often disco sends notifications</p>
          <p>• <strong>Priority Threshold:</strong> Only notifications at or above this priority will be sent</p>
          <p>• <strong>Notification Types:</strong> Enable/disable specific types of notifications</p>
          <p>• <strong>Quiet Hours:</strong> During quiet hours, only urgent notifications are sent</p>
          <p>• <strong>Default Recipient:</strong> Who receives notifications when no specific recipient is specified</p>
          <p>• <strong>Test Notification:</strong> Send a test notification to verify settings work correctly</p>
        </CardContent>
      </Card>
    </div>
  )
}
