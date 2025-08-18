"use client"

import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Package } from "lucide-react"

interface VariantItemsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: any
  items: any[]
}

export default function VariantItemsDrawer({ open, onOpenChange, variant, items }: VariantItemsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {variant?.sku || "Variant"} Items
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Items List</h3>
            <p className="text-gray-600 mb-6">
              View individual items for this variant.
            </p>
            <p className="text-gray-500 text-sm">
              This feature is coming soon.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
