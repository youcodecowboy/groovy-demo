"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { DraggableWidget } from "./draggable-widget"
import { DashboardWidget } from "@/types/dashboard"

interface SortableWidgetGridProps {
  widgets: DashboardWidget[]
  isEditMode?: boolean
  onReorder?: (widgets: DashboardWidget[]) => void
  onRemove?: (widgetId: string) => void
  onEdit?: (widget: DashboardWidget) => void
}

export function SortableWidgetGrid({
  widgets,
  isEditMode = false,
  onReorder,
  onRemove,
  onEdit,
}: SortableWidgetGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id)
      const newIndex = widgets.findIndex((widget) => widget.id === over?.id)

      const newWidgets = arrayMove(widgets, oldIndex, newIndex)
      
      // Update positions
      const updatedWidgets = newWidgets.map((widget, index) => ({
        ...widget,
        position: index,
      }))

      onReorder?.(updatedWidgets)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6 auto-rows-fr">
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          {widgets
            .sort((a, b) => a.position - b.position)
            .map((widget) => (
              <div
                key={widget.id}
                className={`
                  ${widget.size === 'sm' ? 'col-span-1' : ''}
                  ${widget.size === 'md' ? 'col-span-2' : ''}
                  ${widget.size === 'lg' ? 'col-span-3' : ''}
                  ${widget.size === 'xl' ? 'col-span-full' : ''}
                  h-full
                `}
              >
                <DraggableWidget
                  widget={widget}
                  isEditMode={isEditMode}
                  onRemove={() => onRemove?.(widget.id)}
                  onEdit={() => onEdit?.(widget)}
                />
              </div>
            ))}
        </SortableContext>
      </div>
    </DndContext>
  )
}
