'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings, TrendingUp, TrendingDown, Package, Clock, AlertTriangle, MessageSquare, DollarSign, MapPin, Factory, ShoppingCart, Upload, Users, FileText, Bell } from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandOrder, BrandFactory } from '@/lib/brand-mock-data'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts'
import Link from 'next/link'

interface DashboardStats {
  activeOrders: number
  onTimePercentage: number
  avgDefectRate: number
  monthlySpend: number
  unreadMessages: number
  pendingSamples: number
}

interface Widget {
  id: string
  title: string
  type: 'stat' | 'chart' | 'list' | 'map' | 'quick-actions' | 'notifications' | 'orders-progress'
  size: 'sm' | 'md' | 'lg' | 'xl'
  position: number
}

// Mock notifications
const mockNotifications = [
  { id: 1, type: 'order', message: 'PO-2024-001 has been confirmed by Apex Manufacturing', time: '2 hours ago', priority: 'high' },
  { id: 2, type: 'sample', message: 'Sample request approved for EcoLux Manufacturing', time: '4 hours ago', priority: 'medium' },
  { id: 3, type: 'delivery', message: 'Shipment PO-2024-002 is 2 days late', time: '6 hours ago', priority: 'high' },
  { id: 4, type: 'factory', message: 'New factory connection request from Digital Print Pro', time: '1 day ago', priority: 'low' }
]

const defaultWidgets: Widget[] = [
  { id: 'quick-actions', title: 'Quick Actions', type: 'quick-actions', size: 'md', position: 0 },
  { id: 'active-orders', title: 'Active Orders', type: 'stat', size: 'sm', position: 1 },
  { id: 'orders-progress', title: 'Orders by Factory', type: 'orders-progress', size: 'lg', position: 2 },
  { id: 'notifications', title: 'Recent Notifications', type: 'notifications', size: 'md', position: 3 },
  { id: 'unread-messages', title: 'Messages', type: 'stat', size: 'sm', position: 4 },
  { id: 'monthly-spend', title: 'Monthly Spend', type: 'stat', size: 'sm', position: 5 },
  { id: 'on-time-delivery', title: 'On-time Delivery', type: 'chart', size: 'md', position: 6 },
  { id: 'top-factories', title: 'Top Factories', type: 'list', size: 'md', position: 7 }
]

