'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Scissors, 
  Palette, 
  Download, 
  Eye, 
  ShoppingCart,
  Heart,
  Share2,
  Package,
  DollarSign,
  Clock,
  Leaf,
  Thermometer,
  Droplets,
  Gauge,
  Tag,
  Image,
  Video,
  Layers
} from 'lucide-react'

interface FabricSwatch {
  id: string
  name: string
  image: string
  composition: string
  price: number
  currency: string
  availability: string
  colors: string[]
  pattern?: string
  weight: string
  width: string
  sustainability: {
    organic: boolean
    recycled: boolean
    biodegradable: boolean
    waterConsumption: number
    co2Footprint: number
  }
  certifications: string[]
  leadTime: string
  minOrder: string
  supplier: {
    name: string
    location: string
    rating: number
  }
  isFavorite: boolean
}

const mockFabrics: FabricSwatch[] = [
  {
    id: 'fabric-1',
    name: 'Organic Cotton Jersey',
    image: '/mock/fabric-1.jpg',
    composition: '100% Organic Cotton',
    price: 8.50,
    currency: 'EUR',
    availability: 'In Stock',
    colors: ['White', 'Black', 'Navy', 'Gray', 'Beige'],
    weight: '180 gsm',
    width: '160 cm',
    sustainability: {
      organic: true,
      recycled: false,
      biodegradable: true,
      waterConsumption: 85,
      co2Footprint: 2.1
    },
    certifications: ['GOTS', 'OEKO-TEX', 'Organic'],
    leadTime: '14-21 days',
    minOrder: '100 meters',
    supplier: {
      name: 'EcoLux Manufacturing',
      location: 'Portugal',
      rating: 4.9
    },
    isFavorite: false
  },
  {
    id: 'fabric-2',
    name: 'Recycled Polyester Fleece',
    image: '/mock/fabric-2.jpg',
    composition: '100% Recycled Polyester',
    price: 12.00,
    currency: 'EUR',
    availability: 'In Stock',
    colors: ['Charcoal', 'Forest Green', 'Burgundy', 'Navy'],
    weight: '280 gsm',
    width: '150 cm',
    sustainability: {
      organic: false,
      recycled: true,
      biodegradable: false,
      waterConsumption: 45,
      co2Footprint: 1.8
    },
    certifications: ['GRS', 'OEKO-TEX', 'Recycled'],
    leadTime: '10-15 days',
    minOrder: '200 meters',
    supplier: {
      name: 'Innovation Textiles Lab',
      location: 'Germany',
      rating: 4.8
    },
    isFavorite: true
  },
  {
    id: 'fabric-3',
    name: 'Bamboo Viscose Twill',
    image: '/mock/fabric-3.jpg',
    composition: '70% Bamboo Viscose, 30% Organic Cotton',
    price: 15.50,
    currency: 'EUR',
    availability: 'Limited Stock',
    colors: ['Natural', 'Sage', 'Taupe', 'Cream'],
    weight: '220 gsm',
    width: '145 cm',
    sustainability: {
      organic: true,
      recycled: false,
      biodegradable: true,
      waterConsumption: 60,
      co2Footprint: 1.5
    },
    certifications: ['GOTS', 'OEKO-TEX', 'Bamboo'],
    leadTime: '21-28 days',
    minOrder: '50 meters',
    supplier: {
      name: 'Organic Cotton Collective',
      location: 'India',
      rating: 4.7
    },
    isFavorite: false
  }
]

