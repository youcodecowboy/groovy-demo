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
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { format } from 'date-fns'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [brandId, setBrandId] = useState<Id<"brands"> | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [factoryFilter, setFactoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Get or create a demo brand
  const brands = useQuery(api.brands.listBrands)
  const createBrand = useMutation(api.brands.createBrand)
  
  useEffect(() => {
    const setupBrand = async () => {
      if (brands && brands.length > 0) {
        // Use the first available brand
        setBrandId(brands[0]._id as Id<"brands">)
      } else {
        // Create a demo brand if none exist
        try {
          const newBrandId = await createBrand({
            name: "Demo Brand",
            email: "demo@brand.com",
            contactPerson: "Demo Contact",
            phone: "+1-555-0123",
            address: "123 Demo Street, Demo City, DC 12345",
            logo: "/placeholder-logo.png",
            metadata: { isDemo: true }
          })
          setBrandId(newBrandId)
        } catch (error) {
          console.error("Failed to create demo brand:", error)
        }
      }
    }

    setupBrand()
  }, [brands, createBrand])

  // Fetch orders data from Convex
  const orders = useQuery(
    api.brands.getBrandPurchaseOrders,
    brandId ? { 
      brandId,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 50
    } : "skip"
  )

  // Get available factories for filtering
  const factories = useQuery(
    api.brands.getBrandFactories,
    brandId ? { brandId } : "skip"
  )

  // Filter orders based on search term and factory filter
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.factory.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFactory = factoryFilter === 'all' || 
      order.factoryId === factoryFilter

    return matchesSearch && matchesFactory
  }) || []

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600 bg-green-50'
      case 'on_track': return 'text-blue-600 bg-blue-50'
      case 'behind': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getScheduleStatusIcon = (status: string) => {
    switch (status) {
      case 'ahead': return <TrendingUp className="w-4 h-4" />
      case 'on_track': return <CheckCircle className="w-4 h-4" />
      case 'behind': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  // Show loading state while brand is being set up
  if (!brandId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up orders page...</p>
        </div>
      </div>
    )
  }

  // Show empty state when no orders are available
  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
              <p className="text-gray-600">Manage your production orders and track progress</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Purchase Orders Found</h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any purchase orders yet. Create your first order to get started.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
          <p className="text-gray-600">Manage your production orders and track progress</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Summary Stats - Top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{filteredOrders.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${filteredOrders.reduce((sum, order) => sum + order.value, 0).toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Production</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredOrders.filter(order => order.status === 'in_production').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Factory className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredOrders.filter(order => order.status === 'pending').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_production">In Production</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={factoryFilter} onValueChange={setFactoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Factory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Factories</SelectItem>
                {factories?.map((factory) => (
                  <SelectItem key={factory.id} value={factory.id}>
                    {factory.name}
                  </SelectItem>
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
            {filteredOrders.map((order) => (
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
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[order.priority as keyof typeof priorityColors]}>
                          {order.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Factory className="h-4 w-4" />
                          <span>{order.factory}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due {format(order.dueDate, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${order.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">{order.items} items</div>
                    </div>
                  </div>

                  {/* Progress and Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Production Progress</span>
                        <span className="text-sm text-gray-600">{order.progress}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.itemsCompleted}/{order.items} items completed
                      </div>
                    </div>

                    {/* Schedule Status */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getScheduleStatusIcon(order.scheduleStatus)}
                        <span className="text-sm font-medium text-gray-700">Schedule Status</span>
                      </div>
                      <div className={getScheduleStatusColor(order.scheduleStatus)}>
                        <div className="text-lg font-semibold">
                          {order.scheduleStatus.replace('_', ' ')}
                        </div>
                        <div className="text-sm">Due {format(order.dueDate, 'MMM d, yyyy')}</div>
                      </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Quality Metrics</span>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Defects</span>
                          <span className={`text-sm font-medium ${order.defects > 2 ? 'text-red-600' : 'text-green-600'}`}>
                            {order.defects}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Reworks</span>
                          <span className={`text-sm font-medium ${order.reworks > 1 ? 'text-orange-600' : 'text-green-600'}`}>
                            {order.reworks}
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
                        <div className="font-medium">{order.items} items</div>
                        <div className="text-gray-600">Total quantity</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{order.factory}</div>
                        <div className="text-gray-600">Manufacturing partner</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">Standard</div>
                        <div className="text-gray-600">Shipping method</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">Net 30</div>
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
            ))}
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
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            href={`/brand/orders/purchase-orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {order.poNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.factory}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                            {statusLabels[order.status as keyof typeof statusLabels]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${order.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {order.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={getScheduleStatusColor(order.scheduleStatus)}>
                            {format(order.dueDate, 'MMM d')}
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
                    ))}
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First PO
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
