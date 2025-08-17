"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { SimpleWidget } from "./simple-widget"
import { DashboardWidget } from "@/types/dashboard"

interface DraggableWidgetProps {
  widget: DashboardWidget
  isEditMode?: boolean
  onRemove?: () => void
  onEdit?: () => void
}

export function DraggableWidget({ widget, isEditMode = false, onRemove, onEdit }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -top-2 -left-2 z-10 p-1 bg-white border border-gray-300 rounded-md cursor-grab hover:bg-gray-50 active:cursor-grabbing shadow-sm"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
      )}
      <SimpleWidget
        widget={widget}
        isEditMode={isEditMode}
        onRemove={onRemove}
        onEdit={onEdit}
      />
    </div>
  )
}
