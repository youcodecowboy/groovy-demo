"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DiscoHeader } from "@/components/disco/disco-header"
import { Settings, Users, Workflow, Monitor, ArrowLeft, Bell, Clock, AlertTriangle, MessageSquare, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function DiscoConfigPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedTeam, setSelectedTeam] = useState<string>("production")
  const [isEnabled, setIsEnabled] = useState(true)
  const [selectedWorkflow, setSelectedWorkflow] = useState("default")

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
  const [isLoading, setIsLoading] = useState(false)

  // Load preferences from API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/disco/preferences?factoryId=demo-factory')
        if (response.ok) {
          const prefs = await response.json()
          setNotificationsEnabled(prefs.notificationsEnabled)
          setNotificationFrequency(prefs.notificationFrequency)
          setBatchInterval(prefs.batchInterval || 15)
          setQuietHoursEnabled(prefs.quietHoursEnabled || false)
          setQuietHoursStart(prefs.quietHoursStart || "22:00")
          setQuietHoursEnd(prefs.quietHoursEnd || "06:00")
          setDefaultRecipient(prefs.defaultRecipient)
          setNotificationTypes(prefs.notificationTypes)
          setPriorityThreshold(prefs.priorityThreshold)
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    }

    loadPreferences()
  }, [])

  const handleSavePreferences = async () => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
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

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <DiscoHeader currentTeam={selectedTeam} />
      
      {/* Main Content */}
      <div className="flex-1 pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push("/disco")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Floor App
          </Button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Disco Configuration</h1>
            <p className="text-gray-600">Configure factory floor views and team assignments</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="disco-enabled">Enable Disco Floor App</Label>
                  <Switch
                    id="disco-enabled"
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-workflow">Default Workflow</Label>
                  <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Production</SelectItem>
                      <SelectItem value="custom">Custom Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">Auto-refresh Interval (seconds)</Label>
                  <Input
                    id="refresh-interval"
                    type="number"
                    defaultValue={30}
                    min={5}
                    max={300}
                  />
                </div>
              </CardContent>
            </Card>

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
                        {key === 'inventory_alerts' && <Workflow className="w-4 h-4 text-green-500" />}
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

            {/* Team Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {["Production", "Cutting", "Sewing", "Quality Control", "Packaging"].map((team) => (
                    <div key={team} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{team}</Badge>
                        <span className="text-sm text-gray-600">5 members</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add New Team
                </Button>
              </CardContent>
            </Card>

            {/* Workflow Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  Workflow Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { team: "Production", workflow: "Default Production", status: "active" },
                    { team: "Cutting", workflow: "Cutting Process", status: "active" },
                    { team: "Sewing", workflow: "Sewing Process", status: "active" },
                    { team: "Quality Control", workflow: "QC Process", status: "active" },
                    { team: "Packaging", workflow: "Packaging Process", status: "active" },
                  ].map((item) => (
                    <div key={item.team} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.team}</div>
                        <div className="text-sm text-gray-600">{item.workflow}</div>
                      </div>
                      <Badge variant={item.status === "active" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Display Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Layout</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">Grid</Button>
                    <Button size="sm" variant="outline">List</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Items per page</Label>
                  <Select defaultValue="12">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 items</SelectItem>
                      <SelectItem value="12">12 items</SelectItem>
                      <SelectItem value="24">24 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-priority">Show Priority Colors</Label>
                  <Switch id="show-priority" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-timers">Show Due Time Countdown</Label>
                  <Switch id="show-timers" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleResetPreferences}>Reset to Defaults</Button>
            <Button onClick={handleSavePreferences} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
