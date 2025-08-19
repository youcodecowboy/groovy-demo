'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Download, 
  MessageSquare, 
  Eye, 
  Plus,
  Calendar,
  DollarSign,
  Package,
  Factory,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Users,
  MapPin,
  Truck,
  CreditCard
} from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandOrder } from '@/lib/brand-mock-data'
import { format } from 'date-fns'
import Link from 'next/link'

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

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const priorityIcons = {
  low: Clock,
  medium: Package,
  high: AlertTriangle,
  urgent: AlertTriangle
}

export function BrandOrdersList() {
  const [orders, setOrders] = useState<BrandOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<BrandOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [factoryFilter, setFactoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const ordersData = await brandAdapter.getOrders()
        setOrders(ordersData)
        setFilteredOrders(ordersData)
      } catch (error) {
        console.error('Failed to load orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  useEffect(() => {
    let filtered = [...orders]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(order => 
        order.poNumber.toLowerCase().includes(search) ||
        order.factoryName.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Factory filter
    if (factoryFilter !== 'all') {
      filtered = filtered.filter(order => order.factoryId === factoryFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, factoryFilter])

  const getDeliveryStatus = (order: BrandOrder) => {
    if (order.status === 'delivered' && order.actualDelivery) {
      const onTime = order.actualDelivery <= order.promisedDelivery
      return onTime ? 'on-time' : 'late'
    }
    if (['shipped', 'delivered'].includes(order.status)) {
      return 'on-time'
    }
    const now = new Date()
    const daysUntilDelivery = Math.ceil((order.promisedDelivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDelivery < 0) return 'overdue'
    if (daysUntilDelivery <= 3) return 'at-risk'
    return 'on-track'
  }

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'text-green-600'
      case 'late': return 'text-red-600'
      case 'overdue': return 'text-red-600 font-semibold'
      case 'at-risk': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time': return CheckCircle
      case 'late': return AlertTriangle
      case 'overdue': return AlertTriangle
      case 'at-risk': return Clock
      default: return Clock
    }
  }

  const uniqueFactories = Array.from(new Set(orders.map(order => order.factoryName)))

  const renderOrderCard = (order: BrandOrder) => {
    const deliveryStatus = getDeliveryStatus(order)
    const DeliveryIcon = getDeliveryStatusIcon(deliveryStatus)
    const PriorityIcon = priorityIcons[order.priority]
    const progressPercentage = Math.round((order.itemsCompleted / order.totalItems) * 100)
    const daysUntilDelivery = Math.ceil((order.promisedDelivery.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    return (
      <Card key={order.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  <Link 
                    href={`/brand/orders/purchase-orders/${order.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {order.poNumber}
                  </Link>
                </h3>
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
                <Badge variant="outline" className={priorityColors[order.priority]}>
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {order.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Factory className="h-4 w-4" />
                  <span>{order.factoryName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {format(order.createdAt, 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${order.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{order.currency}</div>
            </div>
          </div>

          {/* Progress and Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Production Progress</span>
                <span className="text-sm text-gray-600">{progressPercentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {order.itemsCompleted}/{order.totalItems} items completed
              </div>
            </div>

            {/* Delivery Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DeliveryIcon className={`h-4 w-4 ${getDeliveryStatusColor(deliveryStatus)}`} />
                <span className="text-sm font-medium text-gray-700">Delivery Status</span>
              </div>
              <div className={getDeliveryStatusColor(deliveryStatus)}>
                <div className="text-lg font-semibold">
                  {format(order.promisedDelivery, 'MMM d, yyyy')}
                </div>
                {deliveryStatus === 'overdue' && (
                  <div className="text-sm">Overdue by {Math.abs(daysUntilDelivery)} days</div>
                )}
                {deliveryStatus === 'at-risk' && (
                  <div className="text-sm">Due in {daysUntilDelivery} days</div>
                )}
                {deliveryStatus === 'on-track' && (
                  <div className="text-sm">Due in {daysUntilDelivery} days</div>
                )}
                {order.actualDelivery && (
                  <div className="text-xs text-gray-500">
                    Delivered {format(order.actualDelivery, 'MMM d')}
                  </div>
                )}
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Quality Metrics</span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Defect Rate</span>
                  <span className={`text-sm font-medium ${order.defectRate > 3 ? 'text-red-600' : order.defectRate > 1.5 ? 'text-orange-600' : 'text-green-600'}`}>
                    {order.defectRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">On-time %</span>
                  <span className="text-sm font-medium text-green-600">
                    {order.onTimePercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium">{order.totalItems} items</div>
                <div className="text-gray-600">Total quantity</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium">{order.factoryName}</div>
                <div className="text-gray-600">Manufacturing partner</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium">{order.shippingMethod || 'Standard'}</div>
                <div className="text-gray-600">Shipping method</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium">{order.paymentTerms || 'Net 30'}</div>
                <div className="text-gray-600">Payment terms</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/brand/orders/purchase-orders/${order.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/brand/messaging?order=${order.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/brand/orders/new">
              <Plus className="h-4 w-4 mr-2" />
              Create PO
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders or factories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={factoryFilter} onValueChange={setFactoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Factory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Factories</SelectItem>
                {uniqueFactories.map((factory) => (
                  <SelectItem key={factory} value={factory}>{factory}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-r-none"
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                Table
              </Button>
            </div>

            {(statusFilter !== 'all' || factoryFilter !== 'all' || searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setFactoryFilter('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </h2>
        </div>

        {viewMode === 'cards' ? (
          <div className="space-y-4">
            {filteredOrders.map(renderOrderCard)}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const deliveryStatus = getDeliveryStatus(order)
                      const progressPercentage = Math.round((order.itemsCompleted / order.totalItems) * 100)
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              href={`/brand/orders/purchase-orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {order.poNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.factoryName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={statusColors[order.status]}>
                              {statusLabels[order.status]}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">
                                {progressPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={getDeliveryStatusColor(deliveryStatus)}>
                              {format(order.promisedDelivery, 'MMM d')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.value.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/brand/messaging?order=${order.id}`}>
                                  <MessageSquare className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/brand/orders/purchase-orders/${order.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || factoryFilter !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first purchase order"
                }
              </p>
              {!searchTerm && statusFilter === 'all' && factoryFilter === 'all' && (
                <Button asChild>
                  <Link href="/brand/orders/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First PO
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
