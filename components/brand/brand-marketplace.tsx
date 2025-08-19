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
  ShoppingBag, 
  Star, 
  MapPin, 
  Users, 
  Clock, 
  Filter,
  Search,
  Zap,
  Shield,
  Award,
  Globe,
  MessageSquare,
  ExternalLink,
  Plus,
  CheckCircle,
  TrendingUp,
  Building,
  Package,
  Scissors,
  Truck,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react'

// Mock marketplace data
interface MarketplacePartner {
  id: string
  name: string
  type: 'factory' | 'service' | 'material' | 'logistics'
  description: string
  location: string
  rating: number
  reviewCount: number
  specialties: string[]
  certifications: string[]
  leadTime: string
  minOrder: string
  featured: boolean
  verified: boolean
  isFavorite: boolean
  responseTime: string
  capacity: string
  languages: string[]
  established: number
  teamSize: string
}

const mockPartners: MarketplacePartner[] = [
  {
    id: 'partner-1',
    name: 'EcoLux Manufacturing',
    type: 'factory',
    description: 'Sustainable luxury garment production with GOTS certification and zero-waste processes. Specializing in organic cotton, bamboo, and recycled materials.',
    location: 'Portugal',
    rating: 4.9,
    reviewCount: 127,
    specialties: ['Sustainable Production', 'Luxury Finishing', 'Small Batches', 'Organic Materials'],
    certifications: ['GOTS', 'OEKO-TEX', 'ISO 14001', 'Fair Trade'],
    leadTime: '21-28 days',
    minOrder: '100 units',
    featured: true,
    verified: true,
    isFavorite: false,
    responseTime: '< 2 hours',
    capacity: '10,000 units/month',
    languages: ['English', 'Portuguese', 'Spanish'],
    established: 2015,
    teamSize: '50-100'
  },
  {
    id: 'partner-2',
    name: 'Digital Print Pro',
    type: 'service',
    description: 'Advanced digital textile printing with custom pattern development and color matching. State-of-the-art equipment for high-quality prints.',
    location: 'Italy',
    rating: 4.7,
    reviewCount: 89,
    specialties: ['Digital Printing', 'Pattern Development', 'Color Matching', 'Custom Designs'],
    certifications: ['ISO 9001', 'OEKO-TEX', 'GOTS'],
    leadTime: '7-14 days',
    minOrder: '50 meters',
    featured: false,
    verified: true,
    isFavorite: true,
    responseTime: '< 4 hours',
    capacity: '5,000 meters/month',
    languages: ['English', 'Italian', 'French'],
    established: 2018,
    teamSize: '20-50'
  },
  {
    id: 'partner-3',
    name: 'Organic Cotton Collective',
    type: 'material',
    description: 'Premium organic cotton supplier with direct farmer relationships and full traceability. Supporting sustainable farming practices.',
    location: 'India',
    rating: 4.8,
    reviewCount: 203,
    specialties: ['Organic Cotton', 'Traceability', 'Fair Trade', 'Bulk Supply'],
    certifications: ['GOTS', 'Fair Trade', 'Organic', 'Rainforest Alliance'],
    leadTime: '14-21 days',
    minOrder: '500kg',
    featured: true,
    verified: true,
    isFavorite: false,
    responseTime: '< 6 hours',
    capacity: '50,000kg/month',
    languages: ['English', 'Hindi', 'Gujarati'],
    established: 2012,
    teamSize: '100-200'
  },
  {
    id: 'partner-4',
    name: 'Swift Logistics Solutions',
    type: 'logistics',
    description: 'Global logistics partner specializing in fashion supply chain with real-time tracking and customs expertise.',
    location: 'Netherlands',
    rating: 4.6,
    reviewCount: 156,
    specialties: ['Global Shipping', 'Supply Chain', 'Real-time Tracking', 'Customs Clearance'],
    certifications: ['ISO 14001', 'C-TPAT', 'AEO'],
    leadTime: '3-7 days',
    minOrder: 'No minimum',
    featured: false,
    verified: true,
    isFavorite: false,
    responseTime: '< 1 hour',
    capacity: 'Unlimited',
    languages: ['English', 'Dutch', 'German', 'French'],
    established: 2010,
    teamSize: '200+'
  },
  {
    id: 'partner-5',
    name: 'Innovation Textiles Lab',
    type: 'service',
    description: 'R&D lab for innovative textile solutions including smart fabrics and performance materials. Cutting-edge technology and research.',
    location: 'Germany',
    rating: 4.9,
    reviewCount: 45,
    specialties: ['Smart Fabrics', 'Performance Materials', 'R&D', 'Prototyping'],
    certifications: ['ISO 17025', 'OEKO-TEX', 'ISO 9001'],
    leadTime: '30-45 days',
    minOrder: 'Project-based',
    featured: true,
    verified: true,
    isFavorite: true,
    responseTime: '< 24 hours',
    capacity: 'Custom projects',
    languages: ['English', 'German'],
    established: 2016,
    teamSize: '10-20'
  }
]

