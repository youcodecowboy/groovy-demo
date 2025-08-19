'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Bookmark,
  Map,
  Grid,
  List,
  Eye,
  Download,
  Upload,
  Calendar,
  DollarSign,
  Target,
  Factory,
  Palette,
  Leaf,
  Thermometer,
  Droplets,
  Gauge,
  BarChart3,
  Sparkles,
  Bot,
  Send,
  Phone,
  Mail,
  Globe2,
  FileText,
  Image,
  Video,
  Layers,
  Tag,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  X,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react'
import Link from 'next/link'

// Enhanced marketplace data interfaces
interface MarketplacePartner {
  id: string
  name: string
  type: 'factory' | 'service' | 'material' | 'logistics'
  description: string
  location: string
  country: string
  coordinates: { lat: number; lng: number }
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
  
  // Enhanced fields
  sustainabilityScore: number
  costRating: number
  qualityRating: number
  reliabilityRating: number
  onTimeDelivery: number
  capacityUtilization: number
  contactPerson: string
  email: string
  phone: string
  website: string
  
  // Visual content
  images: string[]
  videos: string[]
  swatchLibrary?: SwatchItem[]
  
  // Real-time data
  isOnline: boolean
  lastActive: Date
  currentCapacity: number
  activeOrders: number
  
  // Reviews
  reviews: PartnerReview[]
  
  // Pricing
  pricingTiers: PricingTier[]
  
  // Sustainability
  sustainabilityMetrics: SustainabilityMetrics
}

interface SwatchItem {
  id: string
  name: string
  image: string
  composition: string
  price: number
  currency: string
  availability: string
  colors: string[]
  pattern?: string
}

interface PartnerReview {
  id: string
  reviewer: string
  rating: number
  comment: string
  date: Date
  orderValue: number
  productType: string
}

interface PricingTier {
  quantity: number
  price: number
  currency: string
  leadTime: string
}

interface SustainabilityMetrics {
  co2Reduction: number
  waterSavings: number
  recycledMaterials: number
  renewableEnergy: number
  fairTrade: boolean
  organicCertified: boolean
}

