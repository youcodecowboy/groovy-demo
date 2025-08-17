"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, GripVertical, Settings } from "lucide-react"

interface DashboardWidgetProps {
  widget: {
    id: string
    type: string
    title: string
    config?: any
  }
  isEditMode: boolean
  onRemove: () => void
  onConfigure?: () => void
  children: React.ReactNode
}

export function DashboardWidget({ 
  widget, 
  isEditMode, 
  onRemove, 
  onConfigure,
  children 
}: DashboardWidgetProps) {
  const [isHovered, setIsHovered] = useState(false)

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
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50 scale-105' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
            {widget.type}
          </Badge>
          
          {onConfigure && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
              onClick={onConfigure}
            >
              <Settings className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="destructive"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Drag Handle */}
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 left-4 z-20 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 bg-white/80 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-gray-200"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
      )}

      {/* Widget Content */}
      <div className={`
        ${isEditMode ? "border-2 border-dashed border-gray-200 rounded-lg p-2" : ""}
        ${isEditMode ? "pt-12 pb-2 pl-12 pr-2" : ""}
        transition-all duration-200
      `}>
        {children}
      </div>
    </div>
  )
}
