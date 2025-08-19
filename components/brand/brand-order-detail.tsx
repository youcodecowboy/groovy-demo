'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  MessageSquare, 
  Download, 
  FileText, 
  Package, 
  Factory, 
  Truck,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandOrder, BrandFactory } from '@/lib/brand-mock-data'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface BrandOrderDetailProps {
  orderId: string
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_production: 'bg-purple-100 text-purple-800',
  quality_check: 'bg-orange-100 text-orange-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusLabels = {
  draft: 'Draft',
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  quality_check: 'Quality Check',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
}

// Mock milestones data
const mockMilestones = [
  { id: 1, name: 'Order Placed', date: new Date('2024-01-15'), status: 'completed' },
  { id: 2, name: 'Factory Confirmed', date: new Date('2024-01-16'), status: 'completed' },
  { id: 3, name: 'Materials Sourced', date: new Date('2024-01-20'), status: 'completed' },
  { id: 4, name: 'Production Started', date: new Date('2024-01-22'), status: 'completed' },
  { id: 5, name: 'Quality Check', date: new Date('2024-02-05'), status: 'in_progress' },
  { id: 6, name: 'Packaging', date: new Date('2024-02-08'), status: 'pending' },
  { id: 7, name: 'Shipped', date: new Date('2024-02-10'), status: 'pending' },
]

