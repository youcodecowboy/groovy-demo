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
  Settings,
  ArrowRight,
  ArrowLeft,
  Factory,
  Package,
  Award,
  Globe,
  Zap
} from 'lucide-react'
import { format, subDays } from 'date-fns'

// Mock sourcing pipeline data
interface SourcingPartner {
  id: string
  name: string
  type: 'factory' | 'supplier' | 'manufacturer' | 'service_provider'
  specialty: string
  location: string
  country: string
  contactPerson: string
  email: string
  phone?: string
  website?: string
  lastInteraction: Date
  totalOrders: number
  totalValue: number
  status: 'researching' | 'contacted' | 'samples_requested' | 'samples_received' | 'approved_for_orders' | 'active_partner' | 'inactive'
  source: 'referral' | 'website' | 'trade_show' | 'cold_outreach' | 'partnership' | 'social_media' | 'database'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  nextFollowUp?: Date
  notes: string[]
  certifications: string[]
  capacity: number
  leadTime: string
  minOrderQuantity: number
  qualityRating: number
  costRating: number
  reliabilityRating: number
}

const mockSourcingPartners: SourcingPartner[] = [
  {
    id: 'partner-1',
    name: 'Textile Excellence Ltd.',
    type: 'factory',
    specialty: 'Premium Cotton Garments',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    contactPerson: 'Ahmed Khan',
    email: 'ahmed@textileexcellence.com',
    phone: '+880-2-955-0123',
    website: 'www.textileexcellence.com',
    lastInteraction: subDays(new Date(), 2),
    totalOrders: 8,
    totalValue: 125000,
    status: 'active_partner',
    source: 'trade_show',
    priority: 'high',
    nextFollowUp: subDays(new Date(), 5),
    notes: ['Excellent quality, fast turnaround', 'GOTS certified', 'Prefers large orders'],
    certifications: ['GOTS', 'OEKO-TEX', 'WRAP'],
    capacity: 50000,
    leadTime: '4-6 weeks',
    minOrderQuantity: 500,
    qualityRating: 9.2,
    costRating: 7.8,
    reliabilityRating: 9.5
  },
  {
    id: 'partner-2',
    name: 'Vietnam Garment Co.',
    type: 'factory',
    specialty: 'Fast Fashion & Basics',
    location: 'Ho Chi Minh City, Vietnam',
    country: 'Vietnam',
    contactPerson: 'Nguyen Thi Mai',
    email: 'mai@vietnamgarment.com',
    phone: '+84-28-382-0124',
    website: 'www.vietnamgarment.com',
    lastInteraction: subDays(new Date(), 7),
    totalOrders: 12,
    totalValue: 180000,
    status: 'samples_received',
    source: 'referral',
    priority: 'medium',
    nextFollowUp: subDays(new Date(), 3),
    notes: ['Good for basics, competitive pricing', 'Quick sample turnaround'],
    certifications: ['WRAP', 'BSCI'],
    capacity: 75000,
    leadTime: '3-4 weeks',
    minOrderQuantity: 300,
    qualityRating: 8.5,
    costRating: 8.2,
    reliabilityRating: 8.8
  },
  {
    id: 'partner-3',
    name: 'EcoFabrics Supply',
    type: 'supplier',
    specialty: 'Sustainable Materials',
    location: 'Mumbai, India',
    country: 'India',
    contactPerson: 'Priya Patel',
    email: 'priya@ecofabrics.com',
    lastInteraction: subDays(new Date(), 14),
    totalOrders: 5,
    totalValue: 45000,
    status: 'contacted',
    source: 'website',
    priority: 'high',
    nextFollowUp: subDays(new Date(), 1),
    notes: ['Specializes in organic cotton', 'Higher cost but premium quality'],
    certifications: ['GOTS', 'Fair Trade'],
    capacity: 20000,
    leadTime: '6-8 weeks',
    minOrderQuantity: 1000,
    qualityRating: 9.5,
    costRating: 6.5,
    reliabilityRating: 9.0
  },
  {
    id: 'partner-4',
    name: 'Luxury Textiles International',
    type: 'manufacturer',
    specialty: 'High-End Fashion',
    location: 'Istanbul, Turkey',
    country: 'Turkey',
    contactPerson: 'Mehmet Yilmaz',
    email: 'mehmet@luxurytextiles.com',
    phone: '+90-212-555-0126',
    website: 'www.luxurytextiles.com',
    lastInteraction: subDays(new Date(), 21),
    totalOrders: 15,
    totalValue: 890000,
    status: 'approved_for_orders',
    source: 'partnership',
    priority: 'urgent',
    nextFollowUp: new Date(),
    notes: ['Premium partner for luxury items', 'High MOQ but excellent quality'],
    certifications: ['GOTS', 'OEKO-TEX', 'ISO 9001'],
    capacity: 25000,
    leadTime: '8-10 weeks',
    minOrderQuantity: 1000,
    qualityRating: 9.8,
    costRating: 5.5,
    reliabilityRating: 9.7
  },
  {
    id: 'partner-5',
    name: 'Startup Manufacturing Hub',
    type: 'factory',
    specialty: 'Small Batch Production',
    location: 'Austin, TX, USA',
    country: 'USA',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@startupmfg.com',
    lastInteraction: subDays(new Date(), 45),
    totalOrders: 2,
    totalValue: 25000,
    status: 'inactive',
    source: 'cold_outreach',
    priority: 'low',
    notes: ['Good for startups, higher cost', 'Limited capacity'],
    certifications: ['WRAP'],
    capacity: 5000,
    leadTime: '2-3 weeks',
    minOrderQuantity: 50,
    qualityRating: 8.0,
    costRating: 4.0,
    reliabilityRating: 8.5
  },
  {
    id: 'partner-6',
    name: 'Performance Wear Pro',
    type: 'factory',
    specialty: 'Athletic & Performance',
    location: 'Denver, CO, USA',
    country: 'USA',
    contactPerson: 'Alex Morgan',
    email: 'alex@performancewearpro.com',
    phone: '+1-303-555-0127',
    website: 'www.performancewearpro.com',
    lastInteraction: subDays(new Date(), 1),
    totalOrders: 0,
    totalValue: 0,
    status: 'researching',
    source: 'social_media',
    priority: 'medium',
    nextFollowUp: subDays(new Date(), 7),
    notes: ['New prospect', 'Interested in performance materials'],
    certifications: ['WRAP'],
    capacity: 15000,
    leadTime: '4-5 weeks',
    minOrderQuantity: 200,
    qualityRating: 8.2,
    costRating: 7.5,
    reliabilityRating: 8.0
  }
]