export function BrandDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<BrandOrder[]>([])
  const [factories, setFactories] = useState<BrandFactory[]>([])
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets)
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    // Load from localStorage after hydration
    if (!hasLoadedFromStorage) {
      const saved = localStorage.getItem('brand-dashboard-widgets')
      if (saved) {
        try {
          setWidgets(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse saved widgets:', e)
        }
      }
      setHasLoadedFromStorage(true)
    }
  }, [hasLoadedFromStorage])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardStats, recentOrders, topFactories] = await Promise.all([
          brandAdapter.getDashboardStats(),
          brandAdapter.getOrders(),
          brandAdapter.getFactories()
        ])
        
        setStats(dashboardStats)
        setOrders(recentOrders)
        setFactories(topFactories.slice(0, 5))
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Save widgets to localStorage when changed (only after initial load)
    if (hasLoadedFromStorage) {
      localStorage.setItem('brand-dashboard-widgets', JSON.stringify(widgets))
    }
  }, [widgets, hasLoadedFromStorage])

  const saveLayout = () => {
    setIsEditMode(false)
    // In a real app, this would save to the backend
  }

  const resetLayout = () => {
    setWidgets(defaultWidgets)
    localStorage.removeItem('brand-dashboard-widgets')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return Package
      case 'sample': return FileText
      case 'delivery': return Clock
      case 'factory': return Factory
      default: return Bell
    }
  }

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-orange-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const renderWidget = (widget: Widget) => {
    const baseClasses = "h-full"
    const sizeClasses = {
      sm: "col-span-1",
      md: "col-span-2", 
      lg: "col-span-3",
      xl: "col-span-full"
    }

    switch (widget.id) {
      case 'quick-actions':
        return (
          <Card className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild className="h-12 flex-col gap-1">
                  <Link href="/brand/orders/new">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs">Create PO</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 flex-col gap-1">
                  <Link href="/brand/design-library">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Upload Design</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 flex-col gap-1">
                  <Link href="/brand/factories">
                    <Factory className="h-5 w-5" />
                    <span className="text-xs">View Factories</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 flex-col gap-1">
                  <Link href="/brand/marketplace">
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Find Partners</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'orders-progress':
        const activeOrders = orders.filter(o => ['confirmed', 'in_production', 'quality_check'].includes(o.status))
        const ordersByFactory = activeOrders.reduce((acc, order) => {
          if (!acc[order.factoryName]) {
            acc[order.factoryName] = { orders: [], totalItems: 0, completedItems: 0 }
          }
          acc[order.factoryName].orders.push(order)
          acc[order.factoryName].totalItems += order.totalItems
          acc[order.factoryName].completedItems += order.itemsCompleted
          return acc
        }, {} as Record<string, { orders: BrandOrder[], totalItems: number, completedItems: number }>)

        return (
          <Card className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Orders by Factory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(ordersByFactory).slice(0, 4).map(([factoryName, data]) => {
                  const progress = Math.round((data.completedItems / data.totalItems) * 100)
                  return (
                    <div key={factoryName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{factoryName}</span>
                        <span className="text-sm text-gray-600">{data.orders.length} orders</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 min-w-fit">
                          {progress}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.completedItems}/{data.totalItems} items completed
                      </div>
                    </div>
                  )
                })}
                {Object.keys(ordersByFactory).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No active orders</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'notifications':
        return (
          <Card className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockNotifications.slice(0, 4).map((notification) => {
                  const Icon = getNotificationIcon(notification.type)
                  return (
                    <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <Icon className={`h-4 w-4 mt-0.5 ${getNotificationColor(notification.priority)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )

      case 'active-orders':
        return (
          <Card className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.activeOrders || 0}</div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-600 mt-1">In production or quality check</p>
            </CardContent>
          </Card>
        )

      case 'on-time-delivery':
        const onTimeData = [
          { name: 'On Time', value: stats?.onTimePercentage || 0, color: '#10b981' },
          { name: 'Late', value: 100 - (stats?.onTimePercentage || 0), color: '#f59e0b' }
        ]
        return (
          <Card className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">On-time Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.onTimePercentage?.toFixed(1) || 0}%</div>
                <div className="w-16 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={onTimeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={30}
                        dataKey="value"
                      >
                        {onTimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'top-factories':
        return (
          <Card className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Top Factories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {factories.slice(0, 3).map((factory) => (
                  <div key={factory.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{factory.name}</p>
                      <p className="text-xs text-gray-600">{factory.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {factory.performance.rating.toFixed(1)}⭐
                      </Badge>
                      <div className="text-xs text-green-600">
                        {factory.onTimePercentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case 'unread-messages':
        return (
          <Card className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unread Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Across all conversations</p>
            </CardContent>
          </Card>
        )

      case 'monthly-spend':
        const spendChange = stats?.monthlySpend ? 
          ((stats.monthlySpend - 3540) / 3540 * 100).toFixed(1) : '0'
        const isPositive = parseFloat(spendChange) > 0
        return (
          <Card className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${(stats?.monthlySpend || 0).toLocaleString()}</div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
              <div className="flex items-center gap-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                <p className={`text-xs ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                  {spendChange}% vs last month
                </p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Brand Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
        <h1 className="text-3xl font-bold">Brand Dashboard</h1>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <Button variant="outline" size="sm" onClick={resetLayout}>
                Reset Layout
              </Button>
              <Button size="sm" onClick={saveLayout}>
                Save Layout
              </Button>
            </>
          )}
          <Button 
            variant={isEditMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? 'Exit Edit' : 'Edit Dashboard'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6 auto-rows-fr">
        {widgets
          .sort((a, b) => a.position - b.position)
          .map((widget) => (
            <div key={widget.id} className={`${isEditMode ? 'ring-2 ring-blue-200 ring-dashed' : ''}`}>
              {renderWidget(widget)}
            </div>
          ))}
        
        {isEditMode && (
          <Card className="col-span-1 border-dashed border-2 border-gray-300 flex items-center justify-center">
            <Button variant="ghost" className="h-full w-full">
              <Plus className="h-8 w-8 text-gray-400" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
