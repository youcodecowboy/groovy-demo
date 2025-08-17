"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LiveProductionFeed } from "./live-production-feed"
import { CapacityTracker } from "./capacity-tracker"
import { CalendarView } from "./calendar-view"
import { DashboardWidget } from "./dashboard-widget"
import { AddElementModal } from "./add-element-modal"
import { WidgetConfigModal } from "./widget-config-modal"
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
import type { Item, Workflow } from "@/types/schema"
import { DashboardWidget as DashboardWidgetType } from "@/types/dashboard"
import { useWidgetData } from "@/lib/widget-data-service"
import { useDashboardLayout } from "@/hooks/use-dashboard-layout"
import {
    Settings, RotateCcw, CheckCircle,
    AlertCircle,
    Plus, Target, BarChart3, Zap,
    Save, Eye, EyeOff, RefreshCw
} from "lucide-react"

interface ModularDashboardProps {
  items: Item[]
  workflows: Workflow[]
  onItemClick?: (itemId: string) => void
  onResetData?: () => void
}

export function ModularDashboard({ items, workflows, onItemClick, onResetData }: ModularDashboardProps) {
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
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Items</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {widgetData?.value || items.filter(item => item.status === "active").length}
                    </p>
                    {widget.config.showTrend && widgetData?.trend && (
                      <p className={`text-xs mt-1 ${widgetData.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {widgetData.trend > 0 ? '+' : ''}{widgetData.trend.toFixed(1)}% from last period
                      </p>
                    )}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Items</p>
                    <p className="text-3xl font-bold text-green-600">
                      {items.filter(item => item.status === "completed").length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {widgetData?.value || Math.round(Math.random() * 20 + 80)}%
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Need Attention</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {items.filter(item => item.status === "paused").length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "capacity":
        return <CapacityTracker items={activeItems} workflows={workflows} />

      case "calendar":
        return <CalendarView items={items} workflows={workflows} onItemClick={onItemClick} />

      case "live-feed":
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Live Production Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <LiveProductionFeed items={items} workflows={workflows} onItemClick={onItemClick} />
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
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

  // Calculate metrics for backward compatibility
  const activeItems = items.filter(item => item.status === "active")
  const completedItems = items.filter(item => item.status === "completed")
  const pausedItems = items.filter(item => item.status === "paused")

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Production Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">Real-time production overview and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onResetData} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Data
          </Button>
          
          {isEditMode ? (
            <>
              <Button 
                onClick={saveDashboardLayout}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Layout"}
              </Button>
              <Button 
                onClick={() => setShowAddModal(true)} 
                className="bg-black hover:bg-gray-800 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditMode(false)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Mode
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditMode(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Modular Dashboard */}
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
