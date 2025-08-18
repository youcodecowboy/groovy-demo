'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  Package, 
  Edit, 
  MoreHorizontal,
  Download,
  QrCode,
  Archive,
  Share,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import CategoryBadge from './category-badge'
import UnitChip from './unit-chip'
import { type Material, type InventorySnapshot, formatCurrency, isLowStock } from '@/types/materials'

interface MaterialHeaderProps {
  material: Material
  inventorySnapshot: InventorySnapshot
  onBack: () => void
  onEdit: () => void
  onReceive: () => void
  onIssue: () => void
  onTransfer: () => void
  onPrintLabel: () => void
  onArchive: () => void
}

export default function MaterialHeader({
  material,
  inventorySnapshot,
  onBack,
  onEdit,
  onReceive,
  onIssue,
  onTransfer,
  onPrintLabel,
  onArchive
}: MaterialHeaderProps) {
  const lowStock = isLowStock(material, inventorySnapshot.onHand)

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: material.name,
        text: `${material.name} (${material.code})`,
        url: window.location.href,
      })
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Material info */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="p-2 bg-muted rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{material.name}</h1>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {material.code}
                </code>
                <CategoryBadge category={material.category} />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>{inventorySnapshot.onHand.toFixed(1)}</span>
                  <UnitChip unit={material.defaultUnit} />
                  <span>on hand</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <span>{inventorySnapshot.available.toFixed(1)}</span>
                  <span>available</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="font-medium">
                  {formatCurrency(inventorySnapshot.value, inventorySnapshot.currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Actions and status */}
          <div className="flex items-center gap-2">
            {/* Status indicators */}
            {lowStock && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Low Stock
              </Badge>
            )}
            {material.archived && (
              <Badge variant="secondary">Archived</Badge>
            )}

            {/* Primary actions */}
            <Button onClick={onReceive}>
              <Package className="w-4 h-4 mr-2" />
              Receive
            </Button>
            
            <Button variant="outline" onClick={onIssue}>
              Issue
            </Button>
            
            <Button variant="outline" onClick={onTransfer}>
              Transfer
            </Button>
            
            <Button variant="outline" onClick={onPrintLabel}>
              <QrCode className="w-4 h-4 mr-2" />
              Label
            </Button>
            
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="w-4 h-4 mr-2" />
                  Share Link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  {material.archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
