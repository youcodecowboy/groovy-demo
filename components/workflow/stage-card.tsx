"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Stage, StageAction } from "@/types/schema"
import { GripVertical, Plus, Trash2, Camera, ScanLine, FileText, CheckCircle, Ruler, Eye, Settings } from "lucide-react"

interface StageCardProps {
  stage: Omit<Stage, "id">
  onUpdate: (updates: Partial<Omit<Stage, "id">>) => void
  onDelete: () => void
  isDragging?: boolean
}

const actionIcons = {
  scan: ScanLine,
  photo: Camera,
  note: FileText,
  approval: CheckCircle,
  measurement: Ruler,
  inspection: Eye,
}

const actionTypes = [
  { value: "scan", label: "QR/Barcode Scan" },
  { value: "photo", label: "Photo Capture" },
  { value: "note", label: "Text Note" },
  { value: "approval", label: "Approval Required" },
  { value: "measurement", label: "Measurement" },
  { value: "inspection", label: "Inspection Checklist" },
]

export function StageCard({ stage, onUpdate, onDelete, isDragging }: StageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addAction = () => {
    const newAction: StageAction = {
      id: `action-${Date.now()}`,
      type: "scan",
      label: "New Action",
      required: false,
    }
    onUpdate({
      actions: [...stage.actions, newAction],
    })
  }

  const updateAction = (actionIndex: number, updates: Partial<StageAction>) => {
    const updatedActions = [...stage.actions]
    updatedActions[actionIndex] = { ...updatedActions[actionIndex], ...updates }
    onUpdate({ actions: updatedActions })
  }

  const removeAction = (actionIndex: number) => {
    onUpdate({
      actions: stage.actions.filter((_, index) => index !== actionIndex),
    })
  }

  return (
    <Card className={`transition-all duration-200 ${isDragging ? "opacity-50 rotate-2" : "hover:shadow-md"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: stage.color }}
          />
          <div className="flex-1">
            <Input
              value={stage.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="font-semibold text-lg border-0 p-0 h-auto focus-visible:ring-0"
              placeholder="Stage name"
            />
          </div>
          <Button onClick={() => setIsExpanded(!isExpanded)} variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button onClick={onDelete} variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="color">Color:</Label>
          <input
            type="color"
            value={stage.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded border cursor-pointer"
          />
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={stage.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Stage description..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Required Actions</Label>
                <Button onClick={addAction} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Action
                </Button>
              </div>

              <div className="space-y-3">
                {stage.actions.map((action, index) => {
                  const IconComponent = actionIcons[action.type]
                  return (
                    <div key={action.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                        <Input
                          value={action.label}
                          onChange={(e) => updateAction(index, { label: e.target.value })}
                          className="flex-1 bg-white"
                          placeholder="Action label"
                        />
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={action.required}
                            onChange={(e) => updateAction(index, { required: e.target.checked })}
                          />
                          Required
                        </label>
                        <Button onClick={() => removeAction(index)} size="sm" variant="ghost" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <Select
                          value={action.type}
                          onValueChange={(value: any) => updateAction(index, { type: value })}
                        >
                          <SelectTrigger className="w-48 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {action.required && <Badge variant="secondary">Required</Badge>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{stage.actions.length} actions configured</span>
          <span>•</span>
          <span>{stage.actions.filter((a) => a.required).length} required</span>
        </div>
      </CardContent>
    </Card>
  )
}
