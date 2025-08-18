'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, MapPin, Plus } from 'lucide-react'
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
import { type Location } from '@/types/materials'

interface LocationPickerProps {
  value?: string
  onValueChange: (locationId: string | undefined) => void
  placeholder?: string
  className?: string
}

export default function LocationPicker({
  value,
  onValueChange,
  placeholder = "Select location...",
  className
}: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await dataAdapter.getLocations()
        setLocations(data)
      } catch (error) {
        console.error('Failed to load locations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLocations()
  }, [])

  const selectedLocation = locations.find(loc => loc.id === value)

  const getLocationIcon = (kind?: string) => {
    switch (kind) {
      case 'warehouse':
        return '🏭'
      case 'room':
        return '🏠'
      case 'rack':
        return '📚'
      case 'bin':
        return '📦'
      default:
        return '📍'
    }
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
          {selectedLocation ? (
            <div className="flex items-center">
              <span className="mr-2">{getLocationIcon(selectedLocation.kind)}</span>
              {selectedLocation.name}
              {selectedLocation.kind && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedLocation.kind}
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              {placeholder}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search locations..." />
          <CommandEmpty>
            {loading ? (
              "Loading locations..."
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  No locations found
                </p>
                <Button variant="outline" size="sm" className="text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Location
                </Button>
              </div>
            )}
          </CommandEmpty>
          <CommandGroup>
            {locations.map((location) => (
              <CommandItem
                key={location.id}
                value={location.name}
                onSelect={() => {
                  onValueChange(location.id === value ? undefined : location.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === location.id ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div className="flex items-center flex-1">
                  <span className="mr-2">{getLocationIcon(location.kind)}</span>
                  <div className="flex-1">
                    <div className="font-medium">{location.name}</div>
                    {location.kind && (
                      <div className="text-xs text-muted-foreground">
                        {location.kind}
                      </div>
                    )}
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
