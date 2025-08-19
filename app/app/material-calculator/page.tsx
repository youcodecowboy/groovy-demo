"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Plus, Trash2, Save, FileText, RotateCcw, FilePdf, Download, RefreshCw, Settings } from "lucide-react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from "sonner"

interface MaterialItem {
  id: string
  name: string
  type: 'fabric' | 'trim' | 'accessory' | 'packaging' | 'other'
  quantity: number
  unit: 'meters' | 'yards' | 'pieces' | 'kg' | 'lbs' | 'rolls' | 'sq_meters' | 'sq_yards'
  unitCost: number
  waste: number // percentage
  totalCost: number
  notes: string
  supplier?: string
  leadTime?: number // days
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
  projectName?: string
  customerName?: string
  notes?: string
}

interface MaterialTemplate {
  id: string
  name: string
  description: string
  items: Omit<MaterialItem, 'id'>[]
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
    notes: '',
    supplier: '',
    leadTime: 7
  }])
  const [calculationName, setCalculationName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [calculationNotes, setCalculationNotes] = useState('')
  const [savedCalculations, setSavedCalculations] = useState<Calculation[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const calculationRef = useRef<HTMLDivElement>(null)

  const [unitConversions] = useState({
    'meters_to_yards': 1.09361,
    'yards_to_meters': 0.9144,
    'kg_to_lbs': 2.20462,
    'lbs_to_kg': 0.453592,
    'sq_meters_to_sq_yards': 1.19599,
    'sq_yards_to_sq_meters': 0.836127
  })

  const materialTemplates: MaterialTemplate[] = [
    {
      id: 'jedi-robe',
      name: 'Jedi Robe Template',
      description: 'Standard materials for a Jedi robe',
      items: [
        { name: 'Wool Fabric', type: 'fabric', quantity: 3, unit: 'meters', unitCost: 25.00, waste: 15, totalCost: 0, notes: 'Heavy wool for outer layer', supplier: 'Coruscant Textiles', leadTime: 14 },
        { name: 'Linen Lining', type: 'fabric', quantity: 2.5, unit: 'meters', unitCost: 12.00, waste: 10, totalCost: 0, notes: 'Lightweight lining', supplier: 'Naboo Fabrics', leadTime: 7 },
        { name: 'Leather Belt', type: 'trim', quantity: 1, unit: 'pieces', unitCost: 8.50, waste: 5, totalCost: 0, notes: 'Brown leather belt', supplier: 'Tatooine Leather', leadTime: 5 },
        { name: 'Thread', type: 'trim', quantity: 2, unit: 'rolls', unitCost: 3.25, waste: 20, totalCost: 0, notes: 'Matching thread', supplier: 'Corellia Supplies', leadTime: 3 }
      ]
    },
    {
      id: 'sith-armor',
      name: 'Sith Armor Template',
      description: 'Materials for Sith armor construction',
      items: [
        { name: 'Durasteel Plates', type: 'fabric', quantity: 8, unit: 'pieces', unitCost: 45.00, waste: 8, totalCost: 0, notes: 'Armor plating', supplier: 'Mandalorian Metals', leadTime: 21 },
        { name: 'Leather Straps', type: 'trim', quantity: 6, unit: 'pieces', unitCost: 12.00, waste: 12, totalCost: 0, notes: 'Reinforced straps', supplier: 'Kamino Leather', leadTime: 10 },
        { name: 'Fabric Underlay', type: 'fabric', quantity: 2, unit: 'meters', unitCost: 18.00, waste: 15, totalCost: 0, notes: 'Comfort layer', supplier: 'Dathomir Textiles', leadTime: 7 },
        { name: 'Fasteners', type: 'accessory', quantity: 24, unit: 'pieces', unitCost: 1.75, waste: 25, totalCost: 0, notes: 'Magnetic fasteners', supplier: 'Bespin Hardware', leadTime: 5 }
      ]
    }
  ]

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
      notes: '',
      supplier: '',
      leadTime: 7
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
      toast.success("Material item removed")
    } else {
      toast.error("At least one material item is required")
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

  const loadTemplate = (template: MaterialTemplate) => {
    const templateItems = template.items.map(item => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      totalCost: (item.quantity * item.unitCost) + ((item.quantity * item.unitCost) * item.waste / 100)
    }))
    setItems(templateItems)
    setCalculationName(template.name)
    toast.success(`Loaded ${template.name} template`)
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

  const getTotalWasteAmount = (): number => {
    return items.reduce((sum, item) => {
      const baseTotal = item.quantity * item.unitCost
      return sum + (baseTotal * item.waste / 100)
    }, 0)
  }

  const getTotalWithWaste = (): number => {
    return getTotalCost()
  }

  const saveCalculation = () => {
    if (!calculationName.trim()) {
      toast.error("Please enter a calculation name")
      return
    }

    const calculation: Calculation = {
      id: Date.now().toString(),
      name: calculationName,
      items: [...items],
      totalQuantity: getTotalQuantity(),
      totalCost: getTotalCost(),
      totalWithWaste: getTotalWithWaste(),
      wasteAmount: getTotalWasteAmount(),
      timestamp: new Date().toISOString(),
      projectName,
      customerName,
      notes: calculationNotes
    }

    setSavedCalculations(prev => [calculation, ...prev])
    setCalculationName('')
    setProjectName('')
    setCustomerName('')
    setCalculationNotes('')
    toast.success("Calculation saved successfully!")
  }

  const loadCalculation = (calculation: Calculation) => {
    setItems([...calculation.items])
    setCalculationName(calculation.name)
    setProjectName(calculation.projectName || '')
    setCustomerName(calculation.customerName || '')
    setCalculationNotes(calculation.notes || '')
    toast.success(`Loaded calculation: ${calculation.name}`)
  }

  const deleteCalculation = (id: string) => {
    setSavedCalculations(prev => prev.filter(calc => calc.id !== id))
    toast.success("Calculation deleted")
  }

  const generatePDF = async () => {
    if (!calculationRef.current) {
      toast.error("Calculation data not available")
      return
    }

    setIsGeneratingPDF(true)
    try {
      const element = calculationRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
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

      const fileName = calculationName || `material-calculation-${Date.now()}`
      pdf.save(`${fileName}.pdf`)
      toast.success("PDF generated successfully!")
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error("Failed to generate PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const resetCalculation = () => {
    setItems([{
      id: '1',
      name: 'Cotton Fabric',
      type: 'fabric',
      quantity: 10,
      unit: 'meters',
      unitCost: 15.50,
      waste: 10,
      totalCost: 0,
      notes: '',
      supplier: '',
      leadTime: 7
    }])
    setCalculationName('')
    setProjectName('')
    setCustomerName('')
    setCalculationNotes('')
    toast.success("Calculation reset")
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material Calculator</h1>
          <p className="text-gray-600">Calculate material costs, waste, and requirements for your projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="calculationName">Calculation Name</Label>
                <Input
                  id="calculationName"
                  placeholder="e.g., Jedi Robe Production"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., Order #12345"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="e.g., Jedi Order"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="calculationNotes">Notes</Label>
                <Textarea
                  id="calculationNotes"
                  placeholder="Additional project notes..."
                  value={calculationNotes}
                  onChange={(e) => setCalculationNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Material Templates */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Material Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {materialTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadTemplate(template)}
                    >
                      Load
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                  <div className="text-xs text-gray-500">
                    {template.items.length} items
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={saveCalculation} 
                className="w-full"
                disabled={!calculationName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Calculation
              </Button>
              <Button 
                onClick={generatePDF} 
                className="w-full"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FilePdf className="h-4 w-4 mr-2" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetCalculation}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Material Items and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Material Items */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Material Items</span>
                <Button onClick={addItem} size="sm">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Material Name</Label>
                        <Input
                          placeholder="e.g., Cotton Fabric"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select 
                          value={item.type} 
                          onValueChange={(value: 'fabric' | 'trim' | 'accessory' | 'packaging' | 'other') => updateItem(item.id, 'type', value)}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          onValueChange={(value: 'meters' | 'yards' | 'pieces' | 'kg' | 'lbs' | 'rolls' | 'sq_meters' | 'sq_yards') => updateItem(item.id, 'unit', value)}
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
                            <SelectItem value="sq_meters">Square Meters</SelectItem>
                            <SelectItem value="sq_yards">Square Yards</SelectItem>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Label>Supplier</Label>
                        <Input
                          placeholder="Supplier name"
                          value={item.supplier}
                          onChange={(e) => updateItem(item.id, 'supplier', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Lead Time (days)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.leadTime}
                          onChange={(e) => updateItem(item.id, 'leadTime', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Additional notes about this material..."
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Badge variant="secondary" className="text-sm">
                        Total: ${item.totalCost.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calculation Results */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Calculation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={calculationRef}
                className="bg-white border rounded-lg p-6 space-y-4"
              >
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Material Calculation</h2>
                  {calculationName && <p className="text-gray-600">{calculationName}</p>}
                  {projectName && <p className="text-sm text-gray-500">Project: {projectName}</p>}
                  {customerName && <p className="text-sm text-gray-500">Customer: {customerName}</p>}
                  <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">{items.length}</div>
                    <div className="text-sm text-gray-600">Items</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">${getTotalCost().toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-2xl font-bold text-orange-600">${getTotalWasteAmount().toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Waste Cost</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-2xl font-bold text-purple-600">{getTotalQuantity().toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Total Quantity</div>
                  </div>
                </div>

                <Separator />

                {/* Items Table */}
                <div>
                  <h3 className="font-semibold mb-3">Material Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Material</th>
                          <th className="text-right py-2">Qty</th>
                          <th className="text-right py-2">Unit Cost</th>
                          <th className="text-right py-2">Waste %</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2">
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.type} • {item.unit}</div>
                              </div>
                            </td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">${item.unitCost.toFixed(2)}</td>
                            <td className="text-right py-2">{item.waste}%</td>
                            <td className="text-right py-2 font-medium">${item.totalCost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {calculationNotes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-gray-700 whitespace-pre-line">{calculationNotes}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Calculations */}
      {savedCalculations.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Saved Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCalculations.map((calculation) => (
                <div key={calculation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{calculation.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCalculation(calculation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {calculation.items.length} items • ${calculation.totalCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {new Date(calculation.timestamp).toLocaleString()}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadCalculation(calculation)}
                    className="w-full"
                  >
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