// Mock items data
const mockItems = Array.from({ length: 50 }, (_, i) => ({
  id: `item-${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  name: `Product Item ${i + 1}`,
  stage: ['cutting', 'sewing', 'quality_check', 'packaging', 'completed'][Math.floor(Math.random() * 5)],
  status: Math.random() > 0.1 ? 'normal' : 'defective',
  assignedTo: ['Team A', 'Team B', 'Team C'][Math.floor(Math.random() * 3)],
  completedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7) : undefined
}))

export function BrandOrderDetail({ orderId }: BrandOrderDetailProps) {
  const [order, setOrder] = useState<BrandOrder | null>(null)
  const [factory, setFactory] = useState<BrandFactory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        setLoading(true)
        const orderData = await brandAdapter.getOrder(orderId)
        if (orderData) {
          setOrder(orderData)
          const factoryData = await brandAdapter.getFactory(orderData.factoryId)
          setFactory(factoryData)
        }
      } catch (error) {
        console.error('Failed to load order:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrderData()
  }, [orderId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Button asChild>
          <Link href="/brand/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
    )
  }

  const progressPercentage = Math.round((order.itemsCompleted / order.totalItems) * 100)
  const isOnTime = !order.actualDelivery || order.actualDelivery <= order.promisedDelivery
  const daysUntilDelivery = Math.ceil((order.promisedDelivery.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/brand/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{order.poNumber}</h1>
            <p className="text-gray-600">{order.factoryName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Summary
          </Button>
          <Button size="sm" asChild>
            <Link href={`/brand/messaging?order=${order.id}`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Factory
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-time Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {isOnTime ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-600">On Track</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="font-semibold text-red-600">At Risk</span>
                    </>
                  )}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Complete</p>
                <p className="text-2xl font-bold">{progressPercentage}%</p>
                <p className="text-xs text-gray-500">{order.itemsCompleted} / {order.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Defect Rate</p>
                <p className={`text-2xl font-bold ${order.defectRate > 3 ? 'text-red-600' : order.defectRate > 1.5 ? 'text-orange-600' : 'text-green-600'}`}>
                  {order.defectRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Order Value</p>
                <p className="text-2xl font-bold">${order.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{order.currency}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="factory">Factory</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress and Milestones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Production Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Items Completed</p>
                    <p className="font-semibold">{order.itemsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items Remaining</p>
                    <p className="font-semibold">{order.totalItems - order.itemsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Defective Items</p>
                    <p className="font-semibold text-red-600">
                      {Math.round(order.totalItems * order.defectRate / 100)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quality Rate</p>
                    <p className="font-semibold text-green-600">
                      {(100 - order.defectRate).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline & Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMilestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{milestone.name}</p>
                        <p className="text-xs text-gray-500">
                          {format(milestone.date, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        milestone.status === 'completed' ? 'text-green-600 border-green-200' :
                        milestone.status === 'in_progress' ? 'text-blue-600 border-blue-200' :
                        'text-gray-600 border-gray-200'
                      }>
                        {milestone.status === 'completed' ? 'Done' :
                         milestone.status === 'in_progress' ? 'In Progress' :
                         'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SLA Bar and Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Promised Delivery</span>
                  <span className="font-medium">{format(order.promisedDelivery, 'MMM d, yyyy')}</span>
                </div>
                
                {order.actualDelivery ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Actual Delivery</span>
                    <span className={`font-medium ${isOnTime ? 'text-green-600' : 'text-red-600'}`}>
                      {format(order.actualDelivery, 'MMM d, yyyy')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Days Remaining</span>
                    <span className={`font-medium ${
                      daysUntilDelivery < 0 ? 'text-red-600' :
                      daysUntilDelivery <= 3 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {daysUntilDelivery < 0 ? `${Math.abs(daysUntilDelivery)} days overdue` :
                       daysUntilDelivery === 0 ? 'Due today' :
                       `${daysUntilDelivery} days`}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Timeline Progress</span>
                    <span>
                      {order.status === 'delivered' ? '100%' : 
                       order.status === 'shipped' ? '90%' :
                       order.status === 'quality_check' ? '75%' :
                       order.status === 'in_production' ? '50%' :
                       '25%'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      order.status === 'delivered' ? 100 : 
                      order.status === 'shipped' ? 90 :
                      order.status === 'quality_check' ? 75 :
                      order.status === 'in_production' ? 50 :
                      25
                    } 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Priority</span>
                  <Badge variant="outline">{order.priority}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm">{format(order.createdAt, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm">{formatDistanceToNow(order.updatedAt, { addSuffix: true })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tags</span>
                  <div className="flex gap-1">
                    {order.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({mockItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Badge variant="outline">All Items</Badge>
                    <Badge variant="outline">In Progress</Badge>
                    <Badge variant="outline">Completed</Badge>
                    <Badge variant="outline">Defective</Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                
                <div className="border rounded-lg">
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-4 p-3 border-b bg-gray-50 text-sm font-medium">
                      <div>SKU</div>
                      <div>Name</div>
                      <div>Stage</div>
                      <div>Status</div>
                      <div>Assigned To</div>
                    </div>
                    {mockItems.slice(0, 20).map((item) => (
                      <div key={item.id} className="grid grid-cols-5 gap-4 p-3 border-b text-sm">
                        <div className="font-medium">{item.sku}</div>
                        <div>{item.name}</div>
                        <div>
                          <Badge variant="outline" className="capitalize">
                            {item.stage.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <Badge 
                            variant={item.status === 'defective' ? 'destructive' : 'default'}
                            className={item.status === 'normal' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-gray-600">{item.assignedTo}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factory">
          {factory && (
            <Card>
              <CardHeader>
                <CardTitle>Factory Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{factory.name}</h3>
                      <p className="text-gray-600">{factory.location}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {factory.capabilities.map((capability) => (
                          <Badge key={capability} variant="outline">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Contacts</h4>
                      <div className="space-y-2">
                        {factory.contacts.map((contact, index) => (
                          <div key={index} className="flex justify-between">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-gray-600">{contact.role}</p>
                            </div>
                            <div className="text-right text-sm">
                              <p>{contact.email}</p>
                              {contact.phone && <p>{contact.phone}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Performance Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">On-time Delivery</p>
                          <p className="text-2xl font-bold text-green-600">
                            {factory.performance.onTime}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Defect Rate</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {factory.performance.defects}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Throughput</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {factory.performance.throughput}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {factory.performance.rating.toFixed(1)}⭐
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Lead Times</h4>
                      <p className="text-sm text-gray-600">
                        {factory.leadTimeMin}-{factory.leadTimeMax} days
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Active Orders</h4>
                      <p className="text-sm text-gray-600">{factory.activeOrders} orders in production</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Messages for this order</h3>
                <p className="text-gray-600 mb-4">View and manage all communications related to this order</p>
                <Button asChild>
                  <Link href={`/brand/messaging?order=${order.id}`}>
                    Open Messages
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Purchase Order.pdf', type: 'PDF', size: '2.1 MB', date: '2 days ago' },
                    { name: 'Tech Pack.pdf', type: 'PDF', size: '5.3 MB', date: '1 week ago' },
                    { name: 'Quality Specs.docx', type: 'DOC', size: '1.2 MB', date: '1 week ago' },
                    { name: 'Reference Images.zip', type: 'ZIP', size: '12.5 MB', date: '2 weeks ago' },
                  ].map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                          <p className="text-xs text-gray-500 mt-1">{doc.date}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logistics">
          <Card>
            <CardHeader>
              <CardTitle>Logistics & Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Truck className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="font-medium">Shipment Tracking</h4>
                    <p className="text-sm text-gray-600">
                      {order.status === 'shipped' ? 'In transit to destination' : 
                       order.status === 'delivered' ? 'Delivered successfully' :
                       'Shipment not yet scheduled'}
                    </p>
                  </div>
                  {order.status === 'shipped' && (
                    <Button variant="outline" size="sm">
                      Track Package
                    </Button>
                  )}
                </div>

                {order.status === 'delivered' && order.actualDelivery && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-800">Delivered Successfully</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Delivered on {format(order.actualDelivery, 'MMMM d, yyyy')}
                      {isOnTime ? ' (On Time)' : ' (Late)'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}