"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Plus, Trash2, Save, FileText, AlertTriangle, CheckCircle, Package, Search } from "lucide-react"

interface StockItem {
  id: string
  itemName: string
  sku: string
  category: 'fabric' | 'trim' | 'accessory' | 'packaging' | 'finished'
  location: string
  systemQuantity: number
  physicalCount: number
  variance: number
  unit: string
  unitCost: number
  varianceValue: number
  reason: string
  status: 'pending' | 'reconciled' | 'investigating'
}

interface Reconciliation {
  id: string
  name: string
  date: string
  location: string
  items: StockItem[]
  totalVariance: number
  totalVarianceValue: number
  accuracyPercentage: number
  itemsReconciled: number
  timestamp: string
}

const stockCategories = [
  { id: 'fabric', name: 'Fabric', color: 'bg-blue-100 text-blue-800' },
  { id: 'trim', name: 'Trim', color: 'bg-green-100 text-green-800' },
  { id: 'accessory', name: 'Accessory', color: 'bg-purple-100 text-purple-800' },
  { id: 'packaging', name: 'Packaging', color: 'bg-orange-100 text-orange-800' },
  { id: 'finished', name: 'Finished Goods', color: 'bg-red-100 text-red-800' }
]

const varianceReasons = [
  'Physical count error',
  'System entry error',
  'Theft/Loss',
  'Damage/Waste',
  'Transfer not recorded',
  'Receiving error',
  'Production consumption',
  'Other'
]

