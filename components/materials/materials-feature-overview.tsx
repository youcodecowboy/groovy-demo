'use client'

import { 
  Package, 
  MapPin, 
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  QrCode,
  Settings,
  Shield,
  FileText,
  Bell,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const MATERIAL_FEATURES = [
  {
    id: 'overview',
    name: 'Overview Dashboard',
    description: 'Real-time inventory metrics, value tracking, and trend forecasts',
    icon: Package,
    status: 'complete',
    features: [
      'Total inventory value with trends',
      'Materials on order tracking',
      'Forecast projections',
      'Active alerts summary',
      'Pending orders display'
    ]
  },
  {
    id: 'locations',
    name: 'Lots & Locations',
    description: 'Track materials by warehouse, rack, shelf, and bin locations',
    icon: MapPin,
    status: 'complete',
    features: [
      'Hierarchical location management',
      'Lot code tracking',
      'Quantity per location',
      'Location-based inventory',
      'Shelf/rack/bin organization'
    ]
  },
  {
    id: 'movements',
    name: 'Movement Tracking',
    description: 'Complete history of all material movements and transactions',
    icon: ArrowUpDown,
    status: 'complete',
    features: [
      'Receipt, issue, transfer, and adjustment tracking',
      'Movement search and filtering',
      'Detailed movement history',
      'Export capabilities',
      'Actor and reason tracking'
    ]
  },
  {
    id: 'usage',
    name: 'Usage Analytics',
    description: 'Analyze consumption patterns and forecast material needs',
    icon: TrendingUp,
    status: 'complete',
    features: [
      'Daily usage tracking',
      'Consumption trend analysis',
      'Projected run-out dates',
      'Usage pattern alerts',
      'Historical usage charts'
    ]
  },
  {
    id: 'pricing',
    name: 'Price Management',
    description: 'Track price history and manage material costs',
    icon: DollarSign,
    status: 'complete',
    features: [
      'Price history tracking',
      'Cost trend analysis',
      'Min/max price tracking',
      'Price variance alerts',
      'Multiple pricing sources'
    ]
  },
  {
    id: 'po',
    name: 'Purchase Orders',
    description: 'Generate branded PO invoices and track order history',
    icon: FileText,
    status: 'complete',
    features: [
      'Branded PDF invoice generation',
      'PO history tracking',
      'Supplier management',
      'Cost calculations',
      'Delivery tracking'
    ]
  },
  {
    id: 'labels',
    name: 'Label Generation',
    description: 'Generate QR code labels for materials and lots',
    icon: QrCode,
    status: 'complete',
    features: [
      'Material and lot labels',
      'QR code generation',
      'Custom label templates',
      'Bulk label printing',
      'Label preview'
    ]
  },
  {
    id: 'settings',
    name: 'Settings & Configuration',
    description: 'Configure material settings and system preferences',
    icon: Settings,
    status: 'complete',
    features: [
      'Material-specific settings',
      'Inventory valuation methods',
      'Alert configuration',
      'Currency settings',
      'Lot tracking preferences'
    ]
  },
  {
    id: 'audit',
    name: 'Audit Trail',
    description: 'Complete audit history of all material-related activities',
    icon: Shield,
    status: 'complete',
    features: [
      'Complete change tracking',
      'Actor identification',
      'Timestamp logging',
      'Change details',
      'Export capabilities'
    ]
  },
  {
    id: 'alerts',
    name: 'Smart Alerts',
    description: 'Intelligent notifications for inventory management',
    icon: Bell,
    status: 'complete',
    features: [
      'Low stock alerts',
      'High usage warnings',
      'PO mismatch detection',
      'Cost variance alerts',
      'Configurable thresholds'
    ]
  }
]

export default function MaterialsFeatureOverview() {
  const completedFeatures = MATERIAL_FEATURES.filter(f => f.status === 'complete').length
  const totalFeatures = MATERIAL_FEATURES.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            Materials Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              Comprehensive materials tracking and management platform
            </p>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {completedFeatures}/{totalFeatures} Features Complete
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedFeatures / totalFeatures) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MATERIAL_FEATURES.map((feature) => {
          const IconComponent = feature.icon
          return (
            <Card key={feature.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-medium">{feature.name}</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={feature.status === 'complete' 
                      ? 'text-green-600 border-green-600' 
                      : 'text-yellow-600 border-yellow-600'
                    }
                  >
                    {feature.status === 'complete' ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <div className="space-y-1">
                  {feature.features.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-1 h-1 bg-blue-600 rounded-full" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
