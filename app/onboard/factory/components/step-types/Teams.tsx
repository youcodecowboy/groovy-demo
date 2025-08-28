"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OnboardingStepConfig } from "../../types"

interface TeamsProps {
  step: OnboardingStepConfig
  value?: string[]
  onChange: (value: string[]) => void
}

const commonTeams = [
  "Production",
  "Quality Control",
  "Design",
  "Cutting",
  "Sewing",
  "Finishing",
  "Packing",
  "Shipping",
  "Management",
  "Maintenance",
]

export function Teams({ step, value = [], onChange }: TeamsProps) {
  const [newTeam, setNewTeam] = useState("")
  const [teams, setTeams] = useState<string[]>(value)

  const handleAddTeam = () => {
    if (newTeam.trim() && !teams.includes(newTeam.trim())) {
      const updatedTeams = [...teams, newTeam.trim()]
      setTeams(updatedTeams)
      onChange(updatedTeams)
      setNewTeam("")
    }
  }

  const handleRemoveTeam = (teamName: string) => {
    const updatedTeams = teams.filter(t => t !== teamName)
    setTeams(updatedTeams)
    onChange(updatedTeams)
  }

  const handleToggleCommonTeam = (teamName: string) => {
    if (teams.includes(teamName)) {
      handleRemoveTeam(teamName)
    } else {
      const updatedTeams = [...teams, teamName]
      setTeams(updatedTeams)
      onChange(updatedTeams)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Common Teams */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Common Factory Teams</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {commonTeams.map((team) => (
            <button
              key={team}
              onClick={() => handleToggleCommonTeam(team)}
              className={`
                p-4 rounded-xl border transition-all duration-200 text-center
                ${teams.includes(team)
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white hover:border-black hover:shadow-md'
                }
              `}
            >
              <div className={`font-semibold text-sm ${
                teams.includes(team) ? 'text-white' : 'text-gray-900'
              }`}>
                {team}
              </div>
              {teams.includes(team) && (
                <div className="mt-1 text-lg">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Team */}
      <div className="border-t border-black/10 pt-6">
        <h3 className="text-lg font-semibold mb-4">Add Custom Team</h3>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Enter team name..."
            value={newTeam}
            onChange={(e) => setNewTeam(e.target.value)}
            className="flex-1 h-12 border-black/10 focus:border-black rounded-xl px-4"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
          />
          <Button
            onClick={handleAddTeam}
            disabled={!newTeam.trim() || teams.includes(newTeam.trim())}
            className="h-12 rounded-xl border border-black bg-black px-6 text-white hover:bg-white hover:text-black"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Selected Teams */}
      {teams.length > 0 && (
        <div className="border-t border-black/10 pt-6">
          <h3 className="text-lg font-semibold mb-4">Your Teams ({teams.length})</h3>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <div
                key={team}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
              >
                <span className="text-sm font-medium">{team}</span>
                <button
                  onClick={() => handleRemoveTeam(team)}
                  className="text-gray-500 hover:text-red-500 text-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-3 text-green-800">
          <span className="text-lg">👥</span>
          <div>
            <p className="font-medium">Team Management</p>
            <p className="text-sm italic">
              We'll set up permissions and workflows for each team you add.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
