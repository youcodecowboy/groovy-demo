"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { StageBadge } from "@/components/ui/stage-badge"
import { Plus, Trash2, Package, Shirt, Tag, Building2, Palette, Ruler } from "lucide-react"
import { validateItemConfig } from "@/lib/item-utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ItemConfiguration {
  id: string
  sku: string
  quantity: number
  brand: string
  fabricCode: string
  color: string
  size: string
  style: string
  season: string
  notes: string
}

interface ModernItemGeneratorProps {
  workflows: any[]
  onGenerate: (items: any[]) => Promise<any[]>
}

const demoItems: ItemConfiguration[] = [
  {
    id: "1",
    sku: "ZRA-SS24-001",
    quantity: 25,
    brand: "Zara",
    fabricCode: "COT-100-DEN",
    color: "Indigo Blue",
    size: "32x34",
    style: "Slim Fit Jeans",
    season: "SS24",
    notes: "Premium denim with stretch",
  },
  {
    id: "2",
    sku: "HM-FW24-002",
    quantity: 15,
    brand: "H&M",
    fabricCode: "WOL-80-CAS",
    color: "Charcoal Grey",
    size: "L",
    style: "Crew Neck Sweater",
    season: "FW24",
    notes: "Sustainable wool blend",
  },
  {
    id: "3",
    sku: "UNI-SS24-003",
    quantity: 30,
    brand: "Uniqlo",
    fabricCode: "COT-100-JER",
    color: "White",
    size: "M",
    style: "Basic T-Shirt",
    season: "SS24",
    notes: "Organic cotton jersey",
  },
]

const fabricCodes = [
  "COT-100-DEN", // 100% Cotton Denim
  "COT-100-JER", // 100% Cotton Jersey
  "WOL-80-CAS", // 80% Wool Cashmere
  "POL-65-COT", // 65% Polyester Cotton
  "LIN-100-WOV", // 100% Linen Woven
  "SIL-100-SAT", // 100% Silk Satin
  "VIS-95-ELA", // 95% Viscose Elastane
]

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "28x30", "30x32", "32x34", "34x36", "36x38"]
const seasons = ["SS24", "FW24", "SS25", "FW25", "Resort", "Pre-Fall"]
const colors = [
  "White",
  "Black",
  "Navy Blue",
  "Indigo Blue",
  "Charcoal Grey",
  "Light Grey",
  "Beige",
  "Khaki",
  "Burgundy",
  "Forest Green",
]

