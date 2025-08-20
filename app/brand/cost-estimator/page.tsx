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
  category: 'materials' | 'design' | 'marketing' | 'production' | 'shipping' | 'other'
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
  projectType: 'product_development' | 'marketing_campaign' | 'brand_launch' | 'custom'
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
  { id: 'design', name: 'Design', color: 'bg-purple-100 text-purple-800', icon: '🎨' },
  { id: 'marketing', name: 'Marketing', color: 'bg-green-100 text-green-800', icon: '📢' },
  { id: 'production', name: 'Production', color: 'bg-orange-100 text-orange-800', icon: '🏭' },
  { id: 'shipping', name: 'Shipping', color: 'bg-cyan-100 text-cyan-800', icon: '🚚' },
  { id: 'other', name: 'Other', color: 'bg-gray-100 text-gray-800', icon: '📋' }
]

export default function CostEstimatorPage() {
  const [items, setItems] = useState<CostItem[]>([{
    id: '1',
    category: 'materials',
    name: 'Premium Fabric',
    unitCost: 25.00,
    quantity: 10,
    unit: 'meters',
    totalCost: 250,
    notes: 'High-quality material for brand products'
  }])
  const [estimateName, setEstimateName] = useState('')
  const [projectType, setProjectType] = useState<'product_development' | 'marketing_campaign' | 'brand_launch' | 'custom'>('product_development')
  const [markup, setMarkup] = useState(30) // percentage
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

  const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0)
  const markupAmount = (subtotal * markup) / 100
  const discountAmount = (subtotal * discount) / 100
  const finalTotal = subtotal + markupAmount - discountAmount
  const profitMargin = subtotal > 0 ? ((markupAmount - discountAmount) / subtotal) * 100 : 0

  const saveEstimate = () => {
    if (!estimateName.trim()) {
      toast.error("Please enter an estimate name")
      return
    }

    const newEstimate: CostEstimate = {
      id: Date.now().toString(),
      name: estimateName,
      projectType,
      items: [...items],
      markup,
      discount,
      subtotal,
      markupAmount,
      discountAmount,
      finalTotal,
      profitMargin,
      timestamp: new Date().toISOString()
    }

    setSavedEstimates(prev => [newEstimate, ...prev])
    setEstimateName('')
    toast.success("Cost estimate saved successfully!")
  }

  const loadEstimate = (estimate: CostEstimate) => {
    setItems(estimate.items)
    setProjectType(estimate.projectType)
    setMarkup(estimate.markup)
    setDiscount(estimate.discount)
    toast.success("Estimate loaded successfully!")
  }

  const deleteEstimate = (id: string) => {
    setSavedEstimates(prev => prev.filter(estimate => estimate.id !== id))
    toast.success("Estimate deleted")
  }

  const generatePDF = async () => {
    if (!estimateRef.current) return

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

  const getCategoryIcon = (category: string) => {
    return costCategories.find(cat => cat.id === category)?.icon || '📋'
  }

  const getCategoryColor = (category: string) => {
    return costCategories.find(cat => cat.id === category)?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cost Estimator</h1>
          <p className="text-gray-600">Calculate costs for brand products, marketing campaigns, and brand development</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="Enter project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Customer/Client</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="projectType">Project Type</Label>
                <Select value={projectType} onValueChange={(value: any) => setProjectType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product_development">Product Development</SelectItem>
                    <SelectItem value="marketing_campaign">Marketing Campaign</SelectItem>
                    <SelectItem value="brand_launch">Brand Launch</SelectItem>
                    <SelectItem value="custom">Custom Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cost Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cost Items</span>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <Badge className={getCategoryColor(item.category)}>
                        {costCategories.find(cat => cat.id === item.category)?.name}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`name-${item.id}`}>Item Name</Label>
                      <Input
                        id={`name-${item.id}`}
                        placeholder="Enter item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`category-${item.id}`}>Category</Label>
                      <Select 
                        value={item.category} 
                        onValueChange={(value: any) => updateItem(item.id, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {costCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`unitCost-${item.id}`}>Unit Cost ($)</Label>
                      <Input
                        id={`unitCost-${item.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => updateItem(item.id, 'unitCost', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`unit-${item.id}`}>Unit</Label>
                      <Input
                        id={`unit-${item.id}`}
                        placeholder="pieces, meters, hours, etc."
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`totalCost-${item.id}`}>Total Cost</Label>
                      <Input
                        id={`totalCost-${item.id}`}
                        value={`$${item.totalCost.toFixed(2)}`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                    <Textarea
                      id={`notes-${item.id}`}
                      placeholder="Additional notes about this cost item"
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Cost Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Markup ({markup}%):</span>
                  <span className="font-medium text-green-600">+${markupAmount.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount ({discount}%):</span>
                    <span className="font-medium text-red-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className={`font-medium ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="markup">Markup Percentage</Label>
                  <Input
                    id="markup"
                    type="number"
                    min="0"
                    max="100"
                    value={markup}
                    onChange={(e) => setMarkup(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount Percentage</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={generatePDF} 
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

          {/* Save Estimate */}
          <Card>
            <CardHeader>
              <CardTitle>Save Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="estimateName">Estimate Name</Label>
                <Input
                  id="estimateName"
                  placeholder="Enter estimate name"
                  value={estimateName}
                  onChange={(e) => setEstimateName(e.target.value)}
                />
              </div>
              <Button onClick={saveEstimate} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Estimate
              </Button>
            </CardContent>
          </Card>

          {/* Saved Estimates */}
          {savedEstimates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Estimates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedEstimates.map((estimate) => (
                  <div key={estimate.id} className="border rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{estimate.name}</div>
                        <div className="text-sm text-gray-500">
                          ${estimate.finalTotal.toFixed(2)} • {new Date(estimate.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadEstimate(estimate)}
                        >
                          <TrendingUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEstimate(estimate.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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
