'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  ExternalLink
} from 'lucide-react'
import { Input } from '@/components/ui/input'

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
}

const mockPartners: MarketplacePartner[] = [
  {
    id: 'partner-1',
    name: 'EcoLux Manufacturing',
    type: 'factory',
    description: 'Sustainable luxury garment production with GOTS certification and zero-waste processes.',
    location: 'Portugal',
    rating: 4.9,
    reviewCount: 127,
    specialties: ['Sustainable Production', 'Luxury Finishing', 'Small Batches'],
    certifications: ['GOTS', 'OEKO-TEX', 'ISO 14001'],
    leadTime: '21-28 days',
    minOrder: '100 units',
    featured: true,
    verified: true
  },
  {
    id: 'partner-2',
    name: 'Digital Print Pro',
    type: 'service',
    description: 'Advanced digital textile printing with custom pattern development and color matching.',
    location: 'Italy',
    rating: 4.7,
    reviewCount: 89,
    specialties: ['Digital Printing', 'Pattern Development', 'Color Matching'],
    certifications: ['ISO 9001', 'OEKO-TEX'],
    leadTime: '7-14 days',
    minOrder: '50 meters',
    featured: false,
    verified: true
  },
  {
    id: 'partner-3',
    name: 'Organic Cotton Collective',
    type: 'material',
    description: 'Premium organic cotton supplier with direct farmer relationships and full traceability.',
    location: 'India',
    rating: 4.8,
    reviewCount: 203,
    specialties: ['Organic Cotton', 'Traceability', 'Fair Trade'],
    certifications: ['GOTS', 'Fair Trade', 'Organic'],
    leadTime: '14-21 days',
    minOrder: '500kg',
    featured: true,
    verified: true
  },
  {
    id: 'partner-4',
    name: 'Swift Logistics Solutions',
    type: 'logistics',
    description: 'Global logistics partner specializing in fashion supply chain with real-time tracking.',
    location: 'Netherlands',
    rating: 4.6,
    reviewCount: 156,
    specialties: ['Global Shipping', 'Supply Chain', 'Real-time Tracking'],
    certifications: ['ISO 14001', 'C-TPAT'],
    leadTime: '3-7 days',
    minOrder: 'No minimum',
    featured: false,
    verified: true
  },
  {
    id: 'partner-5',
    name: 'Innovation Textiles Lab',
    type: 'service',
    description: 'R&D lab for innovative textile solutions including smart fabrics and performance materials.',
    location: 'Germany',
    rating: 4.9,
    reviewCount: 45,
    specialties: ['Smart Fabrics', 'Performance Materials', 'R&D'],
    certifications: ['ISO 17025', 'OEKO-TEX'],
    leadTime: '30-45 days',
    minOrder: 'Project-based',
    featured: true,
    verified: true
  }
]

const typeColors = {
  factory: 'bg-blue-100 text-blue-800',
  service: 'bg-green-100 text-green-800',
  material: 'bg-purple-100 text-purple-800',
  logistics: 'bg-orange-100 text-orange-800'
}

const typeIcons = {
  factory: Users,
  service: Zap,
  material: ShoppingBag,
  logistics: Globe
}

export function BrandMarketplace() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-600 mt-1">Discover and connect with verified manufacturing partners</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Categories */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search partners by name, location, or specialty..."
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200">
                All Partners
              </Button>
              <Button variant="outline" size="sm">
                Factories
              </Button>
              <Button variant="outline" size="sm">
                Services
              </Button>
              <Button variant="outline" size="sm">
                Materials
              </Button>
              <Button variant="outline" size="sm">
                Logistics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Partners */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Featured Partners</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockPartners.filter(p => p.featured).map((partner) => {
            const TypeIcon = typeIcons[partner.type]
            return (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow border-2 border-blue-100">
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
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Lead Time</p>
                      <p className="font-medium">{partner.leadTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Min Order</p>
                      <p className="font-medium">{partner.minOrder}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1">
                      Request Introduction
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* All Partners */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPartners.filter(p => !p.featured).map((partner) => {
            const TypeIcon = typeIcons[partner.type]
            return (
              <Card key={partner.id} className="hover:shadow-md transition-shadow">
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
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{partner.leadTime}</span>
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

                  <Button variant="outline" size="sm" className="w-full">
                    Request Introduction
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can't find what you're looking for?</h3>
            <p className="text-gray-600 mb-6">
              Our team can help you find the perfect manufacturing partner for your specific needs.
            </p>
            <Button>
              Contact Our Sourcing Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
