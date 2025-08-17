"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { DiscoHeader } from "@/components/disco/disco-header"
import { DiscoFooter } from "@/components/disco/disco-footer"
import { DiscoQueue } from "@/components/disco/disco-queue"
import { DiscoMetrics } from "@/components/disco/disco-metrics"
import { TeamSelector } from "@/components/disco/team-selector"

export default function DiscoFloorPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedTeam, setSelectedTeam] = useState<string>("production")
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  
  // For demo purposes, using a default factory ID
  // In production, this would come from user context or URL params
  const factoryId = "demo-factory-1" as any

  // Mutations
  const advanceItem = useMutation(api.items.advanceItemWithValidation)

  const handleScan = async (data: string) => {
    try {
      // Parse the scanned data - expect format like "item:ITEM-001"
      const itemId = data.replace("item:", "")
      
      // Find the item by itemId
      const allItems = await fetch("/api/items?teamId=" + selectedTeam).then(r => r.json())
      const item = allItems.find((i: any) => i.itemId === itemId)
      
      if (!item) {
        toast({
          title: "Item Not Found",
          description: `Item ${itemId} not found in ${selectedTeam} team queue`,
          variant: "destructive",
        })
        return
      }

      // Check if item has required actions
      const requiredActions = item.requiredActions?.filter((a: any) => a.required) || []
      
      if (requiredActions.length > 0) {
        // For now, auto-complete with basic scan action
        // In a real implementation, you'd show a modal to collect required data
        const completedActions = requiredActions.map((action: any) => ({
          id: action.id,
          type: action.type,
          label: action.label,
          data: action.type === "scan" ? { scannedValue: itemId } : 
                action.type === "approval" ? { approved: true } :
                action.type === "measurement" ? { value: 10 } : // Default value
                undefined
        }))

        const result = await advanceItem({
          itemId: item._id,
          userId: "disco-floor",
          completedActions,
          notes: "Advanced via QR scan"
        })

        if (result.status === "completed") {
          toast({
            title: "✅ Item Completed",
            description: "Item has been completed successfully",
          })
        } else {
          toast({
            title: "✅ Item Advanced",
            description: `Advanced to ${result.nextStage?.name}`,
          })
        }
      } else {
        // No required actions, just advance with basic scan
        const completedActions = [{
          id: "basic-scan",
          type: "scan" as const,
          label: "QR Code Scan",
          data: { scannedValue: itemId }
        }]

        const result = await advanceItem({
          itemId: item._id,
          userId: "disco-floor",
          completedActions,
          notes: "Advanced via QR scan"
        })

        if (result.status === "completed") {
          toast({
            title: "✅ Item Completed",
            description: "Item has been completed successfully",
          })
        } else {
          toast({
            title: "✅ Item Advanced",
            description: `Advanced to ${result.nextStage?.name}`,
          })
        }
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process scan",
        variant: "destructive",
      })
    }
  }

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId)
    toast({
      title: "Team Changed",
      description: `Switched to ${teamId} team`,
    })
  }

  const handleItemAction = (action: string, itemId: string) => {
    toast({
      title: "Action Completed",
      description: `${action} for item ${itemId}`,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <DiscoHeader currentTeam={selectedTeam} />
      
      {/* Main Content Area */}
      <div className="flex-1 pb-20">
        {/* Team Selector */}
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <TeamSelector 
              selectedTeam={selectedTeam}
              onTeamChange={handleTeamChange}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-6 space-y-8">
          {/* Metrics Cards */}
          <DiscoMetrics teamId={selectedTeam} factoryId={factoryId} />
          
          {/* Item Queue */}
          <DiscoQueue 
            teamId={selectedTeam}
            factoryId={factoryId}
            onItemAction={handleItemAction}
          />
        </div>
      </div>
      
      {/* Sticky Footer with QR Scanner */}
      <DiscoFooter 
        onScan={handleScan}
        isScannerOpen={isScannerOpen}
        onScannerToggle={() => setIsScannerOpen(!isScannerOpen)}
        currentTeam={selectedTeam}
      />
    </div>
  )
}
