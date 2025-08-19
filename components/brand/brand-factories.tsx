'use client'

import { useState, useEffect } from 'react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Factory, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Star, 
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Grid,
  List,
  ExternalLink,
  Plus,
  Eye
} from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandFactory } from '@/lib/brand-mock-data'
import Link from 'next/link'

export function BrandFactories() {
  const [factories, setFactories] = useState<BrandFactory[]>([])
  const [filteredFactories, setFilteredFactories] = useState<BrandFactory[]>([])
  const [selectedFactory, setSelectedFactory] = useState<BrandFactory | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')

  useEffect(() => {
    const loadFactories = async () => {
      try {
        setLoading(true)
        const factoriesData = await brandAdapter.getFactories()
        setFactories(factoriesData)
        setFilteredFactories(factoriesData)
      } catch (error) {
        console.error('Failed to load factories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFactories()
  }, [])

  useEffect(() => {
    let filtered = [...factories]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(factory => 
        factory.name.toLowerCase().includes(search) ||
        factory.location.toLowerCase().includes(search) ||
        factory.capabilities.some(cap => cap.toLowerCase().includes(search))
      )
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(factory => factory.location.includes(regionFilter))
    }

    // Specialty filter
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(factory => 
        factory.capabilities.some(cap => cap.toLowerCase().includes(specialtyFilter.toLowerCase()))
      )
    }

    setFilteredFactories(filtered)
  }, [factories, searchTerm, regionFilter, specialtyFilter])

  const getPerformanceColor = (value: number, type: 'onTime' | 'defects' | 'rating') => {
    switch (type) {
      case 'onTime':
        return value >= 95 ? 'text-green-600' : value >= 85 ? 'text-orange-600' : 'text-red-600'
      case 'defects':
        return value <= 1 ? 'text-green-600' : value <= 3 ? 'text-orange-600' : 'text-red-600'
      case 'rating':
        return value >= 4.5 ? 'text-green-600' : value >= 4 ? 'text-orange-600' : 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPerformanceIcon = (value: number, type: 'onTime' | 'defects' | 'rating') => {
    switch (type) {
      case 'onTime':
        return value >= 95 ? CheckCircle : value >= 85 ? Clock : AlertTriangle
      case 'defects':
        return value <= 1 ? CheckCircle : value <= 3 ? Clock : AlertTriangle
      case 'rating':
        return value >= 4.5 ? CheckCircle : value >= 4 ? Clock : AlertTriangle
      default:
        return Clock
    }
  }

  const getStatusColor = (factory: BrandFactory) => {
    if (factory.activeOrders > 5) return 'bg-green-100 text-green-800'
    if (factory.activeOrders > 0) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (factory: BrandFactory) => {
    if (factory.activeOrders > 5) return 'High Activity'
    if (factory.activeOrders > 0) return 'Active'
    return 'Available'
  }

  const uniqueRegions = Array.from(new Set(factories.map(f => f.location.split(',')[1]?.trim() || f.location.split(',')[0]?.trim() || f.location))).filter(region => region && region.trim() !== '')
  const uniqueSpecialties = Array.from(new Set(factories.flatMap(f => f.capabilities))).filter(specialty => specialty && specialty.trim() !== '')

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Factories</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Factories</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/brand/marketplace">
              <Globe className="h-4 w-4 mr-2" />
              Find More
            </Link>
          </Button>
          <Button asChild>
            <Link href="/brand/marketplace">
              <Plus className="h-4 w-4 mr-2" />
              Connect Factory
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search factories by name, location, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {uniqueRegions.map((region) => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {uniqueSpecialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            {(regionFilter !== 'all' || specialtyFilter !== 'all' || searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setRegionFilter('all')
                  setSpecialtyFilter('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Factories Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredFactories.length} {filteredFactories.length === 1 ? 'Factory' : 'Factories'}
          </h2>
        </div>

        {viewMode === 'table' ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFactories.map((factory) => {
                      const OnTimeIcon = getPerformanceIcon(factory.performance.onTime, 'onTime')
                      const DefectsIcon = getPerformanceIcon(factory.performance.defects, 'defects')
                      
                      return (
                        <tr key={factory.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xs">
                                  {factory.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">{factory.name}</div>
                                <div className="text-sm text-gray-500">
                                  {factory.capabilities.slice(0, 2).join(', ')}
                                  {factory.capabilities.length > 2 && '...'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {factory.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(factory)}>
                              {getStatusLabel(factory)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{factory.performance.rating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <OnTimeIcon className={`h-3 w-3 ${getPerformanceColor(factory.performance.onTime, 'onTime')}`} />
                                <span className={getPerformanceColor(factory.performance.onTime, 'onTime')}>
                                  {factory.performance.onTime}% on-time
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <DefectsIcon className={`h-3 w-3 ${getPerformanceColor(factory.performance.defects, 'defects')}`} />
                                <span className={getPerformanceColor(factory.performance.defects, 'defects')}>
                                  {factory.performance.defects}% defects
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-gray-400" />
                              {factory.activeOrders} active orders
                            </div>
                            <div className="text-xs text-gray-500">
                              {factory.leadTimeMin}-{factory.leadTimeMax} days lead time
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {factory.activeOrders > 0 ? 'Active' : 'Available'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedFactory(factory)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  {selectedFactory && (
                                    <>
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-3">
                                          <Avatar className="w-10 h-10">
                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                              {selectedFactory.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h3 className="text-xl font-semibold">{selectedFactory.name}</h3>
                                            <p className="text-sm text-gray-600 font-normal">{selectedFactory.location}</p>
                                          </div>
                                        </DialogTitle>
                                      </DialogHeader>

                                      <div className="space-y-6">
                                        {/* Performance Overview */}
                                        <div>
                                          <h4 className="font-medium mb-3">Performance Metrics</h4>
                                          <div className="grid grid-cols-4 gap-4">
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                              <div className={`text-2xl font-bold mb-1 ${getPerformanceColor(selectedFactory.performance.onTime, 'onTime')}`}>
                                                {selectedFactory.performance.onTime}%
                                              </div>
                                              <p className="text-xs text-gray-600">On-time Delivery</p>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                              <div className={`text-2xl font-bold mb-1 ${getPerformanceColor(selectedFactory.performance.defects, 'defects')}`}>
                                                {selectedFactory.performance.defects}%
                                              </div>
                                              <p className="text-xs text-gray-600">Defect Rate</p>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                                {selectedFactory.performance.throughput}%
                                              </div>
                                              <p className="text-xs text-gray-600">Throughput</p>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                              <div className={`text-2xl font-bold mb-1 ${getPerformanceColor(selectedFactory.performance.rating, 'rating')}`}>
                                                {selectedFactory.performance.rating.toFixed(1)}⭐
                                              </div>
                                              <p className="text-xs text-gray-600">Rating</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Capabilities */}
                                        <div>
                                          <h4 className="font-medium mb-3">Capabilities</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedFactory.capabilities.map((capability) => (
                                              <Badge key={capability} variant="outline">
                                                {capability}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Contacts */}
                                        <div>
                                          <h4 className="font-medium mb-3">Key Contacts</h4>
                                          <div className="space-y-3">
                                            {selectedFactory.contacts.map((contact, index) => (
                                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                  <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="text-xs">
                                                      {contact.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <div>
                                                    <p className="font-medium text-sm">{contact.name}</p>
                                                    <p className="text-xs text-gray-600">{contact.role}</p>
                                                  </div>
                                                </div>
                                                <div className="flex gap-2">
                                                  <Button variant="ghost" size="sm" asChild>
                                                    <a href={`mailto:${contact.email}`}>
                                                      <Mail className="h-4 w-4" />
                                                    </a>
                                                  </Button>
                                                  {contact.phone && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                      <a href={`tel:${contact.phone}`}>
                                                        <Phone className="h-4 w-4" />
                                                      </a>
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="grid grid-cols-2 gap-6">
                                          <div>
                                            <h4 className="font-medium mb-2">Lead Times</h4>
                                            <p className="text-sm text-gray-600">
                                              {selectedFactory.leadTimeMin}-{selectedFactory.leadTimeMax} days
                                            </p>
                                          </div>
                                          <div>
                                            <h4 className="font-medium mb-2">Active Orders</h4>
                                            <p className="text-sm text-gray-600">
                                              {selectedFactory.activeOrders} orders in production
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/brand/messaging?factory=${factory.id}`}>
                                  <MessageSquare className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFactories.map((factory) => (
              <Card key={factory.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {factory.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{factory.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{factory.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{factory.performance.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Capabilities */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {factory.capabilities.slice(0, 3).map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                      {factory.capabilities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{factory.capabilities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`flex items-center justify-center gap-1 mb-1 ${getPerformanceColor(factory.performance.onTime, 'onTime')}`}>
                        {(() => {
                          const Icon = getPerformanceIcon(factory.performance.onTime, 'onTime')
                          return <Icon className="h-4 w-4" />
                        })()}
                        <span className="text-lg font-bold">{factory.performance.onTime}%</span>
                      </div>
                      <p className="text-xs text-gray-600">On-time</p>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`flex items-center justify-center gap-1 mb-1 ${getPerformanceColor(factory.performance.defects, 'defects')}`}>
                        {(() => {
                          const Icon = getPerformanceIcon(factory.performance.defects, 'defects')
                          return <Icon className="h-4 w-4" />
                        })()}
                        <span className="text-lg font-bold">{factory.performance.defects}%</span>
                      </div>
                      <p className="text-xs text-gray-600">Defect Rate</p>
                    </div>
                  </div>

                  {/* Lead Time & Active Orders */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{factory.leadTimeMin}-{factory.leadTimeMax} days</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Package className="h-3 w-3" />
                      <span>{factory.activeOrders} active orders</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedFactory(factory)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        {/* Same dialog content as in table view */}
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" asChild>
                      <Link href={`/brand/messaging?factory=${factory.id}`}>
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredFactories.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No factories found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || regionFilter !== 'all' || specialtyFilter !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Start working with factories to see them here"
                }
              </p>
              {!searchTerm && regionFilter === 'all' && specialtyFilter === 'all' && (
                <Button asChild>
                  <Link href="/brand/marketplace">
                    <Globe className="h-4 w-4 mr-2" />
                    Find Manufacturing Partners
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
