"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    BarChart3,
    Calendar,
    Target,
    Activity,
    TrendingUp,
    Users,
    Package,
    Clock,
    Zap
} from "lucide-react"

interface AddElementModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (widgetType: string, title: string, config?: any) => void
}

const widgetTypes = [
  {
    type: "metrics",
    title: "Key Metrics",
    description: "Display important production metrics",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600"
  },
  {
    type: "capacity",
    title: "Capacity Tracker",
    description: "Track production capacity and utilization",
    icon: Target,
    color: "bg-green-100 text-green-600"
  },
  {
    type: "calendar",
    title: "Production Calendar",
    description: "View production schedule on calendar",
    icon: Calendar,
    color: "bg-purple-100 text-purple-600"
  },
  {
    type: "efficiency",
    title: "Efficiency Analytics",
    description: "Detailed efficiency and performance metrics",
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-600"
  },
  {
    type: "live-feed",
    title: "Live Production Feed",
    description: "Real-time production activity feed",
    icon: Activity,
    color: "bg-red-100 text-red-600"
  },
  {
    type: "team",
    title: "Team Overview",
    description: "Team performance and workload",
    icon: Users,
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    type: "inventory",
    title: "Inventory Status",
    description: "Current inventory levels and alerts",
    icon: Package,
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    type: "timeline",
    title: "Production Timeline",
    description: "Timeline view of production progress",
    icon: Clock,
    color: "bg-pink-100 text-pink-600"
  }
]

export function AddElementModal({ isOpen, onClose, onAdd }: AddElementModalProps) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [customTitle, setCustomTitle] = useState("")

  const handleAdd = () => {
    if (!selectedType) return
    
    const widgetType = widgetTypes.find(w => w.type === selectedType)
    if (!widgetType) return

    const title = customTitle || widgetType.title
    onAdd(selectedType, title)
    
    // Reset form
    setSelectedType("")
    setCustomTitle("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Dashboard Element</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Widget Type Selection */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Choose Element Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgetTypes.map((widget) => {
                const Icon = widget.icon
                return (
                  <Card
                    key={widget.type}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedType === widget.type 
                        ? "ring-2 ring-blue-500 bg-blue-50" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedType(widget.type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${widget.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                          <p className="text-sm text-gray-600">{widget.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Custom Title */}
          {selectedType && (
            <div>
              <Label htmlFor="custom-title" className="text-base font-semibold mb-2 block">
                Custom Title (Optional)
              </Label>
              <Input
                id="custom-title"
                placeholder="Enter custom title or leave blank for default"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd}
              disabled={!selectedType}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Add Element
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 