import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { DashboardWidget } from '@/types/dashboard'

export function useDashboardLayout() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const layout = useQuery(api.dashboards.getLayout)
  const setLayout = useMutation(api.dashboards.setLayout)

  useEffect(() => {
    if (layout !== undefined) {
      try {
        if (Array.isArray(layout) && layout.length > 0) {
          setWidgets(layout)
        } else {
          // Use default widgets if no layout exists
          setDefaultWidgets()
        }
        setError(null)
      } catch (err) {
        console.error('Failed to parse dashboard layout:', err)
        setError('Failed to load dashboard layout')
        setDefaultWidgets()
      }
      setIsLoading(false)
    }
  }, [layout])

  const setDefaultWidgets = () => {
    const defaultWidgets: DashboardWidget[] = [
      {
        id: "metrics",
        type: "metrics",
        title: "Key Metrics",
        position: 0,
        size: "full",
        config: {
          refreshInterval: 30,
          showTrend: true,
          showPercentage: true,
          colorScheme: "blue",
          displayMode: "card"
        },
        dataSource: {
          type: "metrics",
          timeRange: { type: "last24h" }
        }
      },
      {
        id: "capacity",
        type: "capacity",
        title: "Capacity Tracker",
        position: 1,
        size: "lg",
        config: {
          refreshInterval: 60,
          showTrend: true,
          colorScheme: "green",
          displayMode: "chart"
        },
        dataSource: {
          type: "items",
          filters: [{ field: "status", operator: "eq", value: "active" }],
          aggregation: { type: "count" }
        }
      },
      {
        id: "calendar",
        type: "calendar",
        title: "Production Calendar",
        position: 2,
        size: "lg",
        config: {
          refreshInterval: 300,
          colorScheme: "purple",
          displayMode: "calendar"
        },
        dataSource: {
          type: "items",
          timeRange: { type: "last7d" }
        }
      },
      {
        id: "live-feed",
        type: "live-feed",
        title: "Live Production Feed",
        position: 3,
        size: "full",
        config: {
          refreshInterval: 10,
          colorScheme: "red",
          displayMode: "list"
        },
        dataSource: {
          type: "activity",
          timeRange: { type: "last24h" }
        }
      }
    ]
    setWidgets(defaultWidgets)
  }

  const saveLayout = async (newWidgets: DashboardWidget[]) => {
    try {
      setIsLoading(true)
      const layoutJson = JSON.stringify(newWidgets)
      const success = await setLayout({ layoutJson })
      
      if (success) {
        setWidgets(newWidgets)
        setError(null)
        return true
      } else {
        setError('Failed to save dashboard layout')
        return false
      }
    } catch (err) {
      console.error('Failed to save dashboard layout:', err)
      setError('Failed to save dashboard layout')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const addWidget = (widget: DashboardWidget) => {
    const newWidgets = [...widgets, { ...widget, position: widgets.length }]
    setWidgets(newWidgets)
    return newWidgets
  }

  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    )
    setWidgets(newWidgets)
    return newWidgets
  }

  const removeWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId)
    // Update positions
    newWidgets.forEach((widget, index) => {
      widget.position = index
    })
    setWidgets(newWidgets)
    return newWidgets
  }

  const reorderWidgets = (newOrder: DashboardWidget[]) => {
    // Update positions based on new order
    const reorderedWidgets = newOrder.map((widget, index) => ({
      ...widget,
      position: index
    }))
    setWidgets(reorderedWidgets)
    return reorderedWidgets
  }

  const resetToDefault = () => {
    setDefaultWidgets()
  }

  return {
    widgets,
    isLoading,
    error,
    saveLayout,
    addWidget,
    updateWidget,
    removeWidget,
    reorderWidgets,
    resetToDefault
  }
}
