"use client"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Bell, Mail, Settings, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/components/ui/mock-auth-components"

export function NotificationPrefsForm() {
  const { toast } = useToast()
  const { user } = useUser()
  
  const [preferences, setPreferences] = useState({
    channels: {
      inApp: true,
      email: false,
    },
    kinds: {
      "item.flagged": true,
      "item.defective": true,
      "item.stuck": true,
      "message.inbound": true,
      "order.completed": true,
      "order.behind": true,
      "materials.lowstock": true,
      "materials.received": true,
      "system.alert": true,
    },
    digest: {
      daily: false,
      weekly: false,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const currentUserId = user?.emailAddresses?.[0]?.emailAddress || ""
  const isAuthed = currentUserId.length > 0

  const updatePreferences = useMutation(api.notifications.updateNotificationPreferences)

  // Load user preferences (mock data for now)
  useEffect(() => {
    if (isAuthed) {
      // TODO: Replace with actual preferences query
      // For now, using default preferences
    }
  }, [isAuthed])

  const handleChannelToggle = (channel: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: enabled
      }
    }))
    setHasChanges(true)
  }

  const handleKindToggle = (kind: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      kinds: {
        ...prev.kinds,
        [kind]: enabled
      }
    }))
    setHasChanges(true)
  }

  const handleDigestToggle = (type: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      digest: {
        ...prev.digest,
        [type]: enabled
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!isAuthed) return

    setIsLoading(true)

    try {
      await updatePreferences({
        userId: currentUserId,
        preferences: preferences
      })
      
      setHasChanges(false)
      toast({ title: "Preferences saved", description: "Your notification preferences have been updated" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setPreferences({
      channels: {
        inApp: true,
        email: false,
      },
      kinds: {
        "item.flagged": true,
        "item.defective": true,
        "item.stuck": true,
        "message.inbound": true,
        "order.completed": true,
        "order.behind": true,
        "materials.lowstock": true,
        "materials.received": true,
        "system.alert": true,
      },
      digest: {
        daily: false,
        weekly: false,
      },
    })
    setHasChanges(true)
  }

  const notificationKinds = [
    { key: "item.flagged", label: "Item Flagged", description: "When items are flagged for review" },
    { key: "item.defective", label: "Item Defective", description: "When items are marked as defective" },
    { key: "item.stuck", label: "Item Stuck", description: "When items are stuck in a stage" },
    { key: "message.inbound", label: "Inbound Messages", description: "When new messages are received" },
    { key: "order.completed", label: "Order Completed", description: "When orders are completed" },
    { key: "order.behind", label: "Order Behind Schedule", description: "When orders are behind schedule" },
    { key: "materials.lowstock", label: "Materials Low Stock", description: "When materials are running low" },
    { key: "materials.received", label: "Materials Received", description: "When materials are received" },
    { key: "system.alert", label: "System Alerts", description: "System-wide alerts and notifications" },
  ]

  if (!isAuthed) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to manage notification preferences.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
          <p className="text-sm text-gray-500">Customize how and when you receive notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>

      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <Label htmlFor="inApp" className="text-sm font-medium">In-App Notifications</Label>
                <p className="text-xs text-gray-500">Show notifications in the app interface</p>
              </div>
            </div>
            <Switch
              id="inApp"
              checked={preferences.channels.inApp}
              onCheckedChange={(checked) => handleChannelToggle("inApp", checked)}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-gray-500">Send notifications to your email address</p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.channels.email}
              onCheckedChange={(checked) => handleChannelToggle("email", checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationKinds.map((kind, index) => (
            <div key={kind.key}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <div>
                    <Label htmlFor={kind.key} className="text-sm font-medium">{kind.label}</Label>
                    <p className="text-xs text-gray-500">{kind.description}</p>
                  </div>
                </div>
                <Switch
                  id={kind.key}
                  checked={preferences.kinds[kind.key as keyof typeof preferences.kinds]}
                  onCheckedChange={(checked) => handleKindToggle(kind.key, checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              {index < notificationKinds.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Digest Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Digest Options
          </CardTitle>
          <CardDescription>
            Receive periodic summaries instead of individual notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <div>
                <Label htmlFor="daily" className="text-sm font-medium">Daily Digest</Label>
                <p className="text-xs text-gray-500">Receive a daily summary of all notifications</p>
              </div>
            </div>
            <Switch
              id="daily"
              checked={preferences.digest.daily}
              onCheckedChange={(checked) => handleDigestToggle("daily", checked)}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <div>
                <Label htmlFor="weekly" className="text-sm font-medium">Weekly Digest</Label>
                <p className="text-xs text-gray-500">Receive a weekly summary of all notifications</p>
              </div>
            </div>
            <Switch
              id="weekly"
              checked={preferences.digest.weekly}
              onCheckedChange={(checked) => handleDigestToggle("weekly", checked)}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
            <div>
              <h4 className="font-medium text-blue-900">Current Settings</h4>
              <div className="text-sm text-blue-700 mt-1 space-y-1">
                <p>• {Object.values(preferences.channels).filter(Boolean).length} notification channel{Object.values(preferences.channels).filter(Boolean).length !== 1 ? 's' : ''} enabled</p>
                <p>• {Object.values(preferences.kinds).filter(Boolean).length} notification type{Object.values(preferences.kinds).filter(Boolean).length !== 1 ? 's' : ''} enabled</p>
                <p>• {Object.values(preferences.digest).filter(Boolean).length} digest option{Object.values(preferences.digest).filter(Boolean).length !== 1 ? 's' : ''} enabled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
