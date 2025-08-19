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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Filter, Download, MessageSquare, Eye } from 'lucide-react'
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

export function BrandOrdersList() {
  const [orders, setOrders] = useState<BrandOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<BrandOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [factoryFilter, setFactoryFilter] = useState<string>('all')

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

  const uniqueFactories = Array.from(new Set(orders.map(order => order.factoryName)))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Factory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Defect %</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const deliveryStatus = getDeliveryStatus(order)
                  const progressPercentage = Math.round((order.itemsCompleted / order.totalItems) * 100)
                  
                  return (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <Link 
                          href={`/brand/orders/purchase-orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {order.poNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{order.factoryName}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-fit">
                            {order.itemsCompleted}/{order.totalItems}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={order.defectRate > 3 ? 'text-red-600' : order.defectRate > 1.5 ? 'text-orange-600' : 'text-green-600'}>
                          {order.defectRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={getDeliveryStatusColor(deliveryStatus)}>
                          {format(order.promisedDelivery, 'MMM d')}
                          {order.actualDelivery && (
                            <div className="text-xs text-gray-500">
                              Delivered {format(order.actualDelivery, 'MMM d')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        ${order.value.toLocaleString()} {order.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityColors[order.priority]}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
