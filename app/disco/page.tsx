"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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

  const handleScan = async (data: string) => {
    try {
      toast({
        title: "✅ Item Scanned",
        description: `Processing: ${data}`,
      })
      
      // TODO: Implement workflow validation and item advancement
      // For now, just show success message
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process scan",
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
          <DiscoMetrics teamId={selectedTeam} />
          
          {/* Item Queue */}
          <DiscoQueue 
            teamId={selectedTeam}
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
