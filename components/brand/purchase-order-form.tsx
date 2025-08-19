'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Factory, 
  Package, 
  Calendar, 
  DollarSign, 
  Plus, 
  Trash2,
  Save,
  Send
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PurchaseOrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  description: string
}

export function PurchaseOrderForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    factoryId: '',
    poNumber: '',
    requestedDeliveryDate: '',
    totalValue: 0,
    notes: ''
  })
  const [items, setItems] = useState<PurchaseOrderItem[]>([])
  const [loading, setLoading] = useState(false)

  // Mock factory data
  const factories = [
    { id: 'fact-001', name: 'Apex Manufacturing', location: 'Detroit, MI' },
    { id: 'fact-002', name: 'Global Textiles Co.', location: 'Austin, TX' },
    { id: 'fact-003', name: 'Premium Garments Ltd.', location: 'Los Angeles, CA' }
  ]

  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      description: ''
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof PurchaseOrderItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Purchase Order Created",
        description: `PO ${formData.poNumber} has been submitted successfully.`
      })
      
      // Reset form
      setFormData({
        factoryId: '',
        poNumber: '',
        requestedDeliveryDate: '',
        totalValue: 0,
        notes: ''
      })
      setItems([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="factory">Factory</Label>
              <Select value={formData.factoryId} onValueChange={(value) => setFormData({...formData, factoryId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a factory" />
                </SelectTrigger>
                <SelectContent>
                  {factories.map((factory) => (
                    <SelectItem key={factory.id} value={factory.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{factory.name}</span>
                        <span className="text-sm text-gray-500">{factory.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                placeholder="PO-2024-XXX"
                value={formData.poNumber}
                onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Requested Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.requestedDeliveryDate}
                onChange={(e) => setFormData({...formData, requestedDeliveryDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or special requirements..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    placeholder="e.g., Cotton T-Shirt"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Item specifications, materials, etc."
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Badge variant="secondary">
                  Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                </Badge>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Order Summary */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Items:</span>
                <span className="text-lg">{items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Quantity:</span>
                <span className="text-lg">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-xl font-bold">Total Value:</span>
                <span className="text-xl font-bold text-green-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              factoryId: '',
              poNumber: '',
              requestedDeliveryDate: '',
              totalValue: 0,
              notes: ''
            })
            setItems([])
          }}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={loading || items.length === 0 || !formData.factoryId || !formData.poNumber}
          className="bg-black hover:bg-gray-800"
        >
          {loading ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Create Purchase Order
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
