'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  ArrowUpDown,
  Building,
  Archive,
  Grid3X3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material, type MaterialLot, type Location, formatCurrency } from '@/types/materials'

interface LocationsPanelProps {
  material: Material
  onLocationUpdate?: () => void
}

export default function LocationsPanel({ material, onLocationUpdate }: LocationsPanelProps) {
  const { toast } = useToast()
  const [locations, setLocations] = useState<Location[]>([])
  const [lotsByLocation, setLotsByLocation] = useState<Record<string, MaterialLot[]>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewLocationDialog, setShowNewLocationDialog] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: '',
    kind: 'bin' as const,
    parentId: ''
  })

  useEffect(() => {
    loadData()
  }, [material.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [locationsData, lotsData] = await Promise.all([
        dataAdapter.getLocations(),
        dataAdapter.getMaterialLotsByLocation(material.id)
      ])
      setLocations(locationsData)
      setLotsByLocation(lotsData)
    } catch (error) {
      console.error('Failed to load locations data:', error)
      toast({
        title: "Error",
        description: "Failed to load locations data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLocation = async () => {
    try {
      await dataAdapter.createLocation(newLocation)
      setNewLocation({ name: '', kind: 'bin', parentId: '' })
      setShowNewLocationDialog(false)
      await loadData()
      onLocationUpdate?.()
      toast({
        title: "Location Created",
        description: `Created location ${newLocation.name}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await dataAdapter.deleteLocation(locationId)
      await loadData()
      onLocationUpdate?.()
      toast({
        title: "Location Deleted",
        description: "Location has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      })
    }
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLocationBadgeColor = (kind: string) => {
    switch (kind) {
      case 'warehouse': return 'bg-blue-100 text-blue-800'
      case 'room': return 'bg-green-100 text-green-800'
      case 'rack': return 'bg-yellow-100 text-yellow-800'
      case 'bin': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLocationIcon = (kind: string) => {
    switch (kind) {
      case 'warehouse': return Building
      case 'room': return Archive
      case 'rack': return Grid3X3
      case 'bin': return Package
      default: return MapPin
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Dialog open={showNewLocationDialog} onOpenChange={setShowNewLocationDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location-name">Location Name</Label>
                <Input
                  id="location-name"
                  placeholder="e.g., WH-A1-BIN03"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location-kind">Location Type</Label>
                <Select value={newLocation.kind} onValueChange={(value: any) => setNewLocation({ ...newLocation, kind: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                    <SelectItem value="rack">Rack</SelectItem>
                    <SelectItem value="bin">Bin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewLocationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLocation} disabled={!newLocation.name}>
                Create Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((location) => {
          const lots = lotsByLocation[location.id] || []
          const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantity, 0)
          const totalValue = lots.reduce((sum, lot) => sum + (lot.quantity * lot.unitCost), 0)
          const IconComponent = getLocationIcon(location.kind || 'bin')

          return (
            <Card key={location.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <CardTitle className="text-sm font-medium">{location.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getLocationBadgeColor(location.kind || 'bin')}>
                      {location.kind || 'bin'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDeleteLocation(location.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Location
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Quantity</span>
                    <span className="font-medium">{totalQuantity.toFixed(1)} {material.defaultUnit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="font-medium">{formatCurrency(totalValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lots</span>
                    <span className="font-medium">{lots.length}</span>
                  </div>
                  
                  {lots.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Recent Lots:</div>
                      <div className="space-y-1">
                        {lots.slice(0, 3).map((lot) => (
                          <div key={lot.id} className="flex justify-between text-xs">
                            <span className="font-mono">{lot.lotCode}</span>
                            <span>{lot.quantity.toFixed(1)} {material.defaultUnit}</span>
                          </div>
                        ))}
                        {lots.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{lots.length - 3} more lots
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty state */}
      {filteredLocations.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Locations Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No locations match your search.' : 'No locations have been created yet.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowNewLocationDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Location
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
