'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload,
  Grid3X3,
  List,
  Package,
  AlertTriangle,
  QrCode,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import CategoryBadge from './category-badge'
import { type MaterialFilters, type MaterialListView, type MaterialCategory } from '@/types/materials'

interface MaterialsHeaderProps {
  filters: MaterialFilters
  onFiltersChange: (filters: MaterialFilters) => void
  view: MaterialListView
  onViewChange: (view: MaterialListView) => void
  onNewMaterial: () => void
  onReceive: () => void
  onImport: () => void
  onExportCsv: () => void
  onPrintLabels: () => void
  onViewAlerts?: () => void
  materialCount: number
  lowStockCount: number
}

const CATEGORIES: MaterialCategory[] = ['fabric', 'trim', 'accessory', 'packaging', 'other']

export default function MaterialsHeader({
  filters,
  onFiltersChange,
  view,
  onViewChange,
  onNewMaterial,
  onReceive,
  onImport,
  onExportCsv,
  onPrintLabels,
  onViewAlerts,
  materialCount,
  lowStockCount
}: MaterialsHeaderProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleCategoryToggle = (category: MaterialCategory) => {
    const currentCategories = filters.category || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]
    
    onFiltersChange({ 
      ...filters, 
      category: newCategories.length > 0 ? newCategories : undefined 
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
    setSearchValue('')
  }

  const activeFilterCount = [
    filters.search,
    filters.category?.length,
    filters.lowStock,
    filters.archived
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Header with title and main actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materials</h1>
          <p className="text-muted-foreground">
            Inventory tracking for fabrics, trims, and accessories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={onReceive}>
            <Package className="w-4 h-4 mr-2" />
            Receive
          </Button>
          <Button onClick={onNewMaterial}>
            <Plus className="w-4 h-4 mr-2" />
            New Material
          </Button>
        </div>
      </div>

      {/* Stats and alerts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="w-4 h-4" />
          <span>{materialCount} materials</span>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge 
              variant="destructive" 
              className="gap-1 cursor-pointer hover:bg-destructive/90"
              onClick={onViewAlerts}
            >
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} low stock
            </Badge>
          </div>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search materials..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2">
          {CATEGORIES.map((category) => (
            <Toggle
              key={category}
              pressed={filters.category?.includes(category) || false}
              onPressedChange={() => handleCategoryToggle(category)}
              size="sm"
            >
              <CategoryBadge category={category} variant="outline" />
            </Toggle>
          ))}
        </div>

        {/* Additional filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.lowStock || false}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, lowStock: checked || undefined })
              }
            >
              Low Stock Only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.archived || false}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, archived: checked || undefined })
              }
            >
              Show Archived
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearFilters}>
              Clear All Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        {/* View toggle */}
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={view.type === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange({ ...view, type: 'table' })}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={view.type === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange({ ...view, type: 'cards' })}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>

        {/* More actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPrintLabels}>
              <QrCode className="w-4 h-4 mr-2" />
              Print Labels
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filters display */}
      {(filters.search || filters.category?.length || filters.lowStock || filters.archived) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:bg-muted rounded-sm"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.category?.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              <CategoryBadge category={category} showIcon={false} variant="outline" />
              <button
                onClick={() => handleCategoryToggle(category)}
                className="ml-1 hover:bg-muted rounded-sm"
              >
                ×
              </button>
            </Badge>
          ))}
          
          {filters.lowStock && (
            <Badge variant="secondary" className="gap-1">
              Low Stock
              <button
                onClick={() => onFiltersChange({ ...filters, lowStock: undefined })}
                className="ml-1 hover:bg-muted rounded-sm"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.archived && (
            <Badge variant="secondary" className="gap-1">
              Archived
              <button
                onClick={() => onFiltersChange({ ...filters, archived: undefined })}
                className="ml-1 hover:bg-muted rounded-sm"
              >
                ×
              </button>
            </Badge>
          )}
          
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
