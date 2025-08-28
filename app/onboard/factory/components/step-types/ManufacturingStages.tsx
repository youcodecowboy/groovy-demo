"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OnboardingStepConfig } from "../../types"

interface ManufacturingStagesProps {
  step: OnboardingStepConfig
  value?: string[]
  onChange: (value: string[]) => void
}

const defaultStages = [
  { id: "planning", name: "Planning", icon: "📋" },
  { id: "cutting", name: "Cutting", icon: "✂️" },
  { id: "sewing", name: "Sewing", icon: "🧵" },
  { id: "washing", name: "Washing", icon: "🧺" },
  { id: "qc", name: "Quality Control", icon: "🔍" },
  { id: "finishing", name: "Finishing", icon: "✨" },
  { id: "packing", name: "Packing", icon: "📦" },
  { id: "shipping", name: "Shipping", icon: "🚚" },
]

export function ManufacturingStages({ step, value = [], onChange }: ManufacturingStagesProps) {
  const [newStage, setNewStage] = useState("")
  const [stages, setStages] = useState(defaultStages)

  const handleAddStage = () => {
    if (newStage.trim()) {
      const stageId = newStage.toLowerCase().replace(/\s+/g, "-")
      const newStageObj = {
        id: stageId,
        name: newStage.trim(),
        icon: "⚙️"
      }
      const updatedStages = [...stages, newStageObj]
      setStages(updatedStages)
      onChange(updatedStages.map(s => s.id))
      setNewStage("")
    }
  }

  const handleRemoveStage = (stageId: string) => {
    const updatedStages = stages.filter(s => s.id !== stageId)
    setStages(updatedStages)
    onChange(updatedStages.map(s => s.id))
  }

  const handleToggleStage = (stageId: string) => {
    const isSelected = value.includes(stageId)
    const newValue = isSelected
      ? value.filter(v => v !== stageId)
      : [...value, stageId]
    onChange(newValue)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Default Stages */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Manufacturing Stages</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleToggleStage(stage.id)}
              className={`
                p-4 rounded-xl border transition-all duration-200 text-center
                ${value.includes(stage.id)
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white hover:border-black hover:shadow-md'
                }
              `}
            >
              <div className="text-2xl mb-2">{stage.icon}</div>
              <div className={`font-semibold text-sm ${
                value.includes(stage.id) ? 'text-white' : 'text-gray-900'
              }`}>
                {stage.name}
              </div>
              {value.includes(stage.id) && (
                <div className="mt-1 text-lg">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Stage */}
      <div className="border-t border-black/10 pt-6">
        <h3 className="text-lg font-semibold mb-4">Add Custom Stage</h3>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Enter stage name..."
            value={newStage}
            onChange={(e) => setNewStage(e.target.value)}
            className="flex-1 h-12 border-black/10 focus:border-black rounded-xl px-4"
            onKeyPress={(e) => e.key === 'Enter' && handleAddStage()}
          />
          <Button
            onClick={handleAddStage}
            disabled={!newStage.trim()}
            className="h-12 rounded-xl border border-black bg-black px-6 text-white hover:bg-white hover:text-black"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-3 text-blue-800">
          <span className="text-lg">⚙️</span>
          <div>
            <p className="font-medium">Workflow Builder</p>
            <p className="text-sm italic">
              These stages will become your production workflow. You can customize them anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
