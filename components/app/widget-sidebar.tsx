"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  Clock,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  List,
  PieChart,
  LineChart,
  Calendar,
  Target,
  Zap,
  Settings,
  Plus,
  X,
  MessageSquare,
  AlertTriangle,
  DollarSign,
  MapPin,
  Database,
  Workflow,
  FileText,
  Bell,
  Star,
  Filter,
  Search,
  Grid,
  Columns,
  Square,
} from "lucide-react"
import { DashboardWidget } from '@/types/dashboard'

interface WidgetSidebarProps {
  isOpen: boolean
  onClose: () => void
  onAddWidget: (widget: DashboardWidget) => void
}

interface WidgetTemplate {
  id: string
  name: string
  description: string
  icon: any
  category: string
  color: string
  defaultSize: "sm" | "md" | "lg" | "xl"
  config: any
  dataSource: any
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  // Metrics Cards (1/3 width)
  {
    id: "active-items-card",
    name: "Active Items",
    description: "Count of items currently in production",
    icon: Package,
    category: "metrics",
    color: "blue",
    defaultSize: "sm",
    config: { displayMode: "card", showTrend: true },
    dataSource: {
      type: "items",
      filters: [{ field: "status", operator: "eq", value: "active" }],
      aggregation: { type: "count" }
    }
  },
  {
    id: "on-time-card",
    name: "On Time %",
    description: "Percentage of items completed on time",
    icon: Clock,
    category: "metrics",
    color: "green",
    defaultSize: "sm",
    config: { displayMode: "card", showTrend: true },
    dataSource: {
      type: "metrics",
      timeRange: { type: "last24h" }
    }
  },
  {
    id: "open-tasks-card",
    name: "Open Tasks",
    description: "Number of paused or flagged items",
    icon: CheckSquare,
    category: "metrics",
    color: "purple",
    defaultSize: "sm",
    config: { displayMode: "card", showTrend: true },
    dataSource: {
      type: "items",
      filters: [{ field: "status", operator: "eq", value: "paused" }],
      aggregation: { type: "count" }
    }
  },
  {
    id: "completion-rate-card",
    name: "Completion Rate",
    description: "Items completed today vs total",
    icon: Target,
    category: "metrics",
    color: "orange",
    defaultSize: "sm",
    config: { displayMode: "card", showTrend: true },
    dataSource: {
      type: "metrics",
      timeRange: { type: "last24h" }
    }
  },
  {
    id: "defective-items-card",
    name: "Defective Items",
    description: "Items flagged for quality issues",
    icon: AlertTriangle,
    category: "metrics",
    color: "red",
    defaultSize: "sm",
    config: { displayMode: "card", showTrend: true },
    dataSource: {
      type: "items",
      filters: [{ field: "isDefective", operator: "eq", value: true }],
      aggregation: { type: "count" }
    }
  },
  {
    id: "total-revenue-card",
    name: "Total Revenue",
    description: "Revenue from completed orders",
    icon: DollarSign,
    category: "metrics",
    color: "emerald",
    defaultSize: "sm",
    config: { displayMode: "card", showTrend: true },
    dataSource: {
      type: "metrics",
      timeRange: { type: "last30d" }
    }
  },

  // Charts (2/3 width)
  {
    id: "production-trend-chart",
    name: "Production Trend",
    description: "Daily production over time",
    icon: LineChart,
    category: "charts",
    color: "blue",
    defaultSize: "lg",
    config: { displayMode: "chart", chartType: "line" },
    dataSource: {
      type: "items",
      timeRange: { type: "last7d" },
      aggregation: { type: "groupBy", field: "startedAt" }
    }
  },
  {
    id: "status-distribution-chart",
    name: "Status Distribution",
    description: "Items by status (pie chart)",
    icon: PieChart,
    category: "charts",
    color: "green",
    defaultSize: "lg",
    config: { displayMode: "chart", chartType: "pie" },
    dataSource: {
      type: "items",
      aggregation: { type: "groupBy", field: "status" }
    }
  },
  {
    id: "workflow-performance-chart",
    name: "Workflow Performance",
    description: "Completion times by workflow",
    icon: BarChart3,
    category: "charts",
    color: "purple",
    defaultSize: "lg",
    config: { displayMode: "chart", chartType: "bar" },
    dataSource: {
      type: "workflows",
      aggregation: { type: "avg", field: "completionTime" }
    }
  },
  {
    id: "location-activity-chart",
    name: "Location Activity",
    description: "Activity by location",
    icon: MapPin,
    category: "charts",
    color: "indigo",
    defaultSize: "lg",
    config: { displayMode: "chart", chartType: "bar" },
    dataSource: {
      type: "activity",
      aggregation: { type: "groupBy", field: "locationId" }
    }
  },

  // Activity Feeds (2/3 width)
  {
    id: "recent-activity-feed",
    name: "Recent Activity",
    description: "Latest scans and actions",
    icon: Activity,
    category: "activity",
    color: "blue",
    defaultSize: "lg",
    config: { displayMode: "list", maxItems: 10 },
    dataSource: {
      type: "activity",
      timeRange: { type: "last24h" }
    }
  },
  {
    id: "team-activity-feed",
    name: "Team Activity",
    description: "What your team is working on",
    icon: Users,
    category: "activity",
    color: "green",
    defaultSize: "lg",
    config: { displayMode: "list", maxItems: 8 },
    dataSource: {
      type: "activity",
      filters: [{ field: "type", operator: "eq", value: "team" }],
      timeRange: { type: "last24h" }
    }
  },
  {
    id: "messages-preview",
    name: "Messages Preview",
    description: "Recent messages and notifications",
    icon: MessageSquare,
    category: "activity",
    color: "purple",
    defaultSize: "lg",
    config: { displayMode: "list", maxItems: 6 },
    dataSource: {
      type: "messages",
      timeRange: { type: "last24h" }
    }
  },
  {
    id: "alerts-feed",
    name: "Alerts & Notifications",
    description: "System alerts and important notifications",
    icon: Bell,
    category: "activity",
    color: "red",
    defaultSize: "lg",
    config: { displayMode: "list", maxItems: 5 },
    dataSource: {
      type: "notifications",
      filters: [{ field: "priority", operator: "gte", value: "high" }]
    }
  },

