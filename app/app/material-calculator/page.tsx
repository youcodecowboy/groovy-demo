"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, Plus, Trash2, Save, FileText, RotateCcw } from "lucide-react"

interface MaterialItem {
  id: string
  name: string
  type: 'fabric' | 'trim' | 'accessory' | 'packaging' | 'other'
  quantity: number
  unit: 'meters' | 'yards' | 'pieces' | 'kg' | 'lbs' | 'rolls'
  unitCost: number
  waste: number // percentage
  totalCost: number
  notes: string
}

interface Calculation {
  id: string
  name: string
  items: MaterialItem[]
  totalQuantity: number
  totalCost: number
  totalWithWaste: number
  wasteAmount: number
  timestamp: string
}

export default function MaterialCalculatorPage() {
  const [items, setItems] = useState<MaterialItem[]>([{
    id: '1',
    name: 'Cotton Fabric',
    type: 'fabric',
    quantity: 10,
    unit: 'meters',
    unitCost: 15.50,
    waste: 10,
    totalCost: 0,
    notes: ''
  }])
  const [calculationName, setCalculationName] = useState('')
  const [savedCalculations, setSavedCalculations] = useState<Calculation[]>([])
  const [unitConversions] = useState({
    'meters_to_yards': 1.09361,
    'yards_to_meters': 0.9144,
    'kg_to_lbs': 2.20462,
    'lbs_to_kg': 0.453592
  })

  const addItem = () => {
    const newItem: MaterialItem = {
      id: Date.now().toString(),
      name: '',
      type: 'fabric',
      quantity: 1,
      unit: 'meters',
      unitCost: 0,
      waste: 10,
      totalCost: 0,
      notes: ''
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof MaterialItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        // Recalculate total cost
        const baseTotal = updated.quantity * updated.unitCost
        updated.totalCost = baseTotal + (baseTotal * updated.waste / 100)
        return updated
      }
      return item
    }))
  }

  const convertUnit = (value: number, fromUnit: string, toUnit: string): number => {
    const conversionKey = `${fromUnit}_to_${toUnit}` as keyof typeof unitConversions
    return unitConversions[conversionKey] ? value * unitConversions[conversionKey] : value
  }

  const getTotalCost = (): number => {
    return items.reduce((sum, item) => sum + item.totalCost, 0)
  }

  const getTotalQuantity = (): number => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalWaste = (): number => {
    return items.reduce((sum, item) => {
      const baseTotal = item.quantity * item.unitCost
      return sum + (baseTotal * item.waste / 100)
    }, 0)
  }

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'fabric': return 'bg-blue-100 text-blue-800'
      case 'trim': return 'bg-green-100 text-green-800'
      case 'accessory': return 'bg-purple-100 text-purple-800'
      case 'packaging': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const saveCalculation = () => {
    if (!calculationName) return

    const calculation: Calculation = {
      id: Date.now().toString(),
      name: calculationName,
      items: [...items],
      totalQuantity: getTotalQuantity(),
      totalCost: getTotalCost(),
      totalWithWaste: getTotalCost(),
      wasteAmount: getTotalWaste(),
      timestamp: new Date().toISOString()
    }

    setSavedCalculations(prev => [calculation, ...prev])
    setCalculationName('')
  }

  const loadCalculation = (calculation: Calculation) => {
    setItems(calculation.items)
    setCalculationName(calculation.name)
  }

  const clearCalculation = () => {
    setItems([{
      id: Date.now().toString(),
      name: '',
      type: 'fabric',
      quantity: 1,
      unit: 'meters',
      unitCost: 0,
      waste: 10,
      totalCost: 0,
      notes: ''
    }])
    setCalculationName('')
  }

  const exportCalculation = () => {
    const csvContent = [
      'Material Name,Type,Quantity,Unit,Unit Cost,Waste %,Total Cost,Notes',
      ...items.map(item => 
        `"${item.name}",${item.type},${item.quantity},${item.unit},${item.unitCost},${item.waste},${item.totalCost.toFixed(2)},"${item.notes}"`
      ),
      '',
      `Total Quantity,${getTotalQuantity()}`,
      `Total Cost (with waste),${getTotalCost().toFixed(2)}`,
      `Waste Amount,${getTotalWaste().toFixed(2)}`
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `material-calculation-${calculationName || 'unnamed'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material Calculator</h1>
          <p className="text-gray-600">Calculate material requirements, costs, and waste for production orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Material Items */}
        <div className="lg:col-span-3 space-y-6">
          {/* Calculation Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Material Calculation</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearCalculation}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button variant="outline" onClick={exportCalculation}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="calculationName">Calculation Name</Label>
                  <Input
                    id="calculationName"
                    placeholder="Jedi Robe Production - Batch 001"
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                  />
                </div>
                <Button onClick={saveCalculation} disabled={!calculationName}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Material Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Material Items</span>
                <Button onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge className={getItemTypeColor(item.type)}>
                          {item.type}
                        </Badge>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>Material Name</Label>
                        <Input
                          placeholder="Cotton Fabric"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select 
                          value={item.type} 
                          onValueChange={(value: any) => updateItem(item.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fabric">Fabric</SelectItem>
                            <SelectItem value="trim">Trim</SelectItem>
                            <SelectItem value="accessory">Accessory</SelectItem>
                            <SelectItem value="packaging">Packaging</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select 
                          value={item.unit} 
                          onValueChange={(value: any) => updateItem(item.id, 'unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meters">Meters</SelectItem>
                            <SelectItem value="yards">Yards</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="lbs">Pounds</SelectItem>
                            <SelectItem value="rolls">Rolls</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Label>Waste (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={item.waste}
                          onChange={(e) => updateItem(item.id, 'waste', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Total Cost</Label>
                        <Input
                          value={`$${item.totalCost.toFixed(2)}`}
                          readOnly
                          className="bg-gray-50 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Input
                        placeholder="Additional notes or specifications"
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      />
                    </div>

                    {/* Item Summary */}
                    <div className="bg-gray-50 p-3 rounded border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Base Cost:</span>
                          <div className="font-medium">${(item.quantity * item.unitCost).toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Waste Cost:</span>
                          <div className="font-medium">${((item.quantity * item.unitCost) * item.waste / 100).toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Quantity:</span>
                          <div className="font-medium">{item.quantity} {item.unit}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost per Unit:</span>
                          <div className="font-medium">${item.unitCost.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Saved Calculations */}
        <div className="lg:col-span-1 space-y-6">
          {/* Calculation Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Calculation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">{getTotalQuantity().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Cost:</span>
                  <span className="font-medium">${(getTotalCost() - getTotalWaste()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Waste Cost:</span>
                  <span className="font-medium">${getTotalWaste().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Cost:</span>
                    <span>${getTotalCost().toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Average waste: {items.length > 0 ? (getTotalWaste() / (getTotalCost() - getTotalWaste()) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Material Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {item.name || 'Unnamed Item'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${item.totalCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getTotalCost() > 0 ? ((item.totalCost / getTotalCost()) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Unit Converter */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Unit Converter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-gray-600">
                  <div>1 meter = 1.094 yards</div>
                  <div>1 yard = 0.914 meters</div>
                  <div>1 kg = 2.205 lbs</div>
                  <div>1 lb = 0.454 kg</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Calculations ({savedCalculations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {savedCalculations.length > 0 ? (
                <div className="space-y-3">
                  {savedCalculations.slice(0, 5).map((calc) => (
                    <div 
                      key={calc.id} 
                      className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => loadCalculation(calc)}
                    >
                      <div className="font-medium text-sm truncate">{calc.name}</div>
                      <div className="text-xs text-gray-500">
                        {calc.items.length} items • ${calc.totalCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(calc.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {savedCalculations.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{savedCalculations.length - 5} more calculations
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">No saved calculations</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}