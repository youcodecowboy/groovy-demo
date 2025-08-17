"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WIDGET_TEMPLATES, getWidgetIcon } from '@/lib/dashboard-templates'
import { Zap } from "lucide-react"

interface AddElementModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (widgetType: string, title: string, config?: any) => void
}

const widgetCategories = [
  { id: "metrics", name: "Metrics", description: "Key performance indicators and statistics" },
  { id: "visualization", name: "Visualization", description: "Charts, calendars, and data displays" },
  { id: "activity", name: "Activity", description: "Real-time feeds and notifications" },
  { id: "management", name: "Management", description: "Team and operational overviews" }
]

export function AddElementModal({ isOpen, onClose, onAdd }: AddElementModalProps) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [customTitle, setCustomTitle] = useState("")
  const [activeCategory, setActiveCategory] = useState("metrics")

  const handleAdd = () => {
    if (!selectedType) return
    
    const widgetTemplate = WIDGET_TEMPLATES.find(w => w.type === selectedType)
    if (!widgetTemplate) return

    const title = customTitle || widgetTemplate.name
    onAdd(selectedType, title, widgetTemplate.defaultConfig)
    
    // Reset form
    setSelectedType("")
    setCustomTitle("")
  }

  const getWidgetsByCategory = (category: string) => {
    return WIDGET_TEMPLATES.filter(widget => widget.category === category)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Dashboard Widget</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Widget Category Selection */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Choose Widget Category</Label>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {widgetCategories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {widgetCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">{category.description}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getWidgetsByCategory(category.id).map((widget) => {
                      const Icon = getWidgetIcon(widget.icon)
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
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-${widget.config?.colorScheme || 'blue'}-100`}>
                                <Icon className={`w-5 h-5 text-${widget.config?.colorScheme || 'blue'}-600`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{widget.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {widget.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{widget.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>Refresh: {widget.config?.refreshInterval || 30}s</span>
                                  <span>Mode: {widget.config?.displayMode || 'card'}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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
              Add Widget
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 