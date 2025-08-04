"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LiveProductionFeed } from "./live-production-feed"
import { CapacityTracker } from "./capacity-tracker"
import { CalendarView } from "./calendar-view"
import { DashboardWidget } from "./dashboard-widget"
import { AddElementModal } from "./add-element-modal"
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
import {
    Settings, RotateCcw, CheckCircle,
    AlertCircle,
    Plus, Target, BarChart3, Zap
} from "lucide-react"

interface DashboardWidget {
  id: string
  type: string
  title: string
  config?: any
  position: number
}

interface ModularDashboardProps {
  items: Item[]
  workflows: Workflow[]
  onItemClick?: (itemId: string) => void
  onResetData?: () => void
}

export function ModularDashboard({ items, workflows, onItemClick, onResetData }: ModularDashboardProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: "metrics", type: "metrics", title: "Key Metrics", position: 0 },
    { id: "capacity", type: "capacity", title: "Capacity Tracker", position: 1 },
    { id: "calendar", type: "calendar", title: "Production Calendar", position: 2 },
    { id: "efficiency", type: "efficiency", title: "Efficiency Analytics", position: 3 },
    { id: "live-feed", type: "live-feed", title: "Live Production Feed", position: 4 },
  ])

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
        tolerance: 5, // Allow some tolerance for accidental touches
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Calculate enhanced metrics
  const activeItems = items.filter(item => item.status === "active")
  const completedItems = items.filter(item => item.status === "completed")
  const pausedItems = items.filter(item => item.status === "paused")
  
  // Calculate on-time items (items completed within expected timeframe)
  const onTimeItems = completedItems.filter(item => {
    // Simple logic: if item was completed within 24 hours of creation, it's on time
    const createdAt = new Date(item.createdAt).getTime()
    const completedAt = item.completedAt ? new Date(item.completedAt).getTime() : Date.now()
    const hoursToComplete = (completedAt - createdAt) / (1000 * 60 * 60)
    return hoursToComplete <= 24
  })

  // Calculate efficiency percentage
  const efficiencyPercentage = completedItems.length > 0 
    ? Math.round((onTimeItems.length / completedItems.length) * 100)
    : 0

  // Items requiring attention (stuck for more than 4 hours)
  const itemsRequiringAttention = activeItems.filter(item => {
    const lastActivity = item.history[item.history.length - 1]
    if (!lastActivity) return true
    const hoursSinceLastActivity = (Date.now() - new Date(lastActivity.at).getTime()) / (1000 * 60 * 60)
    return hoursSinceLastActivity > 4
  })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        const newWidgets = arrayMove(items, oldIndex, newIndex)
        
        // Update positions
        newWidgets.forEach((widget, index) => {
          widget.position = index
        })

        return newWidgets
      })
    }
  }

  const addWidget = (widgetType: string, title: string, config?: any) => {
    const newWidget: DashboardWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title,
      config,
      position: widgets.length
    }
    setWidgets([...widgets, newWidget])
    setShowAddModal(false)
  }

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
  }

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case "metrics":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">On-Time Items</p>
                    <p className="text-3xl font-bold text-green-600">{onTimeItems.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed on schedule</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Completed</p>
                    <p className="text-3xl font-bold text-blue-600">{completedItems.length}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-3xl font-bold text-purple-600">{efficiencyPercentage}%</p>
                    <p className="text-xs text-gray-500 mt-1">On-time rate</p>
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
                    <p className="text-3xl font-bold text-amber-600">{itemsRequiringAttention.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Stuck items</p>
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

      case "efficiency":
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Efficiency Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{efficiencyPercentage}%</div>
                  <div className="text-sm text-gray-600">Overall Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{activeItems.length}</div>
                  <div className="text-sm text-gray-600">Active Production</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{workflows.length}</div>
                  <div className="text-sm text-gray-600">Active Workflows</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

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
        return <div>Unknown widget type: {widget.type}</div>
    }
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
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="bg-black hover:bg-gray-800 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Element
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
            <Settings className="w-4 h-4 mr-2" />
            {isEditMode ? "Done" : "Customize"}
          </Button>
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
                onRemove={() => removeWidget(widget.id)}
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
          onAdd={addWidget}
        />
      )}
    </div>
  )
}
