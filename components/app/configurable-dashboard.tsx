"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardWidget } from "@/components/admin/dashboard-widget"
import { AddElementModal } from "@/components/admin/add-element-modal"
import { WidgetConfigModal } from "@/components/admin/widget-config-modal"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { DashboardWidget as DashboardWidgetType } from '@/types/dashboard'
import { useWidgetData } from '@/lib/widget-data-service'
import { useDashboardLayout } from '@/hooks/use-dashboard-layout'
import {
    Settings, Plus, Save, Eye, EyeOff, RefreshCw, AlertCircle,
    Package, Clock, CheckSquare, List, BarChart3, Users, Workflow
} from "lucide-react"

export function ConfigurableDashboard() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configuringWidget, setConfiguringWidget] = useState<DashboardWidgetType | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const {
    widgets,
    isLoading,
    error,
    saveLayout,
    addWidget,
    updateWidget,
    removeWidget,
    reorderWidgets,
    resetToDefault
  } = useDashboardLayout()

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((item) => item.id === active.id)
      const newIndex = widgets.findIndex((item) => item.id === over?.id)

      const newWidgets = arrayMove(widgets, oldIndex, newIndex)
      reorderWidgets(newWidgets)
    }
  }

  const handleAddWidget = (widgetType: string, title: string, config?: any) => {
    const newWidget: DashboardWidgetType = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title,
      position: widgets.length,
      size: "md",
      config: config || {},
      dataSource: undefined
    }
    addWidget(newWidget)
    setShowAddModal(false)
    
    // Open config modal for the new widget
    setConfiguringWidget(newWidget)
    setShowConfigModal(true)
  }

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(widgetId)
  }

  const configureWidget = (widget: DashboardWidgetType) => {
    setConfiguringWidget(widget)
    setShowConfigModal(true)
  }

  const saveWidgetConfig = (updatedWidget: DashboardWidgetType) => {
    updateWidget(updatedWidget.id, updatedWidget)
    setShowConfigModal(false)
    setConfiguringWidget(null)
  }

  const saveDashboardLayout = async () => {
    const success = await saveLayout(widgets)
    if (success) {
      setIsEditMode(false)
    }
  }

  const renderWidget = (widget: DashboardWidgetType) => {
    // Get widget data based on data source
    const widgetData = widget.dataSource ? useWidgetData(widget.dataSource) : null

    switch (widget.type) {
      case "metrics":
        return (
          <div className={`grid gap-6 ${
            widget.size === 'sm' ? 'grid-cols-1 md:grid-cols-2' :
            widget.size === 'md' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            widget.size === 'lg' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            <Card className="rounded-xl border border-black/10 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-6 w-6" />
                    <div className="text-lg font-semibold">Active Items</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {widgetData?.value || 0}
                  </div>
                </div>
                {widget.config.showTrend && widgetData?.trend && (
                  <div className={`mt-2 text-sm ${widgetData.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {widgetData.trend > 0 ? '+' : ''}{widgetData.trend.toFixed(1)}% from last period
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-black/10 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6" />
                    <div className="text-lg font-semibold">On Time</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {widgetData?.value || 95}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-black/10 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-6 w-6" />
                    <div className="text-lg font-semibold">Open Tasks</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {widgetData?.value || 12}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "activity":
        return (
          <Card className="rounded-xl border border-black/10 bg-white shadow-sm">
            <CardHeader className="p-5">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5" />
                <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-md border border-dashed border-black/20 bg-gray-50" />
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600 italic">Activity feed will appear here</div>
            </CardContent>
          </Card>
        )

      case "chart":
        return (
          <Card className="rounded-xl border border-black/10 bg-white shadow-sm">
            <CardHeader className="p-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle className="text-xl font-semibold">Today's Snapshot</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-black/30 bg-gray-50 text-sm text-gray-500 italic">
                Charts will appear here once configured
              </div>
            </CardContent>
          </Card>
        )

      case "team":
        return (
          <Card className="rounded-xl border border-black/10 bg-white shadow-sm">
            <CardHeader className="p-5">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle className="text-xl font-semibold">Team Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Members</span>
                  <span className="font-semibold">{widgetData?.value || 8}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Online Now</span>
                  <span className="font-semibold text-green-600">{widgetData?.value || 5}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "workflows":
        return (
          <Card className="rounded-xl border border-black/10 bg-white shadow-sm">
            <CardHeader className="p-5">
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                <CardTitle className="text-xl font-semibold">Active Workflows</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Workflows</span>
                  <span className="font-semibold">{widgetData?.value || 3}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Items in Progress</span>
                  <span className="font-semibold text-blue-600">{widgetData?.value || 24}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card className="rounded-xl border border-black/10 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Widget type "{widget.type}" not implemented yet</p>
                <p className="text-sm">Data: {widgetData ? JSON.stringify(widgetData.value) : 'No data source'}</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={resetToDefault} variant="outline">
            Reset to Default
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-black/10">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Dashboard Edit Mode</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={saveDashboardLayout}
              disabled={isLoading}
              className="h-9 rounded-full border border-black bg-black px-4 text-white hover:bg-white hover:text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save Layout"}
            </Button>
            <Button 
              onClick={() => setShowAddModal(true)} 
              className="h-9 rounded-full border border-black bg-white px-4 text-black hover:bg-black hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditMode(false)}
              className="h-9 rounded-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Mode
            </Button>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {widgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No widgets configured</h3>
            <p className="text-gray-600 mb-4">Add widgets to start building your dashboard</p>
            <Button 
              onClick={() => setIsEditMode(true)}
              className="rounded-full border border-black bg-black px-6 text-white hover:bg-white hover:text-black"
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-8">
              {widgets.map((widget) => (
                <DashboardWidget
                  key={widget.id}
                  widget={widget}
                  isEditMode={isEditMode}
                  onRemove={() => handleRemoveWidget(widget.id)}
                  onConfigure={() => configureWidget(widget)}
                >
                  {renderWidget(widget)}
                </DashboardWidget>
              ))}
            </div>
          </SortableContext>
          
          <DragOverlay>
            {activeId ? (
              <div className="opacity-80 scale-105 shadow-2xl rounded-lg">
                {renderWidget(widgets.find(w => w.id === activeId) || widgets[0])}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add Element Modal */}
      {showAddModal && (
        <AddElementModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWidget}
        />
      )}

      {/* Widget Configuration Modal */}
      {showConfigModal && configuringWidget && (
        <WidgetConfigModal
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false)
            setConfiguringWidget(null)
          }}
          onSave={saveWidgetConfig}
          widget={configuringWidget}
        />
      )}
    </div>
  )
}
