'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Scissors, Factory, Link as LinkIcon, DollarSign } from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandFabric } from '@/lib/brand-mock-data'
import Link from 'next/link'

interface BrandFabricDetailProps {
  fabricId: string
}

export function BrandFabricDetail({ fabricId }: BrandFabricDetailProps) {
  const [fabric, setFabric] = useState<BrandFabric | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFabric = async () => {
      try {
        setLoading(true)
        const fabricData = await brandAdapter.getFabric(fabricId)
        setFabric(fabricData)
      } catch (error) {
        console.error('Failed to load fabric:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFabric()
  }, [fabricId])

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

  if (!fabric) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fabric Not Found</h2>
        <Button asChild>
          <Link href="/brand/fabric-library">
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
          <Link href="/brand/fabric-library">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{fabric.name}</h1>
          <p className="text-gray-600">{fabric.supplier}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <Scissors className="h-24 w-24 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colorways</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fabric.colorways.map((color) => (
                  <div key={color} className="text-center">
                    <div className="w-full h-20 bg-gray-200 rounded-lg mb-2"></div>
                    <p className="text-sm font-medium">{color}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fabric Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Composition</p>
                <p className="font-medium">{fabric.composition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Supplier</p>
                <p className="font-medium">{fabric.supplier}</p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-semibold">${fabric.pricePerYard} {fabric.currency}</p>
                  <p className="text-sm text-gray-600">per yard</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Factories with Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fabric.factoriesWithStock.map((factoryId) => (
                  <div key={factoryId} className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{factoryId}</span>
                  </div>
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
                {fabric.linkedOrders.map((orderId) => (
                  <div key={orderId} className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <Link href={`/brand/orders/${orderId}`} className="text-blue-600 hover:underline">
                      {orderId}
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full">
            Request Sample
          </Button>
        </div>
      </div>
    </div>
  )
}