export default function StockReconciliationPage() {
  const [reconciliationName, setReconciliationName] = useState('')
  const [reconciliationDate, setReconciliationDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('')
  const [items, setItems] = useState<StockItem[]>([{
    id: '1',
    itemName: 'Cotton Fabric - Navy Blue',
    sku: 'FAB-COT-001',
    category: 'fabric',
    location: 'A-01-02',
    systemQuantity: 100,
    physicalCount: 98,
    variance: -2,
    unit: 'meters',
    unitCost: 15.50,
    varianceValue: -31.00,
    reason: '',
    status: 'pending'
  }])
  const [savedReconciliations, setSavedReconciliations] = useState<Reconciliation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const addItem = () => {
    const newItem: StockItem = {
      id: Date.now().toString(),
      itemName: '',
      sku: '',
      category: 'fabric',
      location: location || '',
      systemQuantity: 0,
      physicalCount: 0,
      variance: 0,
      unit: 'pieces',
      unitCost: 0,
      varianceValue: 0,
      reason: '',
      status: 'pending'
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof StockItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        
        // Recalculate variance and variance value
        if (field === 'systemQuantity' || field === 'physicalCount') {
          updated.variance = updated.physicalCount - updated.systemQuantity
          updated.varianceValue = updated.variance * updated.unitCost
        }
        
        if (field === 'unitCost') {
          updated.varianceValue = updated.variance * updated.unitCost
        }
        
        return updated
      }
      return item
    }))
  }

  const getTotalVariance = (): number => {
    return items.reduce((sum, item) => sum + Math.abs(item.variance), 0)
  }

  const getTotalVarianceValue = (): number => {
    return items.reduce((sum, item) => sum + Math.abs(item.varianceValue), 0)
  }

  const getAccuracyPercentage = (): number => {
    if (items.length === 0) return 100
    const accurateItems = items.filter(item => item.variance === 0).length
    return (accurateItems / items.length) * 100
  }

  const getReconciledItems = (): number => {
    return items.filter(item => item.status === 'reconciled').length
  }

  const getVarianceBreakdown = () => {
    return {
      positive: items.filter(item => item.variance > 0),
      negative: items.filter(item => item.variance < 0),
      accurate: items.filter(item => item.variance === 0)
    }
  }

  const getCategoryBreakdown = () => {
    const breakdown: Record<string, { count: number; variance: number; value: number }> = {}
    
    stockCategories.forEach(category => {
      const categoryItems = items.filter(item => item.category === category.id)
      breakdown[category.id] = {
        count: categoryItems.length,
        variance: categoryItems.reduce((sum, item) => sum + Math.abs(item.variance), 0),
        value: categoryItems.reduce((sum, item) => sum + Math.abs(item.varianceValue), 0)
      }
    })
    
    return breakdown
  }

  const getFilteredItems = () => {
    return items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || filterCategory === "all" || item.category === filterCategory
      const matchesStatus = !filterStatus || filterStatus === "all" || item.status === filterStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return stockCategories.find(cat => cat.id === categoryId) || stockCategories[0]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reconciled': return 'bg-green-100 text-green-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-blue-600' // Overage
    if (variance < 0) return 'text-red-600'  // Shortage
    return 'text-green-600' // Accurate
  }

  const saveReconciliation = () => {
    if (!reconciliationName) return

    const reconciliation: Reconciliation = {
      id: Date.now().toString(),
      name: reconciliationName,
      date: reconciliationDate,
      location: location,
      items: [...items],
      totalVariance: getTotalVariance(),
      totalVarianceValue: getTotalVarianceValue(),
      accuracyPercentage: getAccuracyPercentage(),
      itemsReconciled: getReconciledItems(),
      timestamp: new Date().toISOString()
    }

    setSavedReconciliations(prev => [reconciliation, ...prev])
    setReconciliationName('')
  }

  const loadReconciliation = (reconciliation: Reconciliation) => {
    setReconciliationName(reconciliation.name)
    setReconciliationDate(reconciliation.date)
    setLocation(reconciliation.location)
    setItems(reconciliation.items)
  }

  const exportReconciliation = () => {
    const breakdown = getCategoryBreakdown()
    const varianceBreakdown = getVarianceBreakdown()
    
    const csvContent = [
      'Stock Reconciliation Report',
      `Reconciliation: ${reconciliationName}`,
      `Date: ${reconciliationDate}`,
      `Location: ${location}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      'Summary:',
      `Total Items,${items.length}`,
      `Accurate Items,${varianceBreakdown.accurate.length}`,
      `Items with Overage,${varianceBreakdown.positive.length}`,
      `Items with Shortage,${varianceBreakdown.negative.length}`,
      `Accuracy Percentage,${getAccuracyPercentage().toFixed(1)}%`,
      `Total Variance Quantity,${getTotalVariance()}`,
      `Total Variance Value,${getTotalVarianceValue().toFixed(2)}`,
      `Items Reconciled,${getReconciledItems()}`,
      '',
      'Category Breakdown:',
      'Category,Items,Variance Qty,Variance Value',
      ...Object.entries(breakdown).map(([category, data]) => 
        `${category},${data.count},${data.variance},${data.value.toFixed(2)}`
      ),
      '',
      'Item Details:',
      'Item Name,SKU,Category,Location,System Qty,Physical Count,Variance,Unit,Unit Cost,Variance Value,Reason,Status',
      ...items.map(item => 
        `"${item.itemName}","${item.sku}",${item.category},"${item.location}",${item.systemQuantity},${item.physicalCount},${item.variance},${item.unit},${item.unitCost.toFixed(2)},${item.varianceValue.toFixed(2)},"${item.reason}",${item.status}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `stock-reconciliation-${reconciliationName || 'unnamed'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearReconciliation = () => {
    setItems([{
      id: Date.now().toString(),
      itemName: '',
      sku: '',
      category: 'fabric',
      location: location || '',
      systemQuantity: 0,
      physicalCount: 0,
      variance: 0,
      unit: 'pieces',
      unitCost: 0,
      varianceValue: 0,
      reason: '',
      status: 'pending'
    }])
    setReconciliationName('')
  }

  const filteredItems = getFilteredItems()
  const varianceBreakdown = getVarianceBreakdown()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Reconciliation</h1>
          <p className="text-gray-600">Compare system inventory with physical counts and resolve discrepancies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Reconciliation Header */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="reconciliationName">Reconciliation Name</Label>
                  <Input
                    id="reconciliationName"
                    placeholder="Monthly Stock Check - January"
                    value={reconciliationName}
                    onChange={(e) => setReconciliationName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reconciliationDate">Date</Label>
                  <Input
                    id="reconciliationDate"
                    type="date"
                    value={reconciliationDate}
                    onChange={(e) => setReconciliationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Warehouse A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveReconciliation} disabled={!reconciliationName}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={exportReconciliation}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Stock Items ({filteredItems.length})</span>
                <div className="flex gap-2">
                  <Button onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                  <Button variant="outline" onClick={clearReconciliation}>
                    Clear All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="search">Search Items</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or SKU"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="filterCategory">Filter by Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {stockCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterStatus">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="reconciled">Reconciled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {filteredItems.map((item, index) => {
                  const categoryInfo = getCategoryInfo(item.category)
                  return (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Badge className={categoryInfo.color}>
                            {categoryInfo.name}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          {item.variance !== 0 && (
                            <Badge variant="outline" className={getVarianceColor(item.variance)}>
                              {item.variance > 0 ? `+${item.variance}` : item.variance} {item.unit}
                            </Badge>
                          )}
                        </div>
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label>Item Name</Label>
                          <Input
                            placeholder="Cotton Fabric - Navy Blue"
                            value={item.itemName}
                            onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>SKU</Label>
                          <Input
                            placeholder="FAB-COT-001"
                            value={item.sku}
                            onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select 
                            value={item.category} 
                            onValueChange={(value: any) => updateItem(item.id, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {stockCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            placeholder="A-01-02"
                            value={item.location}
                            onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                          <Label>System Quantity</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.systemQuantity}
                            onChange={(e) => updateItem(item.id, 'systemQuantity', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Physical Count</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.physicalCount}
                            onChange={(e) => updateItem(item.id, 'physicalCount', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Variance</Label>
                          <Input
                            value={`${item.variance > 0 ? '+' : ''}${item.variance}`}
                            readOnly
                            className={`bg-gray-50 font-medium ${getVarianceColor(item.variance)}`}
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <Select 
                            value={item.unit} 
                            onValueChange={(value) => updateItem(item.id, 'unit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pieces">Pieces</SelectItem>
                              <SelectItem value="meters">Meters</SelectItem>
                              <SelectItem value="yards">Yards</SelectItem>
                              <SelectItem value="kg">Kilograms</SelectItem>
                              <SelectItem value="rolls">Rolls</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Unit Cost ($)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateItem(item.id, 'unitCost', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Variance Value</Label>
                          <Input
                            value={`$${item.varianceValue.toFixed(2)}`}
                            readOnly
                            className={`bg-gray-50 font-medium ${getVarianceColor(item.variance)}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Variance Reason</Label>
                          <Select 
                            value={item.reason} 
                            onValueChange={(value) => updateItem(item.id, 'reason', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {varianceReasons.map(reason => (
                                <SelectItem key={reason} value={reason}>
                                  {reason}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select 
                            value={item.status} 
                            onValueChange={(value: any) => updateItem(item.id, 'status', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="investigating">Investigating</SelectItem>
                              <SelectItem value="reconciled">Reconciled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Reconciliation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{getAccuracyPercentage().toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accurate:</span>
                    <span className="font-medium text-green-600">{varianceBreakdown.accurate.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overage:</span>
                    <span className="font-medium text-blue-600">{varianceBreakdown.positive.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shortage:</span>
                    <span className="font-medium text-red-600">{varianceBreakdown.negative.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reconciled:</span>
                    <span className="font-medium">{getReconciledItems()}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Variance:</span>
                    <span className="font-medium">${getTotalVarianceValue().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(getCategoryBreakdown()).map(([categoryId, data]) => {
                  if (data.count === 0) return null
                  const categoryInfo = getCategoryInfo(categoryId)
                  return (
                    <div key={categoryId} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={categoryInfo.color} variant="outline">
                          {categoryInfo.name}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${data.value.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{data.count} items</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getAccuracyPercentage() >= 95 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Excellent accuracy!</span>
                  </div>
                )}
                {getTotalVarianceValue() > 1000 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">High variance value</span>
                  </div>
                )}
                {varianceBreakdown.negative.length > varianceBreakdown.positive.length && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">More shortages than overages</span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Progress: {getReconciledItems()}/{items.length} items reconciled
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Reconciliations */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Reconciliations ({savedReconciliations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {savedReconciliations.length > 0 ? (
                <div className="space-y-3">
                  {savedReconciliations.slice(0, 3).map((reconciliation) => (
                    <div 
                      key={reconciliation.id} 
                      className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => loadReconciliation(reconciliation)}
                    >
                      <div className="font-medium text-sm truncate">{reconciliation.name}</div>
                      <div className="text-xs text-gray-500">
                        {reconciliation.accuracyPercentage.toFixed(1)}% accuracy • {reconciliation.items.length} items
                      </div>
                      <div className="text-xs text-gray-400">
                        ${reconciliation.totalVarianceValue.toFixed(2)} variance • {new Date(reconciliation.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {savedReconciliations.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{savedReconciliations.length - 3} more reconciliations
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">No saved reconciliations</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