export function ModernItemGenerator({ workflows, onGenerate }: ModernItemGeneratorProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>(workflows[0]?._id || "")
  const [itemConfigs, setItemConfigs] = useState<ItemConfiguration[]>([])
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const addNewItem = () => {
    const newItem: ItemConfiguration = {
      id: Date.now().toString(),
      sku: "",
      quantity: 1,
      brand: "",
      fabricCode: "",
      color: "",
      size: "",
      style: "",
      season: "",
      notes: "",
    }
    setItemConfigs([...itemConfigs, newItem])
    setSelectedItemIndex(itemConfigs.length)
  }

  const updateItem = (index: number, updates: Partial<ItemConfiguration>) => {
    const updatedItems = [...itemConfigs]
    updatedItems[index] = { ...updatedItems[index], ...updates }
    setItemConfigs(updatedItems)
  }

  const removeItem = (index: number) => {
    setItemConfigs(itemConfigs.filter((_, i) => i !== index))
    if (selectedItemIndex === index) {
      setSelectedItemIndex(null)
    }
  }

  const loadDemoItems = () => {
    setItemConfigs(demoItems)
    setSelectedItemIndex(0)
  }

  const generateItems = async () => {
    if (!selectedWorkflow || itemConfigs.length === 0) return

    // Validate all item configurations
    const validationErrors: string[] = []
    itemConfigs.forEach((config, index) => {
      const validation = validateItemConfig(config)
      if (!validation.isValid) {
        validationErrors.push(`Item ${index + 1}: ${validation.errors.join(", ")}`)
      }
    })

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: validationErrors.join("\n"),
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const itemsToGenerate = itemConfigs.flatMap((config) => {
        const items = []
        for (let i = 1; i <= config.quantity; i++) {
          items.push({
            sku: config.sku,
            brand: config.brand,
            fabricCode: config.fabricCode,
            color: config.color,
            size: config.size,
            style: config.style,
            season: config.season,
            notes: config.notes,
            workflowId: selectedWorkflow,
            uniqueId: `${config.sku}-${i.toString().padStart(3, "0")}`,
          })
        }
        return items
      })

      const generated = await onGenerate(itemsToGenerate)
      
      // Clear the form
      setItemConfigs([])
      setSelectedItemIndex(null)
      
      // Redirect to results page with generated items
      const itemsParam = encodeURIComponent(JSON.stringify(generated))
      router.push(`/admin/items/results?items=${itemsParam}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedItem = selectedItemIndex !== null ? itemConfigs[selectedItemIndex] : null
  const selectedWorkflowData = workflows.find((w) => w._id === selectedWorkflow)
  const totalItems = itemConfigs.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-8 pb-20 overflow-hidden">
        {/* Left Panel - Configuration */}
        <div className="space-y-6 overflow-y-auto pr-4">
          <div className="px-5 py-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Production Items</h2>
            <p className="text-gray-600">Create new items with detailed specifications for production tracking</p>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflow-select" className="text-sm font-medium text-gray-700">
                  Production Workflow
                </Label>
                <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.map((workflow) => (
                      <SelectItem key={workflow._id} value={workflow._id}>
                        {workflow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button onClick={loadDemoItems} variant="outline" className="flex-1 bg-transparent">
                  Load Demo Order
                </Button>
                <Button onClick={addNewItem} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedItem && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shirt className="w-5 h-5" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">SKU</Label>
                    <Input
                      value={selectedItem.sku}
                      onChange={(e) => updateItem(selectedItemIndex!, { sku: e.target.value })}
                      placeholder="e.g., ZRA-SS24-001"
                      className="mt-1 h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Quantity</Label>
                    <Input
                      type="number"
                      value={selectedItem.quantity}
                      onChange={(e) =>
                        updateItem(selectedItemIndex!, { quantity: Number.parseInt(e.target.value) || 1 })
                      }
                      min="1"
                      max="1000"
                      className="mt-1 h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Brand</Label>
                    <Input
                      value={selectedItem.brand}
                      onChange={(e) => updateItem(selectedItemIndex!, { brand: e.target.value })}
                      placeholder="e.g., Zara, H&M"
                      className="mt-1 h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Season</Label>
                    <Select
                      value={selectedItem.season}
                      onValueChange={(value) => updateItem(selectedItemIndex!, { season: value })}
                    >
                      <SelectTrigger className="mt-1 h-11">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons.map((season) => (
                          <SelectItem key={season} value={season}>
                            {season}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Style Description</Label>
                  <Input
                    value={selectedItem.style}
                    onChange={(e) => updateItem(selectedItemIndex!, { style: e.target.value })}
                    placeholder="e.g., Slim Fit Jeans, Crew Neck Sweater"
                    className="mt-1 h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Fabric Code</Label>
                    <Select
                      value={selectedItem.fabricCode}
                      onValueChange={(value) => updateItem(selectedItemIndex!, { fabricCode: value })}
                    >
                      <SelectTrigger className="mt-1 h-11">
                        <SelectValue placeholder="Select fabric" />
                      </SelectTrigger>
                      <SelectContent>
                        {fabricCodes.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Size</Label>
                    <Select
                      value={selectedItem.size}
                      onValueChange={(value) => updateItem(selectedItemIndex!, { size: value })}
                    >
                      <SelectTrigger className="mt-1 h-11">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Color</Label>
                  <Select
                    value={selectedItem.color}
                    onValueChange={(value) => updateItem(selectedItemIndex!, { color: value })}
                  >
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Production Notes</Label>
                  <Textarea
                    value={selectedItem.notes}
                    onChange={(e) => updateItem(selectedItemIndex!, { notes: e.target.value })}
                    placeholder="Special instructions, quality requirements, etc."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Production Order</h3>
            <p className="text-gray-600">Review your order configuration and generated items</p>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{itemConfigs.length}</div>
                    <div className="text-sm text-gray-600">SKUs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{selectedWorkflowData?.stages.length || 0}</div>
                    <div className="text-sm text-gray-600">Stages</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Preview */}
            {selectedWorkflowData && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Production Workflow</h4>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">{selectedWorkflowData.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflowData.stages
                          .sort((a: any, b: any) => a.order - b.order)
                          .map((stage: any) => (
                            <StageBadge key={stage.id} stage={stage} className="text-xs" />
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Item Configurations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Item Configurations</h4>
                {itemConfigs.length === 0 && (
                  <Button onClick={addNewItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                )}
              </div>

              {itemConfigs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Shirt className="w-8 h-8" />
                  </div>
                  <p className="font-medium">No items configured yet</p>
                  <p className="text-sm">Add items to start building your production order</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemConfigs.map((item, index) => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedItemIndex === index ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedItemIndex(index)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">{item.sku || "Untitled SKU"}</span>
                              <Badge variant="secondary" className="text-xs">
                                {item.quantity}x
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {item.brand && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-3 h-3" />
                                  {item.brand}
                                </div>
                              )}
                              {item.style && <div>{item.style}</div>}
                              <div className="flex items-center gap-4">
                                {item.color && (
                                  <div className="flex items-center gap-1">
                                    <Palette className="w-3 h-3" />
                                    {item.color}
                                  </div>
                                )}
                                {item.size && (
                                  <div className="flex items-center gap-1">
                                    <Ruler className="w-3 h-3" />
                                    {item.size}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeItem(index)
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>


          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{itemConfigs.length} SKUs configured</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{totalItems} total items</span>
              </div>
              {selectedWorkflowData && (
                <div className="flex items-center gap-2">
                  <span>→</span>
                  <span>{selectedWorkflowData.name}</span>
                </div>
              )}
            </div>
            <Button
              onClick={generateItems}
              size="lg"
              className="px-8 shadow-lg"
              disabled={isGenerating || itemConfigs.length === 0}
            >
              {isGenerating ? "Generating..." : `Generate ${totalItems} Items`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