export function MarketplaceFabrics() {
  const [fabrics, setFabrics] = useState<FabricSwatch[]>(mockFabrics)
  const [selectedFabric, setSelectedFabric] = useState<FabricSwatch | null>(null)
  const [showFabricDetail, setShowFabricDetail] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [compositionFilter, setCompositionFilter] = useState<string>('all')
  const [sustainabilityFilter, setSustainabilityFilter] = useState<string>('all')

  const toggleFavorite = (fabricId: string) => {
    setFabrics(fabrics.map(fabric => 
      fabric.id === fabricId 
        ? { ...fabric, isFavorite: !fabric.isFavorite }
        : fabric
    ))
  }

  const filteredFabrics = fabrics.filter(fabric => {
    if (searchTerm && !fabric.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (compositionFilter !== 'all' && !fabric.composition.toLowerCase().includes(compositionFilter.toLowerCase())) {
      return false
    }
    if (sustainabilityFilter !== 'all') {
      if (sustainabilityFilter === 'organic' && !fabric.sustainability.organic) return false
      if (sustainabilityFilter === 'recycled' && !fabric.sustainability.recycled) return false
      if (sustainabilityFilter === 'biodegradable' && !fabric.sustainability.biodegradable) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fabric Discovery</h2>
          <p className="text-gray-600">Explore sustainable materials from verified mills worldwide</p>
        </div>
        <Button>
          <Scissors className="h-4 w-4 mr-2" />
          Request Custom Fabric
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search fabrics by name, composition, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Scissors className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Select value={compositionFilter} onValueChange={setCompositionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Composition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Compositions</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="polyester">Polyester</SelectItem>
                  <SelectItem value="bamboo">Bamboo</SelectItem>
                  <SelectItem value="wool">Wool</SelectItem>
                  <SelectItem value="linen">Linen</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sustainabilityFilter} onValueChange={setSustainabilityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sustainability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fabrics</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="recycled">Recycled</SelectItem>
                  <SelectItem value="biodegradable">Biodegradable</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </Button>
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fabric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFabrics.map((fabric) => (
          <FabricCard
            key={fabric.id}
            fabric={fabric}
            onToggleFavorite={toggleFavorite}
            onViewDetails={() => {
              setSelectedFabric(fabric)
              setShowFabricDetail(true)
            }}
          />
        ))}
      </div>

      {/* Fabric Detail Dialog */}
      {selectedFabric && (
        <Dialog open={showFabricDetail} onOpenChange={setShowFabricDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Scissors className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold">{selectedFabric.name}</h2>
                  <p className="text-gray-600">{selectedFabric.composition}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fabric Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Fabric swatch image</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View Swatch
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    Drape Video
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Fabric Details */}
              <div className="space-y-6">
                {/* Pricing */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Pricing</h3>
                    <Badge variant="secondary">{selectedFabric.availability}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedFabric.price} {selectedFabric.currency}/meter
                  </div>
                  <div className="text-sm text-gray-600">
                    Min order: {selectedFabric.minOrder} • Lead time: {selectedFabric.leadTime}
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="font-semibold mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium ml-2">{selectedFabric.weight}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Width:</span>
                      <span className="font-medium ml-2">{selectedFabric.width}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Colors:</span>
                      <span className="font-medium ml-2">{selectedFabric.colors.length} available</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pattern:</span>
                      <span className="font-medium ml-2">{selectedFabric.pattern || 'Solid'}</span>
                    </div>
                  </div>
                </div>

                {/* Sustainability */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    Sustainability
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Water Consumption</span>
                      <span className="text-sm font-medium">{selectedFabric.sustainability.waterConsumption}% less</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CO₂ Footprint</span>
                      <span className="text-sm font-medium">{selectedFabric.sustainability.co2Footprint} kg CO₂</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFabric.sustainability.organic && (
                        <Badge variant="outline" className="text-xs">Organic</Badge>
                      )}
                      {selectedFabric.sustainability.recycled && (
                        <Badge variant="outline" className="text-xs">Recycled</Badge>
                      )}
                      {selectedFabric.sustainability.biodegradable && (
                        <Badge variant="outline" className="text-xs">Biodegradable</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="font-semibold mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFabric.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Package className="h-4 w-4 mr-2" />
                    Request Sample
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => toggleFavorite(selectedFabric.id)}
                  >
                    <Heart className={`h-4 w-4 ${selectedFabric.isFavorite ? 'text-red-500 fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Fabric Card Component
function FabricCard({ 
  fabric, 
  onToggleFavorite, 
  onViewDetails 
}: { 
  fabric: FabricSwatch
  onToggleFavorite: (id: string) => void
  onViewDetails: () => void
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{fabric.name}</h3>
            <p className="text-sm text-gray-600">{fabric.composition}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onToggleFavorite(fabric.id)}
          >
            <Heart className={`h-4 w-4 ${fabric.isFavorite ? 'text-red-500 fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Fabric Image */}
        <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Fabric swatch</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {fabric.price} {fabric.currency}/m
            </div>
            <div className="text-sm text-gray-600">
              Min: {fabric.minOrder}
            </div>
          </div>
          <Badge variant={fabric.availability === 'In Stock' ? 'default' : 'secondary'}>
            {fabric.availability}
          </Badge>
        </div>

        {/* Sustainability */}
        <div className="flex flex-wrap gap-1">
          {fabric.sustainability.organic && (
            <Badge variant="outline" className="text-xs">Organic</Badge>
          )}
          {fabric.sustainability.recycled && (
            <Badge variant="outline" className="text-xs">Recycled</Badge>
          )}
          {fabric.sustainability.biodegradable && (
            <Badge variant="outline" className="text-xs">Biodegradable</Badge>
          )}
        </div>

        {/* Colors */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Available Colors</p>
          <div className="flex flex-wrap gap-1">
            {fabric.colors.slice(0, 3).map((color) => (
              <Badge key={color} variant="secondary" className="text-xs">
                {color}
              </Badge>
            ))}
            {fabric.colors.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{fabric.colors.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Supplier */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">{fabric.supplier.name}</p>
            <p className="text-gray-600">{fabric.supplier.location}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{fabric.supplier.rating}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onViewDetails}>
            View Details
          </Button>
          <Button variant="outline">
            <Package className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}