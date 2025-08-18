'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { dataAdapter } from '@/lib/dataAdapter'
import { type MaterialLot } from '@/types/materials'
import { formatCurrency } from '@/types/materials'

interface LotPickerProps {
  materialId: string
  value?: string
  onValueChange: (lotId: string | undefined) => void
  placeholder?: string
  className?: string
  showFifoOption?: boolean
}

export default function LotPicker({
  materialId,
  value,
  onValueChange,
  placeholder = "Select lot (or use FIFO)...",
  className,
  showFifoOption = true
}: LotPickerProps) {
  const [open, setOpen] = useState(false)
  const [lots, setLots] = useState<MaterialLot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLots = async () => {
      if (!materialId) return
      
      try {
        setLoading(true)
        const data = await dataAdapter.getMaterialLots(materialId)
        // Only show lots with available quantity
        setLots(data.filter(lot => lot.quantity > 0))
      } catch (error) {
        console.error('Failed to load lots:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLots()
  }, [materialId])

  const selectedLot = lots.find(lot => lot.id === value)

  const formatLotDisplay = (lot: MaterialLot) => {
    const parts = []
    if (lot.lotCode) parts.push(`Lot: ${lot.lotCode}`)
    if (lot.color) parts.push(`Color: ${lot.color}`)
    if (lot.widthMm) parts.push(`Width: ${lot.widthMm}mm`)
    return parts.join(' • ')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between ${className}`}
        >
          {selectedLot ? (
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">
                  {selectedLot.lotCode || `Lot ${selectedLot.id.slice(-6)}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedLot.quantity.toFixed(1)} available • {formatCurrency(selectedLot.unitCost)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <Package className="w-4 h-4 mr-2" />
              {placeholder}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search lots..." />
          <CommandEmpty>
            {loading ? "Loading lots..." : "No lots available"}
          </CommandEmpty>
          <CommandGroup>
            {showFifoOption && (
              <CommandItem
                value="fifo"
                onSelect={() => {
                  onValueChange(undefined)
                  setOpen(false)
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    !value ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div className="flex items-center flex-1">
                  <div className="flex-1">
                    <div className="font-medium">Use FIFO (First In, First Out)</div>
                    <div className="text-xs text-muted-foreground">
                      Automatically select oldest lot
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    Automatic
                  </Badge>
                </div>
              </CommandItem>
            )}
            
            {lots.map((lot) => (
              <CommandItem
                key={lot.id}
                value={lot.lotCode || lot.id}
                onSelect={() => {
                  onValueChange(lot.id === value ? undefined : lot.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === lot.id ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div className="flex items-center flex-1">
                  <div className="flex-1">
                    <div className="font-medium">
                      {lot.lotCode || `Lot ${lot.id.slice(-6)}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatLotDisplay(lot)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Received: {new Date(lot.receivedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="font-medium">
                      {lot.quantity.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @ {formatCurrency(lot.unitCost)}
                    </div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}