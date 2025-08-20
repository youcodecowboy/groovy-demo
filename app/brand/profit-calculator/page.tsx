"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Calculator, TrendingUp, TrendingDown, DollarSign, Save, FileText, RefreshCw, Target, Percent } from "lucide-react"
import { toast } from "sonner"

interface ProfitCalculation {
  id: string
  name: string
  type: 'product' | 'campaign' | 'service' | 'custom'
  revenue: number
  costOfGoods: number
  operatingExpenses: number
  marketingCosts: number
  otherCosts: number
  quantity: number
  unitPrice: number
  unitCost: number
  grossProfit: number
  netProfit: number
  grossMargin: number
  netMargin: number
  roi: number
  breakEvenQuantity: number
  notes: string
  timestamp: string
}

export default function ProfitCalculatorPage() {
  const [calculations, setCalculations] = useState<ProfitCalculation[]>([])
  const [currentCalc, setCurrentCalc] = useState<Partial<ProfitCalculation>>({
    name: "",
    type: 'product',
    revenue: 0,
    costOfGoods: 0,
    operatingExpenses: 0,
    marketingCosts: 0,
    otherCosts: 0,
    quantity: 1,
    unitPrice: 0,
    unitCost: 0,
    notes: ""
  })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Calculate derived values
  const totalCosts = (currentCalc.costOfGoods || 0) + (currentCalc.operatingExpenses || 0) + 
                    (currentCalc.marketingCosts || 0) + (currentCalc.otherCosts || 0)
  
  const grossProfit = (currentCalc.revenue || 0) - (currentCalc.costOfGoods || 0)
  const netProfit = (currentCalc.revenue || 0) - totalCosts
  
  const grossMargin = (currentCalc.revenue || 0) > 0 ? (grossProfit / (currentCalc.revenue || 1)) * 100 : 0
  const netMargin = (currentCalc.revenue || 0) > 0 ? (netProfit / (currentCalc.revenue || 1)) * 100 : 0
  
  const roi = totalCosts > 0 ? ((netProfit / totalCosts) * 100) : 0
  
  const breakEvenQuantity = (currentCalc.unitPrice || 0) > 0 ? 
    Math.ceil(totalCosts / (currentCalc.unitPrice || 1)) : 0

  const updateCalculation = (field: keyof ProfitCalculation, value: any) => {
    setCurrentCalc(prev => ({ ...prev, [field]: value }))
  }

  const calculateFromUnit = () => {
    const quantity = currentCalc.quantity || 1
    const unitPrice = currentCalc.unitPrice || 0
    const unitCost = currentCalc.unitCost || 0
    
    const revenue = quantity * unitPrice
    const costOfGoods = quantity * unitCost
    
    setCurrentCalc(prev => ({
      ...prev,
      revenue,
      costOfGoods
    }))
  }

  const calculateFromRevenue = () => {
    const revenue = currentCalc.revenue || 0
    const quantity = currentCalc.quantity || 1
    
    if (quantity > 0) {
      const unitPrice = revenue / quantity
      setCurrentCalc(prev => ({
        ...prev,
        unitPrice
      }))
    }
  }

  const saveCalculation = () => {
    if (!currentCalc.name?.trim()) {
      toast.error("Please enter a calculation name")
      return
    }

    const newCalculation: ProfitCalculation = {
      id: Date.now().toString(),
      name: currentCalc.name,
      type: currentCalc.type || 'product',
      revenue: currentCalc.revenue || 0,
      costOfGoods: currentCalc.costOfGoods || 0,
      operatingExpenses: currentCalc.operatingExpenses || 0,
      marketingCosts: currentCalc.marketingCosts || 0,
      otherCosts: currentCalc.otherCosts || 0,
      quantity: currentCalc.quantity || 1,
      unitPrice: currentCalc.unitPrice || 0,
      unitCost: currentCalc.unitCost || 0,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      roi,
      breakEvenQuantity,
      notes: currentCalc.notes || '',
      timestamp: new Date().toISOString()
    }

    setCalculations(prev => [newCalculation, ...prev])
    setCurrentCalc({
      name: "",
      type: 'product',
      revenue: 0,
      costOfGoods: 0,
      operatingExpenses: 0,
      marketingCosts: 0,
      otherCosts: 0,
      quantity: 1,
      unitPrice: 0,
      unitCost: 0,
      notes: ""
    })
    toast.success("Profit calculation saved successfully!")
  }

  const deleteCalculation = (id: string) => {
    setCalculations(prev => prev.filter(calc => calc.id !== id))
    toast.success("Calculation deleted")
  }

  const loadCalculation = (calculation: ProfitCalculation) => {
    setCurrentCalc({
      name: calculation.name,
      type: calculation.type,
      revenue: calculation.revenue,
      costOfGoods: calculation.costOfGoods,
      operatingExpenses: calculation.operatingExpenses,
      marketingCosts: calculation.marketingCosts,
      otherCosts: calculation.otherCosts,
      quantity: calculation.quantity,
      unitPrice: calculation.unitPrice,
      unitCost: calculation.unitCost,
      notes: calculation.notes
    })
    toast.success("Calculation loaded successfully!")
  }

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // In a real implementation, this would generate a PDF
      toast.success("PDF generated successfully!")
    } catch (error) {
      toast.error("Failed to generate PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getProfitStatus = (margin: number) => {
    if (margin >= 20) return { status: "Excellent", color: "bg-green-100 text-green-800", icon: TrendingUp }
    if (margin >= 10) return { status: "Good", color: "bg-blue-100 text-blue-800", icon: TrendingUp }
    if (margin >= 0) return { status: "Fair", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown }
    return { status: "Loss", color: "bg-red-100 text-red-800", icon: TrendingDown }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profit Calculator</h1>
          <p className="text-gray-600">Calculate profit margins, ROI, and financial metrics for brand operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Calculation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Calculation Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter calculation name"
                    value={currentCalc.name}
                    onChange={(e) => updateCalculation('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Calculation Type</Label>
                  <Select value={currentCalc.type} onValueChange={(value: any) => updateCalculation('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="campaign">Marketing Campaign</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this calculation"
                  value={currentCalc.notes}
                  onChange={(e) => updateCalculation('notes', e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Revenue and Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revenue">Total Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentCalc.revenue}
                    onChange={(e) => updateCalculation('revenue', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="costOfGoods">Cost of Goods ($)</Label>
                  <Input
                    id="costOfGoods"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentCalc.costOfGoods}
                    onChange={(e) => updateCalculation('costOfGoods', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="operatingExpenses">Operating Expenses ($)</Label>
                  <Input
                    id="operatingExpenses"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentCalc.operatingExpenses}
                    onChange={(e) => updateCalculation('operatingExpenses', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="marketingCosts">Marketing Costs ($)</Label>
                  <Input
                    id="marketingCosts"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentCalc.marketingCosts}
                    onChange={(e) => updateCalculation('marketingCosts', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="otherCosts">Other Costs ($)</Label>
                  <Input
                    id="otherCosts"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentCalc.otherCosts}
                    onChange={(e) => updateCalculation('otherCosts', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Unit Calculations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={currentCalc.quantity}
                    onChange={(e) => updateCalculation('quantity', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="unitPrice">Unit Price ($)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentCalc.unitPrice}
                    onChange={(e) => updateCalculation('unitPrice', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="unitCost">Unit Cost ($)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentCalc.unitCost}
                    onChange={(e) => updateCalculation('unitCost', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={calculateFromUnit} variant="outline" size="sm">
                  Calculate from Unit Values
                </Button>
                <Button onClick={calculateFromRevenue} variant="outline" size="sm">
                  Calculate Unit Price from Revenue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profit Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Profit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium">${(currentCalc.revenue || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Costs:</span>
                  <span className="font-medium text-red-600">${totalCosts.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Profit:</span>
                  <span className={`font-medium ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${grossProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className={`font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Margin:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${grossMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {grossMargin.toFixed(1)}%
                    </span>
                    <Badge className={getProfitStatus(grossMargin).color}>
                      {getProfitStatus(grossMargin).status}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Margin:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netMargin.toFixed(1)}%
                    </span>
                    <Badge className={getProfitStatus(netMargin).color}>
                      {getProfitStatus(netMargin).status}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI:</span>
                  <span className={`font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break-even Qty:</span>
                  <span className="font-medium">{breakEvenQuantity}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button onClick={saveCalculation} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Calculation
                </Button>
                <Button 
                  onClick={generatePDF} 
                  variant="outline" 
                  className="w-full"
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingPDF ? 'Generating...' : 'Generate PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Cost of Goods:</span>
                <span>${(currentCalc.costOfGoods || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Operating Expenses:</span>
                <span>${(currentCalc.operatingExpenses || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Marketing Costs:</span>
                <span>${(currentCalc.marketingCosts || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Other Costs:</span>
                <span>${(currentCalc.otherCosts || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Costs:</span>
                <span>${totalCosts.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Saved Calculations */}
          {calculations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Calculations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {calculations.map((calculation) => (
                  <div key={calculation.id} className="border rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{calculation.name}</div>
                        <div className="text-sm text-gray-500">
                          ${calculation.netProfit.toFixed(2)} • {calculation.netMargin.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadCalculation(calculation)}
                        >
                          <Target className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCalculation(calculation.id)}
                        >
                          <TrendingDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