const typeColors = {
  factory: 'bg-blue-100 text-blue-800',
  service: 'bg-green-100 text-green-800',
  material: 'bg-purple-100 text-purple-800',
  logistics: 'bg-orange-100 text-orange-800'
}

const typeIcons = {
  factory: Building,
  service: Zap,
  material: Scissors,
  logistics: Truck
}

const regions = ['All Regions', 'Europe', 'Asia', 'North America', 'South America', 'Africa']
const capacities = ['All Capacities', 'Small (< 1K units)', 'Medium (1K-10K units)', 'Large (10K+ units)']
const responseTimes = ['All Response Times', '< 2 hours', '< 6 hours', '< 24 hours']

export function BrandMarketplace() {
  const [partners, setPartners] = useState<MarketplacePartner[]>(mockPartners)
  const [filteredPartners, setFilteredPartners] = useState<MarketplacePartner[]>(mockPartners)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [capacityFilter, setCapacityFilter] = useState<string>('all')
  const [responseTimeFilter, setResponseTimeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered = [...partners]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(partner => 
        partner.name.toLowerCase().includes(search) ||
        partner.description.toLowerCase().includes(search) ||
        partner.specialties.some(s => s.toLowerCase().includes(search)) ||
        partner.location.toLowerCase().includes(search)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(partner => partner.type === typeFilter)
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(partner => {
        if (regionFilter === 'Europe') return ['Portugal', 'Italy', 'Netherlands', 'Germany'].includes(partner.location)
        if (regionFilter === 'Asia') return ['India', 'China', 'Vietnam', 'Bangladesh'].includes(partner.location)
        if (regionFilter === 'North America') return ['USA', 'Canada', 'Mexico'].includes(partner.location)
        return true
      })
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      filtered = filtered.filter(partner => {
        if (capacityFilter.includes('Small')) return partner.capacity.includes('< 1K') || partner.capacity.includes('Project-based')
        if (capacityFilter.includes('Medium')) return partner.capacity.includes('1K-10K') || partner.capacity.includes('5,000')
        if (capacityFilter.includes('Large')) return partner.capacity.includes('10K+') || partner.capacity.includes('50,000') || partner.capacity.includes('Unlimited')
        return true
      })
    }

    // Response time filter
    if (responseTimeFilter !== 'all') {
      filtered = filtered.filter(partner => partner.responseTime === responseTimeFilter)
    }

    setFilteredPartners(filtered)
  }, [partners, searchTerm, typeFilter, regionFilter, capacityFilter, responseTimeFilter])

  const toggleFavorite = (partnerId: string) => {
    setPartners(partners.map(partner => 
      partner.id === partnerId 
        ? { ...partner, isFavorite: !partner.isFavorite }
        : partner
    ))
  }

  const getResponseTimeColor = (responseTime: string) => {
    if (responseTime.includes('< 2')) return 'text-green-600'
    if (responseTime.includes('< 6')) return 'text-blue-600'
    if (responseTime.includes('< 24')) return 'text-orange-600'
    return 'text-gray-600'
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setRegionFilter('all')
    setCapacityFilter('all')
    setResponseTimeFilter('all')
  }

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || regionFilter !== 'all' || capacityFilter !== 'all' || responseTimeFilter !== 'all'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-600 mt-1">Discover and connect with verified manufacturing partners worldwide</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved Partners
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Partner
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search partners by name, specialty, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant={typeFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                All Partners
              </Button>
              <Button 
                variant={typeFilter === 'factory' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('factory')}
              >
                <Building className="h-4 w-4 mr-1" />
                Factories
              </Button>
              <Button 
                variant={typeFilter === 'service' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('service')}
              >
                <Zap className="h-4 w-4 mr-1" />
                Services
              </Button>
              <Button 
                variant={typeFilter === 'material' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('material')}
              >
                <Scissors className="h-4 w-4 mr-1" />
                Materials
              </Button>
              <Button 
                variant={typeFilter === 'logistics' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('logistics')}
              >
                <Truck className="h-4 w-4 mr-1" />
                Logistics
              </Button>

              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region === 'All Regions' ? 'all' : region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    {capacities.map((capacity) => (
                      <SelectItem key={capacity} value={capacity === 'All Capacities' ? 'all' : capacity}>
                        {capacity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={responseTimeFilter} onValueChange={setResponseTimeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Response Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {responseTimes.map((time) => (
                      <SelectItem key={time} value={time === 'All Response Times' ? 'all' : time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {filteredPartners.length} {filteredPartners.length === 1 ? 'Partner' : 'Partners'} Found
          </h2>
          {hasActiveFilters && (
            <Badge variant="secondary">
              Filtered Results
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>Updated daily with verified partners</span>
        </div>
      </div>

      {/* Featured Partners */}
      {filteredPartners.filter(p => p.featured).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            Featured Partners
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPartners.filter(p => p.featured).map((partner) => {
              const TypeIcon = typeIcons[partner.type]
              return (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow border-2 border-blue-100 relative">
                  {partner.isFavorite && (
                    <div className="absolute top-4 right-4 z-10">
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {partner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{partner.name}</h3>
                            {partner.verified && (
                              <Shield className="h-4 w-4 text-blue-500" />
                            )}
                            <Badge variant="secondary" className="text-xs">
                              FEATURED
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{partner.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span>{partner.rating}</span>
                              <span>({partner.reviewCount})</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getResponseTimeColor(partner.responseTime)}`}>
                              <Clock className="h-3 w-3" />
                              <span>{partner.responseTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className={typeColors[partner.type]}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {partner.type}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{partner.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {partner.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {partner.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{partner.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-1">
                          {partner.certifications.slice(0, 2).map((cert) => (
                            <Badge key={cert} variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                          {partner.certifications.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{partner.certifications.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Lead Time</p>
                        <p className="font-medium">{partner.leadTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Min Order</p>
                        <p className="font-medium">{partner.minOrder}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Capacity</p>
                        <p className="font-medium">{partner.capacity}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1">
                        Request Introduction
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleFavorite(partner.id)}
                      >
                        <Heart className={`h-4 w-4 ${partner.isFavorite ? 'text-red-500 fill-current' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* All Partners */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.filter(p => !p.featured).map((partner) => {
            const TypeIcon = typeIcons[partner.type]
            return (
              <Card key={partner.id} className="hover:shadow-md transition-shadow relative">
                {partner.isFavorite && (
                  <div className="absolute top-4 right-4 z-10">
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                          {partner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="font-medium">{partner.name}</h3>
                          {partner.verified && (
                            <Shield className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{partner.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={typeColors[partner.type]} variant="outline">
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {partner.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700 line-clamp-2">{partner.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span>{partner.rating}</span>
                      <span className="text-gray-500">({partner.reviewCount})</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${getResponseTimeColor(partner.responseTime)}`}>
                      <Clock className="h-3 w-3" />
                      <span>{partner.responseTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {partner.specialties.slice(0, 2).map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {partner.specialties.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{partner.specialties.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Request Introduction
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleFavorite(partner.id)}
                    >
                      <Heart className={`h-4 w-4 ${partner.isFavorite ? 'text-red-500 fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredPartners.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or filters to find more partners."
                  : "We're constantly adding new verified partners to our marketplace."
                }
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              ) : (
                <Button>
                  Contact Our Sourcing Team
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Section */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can't find what you're looking for?</h3>
            <p className="text-gray-600 mb-6">
              Our team can help you find the perfect manufacturing partner for your specific needs.
            </p>
            <div className="flex gap-2 justify-center">
              <Button>
                Contact Our Sourcing Team
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Submit Partner Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
