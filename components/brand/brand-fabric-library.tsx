'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Scissors, Eye, Factory } from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandFabric } from '@/lib/brand-mock-data'
import Link from 'next/link'

export function BrandFabricLibrary() {
  const [fabrics, setFabrics] = useState<BrandFabric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadFabrics = async () => {
      try {
        setLoading(true)
        const fabricsData = await brandAdapter.getFabrics()
        setFabrics(fabricsData)
      } catch (error) {
        console.error('Failed to load fabrics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFabrics()
  }, [])

  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Fabric Library</h1>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fabric Library</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Fabric
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search fabrics by name, composition, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fabrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFabrics.map((fabric) => (
          <Card key={fabric.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{fabric.name}</h3>
                  <p className="text-sm text-gray-600">{fabric.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${fabric.pricePerYard}</p>
                  <p className="text-xs text-gray-600">per yard</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <Scissors className="h-12 w-12 text-gray-400" />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Composition</p>
                <p className="font-medium">{fabric.composition}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Colorways</p>
                <div className="flex flex-wrap gap-1">
                  {fabric.colorways.slice(0, 3).map((color) => (
                    <Badge key={color} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                  {fabric.colorways.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{fabric.colorways.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Factory className="h-4 w-4" />
                <span>{fabric.factoriesWithStock.length} factories with stock</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/brand/fabric-library/${fabric.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFabrics.length === 0 && (
        <div className="text-center py-12">
          <Scissors className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No fabrics found</h3>
          <p className="text-gray-600">Add your first fabric to get started</p>
        </div>
      )}
    </div>
  )
}