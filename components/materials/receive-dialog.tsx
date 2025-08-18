'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import LocationPicker from './location-picker'
import UnitChip from './unit-chip'
import { type Material, type ReceiveMaterialForm } from '@/types/materials'

interface ReceiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: Material | null
  onReceive: (form: ReceiveMaterialForm) => Promise<void>
}

export default function ReceiveDialog({
  open,
  onOpenChange,
  material,
  onReceive
}: ReceiveDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<ReceiveMaterialForm>>({
    quantity: 0,
    unitCost: 0,
    unit: material?.defaultUnit,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!material || !form.quantity || !form.unitCost) return

    try {
      setLoading(true)
      await onReceive({
        materialId: material.id,
        quantity: form.quantity,
        unitCost: form.unitCost,
        unit: form.unit || material.defaultUnit,
        lotCode: form.lotCode,
        color: form.color,
        widthMm: form.widthMm,
        locationId: form.locationId,
        supplierId: form.supplierId,
        poId: form.poId,
        notes: form.notes,
      })
      
      // Reset form
      setForm({
        quantity: 0,
        unitCost: 0,
        unit: material.defaultUnit,
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to receive material:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!material) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Receive Material</DialogTitle>
          <DialogDescription>
            Record incoming inventory for {material.name} ({material.code})
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.quantity || ''}
                  onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
                <UnitChip unit={material.defaultUnit} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost *</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                min="0"
                value={form.unitCost || ''}
                onChange={(e) => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lotCode">Lot/Batch Code</Label>
              <Input
                id="lotCode"
                value={form.lotCode || ''}
                onChange={(e) => setForm({ ...form, lotCode: e.target.value })}
                placeholder="e.g., LOT-2024-001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={form.color || ''}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="e.g., Navy Blue"
              />
            </div>
          </div>

          {material.category === 'fabric' && (
            <div className="space-y-2">
              <Label htmlFor="widthMm">Width (mm)</Label>
              <Input
                id="widthMm"
                type="number"
                min="0"
                value={form.widthMm || ''}
                onChange={(e) => setForm({ ...form, widthMm: parseInt(e.target.value) || undefined })}
                placeholder="1500"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Location</Label>
            <LocationPicker
              value={form.locationId}
              onValueChange={(locationId) => setForm({ ...form, locationId })}
              placeholder="Select storage location..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierSku">Supplier</Label>
              <Input
                id="supplierSku"
                value={form.supplierId || ''}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poId">PO Reference</Label>
              <Input
                id="poId"
                value={form.poId || ''}
                onChange={(e) => setForm({ ...form, poId: e.target.value })}
                placeholder="PO-2024-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes about this receipt..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.quantity || !form.unitCost}>
              {loading ? 'Receiving...' : 'Receive Material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}