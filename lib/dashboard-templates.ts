import { WidgetTemplate, DataSourceTemplate } from '@/types/dashboard'
import { 
  BarChart3, 
  Calendar, 
  Target, 
  Activity, 
  TrendingUp, 
  Users, 
  Package, 
  Clock, 
  Zap,
  AlertCircle,
  CheckCircle,
  Settings,
  MapPin,
  FileText,
  PieChart,
  LineChart,
  Table,
  List,
  Workflow,
  Database
} from 'lucide-react'

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: "metrics",
    name: "Key Metrics",
    description: "Display important production metrics with trend indicators",
    icon: "BarChart3",
    category: "metrics",
    defaultConfig: {
      refreshInterval: 30,
      showTrend: true,
      showPercentage: true,
      colorScheme: "blue",
      displayMode: "card"
    },
    defaultDataSource: {
      type: "metrics",
      timeRange: { type: "last24h" }
    }
  },
  {
    type: "capacity",
    name: "Capacity Tracker",
    description: "Track production capacity and utilization",
    icon: "Target",
    category: "metrics",
    defaultConfig: {
      refreshInterval: 60,
      showTrend: true,
      colorScheme: "green",
      displayMode: "chart"
    },
    defaultDataSource: {
      type: "items",
      filters: [{ field: "status", operator: "eq", value: "active" }],
      aggregation: { type: "count" }
    }
  },
  {
    type: "calendar",
    name: "Production Calendar",
    description: "View production schedule on calendar",
    icon: "Calendar",
    category: "visualization",
    defaultConfig: {
      refreshInterval: 300,
      colorScheme: "purple",
      displayMode: "calendar"
    },
    defaultDataSource: {
      type: "items",
      timeRange: { type: "last7d" }
    }
  },
  {
    type: "efficiency",
    name: "Efficiency Analytics",
    description: "Detailed efficiency and performance metrics",
    icon: "TrendingUp",
    category: "metrics",
    defaultConfig: {
      refreshInterval: 60,
      showTrend: true,
      showPercentage: true,
      colorScheme: "orange",
      displayMode: "chart"
    },
    defaultDataSource: {
      type: "metrics",
      timeRange: { type: "last7d" }
    }
  },
  {
    type: "live-feed",
    name: "Live Production Feed",
    description: "Real-time production activity feed",
    icon: "Activity",
    category: "activity",
    defaultConfig: {
      refreshInterval: 10,
      colorScheme: "red",
      displayMode: "list"
    },
    defaultDataSource: {
      type: "activity",
      timeRange: { type: "last24h" }
    }
  },
  {
    type: "team",
    name: "Team Overview",
    description: "Team performance and workload",
    icon: "Users",
    category: "management",
    defaultConfig: {
      refreshInterval: 120,
      colorScheme: "indigo",
      displayMode: "table"
    },
    defaultDataSource: {
      type: "items",
      aggregation: { type: "groupBy", field: "assignedTo" }
    }
  },
  {
    type: "inventory",
    name: "Inventory Status",
    description: "Current inventory levels and alerts",
    icon: "Package",
    category: "metrics",
    defaultConfig: {
      refreshInterval: 300,
      colorScheme: "yellow",
      displayMode: "card"
    },
    defaultDataSource: {
      type: "items",
      filters: [{ field: "status", operator: "in", value: ["active", "paused"] }]
    }
  },
  {
    type: "timeline",
    name: "Production Timeline",
    description: "Timeline view of production progress",
    icon: "Clock",
    category: "visualization",
    defaultConfig: {
      refreshInterval: 60,
      colorScheme: "pink",
      displayMode: "timeline"
    },
    defaultDataSource: {
      type: "items",
      timeRange: { type: "last24h" }
    }
  },
  {
    type: "alerts",
    name: "Alert Center",
    description: "System alerts and notifications",
    icon: "AlertCircle",
    category: "activity",
    defaultConfig: {
      refreshInterval: 30,
      colorScheme: "red",
      displayMode: "list"
    },
    defaultDataSource: {
      type: "activity",
      filters: [{ field: "type", operator: "eq", value: "alert" }]
    }
  },
  {
    type: "quality",
    name: "Quality Metrics",
    description: "Quality control statistics and trends",
    icon: "CheckCircle",
    category: "metrics",
    defaultConfig: {
      refreshInterval: 120,
      showTrend: true,
      colorScheme: "green",
      displayMode: "chart"
    },
    defaultDataSource: {
      type: "items",
      filters: [{ field: "isDefective", operator: "eq", value: true }],
      aggregation: { type: "count" }
    }
  },
  {
    type: "locations",
    name: "Location Overview",
    description: "Production locations and their status",
    icon: "MapPin",
    category: "management",
    defaultConfig: {
      refreshInterval: 300,
      colorScheme: "blue",
      displayMode: "table"
    },
    defaultDataSource: {
      type: "items",
      aggregation: { type: "groupBy", field: "currentLocationId" }
    }
  },
  {
    type: "reports",
    name: "Quick Reports",
    description: "Common production reports and summaries",
    icon: "FileText",
    category: "management",
    defaultConfig: {
      refreshInterval: 600,
      colorScheme: "gray",
      displayMode: "table"
    },
    defaultDataSource: {
      type: "metrics",
      timeRange: { type: "last30d" }
    }
  },
  // App-specific widgets
  {
    type: "activity",
    name: "Recent Activity",
    description: "Recent activity feed for the main app",
    icon: "List",
    category: "activity",
    defaultConfig: {
      refreshInterval: 30,
      colorScheme: "blue",
      displayMode: "list"
    },
    defaultDataSource: {
      type: "activity",
      timeRange: { type: "last24h" }
    }
  },
  {
    type: "chart",
    name: "Today's Snapshot",
    description: "Chart view for daily overview",
    icon: "BarChart3",
    category: "visualization",
    defaultConfig: {
      refreshInterval: 300,
      colorScheme: "purple",
      displayMode: "chart"
    },
    defaultDataSource: {
      type: "metrics",
      timeRange: { type: "last24h" }
    }
  },
  {
    type: "workflows",
    name: "Active Workflows",
    description: "Overview of active workflows",
    icon: "Workflow",
    category: "management",
    defaultConfig: {
      refreshInterval: 120,
      colorScheme: "green",
      displayMode: "card"
    },
    defaultDataSource: {
      type: "workflows",
      filters: [{ field: "isActive", operator: "eq", value: true }]
    }
  },
  {
    type: "data",
    name: "Data Overview",
    description: "General data statistics",
    icon: "Database",
    category: "metrics",
    defaultConfig: {
      refreshInterval: 300,
      colorScheme: "blue",
      displayMode: "card"
    },
    defaultDataSource: {
      type: "metrics",
      timeRange: { type: "last7d" }
    }
  }
]

