"use client"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { X, Bell, Users, Mail, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/components/ui/mock-auth-components"

interface NotificationRuleModalProps {
  open: boolean
  onClose: () => void
  rule?: any
}

const notificationKinds = [
  { value: "item.flagged", label: "Item Flagged", description: "When an item is flagged for review" },
  { value: "item.defective", label: "Item Defective", description: "When an item is marked as defective" },
  { value: "item.stuck", label: "Item Stuck", description: "When an item is stuck in a stage for too long" },
  { value: "message.inbound", label: "Inbound Message", description: "When a new message is received" },
  { value: "order.completed", label: "Order Completed", description: "When an order is completed" },
  { value: "order.behind", label: "Order Behind Schedule", description: "When an order is behind schedule" },
  { value: "materials.lowstock", label: "Materials Low Stock", description: "When materials are running low" },
  { value: "materials.received", label: "Materials Received", description: "When materials are received" },
  { value: "system.alert", label: "System Alert", description: "System-wide alerts and notifications" },
]

const severityOptions = [
  { value: "", label: "Any Severity" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

const channelOptions = [
  { value: "inApp", label: "In-App", description: "Show in notification center" },
  { value: "email", label: "Email", description: "Send email notification" },
]

export function NotificationRuleModal({ open, onClose, rule }: NotificationRuleModalProps) {
  const { toast } = useToast()
  const { user } = useUser()
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    kind: "",
    severity: "",
    channels: [] as string[],
    recipients: [] as string[],
    conditions: {} as Record<string, any>,
    isEnabled: true,
  })

  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const currentUserId = user?.emailAddresses?.[0]?.emailAddress || ""
  const isAuthed = currentUserId.length > 0

  const createRule = useMutation(api.notifications.createNotificationRule)
  const updateRule = useMutation(api.notifications.updateNotificationRule)

  // Load available users (mock data for now)
  useEffect(() => {
    if (isAuthed) {
      // TODO: Replace with actual users query
      setAvailableUsers([
        { _id: "user1", name: "John Doe", email: "john@example.com" },
        { _id: "user2", name: "Jane Smith", email: "jane@example.com" },
        { _id: "user3", name: "Bob Johnson", email: "bob@example.com" },
      ])
    }
  }, [isAuthed])

  // Initialize form data when editing
  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || "",
        description: rule.description || "",
        kind: rule.kind || "",
        severity: rule.severity || "",
        channels: rule.channels || ["inApp"],
        recipients: rule.recipients || [],
        conditions: rule.conditions || {},
        isEnabled: rule.isEnabled !== false,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        kind: "",
        severity: "",
        channels: ["inApp"],
        recipients: [],
        conditions: {},
        isEnabled: true,
      })
    }
  }, [rule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthed) return

    if (!formData.name || !formData.kind) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const ruleData = {
        name: formData.name,
        description: formData.description,
        kind: formData.kind,
        severity: formData.severity || undefined,
        channels: formData.channels,
        recipients: formData.recipients,
        conditions: formData.conditions,
        isEnabled: formData.isEnabled,
        userId: currentUserId,
      }

      if (rule?._id) {
        await updateRule({ ruleId: rule._id, ...ruleData })
        toast({ title: "Rule updated", description: "Notification rule has been updated" })
      } else {
        await createRule(ruleData)
        toast({ title: "Rule created", description: "Notification rule has been created" })
      }

      onClose()
    } catch (error) {
      toast({ title: "Error", description: "Failed to save rule", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChannelToggle = (channel: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        channels: [...prev.channels, channel]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        channels: prev.channels.filter(c => c !== channel)
      }))
    }
  }

  const handleRecipientToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, userId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter(r => r !== userId)
      }))
    }
  }

  const handleConditionChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [key]: value
      }
    }))
  }

  const getConditionFields = () => {
    switch (formData.kind) {
      case "item.stuck":
        return (
          <div className="space-y-2">
            <Label htmlFor="stageTimeoutHours">Stage Timeout (hours)</Label>
            <Input
              id="stageTimeoutHours"
              type="number"
              min="1"
              value={formData.conditions.stageTimeoutHours || ""}
              onChange={(e) => handleConditionChange("stageTimeoutHours", parseInt(e.target.value) || 4)}
              placeholder="4"
            />
          </div>
        )
      case "order.behind":
        return (
          <div className="space-y-2">
            <Label htmlFor="lateByHours">Late by (hours)</Label>
            <Input
              id="lateByHours"
              type="number"
              min="1"
              value={formData.conditions.lateByHours || ""}
              onChange={(e) => handleConditionChange("lateByHours", parseInt(e.target.value) || 12)}
              placeholder="12"
            />
          </div>
        )
      case "materials.lowstock":
        return (
          <div className="space-y-2">
            <Label htmlFor="belowQty">Below Quantity</Label>
            <Input
              id="belowQty"
              type="number"
              min="1"
              value={formData.conditions.belowQty || ""}
              onChange={(e) => handleConditionChange("belowQty", parseInt(e.target.value) || 10)}
              placeholder="10"
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {rule ? "Edit Notification Rule" : "Create Notification Rule"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Alert when items are stuck"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of this rule"
                rows={2}
              />
            </div>
          </div>

          {/* Rule Type */}
          <div className="space-y-4">
            <Label>Notification Type *</Label>
            <Select value={formData.kind} onValueChange={(value) => setFormData(prev => ({ ...prev, kind: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                {notificationKinds.map((kind) => (
                  <SelectItem key={kind.value} value={kind.value}>
                    <div>
                      <div className="font-medium">{kind.label}</div>
                      <div className="text-sm text-gray-500">{kind.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-4">
            <Label>Severity Level</Label>
            <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditions */}
          {formData.kind && (
            <div className="space-y-4">
              <Label>Conditions</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                {getConditionFields()}
              </div>
            </div>
          )}

          {/* Channels */}
          <div className="space-y-4">
            <Label>Notification Channels</Label>
            <div className="space-y-2">
              {channelOptions.map((channel) => (
                <div key={channel.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`channel-${channel.value}`}
                    checked={formData.channels.includes(channel.value)}
                    onCheckedChange={(checked) => handleChannelToggle(channel.value, checked as boolean)}
                  />
                  <Label htmlFor={`channel-${channel.value}`} className="flex items-center gap-2">
                    {channel.label}
                    <span className="text-sm text-gray-500">({channel.description})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-4">
            <Label>Recipients</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableUsers.map((user) => (
                <div key={user._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`recipient-${user._id}`}
                    checked={formData.recipients.includes(user._id)}
                    onCheckedChange={(checked) => handleRecipientToggle(user._id, checked as boolean)}
                  />
                  <Label htmlFor={`recipient-${user._id}`} className="flex items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-gray-500">({user.email})</span>
                  </Label>
                </div>
              ))}
            </div>
            {formData.recipients.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.recipients.map((recipientId) => {
                  const user = availableUsers.find(u => u._id === recipientId)
                  return (
                    <Badge key={recipientId} variant="secondary" className="text-xs">
                      {user?.name || recipientId}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isEnabled"
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked as boolean }))}
            />
            <Label htmlFor="isEnabled">Enable this rule</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (rule ? "Update Rule" : "Create Rule")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
