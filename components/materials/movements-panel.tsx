'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowUpDown, 
  Package, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  Eye,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/dialog'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material, type MaterialMovement, formatCurrency } from '@/types/materials'

interface MovementsPanelProps {
  material: Material
}

export default function MovementsPanel({ material }: MovementsPanelProps) {
  const { toast } = useToast()
  const [movements, setMovements] = useState<MaterialMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMovement, setSelectedMovement] = useState<MaterialMovement | null>(null)

  useEffect(() => {
    loadMovements()
  }, [material.id])

  const loadMovements = async () => {
    try {
      setLoading(true)
      const movementsData = await dataAdapter.getMaterialMovements(material.id)
      setMovements(movementsData)
    } catch (error) {
      console.error('Failed to load movements:', error)
      toast({
        title: "Error",
        description: "Failed to load movement history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMovements = movements.filter(movement => {
    const matchesType = filterType === 'all' || movement.type === filterType
    const matchesSearch = searchTerm === '' || 
      movement.actor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT': return Package
      case 'ISSUE': return TrendingUp
      case 'TRANSFER': return MapPin
      case 'ADJUST': return AlertTriangle
      default: return ArrowUpDown
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'RECEIPT': return 'bg-green-100 text-green-600'
      case 'ISSUE': return 'bg-red-100 text-red-600'
      case 'TRANSFER': return 'bg-blue-100 text-blue-600'
      case 'ADJUST': return 'bg-yellow-100 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'RECEIPT': return 'Received'
      case 'ISSUE': return 'Issued'
      case 'TRANSFER': return 'Transferred'
      case 'ADJUST': return 'Adjusted'
      default: return type
    }
  }

  const exportMovements = () => {
    const csvData = filteredMovements.map(movement => ({
      Date: new Date(movement.at).toLocaleDateString(),
      Time: new Date(movement.at).toLocaleTimeString(),
      Type: movement.type,
      Quantity: movement.quantity,
      Unit: material.defaultUnit,
      'Unit Cost': movement.unitCost || '',
      'Total Value': movement.unitCost ? movement.quantity * movement.unitCost : '',
      Actor: movement.actor || '',
      Reason: movement.reason || '',
      'From Location': movement.fromLocationId || '',
      'To Location': movement.toLocationId || '',
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${material.code}-movements-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `Exported ${filteredMovements.length} movements to CSV`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="RECEIPT">Receipts</SelectItem>
              <SelectItem value="ISSUE">Issues</SelectItem>
              <SelectItem value="TRANSFER">Transfers</SelectItem>
              <SelectItem value="ADJUST">Adjustments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportMovements}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Movements table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Movement History ({filteredMovements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => {
                  const IconComponent = getMovementIcon(movement.type)
                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(movement.at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(movement.at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-full ${getMovementColor(movement.type)}`}>
                            <IconComponent className="w-3 h-3" />
                          </div>
                          <span className="text-sm font-medium">
                            {getMovementLabel(movement.type)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${
                          movement.type === 'RECEIPT' || (movement.type === 'ADJUST' && movement.quantity > 0)
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {movement.type === 'RECEIPT' || (movement.type === 'ADJUST' && movement.quantity > 0) 
                            ? '+' : '-'
                          }{Math.abs(movement.quantity).toFixed(1)} {material.defaultUnit}
                        </div>
                      </TableCell>
                      <TableCell>
                        {movement.unitCost ? (
                          <div>
                            <div className="text-sm">{formatCurrency(movement.unitCost)}</div>
                            <div className="text-xs text-muted-foreground">
                              Total: {formatCurrency(movement.quantity * movement.unitCost)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{movement.actor || 'System'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {movement.reason && (
                            <div className="mb-1">{movement.reason}</div>
                          )}
                          {movement.fromLocationId && movement.toLocationId && (
                            <div className="text-xs text-muted-foreground">
                              From: {movement.fromLocationId} → To: {movement.toLocationId}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Movement Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Type</Label>
                                  <p className="text-sm font-medium">{getMovementLabel(movement.type)}</p>
                                </div>
                                <div>
                                  <Label>Date & Time</Label>
                                  <p className="text-sm">{new Date(movement.at).toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label>Quantity</Label>
                                  <p className="text-sm font-medium">
                                    {movement.quantity.toFixed(1)} {material.defaultUnit}
                                  </p>
                                </div>
                                <div>
                                  <Label>Unit Cost</Label>
                                  <p className="text-sm">
                                    {movement.unitCost ? formatCurrency(movement.unitCost) : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <Label>Actor</Label>
                                  <p className="text-sm">{movement.actor || 'System'}</p>
                                </div>
                                <div>
                                  <Label>Lot Code</Label>
                                  <p className="text-sm font-mono">{movement.lotId || 'N/A'}</p>
                                </div>
                              </div>
                              {movement.reason && (
                                <div>
                                  <Label>Reason/Notes</Label>
                                  <p className="text-sm">{movement.reason}</p>
                                </div>
                              )}
                              {(movement.fromLocationId || movement.toLocationId) && (
                                <div>
                                  <Label>Location Movement</Label>
                                  <p className="text-sm">
                                    {movement.fromLocationId && `From: ${movement.fromLocationId}`}
                                    {movement.fromLocationId && movement.toLocationId && ' → '}
                                    {movement.toLocationId && `To: ${movement.toLocationId}`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowUpDown className="w-8 h-8 mx-auto mb-2" />
              <p>No movements found</p>
              {filterType !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilterType('all')}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