const statusColors = {
  researching: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  samples_requested: 'bg-purple-100 text-purple-800',
  samples_received: 'bg-orange-100 text-orange-800',
  approved_for_orders: 'bg-green-100 text-green-800',
  active_partner: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-red-100 text-red-800'
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
  social_media: 'Social Media',
  database: 'Database'
}

const typeLabels = {
  factory: 'Factory',
  supplier: 'Supplier',
  manufacturer: 'Manufacturer',
  service_provider: 'Service Provider'
}

const pipelineStages = [
  { key: 'researching', label: 'Researching', color: 'bg-gray-100', count: 0 },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-100', count: 0 },
  { key: 'samples_requested', label: 'Samples Requested', color: 'bg-purple-100', count: 0 },
  { key: 'samples_received', label: 'Samples Received', color: 'bg-orange-100', count: 0 },
  { key: 'approved_for_orders', label: 'Approved for Orders', color: 'bg-green-100', count: 0 }
]

export function BrandCRM() {
  const [partners, setPartners] = useState<SourcingPartner[]>(mockSourcingPartners)
  const [filteredPartners, setFilteredPartners] = useState<SourcingPartner[]>(mockSourcingPartners)
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    let filtered = [...partners]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(partner => 
        partner.name.toLowerCase().includes(search) ||
        partner.specialty.toLowerCase().includes(search) ||
        partner.location.toLowerCase().includes(search) ||
        partner.contactPerson.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(partner => partner.status === statusFilter)
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(partner => partner.source === sourceFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(partner => partner.type === typeFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(partner => partner.priority === priorityFilter)
    }

    setFilteredPartners(filtered)
  }, [partners, searchTerm, statusFilter, sourceFilter, typeFilter, priorityFilter])

  const totalPartners = partners.length
  const activePartners = partners.filter(p => p.status === 'active_partner').length
  const totalValue = partners.reduce((sum, partner) => sum + partner.totalValue, 0)
  const avgOrderValue = totalValue / partners.reduce((sum, partner) => sum + partner.totalOrders, 0) || 0
  const urgentFollowUps = partners.filter(p => p.nextFollowUp && p.nextFollowUp <= new Date()).length

  // Calculate pipeline counts
  const pipelineData = pipelineStages.map(stage => ({
    ...stage,
    count: partners.filter(p => p.status === stage.key).length
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

  const getFollowUpStatus = (partner: SourcingPartner) => {
    if (!partner.nextFollowUp) return null
    const now = new Date()
    const diffDays = Math.ceil((partner.nextFollowUp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: 'text-red-600' }
    if (diffDays === 0) return { status: 'today', text: 'Today', color: 'text-orange-600' }
    if (diffDays <= 3) return { status: 'soon', text: `${diffDays} days`, color: 'text-yellow-600' }
    return { status: 'upcoming', text: `${diffDays} days`, color: 'text-gray-600' }
  }

  const movePartnerStage = (partnerId: string, direction: 'forward' | 'backward') => {
    const partner = partners.find(p => p.id === partnerId)
    if (!partner) return

    const stages = ['researching', 'contacted', 'samples_requested', 'samples_received', 'approved_for_orders', 'active_partner']
    const currentIndex = stages.indexOf(partner.status)
    
    if (direction === 'forward' && currentIndex < stages.length - 1) {
      const newStatus = stages[currentIndex + 1]
      setPartners(partners.map(p => p.id === partnerId ? { ...p, status: newStatus as any } : p))
    } else if (direction === 'backward' && currentIndex > 0) {
      const newStatus = stages[currentIndex - 1]
      setPartners(partners.map(p => p.id === partnerId ? { ...p, status: newStatus as any } : p))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sourcing Pipeline</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold">{totalPartners}</p>
              </div>
              <Factory className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold">{activePartners}</p>
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
            <h2 className="text-xl font-semibold">Sourcing Pipeline</h2>
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
                  {filteredPartners
                    .filter(partner => partner.status === stage.key)
                    .map((partner) => (
                      <Card key={partner.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{partner.name}</p>
                              <p className="text-xs text-gray-600 truncate">{partner.specialty}</p>
                              <p className="text-xs text-gray-500 truncate">{partner.location}</p>
                            </div>
                            <Badge className={`text-xs ${priorityColors[partner.priority]}`}>
                              {partner.priority}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              ${(partner.totalValue / 1000).toFixed(0)}K
                            </span>
                            {partner.nextFollowUp && (
                              <span className={getFollowUpStatus(partner)?.color}>
                                {getFollowUpStatus(partner)?.text}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                movePartnerStage(partner.id, 'backward')
                              }}
                              disabled={partner.status === 'researching'}
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                movePartnerStage(partner.id, 'forward')
                              }}
                              disabled={partner.status === 'active_partner'}
                            >
                              <ArrowRight className="h-3 w-3" />
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
                  placeholder="Search partners..."
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
                  <SelectItem key={value} value={value}>{value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
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

            {(statusFilter !== 'all' || sourceFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setSourceFilter('all')
                  setTypeFilter('all')
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
              {filteredPartners.length} {filteredPartners.length === 1 ? 'Partner' : 'Partners'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => {
                    const PriorityIcon = getPriorityIcon(partner.priority)
                    const followUpStatus = getFollowUpStatus(partner)
                    
                    return (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {partner.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{partner.name}</p>
                              <p className="text-sm text-gray-600">{partner.specialty}</p>
                              <p className="text-xs text-gray-500">{partner.location}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[partner.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[partner.status]}>
                            {partner.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <PriorityIcon className="h-3 w-3" />
                            <Badge variant="outline" className={priorityColors[partner.priority]}>
                              {partner.priority}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{partner.totalOrders}</TableCell>
                        <TableCell>${(partner.totalValue / 1000).toFixed(0)}K</TableCell>
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

      {filteredPartners.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Get started by adding your first sourcing partner"
              }
            </p>
            {!searchTerm && statusFilter === 'all' && sourceFilter === 'all' && typeFilter === 'all' && priorityFilter === 'all' && (
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Partner
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
