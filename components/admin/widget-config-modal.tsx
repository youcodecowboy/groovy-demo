"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Database, 
  Filter, 
  BarChart3, 
  Palette,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react"
import { DashboardWidget, WidgetConfig, DataSource, DataFilter, AggregationConfig } from '@/types/dashboard'
import { WIDGET_TEMPLATES, DATA_SOURCE_TEMPLATES, getWidgetTemplate, getDataSourceTemplate } from '@/lib/dashboard-templates'

interface WidgetConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (widget: DashboardWidget) => void
  widget?: DashboardWidget
}

export function WidgetConfigModal({ isOpen, onClose, onSave, widget }: WidgetConfigModalProps) {
  const [config, setConfig] = useState<DashboardWidget>({
    id: widget?.id || `widget-${Date.now()}`,
    type: widget?.type || "metrics",
    title: widget?.title || "New Widget",
    position: widget?.position || 0,
    size: widget?.size || "md",
    config: widget?.config || {},
    dataSource: widget?.dataSource
  })

  const [activeTab, setActiveTab] = useState("general")

  const widgetTemplate = getWidgetTemplate(config.type)
  const dataSourceTemplate = config.dataSource ? getDataSourceTemplate(config.dataSource.type) : null

  useEffect(() => {
    if (widget) {
      setConfig(widget)
    }
  }, [widget])

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const updateConfig = (updates: Partial<DashboardWidget>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const updateWidgetConfig = (updates: Partial<WidgetConfig>) => {
    setConfig(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }))
  }

  const updateDataSource = (updates: Partial<DataSource>) => {
    setConfig(prev => ({
      ...prev,
      dataSource: prev.dataSource ? { ...prev.dataSource, ...updates } : updates as DataSource
    }))
  }

  const addFilter = () => {
    const newFilter: DataFilter = {
      field: "",
      operator: "eq",
      value: ""
    }
    updateDataSource({
      filters: [...(config.dataSource?.filters || []), newFilter]
    })
  }

  const updateFilter = (index: number, updates: Partial<DataFilter>) => {
    const filters = [...(config.dataSource?.filters || [])]
    filters[index] = { ...filters[index], ...updates }
    updateDataSource({ filters })
  }

  const removeFilter = (index: number) => {
    const filters = [...(config.dataSource?.filters || [])]
    filters.splice(index, 1)
    updateDataSource({ filters })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configure Widget
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data Source</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="widget-title">Widget Title</Label>
                <Input
                  id="widget-title"
                  value={config.title}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                  placeholder="Enter widget title"
                />
              </div>
              <div>
                <Label htmlFor="widget-size">Widget Size</Label>
                <Select value={config.size} onValueChange={(value: any) => updateConfig({ size: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="full">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Widget Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {WIDGET_TEMPLATES.map((template) => (
                  <Card
                    key={template.type}
                    className={`cursor-pointer transition-all ${
                      config.type === template.type 
                        ? "ring-2 ring-blue-500 bg-blue-50" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => updateConfig({ 
                      type: template.type,
                      config: template.defaultConfig,
                      dataSource: template.defaultDataSource
                    })}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        <span className="font-medium">{template.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <div>
              <Label>Data Source Type</Label>
              <Select 
                value={config.dataSource?.type || ""} 
                onValueChange={(value) => updateDataSource({ type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCE_TEMPLATES.map((template) => (
                    <SelectItem key={template.type} value={template.type}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dataSourceTemplate && (
              <>
                <div>
                  <Label>Aggregation</Label>
                  <Select 
                    value={config.dataSource?.aggregation?.type || ""} 
                    onValueChange={(value) => updateDataSource({ 
                      aggregation: { 
                        type: value as any,
                        field: config.dataSource?.aggregation?.field || ""
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select aggregation" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSourceTemplate.supportedAggregations.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {config.dataSource?.aggregation?.type && config.dataSource.aggregation.type !== "count" && (
                  <div>
                    <Label>Aggregation Field</Label>
                    <Select 
                      value={config.dataSource.aggregation.field || ""} 
                      onValueChange={(value) => updateDataSource({ 
                        aggregation: { 
                          ...config.dataSource.aggregation,
                          field: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSourceTemplate.availableFields.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <Label>Filters</Label>
                    <Button size="sm" onClick={addFilter}>
                      <Filter className="w-4 h-4 mr-2" />
                      Add Filter
                    </Button>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    {config.dataSource?.filters?.map((filter, index) => (
                      <Card key={index} className="p-3">
                        <div className="grid grid-cols-4 gap-2">
                          <Select 
                            value={filter.field} 
                            onValueChange={(value) => updateFilter(index, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {dataSourceTemplate.availableFields.map((field) => (
                                <SelectItem key={field} value={field}>
                                  {field}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select 
                            value={filter.operator} 
                            onValueChange={(value) => updateFilter(index, { operator: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eq">Equals</SelectItem>
                              <SelectItem value="ne">Not Equals</SelectItem>
                              <SelectItem value="gt">Greater Than</SelectItem>
                              <SelectItem value="lt">Less Than</SelectItem>
                              <SelectItem value="gte">Greater or Equal</SelectItem>
                              <SelectItem value="lte">Less or Equal</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="in">In</SelectItem>
                              <SelectItem value="notIn">Not In</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Input
                            value={filter.value}
                            onChange={(e) => updateFilter(index, { value: e.target.value })}
                            placeholder="Value"
                          />
                          
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removeFilter(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Mode</Label>
                <Select 
                  value={config.config.displayMode || "card"} 
                  onValueChange={(value) => updateWidgetConfig({ displayMode: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Color Scheme</Label>
                <Select 
                  value={config.config.colorScheme || "blue"} 
                  onValueChange={(value) => updateWidgetConfig({ colorScheme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <Label>Show Trend Indicator</Label>
                </div>
                <Switch
                  checked={config.config.showTrend || false}
                  onCheckedChange={(checked) => updateWidgetConfig({ showTrend: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <Label>Show Percentage</Label>
                </div>
                <Switch
                  checked={config.config.showPercentage || false}
                  onCheckedChange={(checked) => updateWidgetConfig({ showPercentage: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div>
              <Label>Refresh Interval (seconds)</Label>
              <Input
                type="number"
                value={config.config.refreshInterval || 30}
                onChange={(e) => updateWidgetConfig({ refreshInterval: parseInt(e.target.value) || 30 })}
                min="5"
                max="3600"
              />
              <p className="text-xs text-gray-600 mt-1">
                How often to refresh the widget data (5-3600 seconds)
              </p>
            </div>

            <div>
              <Label>Custom Configuration (JSON)</Label>
              <textarea
                className="w-full h-32 p-2 border rounded-md font-mono text-sm"
                value={JSON.stringify(config.config, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    updateWidgetConfig(parsed)
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder="Enter custom configuration as JSON"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