export const DATA_SOURCE_TEMPLATES: DataSourceTemplate[] = [
  {
    type: "items",
    name: "Production Items",
    description: "All items in production workflows",
    availableFields: [
      "itemId", "status", "currentStageId", "workflowId", "assignedTo", 
      "currentLocationId", "isDefective", "startedAt", "updatedAt", 
      "completedAt", "brandId", "factoryId", "purchaseOrderId"
    ],
    defaultFilters: [],
    supportedAggregations: ["count", "groupBy"]
  },
  {
    type: "workflows",
    name: "Workflow Definitions",
    description: "Workflow configurations and stages",
    availableFields: [
      "name", "description", "isActive", "stages", "createdAt", "updatedAt"
    ],
    defaultFilters: [{ field: "isActive", operator: "eq", value: true }],
    supportedAggregations: ["count", "groupBy"]
  },
  {
    type: "metrics",
    name: "Calculated Metrics",
    description: "Pre-calculated production metrics",
    availableFields: [
      "activeItems", "completedItems", "efficiency", "onTimeRate", 
      "averageCycleTime", "defectRate", "capacityUtilization"
    ],
    defaultFilters: [],
    supportedAggregations: ["avg", "sum", "min", "max"]
  },
  {
    type: "activity",
    name: "Activity Feed",
    description: "Real-time activity and events",
    availableFields: [
      "type", "itemId", "userId", "action", "timestamp", "details"
    ],
    defaultFilters: [],
    supportedAggregations: ["count", "groupBy"]
  }
]

export const getWidgetIcon = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    BarChart3, Calendar, Target, Activity, TrendingUp, Users, Package, 
    Clock, Zap, AlertCircle, CheckCircle, Settings, MapPin, FileText,
    PieChart, LineChart, Table, List, Workflow, Database
  }
  return iconMap[iconName] || BarChart3
}

export const getWidgetTemplate = (type: string): WidgetTemplate | undefined => {
  return WIDGET_TEMPLATES.find(template => template.type === type)
}

export const getDataSourceTemplate = (type: string): DataSourceTemplate | undefined => {
  return DATA_SOURCE_TEMPLATES.find(template => template.type === type)
}
