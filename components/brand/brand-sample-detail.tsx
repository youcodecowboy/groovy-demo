'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MessageSquare, Paperclip } from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandSample } from '@/lib/brand-mock-data'
import { format } from 'date-fns'
import Link from 'next/link'

interface BrandSampleDetailProps {
  sampleId: string
}

export function BrandSampleDetail({ sampleId }: BrandSampleDetailProps) {
  const [sample, setSample] = useState<BrandSample | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSample = async () => {
      try {
        setLoading(true)
        const sampleData = await brandAdapter.getSample(sampleId)
        setSample(sampleData)
      } catch (error) {
        console.error('Failed to load sample:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSample()
  }, [sampleId])

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

  if (!sample) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sample Not Found</h2>
        <Button asChild>
          <Link href="/brand/samples">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Samples
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/brand/samples">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Samples
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{sample.name}</h1>
          <p className="text-gray-600">Sample Request Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className="mt-1">{sample.status.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <Badge variant="outline" className="mt-1">{sample.priority}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{format(sample.dueDate, 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comments</p>
                  <p className="font-medium">{sample.comments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sample.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{attachment}</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Download
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
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Factory
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
