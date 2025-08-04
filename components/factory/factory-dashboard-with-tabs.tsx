"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FactoryDashboard } from "./factory-dashboard"
import { LocationScanner } from "@/components/ui/location-scanner"
import { Package, MapPin } from "lucide-react"
import type { Item, Workflow } from "@/types/schema"

interface FactoryDashboardWithTabsProps {
  items: Item[]
  workflows: Workflow[]
  onItemClick: (itemId: string) => void
  onAdvanceItem: (itemId: string, toStageId: string, completedActions: any[]) => void
}

export function FactoryDashboardWithTabs({ 
  items, 
  workflows, 
  onItemClick, 
  onAdvanceItem 
}: FactoryDashboardWithTabsProps) {
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleScanComplete = (itemId: string, locationId: string) => {
    // Optionally refresh data or show success message
    console.log(`Item ${itemId} moved to location ${locationId}`)
  }

  return (
    <div className="space-y-6 pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Production Dashboard
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Scanner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <FactoryDashboard
            items={items}
            workflows={workflows}
            onItemClick={onItemClick}
            onAdvanceItem={onAdvanceItem}
          />
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <LocationScanner onScanComplete={handleScanComplete} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 