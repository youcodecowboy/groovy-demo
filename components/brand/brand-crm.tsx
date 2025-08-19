'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Grid, 
  List, 
  Plus, 
  Mail, 
  Phone, 
  Building, 
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Users2,
  Filter,
  MoreHorizontal,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  UserPlus,
  FileText,
  MessageSquare,
  ExternalLink,
  Settings
} from 'lucide-react'
import { format, subDays } from 'date-fns'

// Mock CRM data
interface CRMContact {
  id: string
  name: string
  company: string
  role: string
  email: string
  phone?: string
  location: string
  tags: string[]
  lastContact: Date
  totalOrders: number
  totalValue: number
  status: 'prospect' | 'lead' | 'qualified' | 'negotiation' | 'active' | 'inactive' | 'churned'
  source: 'referral' | 'website' | 'trade_show' | 'cold_outreach' | 'partnership' | 'social_media'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  nextFollowUp?: Date
  notes: string[]
}

const mockContacts: CRMContact[] = [
  {
    id: 'contact-1',
    name: 'Sarah Johnson',
    company: 'Fashion Forward Inc.',
    role: 'Head of Sourcing',
    email: 'sarah@fashionforward.com',
    phone: '+1-555-0123',
    location: 'New York, NY',
    tags: ['Premium', 'Large Volume', 'Sustainable'],
    lastContact: subDays(new Date(), 3),
    totalOrders: 12,
    totalValue: 450000,
    status: 'active',
    source: 'trade_show',
    priority: 'high',
    nextFollowUp: subDays(new Date(), 2),
    notes: ['Interested in sustainable materials', 'Prefers weekly updates']
  },
  {
    id: 'contact-2',
    name: 'Michael Chen',
    company: 'Urban Threads',
    role: 'Procurement Manager',
    email: 'mchen@urbanthreads.com',
    phone: '+1-555-0124',
    location: 'Los Angeles, CA',
    tags: ['Fast Fashion', 'Quick Turnaround'],
    lastContact: subDays(new Date(), 7),
    totalOrders: 8,
    totalValue: 180000,
    status: 'qualified',
    source: 'website',
    priority: 'medium',
    nextFollowUp: subDays(new Date(), 5),
    notes: ['Looking for new suppliers', 'Budget conscious']
  },
  {
    id: 'contact-3',
    name: 'Emma Rodriguez',
    company: 'Eco Apparel Co.',
    role: 'Supply Chain Director',
    email: 'emma@ecoapparelco.com',
    location: 'Portland, OR',
    tags: ['Organic', 'Sustainable', 'Small Batch'],
    lastContact: subDays(new Date(), 14),
    totalOrders: 5,
    totalValue: 75000,
    status: 'lead',
    source: 'referral',
    priority: 'high',
    nextFollowUp: subDays(new Date(), 1),
    notes: ['Very interested in our eco-friendly options', 'Decision maker']
  },
  {
    id: 'contact-4',
    name: 'David Kim',
    company: 'Luxury Brands Ltd.',
    role: 'VP of Operations',
    email: 'dkim@luxurybrands.com',
    phone: '+1-555-0126',
    location: 'Miami, FL',
    tags: ['Luxury', 'High-End', 'Custom'],
    lastContact: subDays(new Date(), 21),
    totalOrders: 15,
    totalValue: 890000,
    status: 'negotiation',
    source: 'partnership',
    priority: 'urgent',
    nextFollowUp: new Date(),
    notes: ['Contract negotiation in progress', 'High-value opportunity']
  },
  {
    id: 'contact-5',
    name: 'Lisa Thompson',
    company: 'Startup Apparel',
    role: 'Founder',
    email: 'lisa@startupapparel.com',
    location: 'Austin, TX',
    tags: ['Startup', 'Growth Stage', 'Tech-Enabled'],
    lastContact: subDays(new Date(), 45),
    totalOrders: 2,
    totalValue: 25000,
    status: 'inactive',
    source: 'cold_outreach',
    priority: 'low',
    notes: ['Limited budget', 'May re-engage later']
  },
  {
    id: 'contact-6',
    name: 'Alex Morgan',
    company: 'Athletic Wear Pro',
    role: 'Sourcing Specialist',
    email: 'alex@athleticwearpro.com',
    phone: '+1-555-0127',
    location: 'Denver, CO',
    tags: ['Athletic', 'Performance', 'Bulk Orders'],
    lastContact: subDays(new Date(), 1),
    totalOrders: 0,
    totalValue: 0,
    status: 'prospect',
    source: 'social_media',
    priority: 'medium',
    nextFollowUp: subDays(new Date(), 7),
    notes: ['New prospect', 'Interested in performance materials']
  }
]