// Mock data
const mockPartners: MarketplacePartner[] = [
  {
    id: 'partner-1',
    name: 'EcoLux Manufacturing',
    type: 'factory',
    description: 'Sustainable luxury garment production with GOTS certification and zero-waste processes. Specializing in organic cotton, bamboo, and recycled materials.',
    location: 'Porto, Portugal',
    country: 'Portugal',
    coordinates: { lat: 41.1579, lng: -8.6291 },
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
    teamSize: '50-100',
    sustainabilityScore: 95,
    costRating: 4.2,
    qualityRating: 4.9,
    reliabilityRating: 4.8,
    onTimeDelivery: 98,
    capacityUtilization: 85,
    contactPerson: 'Maria Silva',
    email: 'maria@ecolux.com',
    phone: '+351 22 123 4567',
    website: 'www.ecolux.com',
    images: ['/mock/factory-1-1.jpg', '/mock/factory-1-2.jpg', '/mock/factory-1-3.jpg'],
    videos: ['/mock/factory-1-video.mp4'],
    isOnline: true,
    lastActive: new Date(),
    currentCapacity: 8500,
    activeOrders: 12,
    reviews: [
      {
        id: 'review-1',
        reviewer: 'Sustainable Fashion Co.',
        rating: 5,
        comment: 'Exceptional quality and commitment to sustainability. Their organic cotton garments exceeded our expectations.',
        date: new Date('2024-01-15'),
        orderValue: 25000,
        productType: 'Organic Cotton T-Shirts'
      }
    ],
    pricingTiers: [
      { quantity: 100, price: 15, currency: 'EUR', leadTime: '21 days' },
      { quantity: 500, price: 12, currency: 'EUR', leadTime: '25 days' },
      { quantity: 1000, price: 10, currency: 'EUR', leadTime: '28 days' }
    ],
    sustainabilityMetrics: {
      co2Reduction: 45,
      waterSavings: 60,
      recycledMaterials: 80,
      renewableEnergy: 100,
      fairTrade: true,
      organicCertified: true
    }
  },
  {
    id: 'partner-2',
    name: 'Digital Print Pro',
    type: 'service',
    description: 'Advanced digital textile printing with custom pattern development and color matching. State-of-the-art equipment for high-quality prints.',
    location: 'Milan, Italy',
    country: 'Italy',
    coordinates: { lat: 45.4642, lng: 9.1900 },
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
    teamSize: '20-50',
    sustainabilityScore: 78,
    costRating: 4.5,
    qualityRating: 4.7,
    reliabilityRating: 4.6,
    onTimeDelivery: 95,
    capacityUtilization: 92,
    contactPerson: 'Marco Rossi',
    email: 'marco@digitalprintpro.com',
    phone: '+39 02 123 4567',
    website: 'www.digitalprintpro.com',
    images: ['/mock/service-1-1.jpg', '/mock/service-1-2.jpg'],
    videos: ['/mock/service-1-video.mp4'],
    isOnline: true,
    lastActive: new Date(),
    currentCapacity: 4600,
    activeOrders: 8,
    reviews: [
      {
        id: 'review-2',
        reviewer: 'Fashion Forward Ltd.',
        rating: 4,
        comment: 'Excellent color matching and fast turnaround times. Very professional service.',
        date: new Date('2024-02-10'),
        orderValue: 15000,
        productType: 'Custom Printed Fabrics'
      }
    ],
    pricingTiers: [
      { quantity: 50, price: 25, currency: 'EUR', leadTime: '7 days' },
      { quantity: 200, price: 20, currency: 'EUR', leadTime: '10 days' },
      { quantity: 500, price: 18, currency: 'EUR', leadTime: '14 days' }
    ],
    sustainabilityMetrics: {
      co2Reduction: 30,
      waterSavings: 40,
      recycledMaterials: 60,
      renewableEnergy: 80,
      fairTrade: false,
      organicCertified: false
    }
  },
  {
    id: 'partner-3',
    name: 'Organic Cotton Collective',
    type: 'material',
    description: 'Premium organic cotton supplier with direct farmer relationships and full traceability. Supporting sustainable farming practices.',
    location: 'Ahmedabad, India',
    country: 'India',
    coordinates: { lat: 23.0225, lng: 72.5714 },
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
    teamSize: '100-200',
    sustainabilityScore: 98,
    costRating: 4.3,
    qualityRating: 4.8,
    reliabilityRating: 4.7,
    onTimeDelivery: 96,
    capacityUtilization: 88,
    contactPerson: 'Rajesh Patel',
    email: 'rajesh@organiccottoncollective.com',
    phone: '+91 79 123 4567',
    website: 'www.organiccottoncollective.com',
    images: ['/mock/material-1-1.jpg', '/mock/material-1-2.jpg', '/mock/material-1-3.jpg'],
    videos: ['/mock/material-1-video.mp4'],
    isOnline: true,
    lastActive: new Date(),
    currentCapacity: 44000,
    activeOrders: 25,
    reviews: [
      {
        id: 'review-3',
        reviewer: 'Eco Fashion Brand',
        rating: 5,
        comment: 'Exceptional quality organic cotton with full traceability. Their commitment to sustainable farming is outstanding.',
        date: new Date('2024-01-20'),
        orderValue: 35000,
        productType: 'Organic Cotton Yarn'
      }
    ],
    pricingTiers: [
      { quantity: 500, price: 8.5, currency: 'USD', leadTime: '14 days' },
      { quantity: 2000, price: 8.0, currency: 'USD', leadTime: '18 days' },
      { quantity: 5000, price: 7.5, currency: 'USD', leadTime: '21 days' }
    ],
    sustainabilityMetrics: {
      co2Reduction: 65,
      waterSavings: 75,
      recycledMaterials: 0,
      renewableEnergy: 90,
      fairTrade: true,
      organicCertified: true
    }
  },
  {
    id: 'partner-4',
    name: 'Swift Logistics Solutions',
    type: 'logistics',
    description: 'Global logistics partner specializing in fashion supply chain with real-time tracking and customs expertise.',
    location: 'Rotterdam, Netherlands',
    country: 'Netherlands',
    coordinates: { lat: 51.9225, lng: 4.4792 },
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
    teamSize: '200+',
    sustainabilityScore: 82,
    costRating: 4.4,
    qualityRating: 4.6,
    reliabilityRating: 4.8,
    onTimeDelivery: 99,
    capacityUtilization: 95,
    contactPerson: 'Hans van der Berg',
    email: 'hans@swiftlogistics.com',
    phone: '+31 10 123 4567',
    website: 'www.swiftlogistics.com',
    images: ['/mock/logistics-1-1.jpg', '/mock/logistics-1-2.jpg'],
    videos: ['/mock/logistics-1-video.mp4'],
    isOnline: true,
    lastActive: new Date(),
    currentCapacity: 0,
    activeOrders: 150,
    reviews: [
      {
        id: 'review-4',
        reviewer: 'Global Fashion Corp',
        rating: 4,
        comment: 'Reliable shipping with excellent tracking. Customs clearance was smooth and efficient.',
        date: new Date('2024-02-15'),
        orderValue: 45000,
        productType: 'Garment Shipment'
      }
    ],
    pricingTiers: [
      { quantity: 1, price: 150, currency: 'EUR', leadTime: '3 days' },
      { quantity: 10, price: 120, currency: 'EUR', leadTime: '5 days' },
      { quantity: 50, price: 100, currency: 'EUR', leadTime: '7 days' }
    ],
    sustainabilityMetrics: {
      co2Reduction: 25,
      waterSavings: 15,
      recycledMaterials: 40,
      renewableEnergy: 70,
      fairTrade: false,
      organicCertified: false
    }
  },
  {
    id: 'partner-5',
    name: 'Innovation Textiles Lab',
    type: 'service',
    description: 'R&D lab for innovative textile solutions including smart fabrics and performance materials. Cutting-edge technology and research.',
    location: 'Berlin, Germany',
    country: 'Germany',
    coordinates: { lat: 52.5200, lng: 13.4050 },
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
    teamSize: '10-20',
    sustainabilityScore: 92,
    costRating: 3.8,
    qualityRating: 4.9,
    reliabilityRating: 4.7,
    onTimeDelivery: 94,
    capacityUtilization: 75,
    contactPerson: 'Dr. Anna Schmidt',
    email: 'anna@innovationtextiles.com',
    phone: '+49 30 123 4567',
    website: 'www.innovationtextiles.com',
    images: ['/mock/service-2-1.jpg', '/mock/service-2-2.jpg', '/mock/service-2-3.jpg'],
    videos: ['/mock/service-2-video.mp4'],
    isOnline: false,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    currentCapacity: 0,
    activeOrders: 3,
    reviews: [
      {
        id: 'review-5',
        reviewer: 'Tech Fashion Startup',
        rating: 5,
        comment: 'Revolutionary smart fabric technology. Their R&D capabilities are world-class.',
        date: new Date('2024-01-30'),
        orderValue: 75000,
        productType: 'Smart Fabric Development'
      }
    ],
    pricingTiers: [
      { quantity: 1, price: 5000, currency: 'EUR', leadTime: '30 days' },
      { quantity: 5, price: 4000, currency: 'EUR', leadTime: '35 days' },
      { quantity: 10, price: 3500, currency: 'EUR', leadTime: '45 days' }
    ],
    sustainabilityMetrics: {
      co2Reduction: 55,
      waterSavings: 70,
      recycledMaterials: 85,
      renewableEnergy: 100,
      fairTrade: true,
      organicCertified: true
    }
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
const garmentTypes = ['All Types', 'T-Shirts', 'Hoodies', 'Denim', 'Blazers', 'Dresses', 'Activewear']
const fabricTypes = ['All Fabrics', 'Organic Cotton', 'Bamboo', 'Wool', 'Recycled Poly', 'Linen', 'Silk']

export function BrandMarketplace() {
  const [partners, setPartners] = useState<MarketplacePartner[]>(mockPartners)
  const [filteredPartners, setFilteredPartners] = useState<MarketplacePartner[]>(mockPartners)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [capacityFilter, setCapacityFilter] = useState<string>('all')
  const [responseTimeFilter, setResponseTimeFilter] = useState<string>('all')
  const [garmentTypeFilter, setGarmentTypeFilter] = useState<string>('all')
  const [fabricTypeFilter, setFabricTypeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'map'>('cards')
  const [selectedPartner, setSelectedPartner] = useState<MarketplacePartner | null>(null)
  const [showPartnerDetail, setShowPartnerDetail] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<MarketplacePartner[]>([])

  // Filter logic
  useEffect(() => {
    let filtered = [...partners]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(partner => 
        partner.name.toLowerCase().includes(search) ||
        partner.description.toLowerCase().includes(search) ||
        partner.specialties.some(s => s.toLowerCase().includes(search)) ||
        partner.location.toLowerCase().includes(search)
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(partner => partner.type === typeFilter)
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(partner => {
        if (regionFilter === 'Europe') return ['Portugal', 'Italy', 'Netherlands', 'Germany'].includes(partner.country)
        if (regionFilter === 'Asia') return ['India', 'China', 'Vietnam', 'Bangladesh'].includes(partner.country)
        if (regionFilter === 'North America') return ['USA', 'Canada', 'Mexico'].includes(partner.country)
        return true
      })
    }

    setFilteredPartners(filtered)
  }, [partners, searchTerm, typeFilter, regionFilter, capacityFilter, responseTimeFilter, garmentTypeFilter, fabricTypeFilter])

  const toggleFavorite = (partnerId: string) => {
    setPartners(partners.map(partner => 
      partner.id === partnerId 
        ? { ...partner, isFavorite: !partner.isFavorite }
        : partner
    ))
  }

  const handleAiSearch = () => {
    // Mock AI search - in real implementation, this would call Disco API
    const suggestions = partners.filter(partner => 
      partner.specialties.some(s => s.toLowerCase().includes('organic')) ||
      partner.specialties.some(s => s.toLowerCase().includes('cotton'))
    ).slice(0, 5)
    setAiSuggestions(suggestions)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setRegionFilter('all')
    setCapacityFilter('all')
    setResponseTimeFilter('all')
    setGarmentTypeFilter('all')
    setFabricTypeFilter('all')
  }

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || regionFilter !== 'all' || 
    capacityFilter !== 'all' || responseTimeFilter !== 'all' || garmentTypeFilter !== 'all' || fabricTypeFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-600 mt-1">The most powerful sourcing hub for brands worldwide</p>
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

      {/* AI Search Assistant */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Ask Disco - Your AI Sourcing Assistant</h3>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="e.g., Find me a supplier for 5,000 organic cotton hoodies in South Asia, under 45 days lead time"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAiSearch}>
              <Sparkles className="h-4 w-4 mr-2" />
              Ask Disco
            </Button>
          </div>
          {aiSuggestions.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <h4 className="font-medium mb-2">Disco's Suggestions:</h4>
              <div className="space-y-2">
                {aiSuggestions.map(partner => (
                  <div key={partner.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{partner.name}</p>
                      <p className="text-sm text-gray-600">{partner.location} • {partner.leadTime}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

              <div className="ml-auto flex items-center gap-2">
                <Button 
                  variant={viewMode === 'cards' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'map' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t">
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

                <Select value={garmentTypeFilter} onValueChange={setGarmentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Garment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {garmentTypes.map((type) => (
                      <SelectItem key={type} value={type === 'All Types' ? 'all' : type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={fabricTypeFilter} onValueChange={setFabricTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fabric Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricTypes.map((fabric) => (
                      <SelectItem key={fabric} value={fabric === 'All Fabrics' ? 'all' : fabric}>
                        {fabric}
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

      {/* Map View */}
      {viewMode === 'map' && (
        <Card className="h-96">
          <CardContent className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Interactive Map</h3>
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4 mr-2" />
                Full Screen
              </Button>
            </div>
            <div className="h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive map view coming soon</p>
                <p className="text-sm text-gray-500">Zoom into regions to see supplier density</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Partners */}
      {viewMode !== 'map' && filteredPartners.filter(p => p.featured).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            Featured Partners
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPartners.filter(p => p.featured).map((partner) => (
              <PartnerCard 
                key={partner.id} 
                partner={partner} 
                featured={true}
                onToggleFavorite={toggleFavorite}
                onViewDetails={() => {
                  setSelectedPartner(partner)
                  setShowPartnerDetail(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Partners */}
      {viewMode !== 'map' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">All Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.filter(p => !p.featured).map((partner) => (
              <PartnerCard 
                key={partner.id} 
                partner={partner} 
                featured={false}
                onToggleFavorite={toggleFavorite}
                onViewDetails={() => {
                  setSelectedPartner(partner)
                  setShowPartnerDetail(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

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

      {/* Partner Detail Dialog */}
      {selectedPartner && (
        <PartnerDetailDialog
          partner={selectedPartner}
          open={showPartnerDetail}
          onOpenChange={setShowPartnerDetail}
          onToggleFavorite={toggleFavorite}
        />
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

// Partner Card Component
function PartnerCard({ 
  partner, 
  featured, 
  onToggleFavorite, 
  onViewDetails 
}: { 
  partner: MarketplacePartner
  featured: boolean
  onToggleFavorite: (id: string) => void
  onViewDetails: () => void
}) {
  const TypeIcon = typeIcons[partner.type]
  
  return (
    <Card className={`hover:shadow-lg transition-shadow relative ${featured ? 'border-2 border-blue-100' : ''}`}>
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
                {featured && (
                  <Badge variant="secondary" className="text-xs">
                    FEATURED
                  </Badge>
                )}
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
                <div className="flex items-center gap-1 text-green-600">
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
        
        {/* Sustainability Score */}
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Sustainability Score: {partner.sustainabilityScore}%</span>
        </div>
        
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
          <Button className="flex-1" onClick={onViewDetails}>
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleFavorite(partner.id)}
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
}

// Partner Detail Dialog Component
function PartnerDetailDialog({ 
  partner, 
  open, 
  onOpenChange, 
  onToggleFavorite 
}: { 
  partner: MarketplacePartner
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleFavorite: (id: string) => void
}) {
  const TypeIcon = typeIcons[partner.type]
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {partner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{partner.name}</h2>
                {partner.verified && <Shield className="h-5 w-5 text-blue-500" />}
                <Badge className={typeColors[partner.type]}>
                  <TypeIcon className="h-4 w-4 mr-1" />
                  {partner.type}
                </Badge>
              </div>
              <p className="text-gray-600">{partner.location}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fabrics">Fabrics</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">About</h3>
                <p className="text-gray-700 mb-4">{partner.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Established</span>
                    <span className="font-medium">{partner.established}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Team Size</span>
                    <span className="font-medium">{partner.teamSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Languages</span>
                    <span className="font-medium">{partner.languages.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span>Sustainability Score</span>
                    </div>
                    <span className="font-bold text-lg">{partner.sustainabilityScore}%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{partner.qualityRating}</div>
                      <div className="text-sm text-gray-600">Quality Rating</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{partner.onTimeDelivery}%</div>
                      <div className="text-sm text-gray-600">On-Time Delivery</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {partner.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Production Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lead Time:</span>
                    <span className="font-medium">{partner.leadTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Order:</span>
                    <span className="font-medium">{partner.minOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium">{partner.capacity}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Sustainability</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CO₂ Reduction:</span>
                    <span className="font-medium">{partner.sustainabilityMetrics.co2Reduction}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Water Savings:</span>
                    <span className="font-medium">{partner.sustainabilityMetrics.waterSavings}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recycled Materials:</span>
                    <span className="font-medium">{partner.sustainabilityMetrics.recycledMaterials}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Real-time Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${partner.isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                      {partner.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium">{partner.capacityUtilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Orders:</span>
                    <span className="font-medium">{partner.activeOrders}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fabrics" className="space-y-6">
            <div className="text-center py-8">
              <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Fabric Library</h3>
              <p className="text-gray-600">Digital swatch cards and material specifications coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Certifications & Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partner.certifications.map((cert) => (
                  <div key={cert} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{cert}</div>
                      <div className="text-sm text-gray-600">Verified certification</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reviews & Ratings</h3>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-bold">{partner.rating}</span>
                  <span className="text-gray-600">({partner.reviewCount} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {partner.reviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.reviewer}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {review.date.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <div className="text-sm text-gray-600">
                      Order: {review.productType} • ${review.orderValue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium">{partner.contactPerson}</div>
                      <div className="text-sm text-gray-600">Primary Contact</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium">{partner.email}</div>
                      <div className="text-sm text-gray-600">Email</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium">{partner.phone}</div>
                      <div className="text-sm text-gray-600">Phone</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe2 className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium">{partner.website}</div>
                      <div className="text-sm text-gray-600">Website</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href={`/brand/messaging?partner=${partner.id}`}>
                    <Button className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request Introduction
                    </Button>
                  </Link>
                  <Link href={`/brand/samples?partner=${partner.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      Request Sample
                    </Button>
                  </Link>
                  <Link href={`/brand/orders?partner=${partner.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit PO
                    </Button>
                  </Link>
                  <Link href={`/brand/crm?partner=${partner.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Add to CRM
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
