"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"

interface TeamSelectorProps {
  selectedTeam: string
  onTeamChange: (teamId: string) => void
}

const teams = [
  { id: "production", name: "Production", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "cutting", name: "Cutting", color: "bg-red-100 text-red-800 border-red-200" },
  { id: "sewing", name: "Sewing", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "quality", name: "Quality Control", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "packaging", name: "Packaging", color: "bg-green-100 text-green-800 border-green-200" },
]

export function TeamSelector({ selectedTeam, onTeamChange }: TeamSelectorProps) {
  const currentTeam = teams.find(team => team.id === selectedTeam)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Team:</span>
      
      {/* Team Tabs */}
      <div className="flex gap-2">
        {teams.map((team) => (
          <Button
            key={team.id}
            variant={selectedTeam === team.id ? "default" : "outline"}
            size="sm"
            onClick={() => onTeamChange(team.id)}
            className={`
              transition-all duration-200
              ${selectedTeam === team.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            {team.name}
            {selectedTeam === team.id && (
              <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
                Active
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
        <span>Items in queue: <strong>12</strong></span>
        <span>Completed today: <strong>47</strong></span>
      </div>
    </div>
  )
}
