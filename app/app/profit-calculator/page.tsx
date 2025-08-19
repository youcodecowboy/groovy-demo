"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Save, FileText } from "lucide-react"

interface ProfitCalculation {
  id: string
  name: string
  revenue: number
  costs: {
    materials: number
    labor: number
    overhead: number
    shipping: number
    other: number
  }
  quantity: number
  grossProfit: number
  grossMargin: number
  profitPerUnit: number
  breakEvenPoint: number
  timestamp: string
}

interface Scenario {
  name: string
  revenueChange: number
  costChange: number
  quantityChange: number
}

const predefinedScenarios: Scenario[] = [
  { name: "Best Case", revenueChange: 15, costChange: -10, quantityChange: 20 },
  { name: "Worst Case", revenueChange: -10, costChange: 15, quantityChange: -15 },
  { name: "Bulk Order", revenueChange: -5, costChange: -15, quantityChange: 50 },
  { name: "Premium Quality", revenueChange: 25, costChange: 20, quantityChange: -10 },
  { name: "Cost Reduction", revenueChange: 0, costChange: -20, quantityChange: 0 }
]

export default function ProfitCalculatorPage() {
  const [calculationName, setCalculationName] = useState('')
  const [revenue, setRevenue] = useState(10000)
  const [quantity, setQuantity] = useState(100)
  const [costs, setCosts] = useState({
    materials: 3500,
    labor: 2000,
    overhead: 1500,
    shipping: 500,
    other: 300
  })
  const [savedCalculations, setSavedCalculations] = useState<ProfitCalculation[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)

  const getTotalCosts = (): number => {
    return Object.values(costs).reduce((sum, cost) => sum + cost, 0)
  }

  const getGrossProfit = (): number => {
    return revenue - getTotalCosts()
  }

  const getGrossMargin = (): number => {
    return revenue > 0 ? (getGrossProfit() / revenue) * 100 : 0
  }

  const getProfitPerUnit = (): number => {
    return quantity > 0 ? getGrossProfit() / quantity : 0
  }

  const getRevenuePerUnit = (): number => {
    return quantity > 0 ? revenue / quantity : 0
  }

  const getCostPerUnit = (): number => {
    return quantity > 0 ? getTotalCosts() / quantity : 0
  }

  const getBreakEvenPoint = (): number => {
    const profitPerUnit = getProfitPerUnit()
    return profitPerUnit > 0 ? getTotalCosts() / profitPerUnit : 0
  }

  const getBreakEvenRevenue = (): number => {
    return getTotalCosts()
  }

  const updateCost = (category: keyof typeof costs, value: number) => {
    setCosts(prev => ({ ...prev, [category]: value }))
  }

  const getCostBreakdown = () => {
    const total = getTotalCosts()
    return Object.entries(costs).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
  }

  const applyScenario = (scenario: Scenario) => {
    const newRevenue = revenue * (1 + scenario.revenueChange / 100)
    const newQuantity = Math.max(1, quantity * (1 + scenario.quantityChange / 100))
    const costMultiplier = 1 + scenario.costChange / 100
    const newCosts = {
      materials: costs.materials * costMultiplier,
      labor: costs.labor * costMultiplier,
      overhead: costs.overhead * costMultiplier,
      shipping: costs.shipping * costMultiplier,
      other: costs.other * costMultiplier
    }

    setRevenue(Math.round(newRevenue))
    setQuantity(Math.round(newQuantity))
    setCosts({
      materials: Math.round(newCosts.materials),
      labor: Math.round(newCosts.labor),
      overhead: Math.round(newCosts.overhead),
      shipping: Math.round(newCosts.shipping),
      other: Math.round(newCosts.other)
    })
    setSelectedScenario(scenario)
  }

  const saveCalculation = () => {
    if (!calculationName) return

    const calculation: ProfitCalculation = {
      id: Date.now().toString(),
      name: calculationName,
      revenue,
      costs: { ...costs },
      quantity,
      grossProfit: getGrossProfit(),
      grossMargin: getGrossMargin(),
      profitPerUnit: getProfitPerUnit(),
      breakEvenPoint: getBreakEvenPoint(),
      timestamp: new Date().toISOString()
    }

    setSavedCalculations(prev => [calculation, ...prev])
    setCalculationName('')
  }

  const loadCalculation = (calculation: ProfitCalculation) => {
    setCalculationName(calculation.name)
    setRevenue(calculation.revenue)
    setCosts(calculation.costs)
    setQuantity(calculation.quantity)
  }

  const exportCalculation = () => {
    const breakdown = getCostBreakdown()
    const csvContent = [
      'Profit Analysis Report',
      `Project: ${calculationName}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      'Financial Summary:',
      `Total Revenue,${revenue.toFixed(2)}`,
      `Total Costs,${getTotalCosts().toFixed(2)}`,
      `Gross Profit,${getGrossProfit().toFixed(2)}`,
      `Gross Margin,${getGrossMargin().toFixed(1)}%`,
      `Quantity,${quantity}`,
      `Revenue per Unit,${getRevenuePerUnit().toFixed(2)}`,
      `Cost per Unit,${getCostPerUnit().toFixed(2)}`,
      `Profit per Unit,${getProfitPerUnit().toFixed(2)}`,
      `Break-even Point,${getBreakEvenPoint().toFixed(0)} units`,
      `Break-even Revenue,${getBreakEvenRevenue().toFixed(2)}`,
      '',
      'Cost Breakdown:',
      ...breakdown.map(item => `${item.category},${item.amount.toFixed(2)},${item.percentage.toFixed(1)}%`),
      '',
      selectedScenario ? `Applied Scenario: ${selectedScenario.name}` : 'No scenario applied'
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `profit-analysis-${calculationName || 'unnamed'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getProfitabilityStatus = () => {
    const margin = getGrossMargin()
    if (margin >= 30) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle }
    if (margin >= 20) return { status: 'good', color: 'text-blue-600', icon: TrendingUp }
    if (margin >= 10) return { status: 'acceptable', color: 'text-yellow-600', icon: DollarSign }
    if (margin > 0) return { status: 'low', color: 'text-orange-600', icon: AlertTriangle }
    return { status: 'loss', color: 'text-red-600', icon: TrendingDown }
  }

  const profitStatus = getProfitabilityStatus()
  const StatusIcon = profitStatus.icon

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profit Calculator</h1>
          <p className="text-gray-600">Analyze profitability, margins, and break-even points for your production orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="calculationName">Project Name</Label>
                  <Input
                    id="calculationName"
                    placeholder="Jedi Robe Production - Q1 2024"
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveCalculation} disabled={!calculationName}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={exportCalculation}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue & Quantity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue & Quantity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="revenue">Total Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Expected total sales revenue
                  </p>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity (Units)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of units to produce
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Revenue per unit: <span className="font-medium">${getRevenuePerUnit().toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materials">Materials Cost ($)</Label>
                  <Input
                    id="materials"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costs.materials}
                    onChange={(e) => updateCost('materials', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="labor">Labor Cost ($)</Label>
                  <Input
                    id="labor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costs.labor}
                    onChange={(e) => updateCost('labor', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="overhead">Overhead Cost ($)</Label>
                  <Input
                    id="overhead"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costs.overhead}
                    onChange={(e) => updateCost('overhead', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="shipping">Shipping Cost ($)</Label>
                  <Input
                    id="shipping"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costs.shipping}
                    onChange={(e) => updateCost('shipping', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="other">Other Costs ($)</Label>
                  <Input
                    id="other"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costs.other}
                    onChange={(e) => updateCost('other', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Costs:</span>
                  <span className="font-medium">${getTotalCosts().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost per unit:</span>
                  <span className="font-medium">${getCostPerUnit().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {predefinedScenarios.map(scenario => (
                  <Button
                    key={scenario.name}
                    variant={selectedScenario?.name === scenario.name ? "default" : "outline"}
                    onClick={() => applyScenario(scenario)}
                    className="flex flex-col h-auto p-3"
                  >
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Revenue: {scenario.revenueChange > 0 ? '+' : ''}{scenario.revenueChange}%
                    </div>
                    <div className="text-xs text-gray-600">
                      Costs: {scenario.costChange > 0 ? '+' : ''}{scenario.costChange}%
                    </div>
                  </Button>
                ))}
              </div>
              {selectedScenario && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <div className="text-sm text-blue-800">
                    Applied scenario: <span className="font-medium">{selectedScenario.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profit Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${profitStatus.color}`} />
                Profit Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">${getGrossProfit().toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Gross Profit</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">${revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Costs:</span>
                    <span className="font-medium">${getTotalCosts().toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Margin:</span>
                      <span className={`font-bold ${profitStatus.color}`}>
                        {getGrossMargin().toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Badge variant="outline" className={profitStatus.color}>
                    {profitStatus.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per Unit Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Per Unit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue/Unit:</span>
                  <span className="font-medium">${getRevenuePerUnit().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost/Unit:</span>
                  <span className="font-medium">${getCostPerUnit().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit/Unit:</span>
                    <span className={`font-bold ${getProfitPerUnit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${getProfitPerUnit().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Break-Even Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Break-Even Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Break-Even Units:</span>
                  <span className="font-medium">{getBreakEvenPoint().toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break-Even Revenue:</span>
                  <span className="font-medium">${getBreakEvenRevenue().toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {quantity > getBreakEvenPoint() 
                    ? `You're ${(quantity - getBreakEvenPoint()).toFixed(0)} units above break-even`
                    : `You need ${(getBreakEvenPoint() - quantity).toFixed(0)} more units to break even`
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getCostBreakdown().map(item => (
                  <div key={item.category} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{item.category}:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">${item.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
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
                  {savedCalculations.slice(0, 3).map((calc) => (
                    <div 
                      key={calc.id} 
                      className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => loadCalculation(calc)}
                    >
                      <div className="font-medium text-sm truncate">{calc.name}</div>
                      <div className="text-xs text-gray-500">
                        ${calc.grossProfit.toFixed(2)} profit • {calc.grossMargin.toFixed(1)}% margin
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(calc.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {savedCalculations.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{savedCalculations.length - 3} more calculations
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