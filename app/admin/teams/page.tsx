"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Building2,
    Users,
    User,
    Crown,
    Calendar,
    Search,
    Plus,
    Edit,
    Trash2,
    UserPlus,
    Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TeamsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Note: getTeams function was removed, teams functionality simplified
  const teams = []
  const users = useQuery(api.users.getAll)
  // Note: getUserStats function was removed, using getAll instead

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getManagerName = (managerId: string) => {
    const manager = users?.find(u => u._id === managerId)
    return manager?.name || "Unknown Manager"
  }

  const getMemberNames = (memberIds: string[]) => {
    if (!memberIds || memberIds.length === 0) return []
    return memberIds.map(id => {
      const member = users?.find(u => u._id === id)
      return member?.name || "Unknown Member"
    })
  }

  const filteredTeams = teams?.filter(team => {
    const matchesSearch = !searchQuery || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && team.isActive) ||
      (statusFilter === "inactive" && !team.isActive)

    return matchesSearch && matchesStatus
  }) || []

  if (teams === undefined) {
    return (
      <AdminSidebar>
        <div className="flex-1 space-y-6 p-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading teams...</div>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">
              Manage teams, assign members, and organize workflows
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalTeams || 0}</div>
              <p className="text-xs text-muted-foreground">
                {userStats?.activeTeams || 0} active teams
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all teams
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.managers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Team leaders
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams && teams.length > 0 
                  ? Math.round(teams.reduce((acc, team) => acc + (team.members?.length || 0), 0) / teams.length)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Members per team
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="active">Active Teams</SelectItem>
                  <SelectItem value="inactive">Inactive Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Teams Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Teams List
            </CardTitle>
            <CardDescription>
              Manage team structure, members, and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTeams.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Teams Found
                </h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "No teams have been created yet"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.map((team) => (
                    <TableRow key={team._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-sm text-gray-500">
                              {team.members?.length || 0} members
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {team.managerId ? (
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            {getManagerName(team.managerId)}
                          </div>
                        ) : (
                          <span className="text-gray-400">No Manager</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {team.members && team.members.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {getMemberNames(team.members).slice(0, 3).map((name, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))}
                              {team.members.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{team.members.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No Members</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={team.description}>
                          {team.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={team.isActive ? "default" : "secondary"}
                        >
                          {team.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {formatDate(team.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
} 