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
  Users2
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
  status: 'prospect' | 'active' | 'inactive' | 'churned'
  source: 'referral' | 'website' | 'trade_show' | 'cold_outreach' | 'partnership'
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
    source: 'trade_show'
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
    status: 'active',
    source: 'website'
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
    status: 'prospect',
    source: 'referral'
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
    status: 'active',
    source: 'partnership'
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
    source: 'cold_outreach'
  }
]

const statusColors = {
  prospect: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  churned: 'bg-red-100 text-red-800'
}

const sourceLabels = {
  referral: 'Referral',
  website: 'Website',
  trade_show: 'Trade Show',
  cold_outreach: 'Cold Outreach',
  partnership: 'Partnership'
}

export function BrandCRM() {
  const [contacts, setContacts] = useState<CRMContact[]>(mockContacts)
  const [filteredContacts, setFilteredContacts] = useState<CRMContact[]>(mockContacts)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

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

    setFilteredContacts(filtered)
  }, [contacts, searchTerm, statusFilter, sourceFilter])

  const totalContacts = contacts.length
  const activeContacts = contacts.filter(c => c.status === 'active').length
  const totalValue = contacts.reduce((sum, contact) => sum + contact.totalValue, 0)
  const avgOrderValue = totalValue / contacts.reduce((sum, contact) => sum + contact.totalOrders, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">CRM</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

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
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
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

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
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

            {(statusFilter !== 'all' || sourceFilter !== 'all' || searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setSourceFilter('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contacts Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredContacts.length} {filteredContacts.length === 1 ? 'Contact' : 'Contacts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{contact.name}</h4>
                          <p className="text-sm text-gray-600">{contact.role}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[contact.status]}>
                        {contact.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{contact.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{contact.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          Last contact: {format(contact.lastContact, 'MMM d')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {contact.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-gray-600">Orders</p>
                        <p className="font-semibold">{contact.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Value</p>
                        <p className="font-semibold">${(contact.totalValue / 1000).toFixed(0)}K</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      {contact.phone && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
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
                      <TableCell>{contact.totalOrders}</TableCell>
                      <TableCell>${(contact.totalValue / 1000).toFixed(0)}K</TableCell>
                      <TableCell>{format(contact.lastContact, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          {contact.phone && (
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <Users2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
