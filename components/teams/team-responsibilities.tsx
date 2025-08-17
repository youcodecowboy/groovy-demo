"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Users,
  Shield,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
} from "lucide-react"

interface Responsibility {
  id: string
  title: string
  description: string
  category: "production" | "quality" | "safety" | "maintenance" | "training"
  priority: "low" | "medium" | "high" | "critical"
  estimatedTime: number // in minutes
  requiredSkills: string[]
  isActive: boolean
}

interface TeamRole {
  id: string
  name: string
  description: string
  permissions: string[]
  responsibilities: string[]
  level: "junior" | "intermediate" | "senior" | "lead"
  isActive: boolean
}

interface TeamResponsibilitiesProps {
  teamId: string
  onSave?: (responsibilities: Responsibility[], roles: TeamRole[]) => void
}

const RESPONSIBILITY_CATEGORIES = [
  { value: "production", label: "Production", color: "bg-blue-100 text-blue-800" },
  { value: "quality", label: "Quality Control", color: "bg-green-100 text-green-800" },
  { value: "safety", label: "Safety", color: "bg-red-100 text-red-800" },
  { value: "maintenance", label: "Maintenance", color: "bg-orange-100 text-orange-800" },
  { value: "training", label: "Training", color: "bg-purple-100 text-purple-800" },
]

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
]

const ROLE_LEVELS = [
  { value: "junior", label: "Junior", color: "bg-blue-100 text-blue-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-green-100 text-green-800" },
  { value: "senior", label: "Senior", color: "bg-orange-100 text-orange-800" },
  { value: "lead", label: "Lead", color: "bg-purple-100 text-purple-800" },
]

const AVAILABLE_PERMISSIONS = [
  "view_items",
  "edit_items",
  "complete_stages",
  "flag_items",
  "assign_items",
  "view_reports",
  "edit_workflows",
  "manage_team",
  "approve_items",
  "view_analytics",
]

