"use client"

import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Plus,
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Settings,
  BarChart3,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useAuth } from "@/components/providers/mock-auth-provider"
import { TeamResponsibilities } from "@/components/teams/team-responsibilities"

interface TeamFormData {
  name: string
  description: string
  managerId: string
  members: string[]
}

export default function TeamsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [showMemberDialog, setShowMemberDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [showResponsibilities, setShowResponsibilities] = useState(false)
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "",
    managerId: "",
    members: [],
  })

  // Queries
  const teams = useQuery(api.teams.getAll) || []
  const users = useQuery(api.users.getAll) || []
  const teamStats = useQuery(api.teams.getStats, { teamId: selectedTeam?._id }) || null
  const teamPerformance = useQuery(api.teams.getPerformance, { teamId: selectedTeam?._id, days: 30 }) || null

  // Mutations
  const createTeam = useMutation(api.teams.create)
  const updateTeam = useMutation(api.teams.update)
  const deleteTeam = useMutation(api.teams.deleteTeam)
  const addMember = useMutation(api.teams.addMember)
  const removeMember = useMutation(api.teams.removeMember)
  const setManager = useMutation(api.teams.setManager)

  // Filter teams based on search query
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) {
      toast.error("Team name is required")
      return
    }

    try {
      await createTeam({
        name: formData.name,
        description: formData.description,
        managerId: formData.managerId || undefined,
        members: formData.members,
      })
      
      toast.success("Team created successfully!")
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to create team")
      console.error(error)
    }
  }

  const handleUpdateTeam = async () => {
    if (!editingTeam || !formData.name.trim()) {
      toast.error("Team name is required")
      return
    }

    try {
      await updateTeam({
        id: editingTeam._id,
        name: formData.name,
        description: formData.description,
        managerId: formData.managerId || undefined,
        members: formData.members,
      })
      
      toast.success("Team updated successfully!")
      setEditingTeam(null)
      resetForm()
    } catch (error) {
      toast.error("Failed to update team")
      console.error(error)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return

    try {
      await deleteTeam({ id: teamId as any })
      toast.success("Team deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete team")
      console.error(error)
    }
  }

  const handleAddMember = async (teamId: string, userId: string) => {
    try {
      await addMember({ teamId: teamId as any, userId })
      toast.success("Member added successfully!")
    } catch (error) {
      toast.error("Failed to add member")
      console.error(error)
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await removeMember({ teamId: teamId as any, userId })
      toast.success("Member removed successfully!")
    } catch (error) {
      toast.error("Failed to remove member")
      console.error(error)
    }
  }

  const handleSetManager = async (teamId: string, userId: string) => {
    try {
      await setManager({ teamId: teamId as any, userId })
      toast.success("Manager updated successfully!")
    } catch (error) {
      toast.error("Failed to update manager")
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      managerId: "",
      members: [],
    })
  }

  const openEditDialog = (team: any) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || "",
      managerId: team.managerId || "",
      members: team.members || [],
    })
  }

  const openMemberDialog = (team: any) => {
    setSelectedTeam(team)
    setShowMemberDialog(true)
  }

  const getUserById = (userId: string) => {
    return users.find(user => user._id === userId)
  }

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">Manage your production teams and their responsibilities</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Team
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredTeams.length} teams
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    {team.name}
                  </CardTitle>
                  {team.description && (
                    <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openMemberDialog(team)}
                    className="h-8 w-8 p-0"
                    title="Manage Members"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTeam(team)
                      setShowResponsibilities(true)
                    }}
                    className="h-8 w-8 p-0"
                    title="Configure Responsibilities"
                  >
                    <Target className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(team)}
                    className="h-8 w-8 p-0"
                    title="Edit Team"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTeam(team._id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    title="Delete Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Team Manager */}
                {team.managerId && (
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-600">Manager:</span>
                    <span className="text-sm font-medium">
                      {getUserById(team.managerId)?.name || "Unknown"}
                    </span>
                  </div>
                )}

                {/* Team Members */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Member List */}
                <div className="space-y-1">
                  {team.members.slice(0, 3).map((memberId) => {
                    const member = getUserById(memberId)
                    return (
                      <div key={memberId} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                        <span className="text-gray-700">
                          {member?.name || "Unknown User"}
                        </span>
                        {team.managerId === memberId && (
                          <Badge variant="secondary" className="text-xs">
                            Manager
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                  {team.members.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{team.members.length - 3} more members
                    </div>
                  )}
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-blue-500" />
                    <span className="text-gray-600">Active:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter team description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="team-manager">Manager</Label>
              <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>
                Create Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-team-name">Team Name</Label>
              <Input
                id="edit-team-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="edit-team-description">Description</Label>
              <Textarea
                id="edit-team-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter team description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-team-manager">Manager</Label>
              <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTeam(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTeam}>
                Update Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Members Dialog */}
      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedTeam?.name} - Team Members
            </DialogTitle>
          </DialogHeader>
          
          {selectedTeam && (
            <div className="space-y-6">
              {/* Team Stats */}
              {teamStats && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{teamStats.memberCount}</div>
                        <div className="text-sm text-gray-600">Members</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{teamStats.activeItemsCount}</div>
                        <div className="text-sm text-gray-600">Active Items</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{teamStats.completedItemsCount}</div>
                        <div className="text-sm text-gray-600">Completed (30d)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Metrics */}
              {teamPerformance && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Avg Completion Time:</span>
                        <div className="font-medium">{formatDuration(teamPerformance.averageCompletionTime)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Items per Day:</span>
                        <div className="font-medium">{teamPerformance.itemsPerDay.toFixed(1)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Members */}
              <div>
                <h3 className="font-semibold mb-3">Current Members</h3>
                <div className="space-y-2">
                  {selectedTeam.members.map((memberId: string) => {
                    const member = getUserById(memberId)
                    const isManager = selectedTeam.managerId === memberId
                    
                    return (
                      <div key={memberId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {member?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div className="font-medium">{member?.name || "Unknown User"}</div>
                            <div className="text-sm text-gray-600">{member?.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isManager ? (
                            <Badge className="bg-amber-100 text-amber-800">
                              <Crown className="w-3 h-3 mr-1" />
                              Manager
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetManager(selectedTeam._id, memberId)}
                            >
                              Make Manager
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(selectedTeam._id, memberId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Add New Member */}
              <div>
                <h3 className="font-semibold mb-3">Add New Member</h3>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => {
                    if (value && !selectedTeam.members.includes(value)) {
                      handleAddMember(selectedTeam._id, value)
                    }
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a user to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(user => !selectedTeam.members.includes(user._id))
                        .map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Team Responsibilities Dialog */}
      <Dialog open={showResponsibilities} onOpenChange={setShowResponsibilities}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {selectedTeam?.name} - Team Responsibilities
            </DialogTitle>
          </DialogHeader>
          
          {selectedTeam && (
            <TeamResponsibilities
              teamId={selectedTeam._id}
              onSave={(responsibilities, roles) => {
                console.log("Saving responsibilities:", responsibilities)
                console.log("Saving roles:", roles)
                // TODO: Implement saving to backend
                setShowResponsibilities(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
