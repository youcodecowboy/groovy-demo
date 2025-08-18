'use client'

import { useState } from 'react'
import { 
  MoreHorizontal, 
  Edit, 
  Archive, 
  QrCode, 
  Package,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import CategoryBadge from './category-badge'
import UnitChip from './unit-chip'
import { type Material, type InventorySnapshot, type MaterialListView, formatCurrency, isLowStock } from '@/types/materials'

interface MaterialsTableProps {
  materials: Material[]
  inventorySnapshots: Record<string, InventorySnapshot>
  view: MaterialListView
  onViewChange: (view: MaterialListView) => void
  onMaterialClick: (material: Material) => void
  onEditMaterial: (material: Material) => void
  onReceiveMaterial: (material: Material) => void
  onPrintLabel: (material: Material) => void
  selectedMaterials: string[]
  onSelectionChange: (materialIds: string[]) => void
}

export default function MaterialsTable({
  materials,
  inventorySnapshots,
  view,
  onViewChange,
  onMaterialClick,
  onEditMaterial,
  onReceiveMaterial,
  onPrintLabel,
  selectedMaterials,
  onSelectionChange
}: MaterialsTableProps) {
  const [sortedMaterials, setSortedMaterials] = useState(materials)

  const handleSort = (field: MaterialListView['sortBy']) => {
    const newOrder = view.sortBy === field && view.sortOrder === 'asc' ? 'desc' : 'asc'
    const newView = { ...view, sortBy: field, sortOrder: newOrder }
    
    const sorted = [...materials].sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'code':
          aValue = a.code.toLowerCase()
          bValue = b.code.toLowerCase()
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        case 'onHand':
          aValue = inventorySnapshots[a.id]?.onHand || 0
          bValue = inventorySnapshots[b.id]?.onHand || 0
          break
        case 'value':
          aValue = inventorySnapshots[a.id]?.value || 0
          bValue = inventorySnapshots[b.id]?.value || 0
          break
        case 'lastMovement':
          aValue = a.updatedAt
          bValue = b.updatedAt
          break
        default:
          return 0
      }
      
      if (aValue < bValue) return newOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return newOrder === 'asc' ? 1 : -1
      return 0
    })
    
    setSortedMaterials(sorted)
    onViewChange(newView)
  }

  const getSortIcon = (field: MaterialListView['sortBy']) => {
    if (view.sortBy !== field) return <ArrowUpDown className="w-4 h-4" />
    return view.sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(materials.map(m => m.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectMaterial = (materialId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedMaterials, materialId])
    } else {
      onSelectionChange(selectedMaterials.filter(id => id !== materialId))
    }
  }

  const isAllSelected = selectedMaterials.length === materials.length && materials.length > 0
  const isSomeSelected = selectedMaterials.length > 0 && selectedMaterials.length < materials.length

  return (
    <TooltipProvider>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected
                  }}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Material
                  {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('code')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Code
                  {getSortIcon('code')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('category')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Category
                  {getSortIcon('category')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('onHand')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  On Hand / Available
                  {getSortIcon('onHand')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('value')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Value
                  {getSortIcon('value')}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('lastMovement')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Last Movement
                  {getSortIcon('lastMovement')}
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(sortedMaterials.length > 0 ? sortedMaterials : materials).map((material) => {
              const snapshot = inventorySnapshots[material.id]
              const lowStock = isLowStock(material, snapshot?.onHand || 0)
              
              return (
                <TableRow 
                  key={material.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onMaterialClick(material)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedMaterials.includes(material.id)}
                      onCheckedChange={(checked) => 
                        handleSelectMaterial(material.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{material.name}</div>
                        {material.supplierSku && (
                          <div className="text-sm text-muted-foreground">
                            SKU: {material.supplierSku}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {material.code}
                    </code>
                  </TableCell>
                  
                  <TableCell>
                    <CategoryBadge category={material.category} />
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {snapshot?.onHand?.toFixed(1) || '0'}
                        </span>
                        <UnitChip unit={material.defaultUnit} />
                        <span className="text-muted-foreground">on hand</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{snapshot?.available?.toFixed(1) || '0'} available</span>
                        {snapshot?.allocated && snapshot.allocated > 0 && (
                          <span>({snapshot.allocated.toFixed(1)} allocated)</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(snapshot?.value || 0, snapshot?.currency)}
                      </div>
                      {snapshot?.onHand && snapshot.onHand > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency((snapshot.value || 0) / snapshot.onHand, snapshot?.currency)}/unit
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lowStock && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Below reorder point of {material.reorderPoint}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {material.archived && (
                        <Badge variant="secondary">Archived</Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(material.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onMaterialClick(material)}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditMaterial(material)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReceiveMaterial(material)}>
                          <Package className="w-4 h-4 mr-2" />
                          Receive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onPrintLabel(material)}>
                          <QrCode className="w-4 h-4 mr-2" />
                          Print Label
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          {material.archived ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        
        {materials.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No materials found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first material to the inventory.
            </p>
            <Button onClick={() => onMaterialClick({} as Material)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}