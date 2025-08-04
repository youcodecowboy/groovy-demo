"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Item, Workflow } from "@/types/schema"
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Package,
    CheckCircle,
    AlertTriangle
} from "lucide-react"

interface CalendarViewProps {
  items: Item[]
  workflows: Workflow[]
  onItemClick?: (itemId: string) => void
}

export function CalendarView({ items, workflows, onItemClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [selectedWorkflow, setSelectedWorkflow] = useState("all")

  // Generate calendar data
  const calendarData = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }

    // Filter items based on selected workflow
    const filteredItems = selectedWorkflow === "all" 
      ? items 
      : items.filter(item => item.workflowId === selectedWorkflow)

    // Group items by date
    const itemsByDate = days.map(date => {
      const dayItems = filteredItems.filter(item => {
        const itemDate = new Date(item.createdAt)
        return itemDate.toDateString() === date.toDateString()
      })

      return {
        date,
        items: dayItems,
        activeItems: dayItems.filter(item => item.status === "active"),
        completedItems: dayItems.filter(item => item.status === "completed"),
        pausedItems: dayItems.filter(item => item.status === "paused")
      }
    })

    return {
      days,
      itemsByDate,
      totalItems: filteredItems.length,
      totalActive: filteredItems.filter(item => item.status === "active").length,
      totalCompleted: filteredItems.filter(item => item.status === "completed").length
    }
  }, [currentDate, items, selectedWorkflow])

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    })
  }

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-700"
      case "completed": return "bg-green-100 text-green-700"
      case "paused": return "bg-yellow-100 text-yellow-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Package className="w-3 h-3" />
      case "completed": return <CheckCircle className="w-3 h-3" />
      case "paused": return <AlertTriangle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Production Calendar</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: "week" | "month") => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Workflows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              {workflows.map(workflow => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous Week
        </Button>
        <div className="text-lg font-semibold">
          {formatDate(calendarData.days[0])} - {formatDate(calendarData.days[6])}
        </div>
        <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
          Next Week
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{calendarData.totalItems}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{calendarData.totalActive}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{calendarData.totalCompleted}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-purple-600">
                  {calendarData.totalItems > 0 
                    ? Math.round((calendarData.totalCompleted / calendarData.totalItems) * 100)
                    : 0}%
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {calendarData.days.map((date, index) => {
              const dayData = calendarData.itemsByDate[index]
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isToday ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="text-center mb-3">
                    <div className={`text-sm font-medium ${
                      isToday ? "text-blue-600" : "text-gray-600"
                    }`}>
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className={`text-lg font-bold ${
                      isToday ? "text-blue-600" : "text-gray-900"
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dayData.items.slice(0, 3).map(item => (
                      <div
                        key={item.id}
                        className={`p-2 rounded text-xs cursor-pointer hover:bg-white transition-colors ${
                          getItemStatusColor(item.status)
                        }`}
                        onClick={() => onItemClick?.(item.id)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {getItemStatusIcon(item.status)}
                          <span className="font-medium">{item.sku}</span>
                        </div>
                        <div className="text-xs opacity-75">
                          {item.metadata?.brand || "No brand"}
                        </div>
                      </div>
                    ))}
                    
                    {dayData.items.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayData.items.length - 3} more
                      </div>
                    )}
                  </div>

                                     {/* Day Summary */}
                   <div className="mt-3 pt-2 border-t border-gray-200">
                     <div className="flex justify-between text-xs text-gray-600">
                       <span>Active: {dayData.activeItems.length}</span>
                       <span>Done: {dayData.completedItems.length}</span>
                     </div>
                   </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items
              .filter(item => item.status === "active")
              .slice(0, 5)
              .map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onItemClick?.(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${getItemStatusColor(item.status)}`}>
                      {getItemStatusIcon(item.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.sku}</p>
                      <p className="text-sm text-gray-600">
                        {item.metadata?.brand || "No brand"} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getItemStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 