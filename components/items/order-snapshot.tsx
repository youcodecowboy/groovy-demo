"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  Calendar, 
  Clock, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react"

interface Order {
  id: string
  code: string
  dueDate: string
  totalItems: number
  completedItems: number
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  customer?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

interface OrderSnapshotProps {
  order?: Order
  onOpenOrder?: (orderId: string) => void
}

export function OrderSnapshot({ order, onOpenOrder }: OrderSnapshotProps) {
  if (!order) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No order linked</h4>
            <p className="text-gray-600">This item is not associated with an order</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progress = (order.completedItems / order.totalItems) * 100
  const isOverdue = new Date(order.dueDate) < new Date()
  const daysUntilDue = Math.ceil((new Date(order.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority?: Order['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDueStatus = () => {
    if (isOverdue) {
      return {
        text: 'Overdue',
        color: 'text-red-600',
        icon: AlertTriangle
      }
    } else if (daysUntilDue <= 1) {
      return {
        text: 'Due today',
        color: 'text-orange-600',
        icon: Clock
      }
    } else if (daysUntilDue <= 3) {
      return {
        text: `Due in ${daysUntilDue} days`,
        color: 'text-yellow-600',
        icon: Clock
      }
    } else {
      return {
        text: `Due in ${daysUntilDue} days`,
        color: 'text-green-600',
        icon: CheckCircle
      }
    }
  }

  const dueStatus = getDueStatus()
  const DueIcon = dueStatus.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Snapshot
          <Badge variant="outline" className="ml-auto">
            {order.code}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-lg">{order.code}</div>
            {order.customer && (
              <div className="text-sm text-gray-600">{order.customer}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace('_', ' ')}
            </Badge>
            {order.priority && (
              <Badge className={getPriorityColor(order.priority)}>
                {order.priority}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {order.completedItems} of {order.totalItems} items
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-gray-500">
            {Math.round(progress)}% complete
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Due Date</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{formatDate(order.dueDate)}</div>
            <div className={`text-xs flex items-center gap-1 ${dueStatus.color}`}>
              <DueIcon className="h-3 w-3" />
              {dueStatus.text}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{order.totalItems}</div>
            <div className="text-gray-600">Total Items</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{order.completedItems}</div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenOrder?.(order.id)}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Order Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
