'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MaterialsHeader from '@/components/materials/materials-header'
import MaterialsTable from '@/components/materials/materials-table'
import ValueCard from '@/components/materials/value-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart,
  Clock
} from 'lucide-react'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { 
  type Material, 
  type MaterialFilters, 
  type MaterialListView,
  type InventorySnapshot,
  isLowStock,
  formatCurrency
} from '@/types/materials'

export default function MaterialsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [materials, setMaterials] = useState<Material[]>([])
  const [inventorySnapshots, setInventorySnapshots] = useState<Record<string, InventorySnapshot>>({})
  const [loading, setLoading] = useState(true)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  
  const [filters, setFilters] = useState<MaterialFilters>({})
  const [view, setView] = useState<MaterialListView>({
    type: 'table',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // Load materials and inventory data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Initialize demo data if needed
        await dataAdapter.initializeMaterialsDemo()
        
        // Load materials
        const materialsData = await dataAdapter.getMaterials(filters)
        setMaterials(materialsData)
        
        // Load inventory snapshots for each material
        const snapshots: Record<string, InventorySnapshot> = {}
        for (const material of materialsData) {
          try {
            const snapshot = await dataAdapter.getInventorySnapshot(material.id)
            snapshots[material.id] = snapshot
          } catch (error) {
            console.error(`Failed to load inventory for ${material.id}:`, error)
          }
        }
        setInventorySnapshots(snapshots)
        
        // Load pending orders
        try {
          const pendingOrdersData = await dataAdapter.getPendingMaterialOrders()
          setPendingOrders(pendingOrdersData)
        } catch (error) {
          console.error('Failed to load pending orders:', error)
        }
        
      } catch (error) {
        console.error('Failed to load materials:', error)
        toast({
          title: "Error",
          description: "Failed to load materials. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters, toast])

  // Calculate stats
  const materialCount = materials.length
  const lowStockCount = materials.filter(material => {
    const snapshot = inventorySnapshots[material.id]
    return isLowStock(material, snapshot?.onHand || 0)
  }).length
  
  // Calculate overview metrics
  const totalValue = Object.values(inventorySnapshots).reduce((sum, snapshot) => sum + snapshot.value, 0)
  const totalOnOrder = pendingOrders.reduce((sum, order) => sum + (order.totalValue || 0), 0)
  const avgMovementTrend = 8.3 // Mock trend - would calculate from recent movements
  const forecastValue = totalValue * (1 + avgMovementTrend / 100) // Simple forecast

  // Handlers
  const handleNewMaterial = () => {
    router.push('/materials/new')
  }

  const handleMaterialClick = (material: Material) => {
    router.push(`/materials/${material.id}`)
  }

  const handleEditMaterial = (material: Material) => {
    router.push(`/materials/${material.id}?tab=settings`)
  }

  const handleReceive = () => {
    toast({
      title: "Receive Materials",
      description: "Receive dialog would open here",
    })
  }

  const handleReceiveMaterial = (material: Material) => {
    toast({
      title: "Receive Material",
      description: `Receive dialog for ${material.name} would open here`,
    })
  }

  const handleImport = () => {
    router.push('/materials/import')
  }

  const handleExportCsv = () => {
    // Generate CSV data
    const csvData = materials.map(material => {
      const snapshot = inventorySnapshots[material.id]
      return {
        Code: material.code,
        Name: material.name,
        Category: material.category,
        'Default Unit': material.defaultUnit,
        'On Hand': snapshot?.onHand || 0,
        'Available': snapshot?.available || 0,
        'Value': snapshot?.value || 0,
        'Reorder Point': material.reorderPoint || '',
        'Supplier SKU': material.supplierSku || '',
        'Created': new Date(material.createdAt).toLocaleDateString(),
        'Updated': new Date(material.updatedAt).toLocaleDateString()
      }
    })

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `materials-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `Exported ${materials.length} materials to CSV`,
    })
  }

  const handlePrintLabels = () => {
    if (selectedMaterials.length === 0) {
      toast({
        title: "No Materials Selected",
        description: "Please select materials to print labels for",
        variant: "destructive",
      })
      return
    }
    
    router.push(`/materials/labels?materials=${selectedMaterials.join(',')}`)
  }

  const handlePrintLabel = (material: Material) => {
    router.push(`/materials/labels?materials=${material.id}`)
  }

  const handleGeneratePO = (material: Material) => {
    router.push(`/materials/${material.id}?tab=po`)
  }

  const handleViewAlerts = () => {
    router.push('/materials/alerts')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <MaterialsHeader
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
        onNewMaterial={handleNewMaterial}
        onReceive={handleReceive}
        onImport={handleImport}
        onExportCsv={handleExportCsv}
        onPrintLabels={handlePrintLabels}
        onViewAlerts={handleViewAlerts}
        materialCount={materialCount}
        lowStockCount={lowStockCount}
      />

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ValueCard
          title="Total Inventory Value"
          value={totalValue}
          currency="USD"
          subtitle="All materials on hand"
          icon={DollarSign}
          trend={{
            value: 12.4,
            isPositive: true,
            period: 'last month'
          }}
        />
        
        <ValueCard
          title="Materials on Order"
          value={totalOnOrder}
          currency="USD"
          subtitle={`${pendingOrders.length} pending orders`}
          icon={ShoppingCart}
          trend={{
            value: 5.2,
            isPositive: true,
            period: 'last week'
          }}
        />
        
        <ValueCard
          title="Forecast Value"
          value={forecastValue}
          currency="USD"
          subtitle="30-day projection"
          icon={TrendingUp}
          trend={{
            value: avgMovementTrend,
            isPositive: avgMovementTrend > 0,
            period: 'trend'
          }}
        />
        
        <ValueCard
          title="Active Alerts"
          value={lowStockCount}
          showAsQuantity={true}
          unit="alerts"
          subtitle="Require attention"
          icon={AlertTriangle}
        />
      </div>

      {/* Pending Orders Summary */}
      {pendingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Pending Material Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{order.materialName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.supplier} • Expected {new Date(order.expectedDelivery).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {order.quantity} {order.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(order.totalValue)}
                    </div>
                  </div>
                </div>
              ))}
              {pendingOrders.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View all {pendingOrders.length} pending orders
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <MaterialsTable
        materials={materials}
        inventorySnapshots={inventorySnapshots}
        view={view}
        onViewChange={setView}
        onMaterialClick={handleMaterialClick}
        onEditMaterial={handleEditMaterial}
        onReceiveMaterial={handleReceiveMaterial}
        onPrintLabel={handlePrintLabel}
        onGeneratePO={handleGeneratePO}
        selectedMaterials={selectedMaterials}
        onSelectionChange={setSelectedMaterials}
      />
    </div>
  )
}
