"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Plus, Trash2, Save, FileText, TrendingUp, AlertCircle, RefreshCw, Settings } from "lucide-react"
import { toast } from "sonner"

interface CostItem {
  id: string
  category: 'materials' | 'labor' | 'overhead' | 'shipping' | 'other'
  name: string
  unitCost: number
  quantity: number
  unit: string
  totalCost: number
  notes: string
}

interface CostEstimate {
  id: string
  name: string
  projectType: 'single_item' | 'batch_production' | 'custom_order'
  items: CostItem[]
  markup: number
  discount: number
  subtotal: number
  markupAmount: number
  discountAmount: number
  finalTotal: number
  profitMargin: number
  timestamp: string
}

const costCategories = [
  { id: 'materials', name: 'Materials', color: 'bg-blue-100 text-blue-800', icon: '🧵' },
  { id: 'labor', name: 'Labor', color: 'bg-green-100 text-green-800', icon: '👥' },
  { id: 'overhead', name: 'Overhead', color: 'bg-orange-100 text-orange-800', icon: '🏭' },
  { id: 'shipping', name: 'Shipping', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
  { id: 'other', name: 'Other', color: 'bg-gray-100 text-gray-800', icon: '📋' }
]

export default function CostEstimatorPage() {
  const [items, setItems] = useState<CostItem[]>([{
    id: '1',
    category: 'materials',
    name: 'Cotton Fabric',
    unitCost: 15.50,
    quantity: 10,
    unit: 'meters',
    totalCost: 155,
    notes: ''
  }])
  const [estimateName, setEstimateName] = useState('')
  const [projectType, setProjectType] = useState<'single_item' | 'batch_production' | 'custom_order'>('single_item')
  const [markup, setMarkup] = useState(25) // percentage
  const [discount, setDiscount] = useState(0) // percentage
  const [savedEstimates, setSavedEstimates] = useState<CostEstimate[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const estimateRef = useRef<HTMLDivElement>(null)

  const addItem = () => {
    const newItem: CostItem = {
      id: Date.now().toString(),
      category: 'materials',
      name: '',
      unitCost: 0,
      quantity: 1,
      unit: 'pieces',
      totalCost: 0,
      notes: ''
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
      toast.success("Cost item removed")
    } else {
      toast.error("At least one cost item is required")
    }
  }

  const updateItem = (id: string, field: keyof CostItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        updated.totalCost = updated.quantity * updated.unitCost
        return updated
      }
      return item
    }))
  }

  const getSubtotal = (): number => {
    return items.reduce((sum, item) => sum + item.totalCost, 0)
  }

  const getMarkupAmount = (): number => {
    return getSubtotal() * (markup / 100)
  }

  const getDiscountAmount = (): number => {
    const afterMarkup = getSubtotal() + getMarkupAmount()
    return afterMarkup * (discount / 100)
  }

  const getFinalTotal = (): number => {
    return getSubtotal() + getMarkupAmount() - getDiscountAmount()
  }

  const getProfitMargin = (): number => {
    const total = getFinalTotal()
    const profit = getMarkupAmount() - getDiscountAmount()
    return total > 0 ? (profit / total) * 100 : 0
  }

  const getCostBreakdown = () => {
    const breakdown: Record<string, number> = {}
    costCategories.forEach(cat => {
      breakdown[cat.id] = items
        .filter(item => item.category === cat.id)
        .reduce((sum, item) => sum + item.totalCost, 0)
    })
    return breakdown
  }

  const getCategoryInfo = (categoryId: string) => {
    return costCategories.find(cat => cat.id === categoryId) || costCategories[0]
  }

  const saveEstimate = () => {
    if (!estimateName.trim()) {
      toast.error("Please enter an estimate name")
      return
    }

    const estimate: CostEstimate = {
      id: Date.now().toString(),
      name: estimateName,
      projectType,
      items: [...items],
      markup,
      discount,
      subtotal: getSubtotal(),
      markupAmount: getMarkupAmount(),
      discountAmount: getDiscountAmount(),
      finalTotal: getFinalTotal(),
      profitMargin: getProfitMargin(),
      timestamp: new Date().toISOString()
    }

    setSavedEstimates(prev => [estimate, ...prev])
    setEstimateName('')
    setProjectName('')
    setCustomerName('')
    toast.success("Cost estimate saved successfully!")
  }

  const generatePDF = async () => {
    if (!estimateRef.current) {
      toast.error("Estimate data not available")
      return
    }

    setIsGeneratingPDF(true)
    try {
      // Dynamic imports to avoid SSR issues
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ])

      const element = estimateRef.current
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        background: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = estimateName || `cost-estimate-${Date.now()}`
      pdf.save(`${fileName}.pdf`)
      toast.success("PDF generated successfully!")
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error("Failed to generate PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const loadEstimate = (estimate: CostEstimate) => {
    setItems(estimate.items)
    setEstimateName(estimate.name)
    setProjectType(estimate.projectType)
    setMarkup(estimate.markup)
    setDiscount(estimate.discount)
  }

  const exportEstimate = () => {
    const breakdown = getCostBreakdown()
    const csvContent = [
      'Cost Estimate Report',
      `Project: ${estimateName}`,
      `Type: ${projectType}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      'Item Details:',
      'Category,Item Name,Quantity,Unit,Unit Cost,Total Cost,Notes',
      ...items.map(item => 
        `${item.category},"${item.name}",${item.quantity},${item.unit},${item.unitCost.toFixed(2)},${item.totalCost.toFixed(2)},"${item.notes}"`
      ),
      '',
      'Cost Summary:',
      ...costCategories.map(cat => `${cat.name},${breakdown[cat.id].toFixed(2)}`),
      '',
      `Subtotal,${getSubtotal().toFixed(2)}`,
      `Markup (${markup}%),${getMarkupAmount().toFixed(2)}`,
      `Discount (${discount}%),${getDiscountAmount().toFixed(2)}`,
      `Final Total,${getFinalTotal().toFixed(2)}`,
      `Profit Margin,${getProfitMargin().toFixed(1)}%`
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cost-estimate-${estimateName || 'unnamed'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearEstimate = () => {
    setItems([{
      id: Date.now().toString(),
      category: 'materials',
      name: '',
      unitCost: 0,
      quantity: 1,
      unit: 'pieces',
      totalCost: 0,
      notes: ''
    }])
    setEstimateName('')
    setMarkup(25)
    setDiscount(0)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cost Estimator</h1>
          <p className="text-gray-600">Create detailed cost estimates for production orders and custom projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cost Items */}
        <div className="lg:col-span-3 space-y-6">
          {/* Estimate Header */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="estimateName">Estimate Name</Label>
                  <Input
                    id="estimateName"
                    placeholder="Jedi Robe Production Estimate"
                    value={estimateName}
                    onChange={(e) => setEstimateName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select 
                    value={projectType} 
                    onValueChange={(value: any) => setProjectType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_item">Single Item</SelectItem>
                      <SelectItem value="batch_production">Batch Production</SelectItem>
                      <SelectItem value="custom_order">Custom Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEstimate} disabled={!estimateName}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={exportEstimate}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={clearEstimate}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cost Items</span>
                <Button onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => {
                  const categoryInfo = getCategoryInfo(item.category)
                  return (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Item {index + 1}</Badge>
                          <Badge className={categoryInfo.color}>
                            {categoryInfo.icon} {categoryInfo.name}
                          </Badge>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                              {costCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Item Name</Label>
                          <Input
                            placeholder="Cotton Fabric"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          />
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
                          <Label>Total Cost</Label>
                          <Input
                            value={`$${item.totalCost.toFixed(2)}`}
                            readOnly
                            className="bg-gray-50 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="kg">Kilograms</SelectItem>
                              <SelectItem value="lbs">Pounds</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Input
                            placeholder="Additional notes"
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="markup">Markup Percentage (%)</Label>
                  <Input
                    id="markup"
                    type="number"
                    min="0"
                    max="200"
                    step="0.1"
                    value={markup}
                    onChange={(e) => setMarkup(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard markup for profit margin
                  </p>
                </div>
                <div>
                  <Label htmlFor="discount">Discount Percentage (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional discount for customer
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Markup ({markup}%):</span>
                  <span className="font-medium text-green-600">+${getMarkupAmount().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount ({discount}%):</span>
                    <span className="font-medium text-red-600">-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Final Total:</span>
                    <span>${getFinalTotal().toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    Profit Margin: {getProfitMargin().toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {costCategories.map(category => {
                  const amount = getCostBreakdown()[category.id]
                  const percentage = getSubtotal() > 0 ? (amount / getSubtotal()) * 100 : 0
                  return (
                    <div key={category.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Profitability Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">${getFinalTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Costs:</span>
                  <span className="font-medium">${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Profit:</span>
                  <span className="font-medium text-green-600">${(getFinalTotal() - getSubtotal()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin:</span>
                  <span className={`font-medium ${getProfitMargin() >= 20 ? 'text-green-600' : getProfitMargin() >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {getProfitMargin().toFixed(1)}%
                  </span>
                </div>
                {getProfitMargin() < 20 && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertCircle className="h-3 w-3" />
                    <span>Consider higher markup for better margins</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Saved Estimates */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Estimates ({savedEstimates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {savedEstimates.length > 0 ? (
                <div className="space-y-3">
                  {savedEstimates.slice(0, 5).map((estimate) => (
                    <div 
                      key={estimate.id} 
                      className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => loadEstimate(estimate)}
                    >
                      <div className="font-medium text-sm truncate">{estimate.name}</div>
                      <div className="text-xs text-gray-500">
                        {estimate.items.length} items • ${estimate.finalTotal.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {estimate.profitMargin.toFixed(1)}% margin • {new Date(estimate.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {savedEstimates.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{savedEstimates.length - 5} more estimates
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">No saved estimates</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}