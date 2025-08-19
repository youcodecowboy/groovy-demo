'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Eye, 
  Settings, 
  Search,
  MoreVertical,
  Crown,
  Key,
  Factory
} from 'lucide-react'
import { format } from 'date-fns'

// Mock team data
interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: Date
  lastActive: Date
  factoryAccess: string[]
}

const mockTeamMembers: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Sarah Johnson',
    email: 'sarah@fashionbrand.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2023-01-15'),
    lastActive: new Date('2024-01-20T10:00:00Z'),
    factoryAccess: ['all']
  },
  {
    id: 'member-2',
    name: 'Michael Chen',
    email: 'michael@fashionbrand.com',
    role: 'manager',
    status: 'active',
    joinedAt: new Date('2023-03-20'),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    factoryAccess: ['fact-001', 'fact-002', 'fact-003']
  },
  {
    id: 'member-3',
    name: 'Emma Rodriguez',
    email: 'emma@fashionbrand.com',
    role: 'viewer',
    status: 'active',
    joinedAt: new Date('2023-06-10'),
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    factoryAccess: ['fact-005']
  },
  {
    id: 'member-4',
    name: 'David Kim',
    email: 'david@fashionbrand.com',
    role: 'manager',
    status: 'pending',
    joinedAt: new Date('2024-01-20'),
    lastActive: new Date('2024-01-20'),
    factoryAccess: ['fact-001', 'fact-004']
  }
]

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800'
}

const roleIcons = {
  admin: Crown,
  manager: Key,
  viewer: Eye
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800'
}

export function BrandTeam() {
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalMembers = members.length
  const activeMembers = members.filter(m => m.status === 'active').length
  const pendingInvites = members.filter(m => m.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Team Settings
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">{activeMembers}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingInvites}</p>
              </div>
              <Mail className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {(roleFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setRoleFilter('all')
                  setStatusFilter('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredMembers.length} {filteredMembers.length === 1 ? 'Member' : 'Members'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.map((member) => {
              const RoleIcon = roleIcons[member.role]
              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge className={roleColors[member.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {member.role}
                        </Badge>
                        <Badge className={statusColors[member.status]}>
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>Joined {format(member.joinedAt, 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>
                          Last active {member.lastActive.toDateString() === new Date('2024-01-20T10:00:00Z').toDateString() ? 'today' : format(member.lastActive, 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Factory className="h-3 w-3" />
                        <span>
                          {member.factoryAccess.includes('all') 
                            ? 'All factories' 
                            : `${member.factoryAccess.length} factories`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-red-500" />
                <span className="font-medium">Admin</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• Full access to all features</li>
                <li>• Manage team members</li>
                <li>• Billing and settings</li>
                <li>• All factory access</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Manager</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• Manage orders and production</li>
                <li>• Factory communication</li>
                <li>• View reports and analytics</li>
                <li>• Assigned factory access</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Viewer</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• View orders and progress</li>
                <li>• Read-only access</li>
                <li>• Basic reports</li>
                <li>• Limited factory access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