  // Management (1/3 width)
  {
    id: "upcoming-deadlines",
    name: "Upcoming Deadlines",
    description: "Items due in the next 7 days",
    icon: Calendar,
    category: "management",
    color: "red",
    defaultSize: "sm",
    config: { displayMode: "list", maxItems: 5 },
    dataSource: {
      type: "items",
      filters: [{ field: "dueDate", operator: "gte", value: "now" }],
      timeRange: { type: "last7d" }
    }
  },
  {
    id: "flagged-items",
    name: "Flagged Items",
    description: "Items requiring attention",
    icon: Star,
    category: "management",
    color: "yellow",
    defaultSize: "sm",
    config: { displayMode: "list", maxItems: 5 },
    dataSource: {
      type: "items",
      filters: [{ field: "flaggedBy", operator: "ne", value: null }]
    }
  },
  {
    id: "quality-control",
    name: "Quality Control",
    description: "Items in quality review",
    icon: Filter,
    category: "management",
    color: "orange",
    defaultSize: "sm",
    config: { displayMode: "list", maxItems: 5 },
    dataSource: {
      type: "items",
      filters: [{ field: "status", operator: "eq", value: "quality_review" }]
    }
  },

  // Tables (3/3 width)
  {
    id: "items-table",
    name: "Items Table",
    description: "Complete items list with filters",
    icon: Database,
    category: "tables",
    color: "blue",
    defaultSize: "xl",
    config: { displayMode: "table", pageSize: 10 },
    dataSource: {
      type: "items",
      pagination: { page: 1, limit: 10 }
    }
  },
  {
    id: "workflows-table",
    name: "Workflows Table",
    description: "All workflows and their status",
    icon: Workflow,
    category: "tables",
    color: "green",
    defaultSize: "xl",
    config: { displayMode: "table", pageSize: 10 },
    dataSource: {
      type: "workflows",
      pagination: { page: 1, limit: 10 }
    }
  },
  {
    id: "activity-log",
    name: "Activity Log",
    description: "Complete activity history",
    icon: FileText,
    category: "tables",
    color: "purple",
    defaultSize: "xl",
    config: { displayMode: "table", pageSize: 15 },
    dataSource: {
      type: "activity",
      timeRange: { type: "last7d" },
      pagination: { page: 1, limit: 15 }
    }
  },

  // Custom
  {
    id: "custom-widget",
    name: "Custom Widget",
    description: "Advanced configuration with full control",
    icon: Settings,
    category: "custom",
    color: "gray",
    defaultSize: "md",
    config: { displayMode: "custom" },
    dataSource: { type: "custom" }
  }
]

const CATEGORIES = [
  { id: "metrics", name: "Metrics Cards", icon: TrendingUp, color: "blue", description: "Key performance indicators" },
  { id: "charts", name: "Charts", icon: BarChart3, color: "green", description: "Data visualizations" },
  { id: "activity", name: "Activity Feeds", icon: Activity, color: "purple", description: "Real-time updates" },
  { id: "management", name: "Management", icon: Target, color: "orange", description: "Operational oversight" },
  { id: "tables", name: "Tables", icon: Grid, color: "indigo", description: "Detailed data views" },
  { id: "custom", name: "Custom", icon: Settings, color: "gray", description: "Advanced configuration" },
]

export function WidgetSidebar({ isOpen, onClose, onAddWidget }: WidgetSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState("metrics")
  const [searchTerm, setSearchTerm] = useState("")

  const handleAddWidget = (template: WidgetTemplate) => {
    const newWidget: DashboardWidget = {
      id: `${template.id}-${Date.now()}`,
      type: template.id,
      title: template.name,
      position: 0, // Will be set by parent
      size: template.defaultSize,
      config: template.config,
      dataSource: template.dataSource
    }
    onAddWidget(newWidget)
    onClose()
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    return category?.icon || Settings
  }

  const getCategoryColor = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    return category?.color || "gray"
  }

  const getSizeLabel = (size: string) => {
    switch (size) {
      case "sm": return "1/3 width"
      case "md": return "1/2 width"
      case "lg": return "2/3 width"
      case "xl": return "Full width"
      default: return "Auto"
    }
  }

  const filteredTemplates = WIDGET_TEMPLATES.filter(t => 
    t.category === selectedCategory && 
    (searchTerm === "" || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[80vh] bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold">Add Widget to Dashboard</h2>
            <p className="text-gray-600">Choose from pre-configured widgets or create custom ones</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-full">
          {/* Category Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <category.icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search widgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Widget Templates */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 hover:scale-[1.02]"
                    onClick={() => handleAddWidget(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg bg-${template.color}-100`}>
                          <template.icon className={`w-6 h-6 text-${template.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm">{template.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getSizeLabel(template.defaultSize)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">Click to add</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No widgets found</h3>
                  <p className="text-gray-600">Try adjusting your search or selecting a different category</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <strong>Tip:</strong> Widgets automatically update with your data and can be resized after adding
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Square className="w-3 h-3" />
                <span>1/3 width</span>
              </div>
              <div className="flex items-center gap-2">
                <Columns className="w-3 h-3" />
                <span>2/3 width</span>
              </div>
              <div className="flex items-center gap-2">
                <Grid className="w-3 h-3" />
                <span>Full width</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
