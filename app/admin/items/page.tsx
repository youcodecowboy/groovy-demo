"use client"

import { useToast } from "@/hooks/use-toast"
import { useWorkflows, useItemMutations } from "@/hooks/use-convex"
import { ModernItemGenerator } from "@/components/items/modern-item-generator"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Loader2 } from "lucide-react"
import { generateUniqueItemId } from "@/lib/item-utils"

export default function CreateItemsPage() {
  const { workflows, isLoading } = useWorkflows()
  const { createItem } = useItemMutations()
  const { toast } = useToast()

  const handleGenerateItems = async (itemsToGenerate: any[]): Promise<any[]> => {
    try {
      const generatedItems = []

      for (const itemConfig of itemsToGenerate) {
        // Create unique item ID
        const uniqueItemId = generateUniqueItemId(itemConfig.sku)
        
        // Create item in Convex
        const itemId = await createItem({
          itemId: uniqueItemId,
          workflowId: itemConfig.workflowId,
          metadata: {
            sku: itemConfig.sku,
            brand: itemConfig.brand,
            fabricCode: itemConfig.fabricCode,
            color: itemConfig.color,
            size: itemConfig.size,
            style: itemConfig.style,
            season: itemConfig.season,
            notes: itemConfig.notes,
            quantity: itemConfig.quantity,
          },
        })

        // Create the enhanced item object for the UI
        const enhancedItem = {
          _id: itemId,
          id: uniqueItemId,
          sku: itemConfig.sku,
          qrData: uniqueItemId,
          currentStageId: "stage-1", // First stage
          workflowId: itemConfig.workflowId,
          status: "active",
          metadata: {
            brand: itemConfig.brand,
            fabricCode: itemConfig.fabricCode,
            color: itemConfig.color,
            size: itemConfig.size,
            style: itemConfig.style,
            season: itemConfig.season,
            notes: itemConfig.notes,
          },
        }

        generatedItems.push(enhancedItem)
      }

      toast({
        title: "Success",
        description: `Generated ${generatedItems.length} items successfully. Redirecting to results...`,
      })

      return generatedItems
    } catch (error) {
      console.error("Error generating items:", error)
      toast({
        title: "Error",
        description: "Failed to generate items",
        variant: "destructive",
      })
      throw error
    }
  }

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex-1 h-full flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading workflows...</span>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="flex-1 h-full overflow-hidden">
        <ModernItemGenerator workflows={workflows || []} onGenerate={handleGenerateItems} />
      </div>
    </AdminSidebar>
  )
}
