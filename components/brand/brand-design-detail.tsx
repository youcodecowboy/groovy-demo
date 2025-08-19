'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, Link as LinkIcon } from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandDesign } from '@/lib/brand-mock-data'
import { format } from 'date-fns'
import Link from 'next/link'

interface BrandDesignDetailProps {
  designId: string
}

export function BrandDesignDetail({ designId }: BrandDesignDetailProps) {
  const [design, setDesign] = useState<BrandDesign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDesign = async () => {
      try {
        setLoading(true)
        const designData = await brandAdapter.getDesign(designId)
        setDesign(designData)
      } catch (error) {
        console.error('Failed to load design:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDesign()
  }, [designId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!design) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Design Not Found</h2>
        <Button asChild>
          <Link href="/brand/design-library">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/brand/design-library">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{design.name}</h1>
          <p className="text-gray-600">{design.version}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <FileText className="h-24 w-24 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {design.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{attachment}</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Season</p>
                <p className="font-medium">{design.season}</p>
              </div>
              {design.capsule && (
                <div>
                  <p className="text-sm text-gray-600">Capsule</p>
                  <p className="font-medium">{design.capsule}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{format(design.createdAt, 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{format(design.updatedAt, 'MMMM d, yyyy')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {design.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {design.linkedOrders.map((orderId) => (
                  <div key={orderId} className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <Link href={`/brand/orders/purchase-orders/${orderId}`} className="text-blue-600 hover:underline">
                      {orderId}
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
