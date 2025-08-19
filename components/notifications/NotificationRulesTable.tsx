"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Plus, Edit, Trash2, Copy, ToggleLeft, ToggleRight, Bell, Users, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/components/ui/mock-auth-components"
import { NotificationRuleModal } from "./NotificationRuleModal"

interface NotificationRulesTableProps {
  onRuleCreated?: () => void
}

export function NotificationRulesTable({ onRuleCreated }: NotificationRulesTableProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)

  const currentUserId = user?.emailAddresses?.[0]?.emailAddress || ""
  const isAuthed = currentUserId.length > 0

  // TODO: Replace with actual notification rules query when implemented
  const rules = useQuery(
    api.notifications.getNotificationRules,
    isAuthed ? { userId: currentUserId } : ("skip" as any)
  ) || []

  const toggleRule = useMutation(api.notifications.toggleNotificationRule)
  const deleteRule = useMutation(api.notifications.deleteNotificationRule)

  const handleCreateRule = () => {
    setEditingRule(null)
    setIsModalOpen(true)
  }

  const handleEditRule = (rule: any) => {
    setEditingRule(rule)
    setIsModalOpen(true)
  }

  const handleDuplicateRule = (rule: any) => {
    setEditingRule({ ...rule, name: `${rule.name} (Copy)`, _id: undefined })
    setIsModalOpen(true)
  }

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteRule({ ruleId, userId: currentUserId })
      toast({ title: "Rule deleted", description: "Notification rule has been deleted" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete rule", variant: "destructive" })
    }
  }

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await toggleRule({ ruleId, userId: currentUserId, enabled })
      toast({ 
        title: `Rule ${enabled ? 'enabled' : 'disabled'}`, 
        description: `Notification rule has been ${enabled ? 'enabled' : 'disabled'}` 
      })
    } catch (error) {
      toast({ title: "Error", description: "Failed to toggle rule", variant: "destructive" })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingRule(null)
    if (onRuleCreated) {
      onRuleCreated()
    }
  }

  const getKindLabel = (kind: string) => {
    const kindMap: Record<string, string> = {
      "item.flagged": "Item Flagged",
      "item.defective": "Item Defective", 
      "item.stuck": "Item Stuck",
      "message.inbound": "Inbound Message",
      "order.completed": "Order Completed",
      "order.behind": "Order Behind Schedule",
      "materials.lowstock": "Materials Low Stock",
      "materials.received": "Materials Received",
      "system.alert": "System Alert",
    }
    return kindMap[kind] || kind
  }

  const getSeverityBadge = (severity: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "outline",
      medium: "secondary", 
      high: "default",
      urgent: "destructive",
    }
    return <Badge variant={variantMap[severity] || "outline"} className="text-xs">{severity}</Badge>
  }

  const getChannelsBadges = (channels: string[]) => {
    return channels.map(channel => (
      <Badge key={channel} variant="outline" className="text-xs mr-1">
        {channel === "inApp" ? "In-App" : channel}
      </Badge>
    ))
  }

  const formatLastTriggered = (timestamp: number | undefined) => {
    if (!timestamp) return "Never"
    const d = new Date(timestamp)
    const now = new Date()
    const m = (now.getTime() - d.getTime()) / 60000
    const h = m / 60
    const days = h / 24
    
    if (m < 1) return "Just now"
    if (m < 60) return `${Math.floor(m)}m ago`
    if (h < 24) return `${Math.floor(h)}h ago`
    if (days < 7) return `${Math.floor(days)}d ago`
    return d.toLocaleDateString()
  }

  if (!isAuthed) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to view notification rules.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification Rules</h3>
          <p className="text-sm text-gray-500">Manage when and how you receive notifications</p>
        </div>
        <Button onClick={handleCreateRule} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Rules table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead>Last Triggered</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length > 0 ? (
              rules.map((rule) => (
                <TableRow key={rule._id}>
                  <TableCell>
                    <Switch
                      checked={rule.isEnabled}
                      onCheckedChange={(enabled) => handleToggleRule(rule._id, enabled)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-gray-500">{rule.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-400" />
                      {getKindLabel(rule.kind)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rule.severity ? getSeverityBadge(rule.severity) : <span className="text-gray-400">Any</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{rule.recipients?.length || 0} users</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getChannelsBadges(rule.channels || [])}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatLastTriggered(rule.lastTriggeredAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateRule(rule)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRule(rule._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="space-y-2">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <Bell className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold">No notification rules</h3>
                    <p className="text-sm text-gray-500">
                      Create your first notification rule to start receiving alerts
                    </p>
                    <Button onClick={handleCreateRule} className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Rule Modal */}
      <NotificationRuleModal
        open={isModalOpen}
        onClose={handleModalClose}
        rule={editingRule}
      />
    </div>
  )
}
