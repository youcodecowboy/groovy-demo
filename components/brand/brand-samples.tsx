'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandSample } from '@/lib/brand-mock-data'
import { format } from 'date-fns'
import Link from 'next/link'

const statusColors = {
  requested: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  shipped: 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  requested: Clock,
  in_progress: Package,
  approved: CheckCircle,
  rejected: XCircle,
  shipped: Truck
}

export function BrandSamples() {
  const [samples, setSamples] = useState<BrandSample[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    const loadSamples = async () => {
      try {
        setLoading(true)
        const samplesData = await brandAdapter.getSamples()
        setSamples(samplesData)
      } catch (error) {
        console.error('Failed to load samples:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSamples()
  }, [])

  const filteredSamples = selectedStatus === 'all' 
    ? samples 
    : samples.filter(sample => sample.status === selectedStatus)

  const groupedSamples = {
    requested: samples.filter(s => s.status === 'requested'),
    in_progress: samples.filter(s => s.status === 'in_progress'),
    approved: samples.filter(s => s.status === 'approved'),
    rejected: samples.filter(s => s.status === 'rejected'),
    shipped: samples.filter(s => s.status === 'shipped')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sample Hub</h1>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sample Hub</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Sample Request
        </Button>
      </div>

      {/* Board View */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(groupedSamples).map(([status, statusSamples]) => {
          const StatusIcon = statusIcons[status as keyof typeof statusIcons]
          return (
            <Card key={status} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <StatusIcon className="h-4 w-4" />
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {statusSamples.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusSamples.map((sample) => (
                  <Link key={sample.id} href={`/brand/samples/${sample.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">{sample.name}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Due {format(sample.dueDate, 'MMM d')}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                sample.priority === 'high' ? 'border-red-200 text-red-600' :
                                sample.priority === 'medium' ? 'border-orange-200 text-orange-600' :
                                'border-gray-200 text-gray-600'
                              }`}
                            >
                              {sample.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{sample.attachments.length} files</span>
                            <span>{sample.comments} comments</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                
                {statusSamples.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No samples</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
