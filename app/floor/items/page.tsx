"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { dataAdapter } from "@/lib/dataAdapter"
import type { Item, Workflow } from "@/types/schema"
import { FactoryHeader } from "@/components/factory/factory-header"
import { FactoryFooter } from "@/components/factory/factory-footer"
import { FactoryItemsList } from "@/components/factory/factory-items-list"

export default function FactoryItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [itemsData, workflowsData] = await Promise.all([dataAdapter.getItems(), dataAdapter.getWorkflows()])
      setItems(itemsData)
      setWorkflows(workflowsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async (data: string) => {
    try {
      // Always navigate to item details page when QR is scanned
      router.push(`/floor/items/${data}`)

      toast({
        title: "✅ Item Scanned",
        description: `Opening details for: ${data}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process scan",
        variant: "destructive",
      })
    }
  }

  const handleItemClick = (itemId: string) => {
    router.push(`/floor/items/${itemId}`)
  }

  const handleAdvanceItem = async (itemId: string, toStageId: string, completedActions: any[]) => {
    try {
      await dataAdapter.advanceItemWithActions(itemId, toStageId, completedActions)
      await loadData() // Refresh data
      toast({
        title: "Success",
        description: "Item advanced successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to advance item",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FactoryHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-lg">Loading items...</div>
          </div>
        </div>
        <FactoryFooter onScan={handleScan} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FactoryHeader />
      <div className="container mx-auto px-4 py-6">
        <FactoryItemsList
          items={items}
          workflows={workflows}
          onItemClick={handleItemClick}
          onAdvanceItem={handleAdvanceItem}
        />
      </div>
      <FactoryFooter onScan={handleScan} unreadMessages={3} />
    </div>
  )
}
