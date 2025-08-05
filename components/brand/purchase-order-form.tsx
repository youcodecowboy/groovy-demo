"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PurchaseOrderItem {
  sku: string
  quantity: number
  description: string
  specifications?: any
}

export function PurchaseOrderForm() {
  const { toast } = useToast()
  const createPurchaseOrder = useMutation(api.purchaseOrders.createPurchaseOrder)
  const factories = useQuery(api.factories.listFactories)
  const brands = useQuery(api.brands.listBrands)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { sku: "", quantity: 1, description: "" }
  ])
  const [formData, setFormData] = useState({
    factoryId: "",
    poNumber: "",
    requestedDeliveryDate: "",
    notes: "",
  })

  const handleAddItem = () => {
    setItems([...items, { sku: "", quantity: 1, description: "" }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    // For demo purposes, we'll use a simple calculation
    // In a real app, you'd have actual pricing
    return items.reduce((total, item) => total + (item.quantity * 250), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.factoryId || !formData.poNumber || !formData.requestedDeliveryDate) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (items.some(item => !item.sku || !item.description)) {
        toast({
          title: "Missing item details",
          description: "Please fill in SKU and description for all items",
          variant: "destructive",
        })
        return
      }

      // Get the first brand (demo setup)
      const brandId = brands?.[0]?._id
      if (!brandId) {
        toast({
          title: "Error",
          description: "No brands available",
          variant: "destructive",
        })
        return
      }

      const poData = {
        brandId,
        factoryId: formData.factoryId as any,
        poNumber: formData.poNumber,
        items: items.map(item => ({
          sku: item.sku,
          quantity: item.quantity,
          description: item.description,
          specifications: item.specifications,
        })),
        totalValue: calculateTotal(),
        requestedDeliveryDate: new Date(formData.requestedDeliveryDate).getTime(),
        notes: formData.notes,
      }

      const poId = await createPurchaseOrder(poData)

      toast({
        title: "Purchase Order Created",
        description: `PO ${formData.poNumber} has been submitted successfully`,
      })

      // Reset form
      setItems([{ sku: "", quantity: 1, description: "" }])
      setFormData({
        factoryId: "",
        poNumber: "",
        requestedDeliveryDate: "",
        notes: "",
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Purchase Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="poNumber">PO Number *</Label>
              <Input
                id="poNumber"
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                placeholder="PO-2024-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="factory">Factory *</Label>
              <Select value={formData.factoryId} onValueChange={(value) => setFormData({ ...formData, factoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select factory" />
                </SelectTrigger>
                <SelectContent>
                  {factories?.map((factory) => (
                    <SelectItem key={factory._id} value={factory._id}>
                      {factory.name} - {factory.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deliveryDate">Requested Delivery Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.requestedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="totalValue">Total Value</Label>
              <Input
                id="totalValue"
                value={`$${calculateTotal().toLocaleString()}`}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>SKU *</Label>
                    <Input
                      value={item.sku}
                      onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                      placeholder="SKU-123"
                      required
                    />
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Product description"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes for the factory..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 