export function TeamResponsibilities({ teamId, onSave }: TeamResponsibilitiesProps) {
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([])
  const [roles, setRoles] = useState<TeamRole[]>([])
  const [editingResponsibility, setEditingResponsibility] = useState<Responsibility | null>(null)
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null)
  const [showResponsibilityForm, setShowResponsibilityForm] = useState(false)
  const [showRoleForm, setShowRoleForm] = useState(false)

  const [responsibilityForm, setResponsibilityForm] = useState({
    title: "",
    description: "",
    category: "production" as const,
    priority: "medium" as const,
    estimatedTime: 30,
    requiredSkills: [] as string[],
  })

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    responsibilities: [] as string[],
    level: "intermediate" as const,
  })

  const addResponsibility = () => {
    if (!responsibilityForm.title.trim()) {
      toast.error("Responsibility title is required")
      return
    }

    const newResponsibility: Responsibility = {
      id: Date.now().toString(),
      ...responsibilityForm,
      isActive: true,
    }

    setResponsibilities([...responsibilities, newResponsibility])
    setShowResponsibilityForm(false)
    resetResponsibilityForm()
    toast.success("Responsibility added successfully")
  }

  const updateResponsibility = () => {
    if (!editingResponsibility || !responsibilityForm.title.trim()) {
      toast.error("Responsibility title is required")
      return
    }

    const updatedResponsibilities = responsibilities.map(r =>
      r.id === editingResponsibility.id
        ? { ...r, ...responsibilityForm }
        : r
    )

    setResponsibilities(updatedResponsibilities)
    setEditingResponsibility(null)
    setShowResponsibilityForm(false)
    resetResponsibilityForm()
    toast.success("Responsibility updated successfully")
  }

  const deleteResponsibility = (id: string) => {
    setResponsibilities(responsibilities.filter(r => r.id !== id))
    toast.success("Responsibility deleted successfully")
  }

  const addRole = () => {
    if (!roleForm.name.trim()) {
      toast.error("Role name is required")
      return
    }

    const newRole: TeamRole = {
      id: Date.now().toString(),
      ...roleForm,
      isActive: true,
    }

    setRoles([...roles, newRole])
    setShowRoleForm(false)
    resetRoleForm()
    toast.success("Role added successfully")
  }

  const updateRole = () => {
    if (!editingRole || !roleForm.name.trim()) {
      toast.error("Role name is required")
      return
    }

    const updatedRoles = roles.map(r =>
      r.id === editingRole.id
        ? { ...r, ...roleForm }
        : r
    )

    setRoles(updatedRoles)
    setEditingRole(null)
    setShowRoleForm(false)
    resetRoleForm()
    toast.success("Role updated successfully")
  }

  const deleteRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id))
    toast.success("Role deleted successfully")
  }

  const resetResponsibilityForm = () => {
    setResponsibilityForm({
      title: "",
      description: "",
      category: "production",
      priority: "medium",
      estimatedTime: 30,
      requiredSkills: [],
    })
  }

  const resetRoleForm = () => {
    setRoleForm({
      name: "",
      description: "",
      permissions: [],
      responsibilities: [],
      level: "intermediate",
    })
  }

  const openEditResponsibility = (responsibility: Responsibility) => {
    setEditingResponsibility(responsibility)
    setResponsibilityForm({
      title: responsibility.title,
      description: responsibility.description,
      category: responsibility.category,
      priority: responsibility.priority,
      estimatedTime: responsibility.estimatedTime,
      requiredSkills: responsibility.requiredSkills,
    })
    setShowResponsibilityForm(true)
  }

  const openEditRole = (role: TeamRole) => {
    setEditingRole(role)
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      responsibilities: role.responsibilities,
      level: role.level,
    })
    setShowRoleForm(true)
  }

  const handleSave = () => {
    onSave?.(responsibilities, roles)
    toast.success("Team responsibilities saved successfully")
  }

  const getCategoryColor = (category: string) => {
    return RESPONSIBILITY_CATEGORIES.find(c => c.value === category)?.color || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.value === priority)?.color || "bg-gray-100 text-gray-800"
  }

  const getLevelColor = (level: string) => {
    return ROLE_LEVELS.find(l => l.value === level)?.color || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Responsibilities</h2>
          <p className="text-gray-600 mt-1">Configure roles, permissions, and responsibilities for your team</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Responsibilities Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Responsibilities
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResponsibilityForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Responsibility
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {responsibilities.map((responsibility) => (
                <div key={responsibility.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{responsibility.title}</h3>
                        <Badge className={getCategoryColor(responsibility.category)}>
                          {RESPONSIBILITY_CATEGORIES.find(c => c.value === responsibility.category)?.label}
                        </Badge>
                        <Badge className={getPriorityColor(responsibility.priority)}>
                          {PRIORITY_LEVELS.find(p => p.value === responsibility.priority)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{responsibility.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {responsibility.estimatedTime} min
                        </span>
                        {responsibility.requiredSkills.length > 0 && (
                          <span>{responsibility.requiredSkills.length} skills required</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditResponsibility(responsibility)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteResponsibility(responsibility.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {responsibilities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No responsibilities configured</p>
                  <p className="text-sm">Add responsibilities to define what your team should handle</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roles Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Team Roles
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRoleForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{role.name}</h3>
                        <Badge className={getLevelColor(role.level)}>
                          {ROLE_LEVELS.find(l => l.value === role.level)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditRole(role)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRole(role.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No roles configured</p>
                  <p className="text-sm">Add roles to define team member permissions and responsibilities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Responsibility Dialog */}
      {showResponsibilityForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingResponsibility ? "Edit Responsibility" : "Add Responsibility"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowResponsibilityForm(false)
                  setEditingResponsibility(null)
                  resetResponsibilityForm()
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={responsibilityForm.title}
                  onChange={(e) => setResponsibilityForm({ ...responsibilityForm, title: e.target.value })}
                  placeholder="Enter responsibility title"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={responsibilityForm.description}
                  onChange={(e) => setResponsibilityForm({ ...responsibilityForm, description: e.target.value })}
                  placeholder="Enter responsibility description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={responsibilityForm.category}
                    onValueChange={(value: any) => setResponsibilityForm({ ...responsibilityForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSIBILITY_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={responsibilityForm.priority}
                    onValueChange={(value: any) => setResponsibilityForm({ ...responsibilityForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Estimated Time (minutes)</Label>
                <Input
                  type="number"
                  value={responsibilityForm.estimatedTime}
                  onChange={(e) => setResponsibilityForm({ ...responsibilityForm, estimatedTime: parseInt(e.target.value) || 0 })}
                  placeholder="30"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResponsibilityForm(false)
                    setEditingResponsibility(null)
                    resetResponsibilityForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingResponsibility ? updateResponsibility : addResponsibility}>
                  {editingResponsibility ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Role Dialog */}
      {showRoleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingRole ? "Edit Role" : "Add Role"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRoleForm(false)
                  setEditingRole(null)
                  resetRoleForm()
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Role Name</Label>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Level</Label>
                <Select
                  value={roleForm.level}
                  onValueChange={(value: any) => setRoleForm({ ...roleForm, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Permissions</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission} className="flex items-center gap-2">
                      <Switch
                        checked={roleForm.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRoleForm({
                              ...roleForm,
                              permissions: [...roleForm.permissions, permission]
                            })
                          } else {
                            setRoleForm({
                              ...roleForm,
                              permissions: roleForm.permissions.filter(p => p !== permission)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRoleForm(false)
                    setEditingRole(null)
                    resetRoleForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingRole ? updateRole : addRole}>
                  {editingRole ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

