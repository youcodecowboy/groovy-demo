'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, FileText, Eye, Download } from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandDesign } from '@/lib/brand-mock-data'
import { format } from 'date-fns'
import Link from 'next/link'

export function BrandDesignLibrary() {
  const [designs, setDesigns] = useState<BrandDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadDesigns = async () => {
      try {
        setLoading(true)
        const designsData = await brandAdapter.getDesigns()
        setDesigns(designsData)
      } catch (error) {
        console.error('Failed to load designs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDesigns()
  }, [])

  const filteredDesigns = designs.filter(design =>
    design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    design.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Design Library</h1>
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
        <h1 className="text-3xl font-bold">Design Library</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Upload Design
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search designs by name or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesigns.map((design) => (
          <Card key={design.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{design.name}</h3>
                  <p className="text-sm text-gray-600">{design.version}</p>
                </div>
                <Badge variant="outline">{design.season}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {design.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Updated {format(design.updatedAt, 'MMM d, yyyy')}</p>
                <p>{design.attachments.length} files • {design.linkedOrders.length} linked orders</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/brand/design-library/${design.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDesigns.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No designs found</h3>
          <p className="text-gray-600">Upload your first design to get started</p>
        </div>
      )}
    </div>
  )
}