const statusColors = {
  prospect: 'bg-gray-100 text-gray-800',
  lead: 'bg-blue-100 text-blue-800',
  qualified: 'bg-purple-100 text-purple-800',
  negotiation: 'bg-orange-100 text-orange-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  churned: 'bg-red-100 text-red-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const sourceLabels = {
  referral: 'Referral',
  website: 'Website',
  trade_show: 'Trade Show',
  cold_outreach: 'Cold Outreach',
  partnership: 'Partnership',
  social_media: 'Social Media'
}

const pipelineStages = [
  { key: 'prospect', label: 'Prospects', color: 'bg-gray-100', count: 0 },
  { key: 'lead', label: 'Leads', color: 'bg-blue-100', count: 0 },
  { key: 'qualified', label: 'Qualified', color: 'bg-purple-100', count: 0 },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-100', count: 0 },
  { key: 'active', label: 'Active', color: 'bg-green-100', count: 0 }
]

export function BrandCRM() {
  const [contacts, setContacts] = useState<CRMContact[]>(mockContacts)
  const [filteredContacts, setFilteredContacts] = useState<CRMContact[]>(mockContacts)
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    let filtered = [...contacts]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(search) ||
        contact.company.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter)
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(contact => contact.source === sourceFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(contact => contact.priority === priorityFilter)
    }

    setFilteredContacts(filtered)
  }, [contacts, searchTerm, statusFilter, sourceFilter, priorityFilter])

  const totalContacts = contacts.length
  const activeContacts = contacts.filter(c => c.status === 'active').length
  const totalValue = contacts.reduce((sum, contact) => sum + contact.totalValue, 0)
  const avgOrderValue = totalValue / contacts.reduce((sum, contact) => sum + contact.totalOrders, 0) || 0
  const urgentFollowUps = contacts.filter(c => c.nextFollowUp && c.nextFollowUp <= new Date()).length

  // Calculate pipeline counts
  const pipelineData = pipelineStages.map(stage => ({
    ...stage,
    count: contacts.filter(c => c.status === stage.key).length
  }))

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return AlertTriangle
      case 'high': return Target
      case 'medium': return Clock
      case 'low': return CheckCircle
      default: return Clock
    }
  }

  const getFollowUpStatus = (contact: CRMContact) => {
    if (!contact.nextFollowUp) return null
    const now = new Date()
    const diffDays = Math.ceil((contact.nextFollowUp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: 'text-red-600' }
    if (diffDays === 0) return { status: 'today', text: 'Today', color: 'text-orange-600' }
    if (diffDays <= 3) return { status: 'soon', text: `${diffDays} days`, color: 'text-yellow-600' }
    return { status: 'upcoming', text: `${diffDays} days`, color: 'text-gray-600' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">CRM</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{totalContacts}</p>
              </div>
              <Users2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold">{activeContacts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">${(avgOrderValue / 1000).toFixed(0)}K</p>
              </div>
              <Building className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow-ups Due</p>
                <p className="text-2xl font-bold">{urgentFollowUps}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sales Pipeline</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total Value:</span>
              <span className="text-lg font-bold text-green-600">
                ${(totalValue / 1000).toFixed(0)}K
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineData.map((stage) => (
              <Card key={stage.key} className="min-h-96">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stage.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredContacts
                    .filter(contact => contact.status === stage.key)
                    .map((contact) => (
                      <Card key={contact.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{contact.name}</p>
                              <p className="text-xs text-gray-600 truncate">{contact.company}</p>
                            </div>
                            <Badge className={`text-xs ${priorityColors[contact.priority]}`}>
                              {contact.priority}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              ${(contact.totalValue / 1000).toFixed(0)}K
                            </span>
                            {contact.nextFollowUp && (
                              <span className={getFollowUpStatus(contact)?.color}>
                                {getFollowUpStatus(contact)?.text}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusColors).map(([value, color]) => (
                  <SelectItem key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(priorityColors).map(([value, color]) => (
                  <SelectItem key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
                className="rounded-r-none"
              >
                Pipeline
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {(statusFilter !== 'all' || sourceFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setSourceFilter('all')
                  setPriorityFilter('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredContacts.length} {filteredContacts.length === 1 ? 'Contact' : 'Contacts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => {
                    const PriorityIcon = getPriorityIcon(contact.priority)
                    const followUpStatus = getFollowUpStatus(contact)
                    
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {contact.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-gray-600">{contact.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contact.company}</p>
                            <p className="text-sm text-gray-600">{contact.location}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[contact.status]}>
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <PriorityIcon className="h-3 w-3" />
                            <Badge variant="outline" className={priorityColors[contact.priority]}>
                              {contact.priority}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{contact.totalOrders}</TableCell>
                        <TableCell>${(contact.totalValue / 1000).toFixed(0)}K</TableCell>
                        <TableCell>
                          {followUpStatus ? (
                            <span className={followUpStatus.color}>
                              {followUpStatus.text}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' || priorityFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Get started by adding your first contact"
              }
            </p>
            {!searchTerm && statusFilter === 'all' && sourceFilter === 'all' && priorityFilter === 'all' && (
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
