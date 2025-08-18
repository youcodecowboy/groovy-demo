'use client'

import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  DollarSign,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ValueCard from './value-card'
import TrendMiniChart from './trend-mini-chart'
import { 
  type Material, 
  type InventorySnapshot, 
  type MaterialMovement,
  formatCurrency,
  isLowStock
} from '@/types/materials'

interface MaterialOverviewProps {
  material: Material
  inventorySnapshot: InventorySnapshot
  recentMovements: MaterialMovement[]
}

export default function MaterialOverview({
  material,
  inventorySnapshot,
  recentMovements
}: MaterialOverviewProps) {
  const lowStock = isLowStock(material, inventorySnapshot.onHand)
  const stockLevel = material.reorderPoint 
    ? (inventorySnapshot.onHand / material.reorderPoint) * 100 
    : 100

  // Mock price trend data - in real app, this would come from price history
  const priceData = [
    { date: '2024-01-01', value: 14.50 },
    { date: '2024-01-15', value: 15.20 },
    { date: '2024-02-01', value: 15.50 },
    { date: '2024-02-15', value: 16.20 },
    { date: '2024-03-01', value: 15.80 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Main metrics */}
      <div className="lg:col-span-2 space-y-6">
        {/* Inventory snapshot cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ValueCard
            title="On Hand"
            value={inventorySnapshot.onHand}
            subtitle={`${material.defaultUnit} available`}
            icon={Package}
            trend={{
              value: 5.2,
              isPositive: true,
              period: 'last week'
            }}
          />
          
          <ValueCard
            title="Current Value"
            value={inventorySnapshot.value}
            currency={inventorySnapshot.currency}
            subtitle="Total inventory value"
            icon={DollarSign}
            trend={{
              value: 2.1,
              isPositive: false,
              period: 'last month'
            }}
          />
          
          <ValueCard
            title="Avg Unit Cost"
            value={inventorySnapshot.onHand > 0 ? inventorySnapshot.value / inventorySnapshot.onHand : 0}
            currency={inventorySnapshot.currency}
            subtitle={`per ${material.defaultUnit}`}
            icon={TrendingUp}
          />
        </div>

        {/* Stock level indicator */}
        {material.reorderPoint && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Stock Level</CardTitle>
                {lowStock && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Low Stock
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {inventorySnapshot.onHand.toFixed(1)} {material.defaultUnit}</span>
                  <span>Reorder at: {material.reorderPoint} {material.defaultUnit}</span>
                </div>
                <Progress 
                  value={Math.min(stockLevel, 100)} 
                  className={`h-2 ${lowStock ? 'text-destructive' : ''}`}
                />
                <p className="text-xs text-muted-foreground">
                  {lowStock 
                    ? `${(material.reorderPoint - inventorySnapshot.onHand).toFixed(1)} ${material.defaultUnit} below reorder point`
                    : `${(inventorySnapshot.onHand - material.reorderPoint).toFixed(1)} ${material.defaultUnit} above reorder point`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent movements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length > 0 ? (
              <div className="space-y-3">
                {recentMovements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        movement.type === 'RECEIPT' ? 'bg-green-100 text-green-600' :
                        movement.type === 'ISSUE' ? 'bg-red-100 text-red-600' :
                        movement.type === 'TRANSFER' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {movement.type === 'RECEIPT' && <Package className="w-4 h-4" />}
                        {movement.type === 'ISSUE' && <TrendingUp className="w-4 h-4" />}
                        {movement.type === 'TRANSFER' && <MapPin className="w-4 h-4" />}
                        {movement.type === 'ADJUST' && <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium">
                          {movement.type === 'RECEIPT' && 'Received'}
                          {movement.type === 'ISSUE' && 'Issued'}
                          {movement.type === 'TRANSFER' && 'Transferred'}
                          {movement.type === 'ADJUST' && 'Adjusted'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(movement.at).toLocaleDateString()} • {movement.actor}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        movement.type === 'RECEIPT' || (movement.type === 'ADJUST' && movement.quantity > 0)
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {movement.type === 'RECEIPT' || (movement.type === 'ADJUST' && movement.quantity > 0) 
                          ? '+' : '-'
                        }{Math.abs(movement.quantity).toFixed(1)} {material.defaultUnit}
                      </div>
                      {movement.unitCost && (
                        <div className="text-sm text-muted-foreground">
                          @ {formatCurrency(movement.unitCost)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column - Context info */}
      <div className="space-y-6">
        {/* Price trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Price Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendMiniChart data={priceData} />
            <div className="mt-3 text-xs text-muted-foreground">
              Last 90 days
            </div>
          </CardContent>
        </Card>

        {/* Material attributes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(material.attributes).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(material.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="font-medium">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attributes defined</p>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Default Unit</span>
              <Badge variant="outline">{material.defaultUnit}</Badge>
            </div>
            {material.reorderPoint && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reorder Point</span>
                <span className="font-medium">{material.reorderPoint}</span>
              </div>
            )}
            {material.supplierSku && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Supplier SKU</span>
                <code className="text-xs bg-muted px-1 rounded">{material.supplierSku}</code>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{new Date(material.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">{new Date(material.updatedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
