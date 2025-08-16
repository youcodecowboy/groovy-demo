# Configurable Dashboard & Custom Pages Specification

## Overview

The Configurable Dashboard system allows each organization to create personalized dashboards with draggable, configurable components. Users can also create custom pages for specific views of items, orders, or any other data they need to track. This creates a truly flexible workspace where each customer can build exactly what they need.

## Core Concepts

### 1. Dashboard Components (Widgets)
- **Definition**: Reusable, configurable UI components that display data or provide functionality
- **Examples**: Metrics cards, charts, data tables, forms, action buttons, live feeds
- **Flexibility**: Each component can be configured with different data sources, layouts, and behaviors
- **Types**: Data visualization, metrics, actions, forms, feeds, custom

### 2. Custom Pages
- **Definition**: User-created pages for specific views or workflows
- **Examples**: "Quality Control Dashboard", "Client Order Tracker", "Inventory Overview"
- **Flexibility**: Can contain any combination of components and custom layouts
- **Scopes**: Organization-wide, role-based, or user-specific

### 3. Component Library
- **Definition**: Registry of available components that can be added to dashboards
- **Categories**: Metrics, Charts, Tables, Actions, Forms, Feeds, Custom
- **Configuration**: Each component has configurable properties and data sources

## Database Schema

### Dashboards Table
```typescript
interface Dashboard {
  id: string
  orgId: string
  name: string                    // "Production Dashboard", "Quality Control"
  description?: string
  scope: "org" | "role" | "user"  // Who can see this dashboard
  ownerId?: string                // For user-specific dashboards
  role?: string                   // For role-based dashboards
  isDefault: boolean              // Is this the default dashboard?
  isActive: boolean
  createdAt: number
  updatedAt: number
}
```

### Dashboard Widgets Table
```typescript
interface DashboardWidget {
  id: string
  dashboardId: string
  widgetId: string                // Reference to widget type in registry
  title: string                   // User-defined title
  position: number                // Order in dashboard
  size: "sm" | "md" | "lg" | "full" | "xl"
  config: Record<string, any>     // Widget-specific configuration
  isVisible: boolean
  createdAt: number
  updatedAt: number
}
```

### Widget Registry Table
```typescript
interface WidgetRegistry {
  id: string
  name: string                    // "metrics-card", "line-chart"
  title: string                   // "Metrics Card", "Line Chart"
  description: string
  category: "metrics" | "charts" | "tables" | "actions" | "forms" | "feeds" | "custom"
  icon: string                    // Icon name
  defaultConfig: Record<string, any>
  configSchema: WidgetConfigSchema[]
  dataSources: string[]           // What data this widget can use
  isActive: boolean
  createdAt: number
  updatedAt: number
}
```

### Widget Config Schema
```typescript
interface WidgetConfigSchema {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "select" | "multiselect" | "color" | "date"
  required: boolean
  defaultValue?: any
  options?: string[]              // For select/multiselect
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  helpText?: string
}
```

### Custom Pages Table
```typescript
interface CustomPage {
  id: string
  orgId: string
  name: string                    // "Quality Control", "Client Orders"
  slug: string                    // URL slug
  description?: string
  scope: "org" | "role" | "user"
  ownerId?: string
  role?: string
  layout: PageLayout              // Grid layout configuration
  widgets: DashboardWidget[]      // Embedded widgets
  isActive: boolean
  createdAt: number
  updatedAt: number
}
```

### Page Layout
```typescript
interface PageLayout {
  type: "grid" | "flexible" | "custom"
  columns: number                 // For grid layout
  rows: number                    // For grid layout
  areas?: string[]                // For custom layouts
  responsive: boolean
  breakpoints?: {
    sm?: LayoutBreakpoint
    md?: LayoutBreakpoint
    lg?: LayoutBreakpoint
    xl?: LayoutBreakpoint
  }
}
```

## Component Library

### Core Widget Types

#### 1. Metrics Widgets
```typescript
// Metric Card
{
  id: "metric-card",
  name: "Metric Card",
  category: "metrics",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "value", label: "Value", type: "string", required: true },
    { key: "subtitle", label: "Subtitle", type: "string" },
    { key: "trend", label: "Trend", type: "select", options: ["up", "down", "neutral"] },
    { key: "trendValue", label: "Trend Value", type: "string" },
    { key: "color", label: "Color", type: "color" },
    { key: "icon", label: "Icon", type: "select", options: ["trending-up", "users", "package", "clock"] }
  ],
  dataSources: ["metrics", "calculations", "custom"]
}

// KPI Grid
{
  id: "kpi-grid",
  name: "KPI Grid",
  category: "metrics",
  configSchema: [
    { key: "metrics", label: "Metrics", type: "multiselect", options: ["production", "quality", "efficiency", "capacity"] },
    { key: "timeRange", label: "Time Range", type: "select", options: ["today", "week", "month", "quarter"] },
    { key: "layout", label: "Layout", type: "select", options: ["2x2", "3x2", "4x2"] }
  ],
  dataSources: ["metrics", "analytics"]
}
```

#### 2. Chart Widgets
```typescript
// Line Chart
{
  id: "line-chart",
  name: "Line Chart",
  category: "charts",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "dataSource", label: "Data Source", type: "select", options: ["production", "quality", "efficiency"] },
    { key: "timeRange", label: "Time Range", type: "select", options: ["7d", "30d", "90d", "1y"] },
    { key: "showLegend", label: "Show Legend", type: "boolean", defaultValue: true },
    { key: "showGrid", label: "Show Grid", type: "boolean", defaultValue: true }
  ],
  dataSources: ["time-series", "analytics"]
}

// Bar Chart
{
  id: "bar-chart",
  name: "Bar Chart",
  category: "charts",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "dataSource", label: "Data Source", type: "select", options: ["production", "quality", "efficiency"] },
    { key: "groupBy", label: "Group By", type: "select", options: ["stage", "workflow", "location", "date"] },
    { key: "orientation", label: "Orientation", type: "select", options: ["vertical", "horizontal"] }
  ],
  dataSources: ["aggregated", "analytics"]
}

// Pie Chart
{
  id: "pie-chart",
  name: "Pie Chart",
  category: "charts",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "dataSource", label: "Data Source", type: "select", options: ["status", "type", "category"] },
    { key: "showValues", label: "Show Values", type: "boolean", defaultValue: true },
    { key: "showPercentages", label: "Show Percentages", type: "boolean", defaultValue: true }
  ],
  dataSources: ["categorical", "analytics"]
}
```

#### 3. Table Widgets
```typescript
// Data Table
{
  id: "data-table",
  name: "Data Table",
  category: "tables",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "dataSource", label: "Data Source", type: "select", options: ["items", "orders", "workflows", "users"] },
    { key: "columns", label: "Columns", type: "multiselect", options: ["id", "name", "status", "created", "updated"] },
    { key: "pageSize", label: "Page Size", type: "number", defaultValue: 10 },
    { key: "showSearch", label: "Show Search", type: "boolean", defaultValue: true },
    { key: "showFilters", label: "Show Filters", type: "boolean", defaultValue: true }
  ],
  dataSources: ["items", "orders", "workflows", "users", "custom"]
}

// Status Table
{
  id: "status-table",
  name: "Status Table",
  category: "tables",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "statuses", label: "Statuses", type: "multiselect", options: ["active", "paused", "completed", "defective"] },
    { key: "groupBy", label: "Group By", type: "select", options: ["workflow", "location", "priority"] },
    { key: "showActions", label: "Show Actions", type: "boolean", defaultValue: true }
  ],
  dataSources: ["items", "workflows"]
}
```

#### 4. Action Widgets
```typescript
// Quick Actions
{
  id: "quick-actions",
  name: "Quick Actions",
  category: "actions",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "actions", label: "Actions", type: "multiselect", options: ["create-item", "create-order", "scan-qr", "generate-report"] },
    { key: "layout", label: "Layout", type: "select", options: ["grid", "list", "buttons"] }
  ],
  dataSources: ["actions", "permissions"]
}

// Workflow Actions
{
  id: "workflow-actions",
  name: "Workflow Actions",
  category: "actions",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "workflowId", label: "Workflow", type: "select", options: ["all", "specific"] },
    { key: "showStages", label: "Show Stages", type: "boolean", defaultValue: true },
    { key: "showProgress", label: "Show Progress", type: "boolean", defaultValue: true }
  ],
  dataSources: ["workflows", "items"]
}
```

#### 5. Feed Widgets
```typescript
// Activity Feed
{
  id: "activity-feed",
  name: "Activity Feed",
  category: "feeds",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "types", label: "Activity Types", type: "multiselect", options: ["item-created", "item-moved", "stage-completed", "user-login"] },
    { key: "limit", label: "Item Limit", type: "number", defaultValue: 20 },
    { key: "showTimestamps", label: "Show Timestamps", type: "boolean", defaultValue: true },
    { key: "autoRefresh", label: "Auto Refresh", type: "boolean", defaultValue: true }
  ],
  dataSources: ["activity", "events"]
}

// Live Production Feed
{
  id: "live-production-feed",
  name: "Live Production Feed",
  category: "feeds",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "workflows", label: "Workflows", type: "multiselect", options: ["all", "specific"] },
    { key: "showDetails", label: "Show Details", type: "boolean", defaultValue: true },
    { key: "refreshInterval", label: "Refresh Interval (seconds)", type: "number", defaultValue: 30 }
  ],
  dataSources: ["production", "workflows"]
}
```

#### 6. Form Widgets
```typescript
// Item Creator
{
  id: "item-creator",
  name: "Item Creator",
  category: "forms",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "template", label: "Default Template", type: "select", options: ["none", "t-shirt", "jeans", "accessories"] },
    { key: "showAdvanced", label: "Show Advanced Options", type: "boolean", defaultValue: false },
    { key: "redirectAfter", label: "Redirect After Creation", type: "select", options: ["dashboard", "item-detail", "none"] }
  ],
  dataSources: ["templates", "attributes"]
}

// Order Creator
{
  id: "order-creator",
  name: "Order Creator",
  category: "forms",
  configSchema: [
    { key: "title", label: "Title", type: "string", required: true },
    { key: "client", label: "Default Client", type: "select", options: ["none", "specific"] },
    { key: "showItems", label: "Show Items Section", type: "boolean", defaultValue: true },
    { key: "showSchedule", label: "Show Schedule Section", type: "boolean", defaultValue: true }
  ],
  dataSources: ["clients", "items", "schedules"]
}
```

## User Experience Flow

### 1. Dashboard Creation
1. **Dashboard Builder**
   - "Create New Dashboard" button
   - Name and description input
   - Scope selection (org/role/user)
   - Template selection (blank, production, quality, etc.)

2. **Component Selection**
   - Component library browser
   - Search and filter by category
   - Preview components
   - Drag and drop to dashboard

3. **Component Configuration**
   - Configure data sources
   - Set display options
   - Customize appearance
   - Test configuration

4. **Layout Management**
   - Drag to reorder components
   - Resize components
   - Grid layout options
   - Responsive design

### 2. Custom Page Creation
1. **Page Setup**
   - Page name and URL slug
   - Description and purpose
   - Access permissions
   - Layout template

2. **Content Building**
   - Add components from library
   - Configure data sources
   - Set up navigation
   - Add custom actions

3. **Publishing**
   - Preview page
   - Set as default (optional)
   - Share with team
   - Version control

### 3. Component Management
1. **Component Library**
   - Browse available components
   - Search and filter
   - Preview functionality
   - Installation

2. **Component Configuration**
   - Data source selection
   - Display options
   - Styling customization
   - Behavior settings

3. **Component Updates**
   - Version management
   - Migration handling
   - Breaking changes
   - Rollback options

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1. Database Schema (Convex Tables)
```typescript
// convex/schema.ts additions
export default defineSchema({
  // ... existing tables ...
  
  dashboards: defineTable({
    orgId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    scope: v.union(v.literal("org"), v.literal("role"), v.literal("user")),
    ownerId: v.optional(v.string()),
    role: v.optional(v.string()),
    isDefault: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_scope", ["orgId", "scope"])
    .index("by_owner", ["ownerId"])
    .index("by_default", ["orgId", "isDefault"]),

  dashboardWidgets: defineTable({
    dashboardId: v.id("dashboards"),
    widgetId: v.string(), // Reference to widget registry
    title: v.string(),
    position: v.number(),
    size: v.union(v.literal("sm"), v.literal("md"), v.literal("lg"), v.literal("full"), v.literal("xl")),
    config: v.any(), // Widget-specific configuration
    isVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_dashboard", ["dashboardId"])
    .index("by_dashboard_position", ["dashboardId", "position"]),

  widgetRegistry: defineTable({
    name: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(v.literal("metrics"), v.literal("charts"), v.literal("tables"), 
                     v.literal("actions"), v.literal("forms"), v.literal("feeds"), v.literal("custom")),
    icon: v.string(),
    defaultConfig: v.any(),
    configSchema: v.array(v.any()), // WidgetConfigSchema[]
    dataSources: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  customPages: defineTable({
    orgId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    scope: v.union(v.literal("org"), v.literal("role"), v.literal("user")),
    ownerId: v.optional(v.string()),
    role: v.optional(v.string()),
    layout: v.any(), // PageLayout
    widgets: v.array(v.any()), // DashboardWidget[]
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_slug", ["slug"])
    .index("by_org_scope", ["orgId", "scope"]),
})
```

#### 2. Convex Functions Implementation

**Dashboard Management:**
```typescript
// convex/dashboards.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { withOrg } from "./util";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    scope: v.union(v.literal("org"), v.literal("role"), v.literal("user")),
    ownerId: v.optional(v.string()),
    role: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: withOrg(async (ctx, args) => {
    const { orgId, userId } = ctx;
    
    // If this is the default dashboard, unset other defaults
    if (args.isDefault) {
      await ctx.db
        .query("dashboards")
        .withIndex("by_default", (q) => q.eq("orgId", orgId).eq("isDefault", true))
        .collect()
        .then(dashboards => {
          dashboards.forEach(dashboard => {
            ctx.db.patch(dashboard._id, { isDefault: false });
          });
        });
    }

    const dashboardId = await ctx.db.insert("dashboards", {
      orgId,
      name: args.name,
      description: args.description,
      scope: args.scope,
      ownerId: args.ownerId || userId,
      role: args.role,
      isDefault: args.isDefault || false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return dashboardId;
  }),
});

export const getByScope = query({
  args: {
    scope: v.union(v.literal("org"), v.literal("role"), v.literal("user")),
    role: v.optional(v.string()),
  },
  handler: withOrg(async (ctx, args) => {
    const { orgId, userId } = ctx;
    
    let dashboards = await ctx.db
      .query("dashboards")
      .withIndex("by_org_scope", (q) => q.eq("orgId", orgId).eq("scope", args.scope))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by role or user if specified
    if (args.scope === "role" && args.role) {
      dashboards = dashboards.filter(d => d.role === args.role);
    } else if (args.scope === "user") {
      dashboards = dashboards.filter(d => d.ownerId === userId);
    }

    return dashboards;
  }),
});

export const getDefault = query({
  handler: withOrg(async (ctx) => {
    const { orgId, userId } = ctx;
    
    // Try to get org default first
    let dashboard = await ctx.db
      .query("dashboards")
      .withIndex("by_default", (q) => q.eq("orgId", orgId).eq("isDefault", true))
      .first();

    if (!dashboard) {
      // Fall back to first available dashboard
      dashboard = await ctx.db
        .query("dashboards")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
    }

    return dashboard;
  }),
});
```

**Widget Management:**
```typescript
// convex/dashboardWidgets.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { withOrg } from "./util";

export const addWidget = mutation({
  args: {
    dashboardId: v.id("dashboards"),
    widgetId: v.string(),
    title: v.string(),
    position: v.number(),
    size: v.union(v.literal("sm"), v.literal("md"), v.literal("lg"), v.literal("full"), v.literal("xl")),
    config: v.any(),
  },
  handler: withOrg(async (ctx, args) => {
    const { orgId } = ctx;
    
    // Verify dashboard ownership
    const dashboard = await ctx.db.get(args.dashboardId);
    if (!dashboard || dashboard.orgId !== orgId) {
      throw new Error("Dashboard not found or access denied");
    }

    const widgetId = await ctx.db.insert("dashboardWidgets", {
      dashboardId: args.dashboardId,
      widgetId: args.widgetId,
      title: args.title,
      position: args.position,
      size: args.size,
      config: args.config,
      isVisible: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return widgetId;
  }),
});

export const updateWidget = mutation({
  args: {
    id: v.id("dashboardWidgets"),
    updates: v.object({
      title: v.optional(v.string()),
      position: v.optional(v.number()),
      size: v.optional(v.union(v.literal("sm"), v.literal("md"), v.literal("lg"), v.literal("full"), v.literal("xl"))),
      config: v.optional(v.any()),
      isVisible: v.optional(v.boolean()),
    }),
  },
  handler: withOrg(async (ctx, args) => {
    const { orgId } = ctx;
    
    const widget = await ctx.db.get(args.id);
    if (!widget) {
      throw new Error("Widget not found");
    }

    // Verify dashboard ownership
    const dashboard = await ctx.db.get(widget.dashboardId);
    if (!dashboard || dashboard.orgId !== orgId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  }),
});

export const getByDashboard = query({
  args: { dashboardId: v.id("dashboards") },
  handler: withOrg(async (ctx, args) => {
    const { orgId } = ctx;
    
    // Verify dashboard ownership
    const dashboard = await ctx.db.get(args.dashboardId);
    if (!dashboard || dashboard.orgId !== orgId) {
      return [];
    }

    return await ctx.db
      .query("dashboardWidgets")
      .withIndex("by_dashboard_position", (q) => q.eq("dashboardId", args.dashboardId))
      .order("asc")
      .collect();
  }),
});
```

**Widget Registry:**
```typescript
// convex/widgetRegistry.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("widgetRegistry")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  }),
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("widgetRegistry")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  }),
});

export const getById = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("widgetRegistry")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
  }),
});
```

### Phase 2: Component Library Implementation

#### 1. Widget Registry Setup
```typescript
// lib/widgets/registry.ts
import { WidgetDefinition } from "./types";

export const widgetRegistry: Record<string, WidgetDefinition> = {
  "metric-card": {
    id: "metric-card",
    name: "Metric Card",
    category: "metrics",
    icon: "TrendingUp",
    component: MetricCardWidget,
    defaultConfig: {
      title: "Metric",
      value: "0",
      subtitle: "",
      trend: "neutral",
      color: "blue"
    },
    configSchema: [
      { key: "title", label: "Title", type: "string", required: true },
      { key: "value", label: "Value", type: "string", required: true },
      { key: "subtitle", label: "Subtitle", type: "string" },
      { key: "trend", label: "Trend", type: "select", options: ["up", "down", "neutral"] },
      { key: "color", label: "Color", type: "color" }
    ],
    dataSources: ["metrics", "calculations", "custom"]
  },
  
  "line-chart": {
    id: "line-chart",
    name: "Line Chart",
    category: "charts",
    icon: "BarChart3",
    component: LineChartWidget,
    defaultConfig: {
      title: "Chart",
      dataSource: "production",
      timeRange: "30d",
      showLegend: true
    },
    configSchema: [
      { key: "title", label: "Title", type: "string", required: true },
      { key: "dataSource", label: "Data Source", type: "select", options: ["production", "quality", "efficiency"] },
      { key: "timeRange", label: "Time Range", type: "select", options: ["7d", "30d", "90d", "1y"] },
      { key: "showLegend", label: "Show Legend", type: "boolean", defaultValue: true }
    ],
    dataSources: ["time-series", "analytics"]
  },
  
  // ... more widgets
};
```

#### 2. Widget Components
```typescript
// components/widgets/MetricCardWidget.tsx
import { WidgetProps } from "../types";

interface MetricCardConfig {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

export function MetricCardWidget({ config, dataSource }: WidgetProps<MetricCardConfig>) {
  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{config.title}</p>
          <p className="text-2xl font-bold text-gray-900">{config.value}</p>
          {config.subtitle && (
            <p className="text-sm text-gray-500">{config.subtitle}</p>
          )}
        </div>
        {config.trend && (
          <div className={`text-${config.color || 'blue'}-500`}>
            {config.trend === 'up' && <TrendingUp className="w-5 h-5" />}
            {config.trend === 'down' && <TrendingDown className="w-5 h-5" />}
            {config.trend === 'neutral' && <Minus className="w-5 h-5" />}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Phase 3: Dashboard Builder UI

#### 1. Dashboard Builder Component
```typescript
// components/dashboard/DashboardBuilder.tsx
import { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DashboardWidget } from "./DashboardWidget";
import { WidgetLibrary } from "./WidgetLibrary";
import { useDashboard } from "@/hooks/useDashboard";

export function DashboardBuilder({ dashboardId }: { dashboardId: string }) {
  const { dashboard, widgets, addWidget, updateWidget, removeWidget } = useDashboard(dashboardId);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over.id);
      
      // Update positions
      const updatedWidgets = [...widgets];
      const [movedWidget] = updatedWidgets.splice(oldIndex, 1);
      updatedWidgets.splice(newIndex, 0, movedWidget);
      
      // Update positions in database
      updatedWidgets.forEach((widget, index) => {
        updateWidget(widget.id, { position: index });
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{dashboard?.name}</h1>
            <p className="text-gray-600">{dashboard?.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isEditMode ? "default" : "outline"}
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? "Done" : "Edit"}
            </Button>
            {isEditMode && (
              <Button onClick={() => setShowWidgetLibrary(true)}>
                Add Widget
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Canvas */}
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {widgets.map((widget) => (
                <DashboardWidget
                  key={widget.id}
                  widget={widget}
                  isEditMode={isEditMode}
                  onUpdate={(updates) => updateWidget(widget.id, updates)}
                  onRemove={() => removeWidget(widget.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Widget Library Modal */}
        {showWidgetLibrary && (
          <WidgetLibrary
            isOpen={showWidgetLibrary}
            onClose={() => setShowWidgetLibrary(false)}
            onAddWidget={addWidget}
          />
        )}
      </div>
    </div>
  );
}
```

#### 2. Widget Library Modal
```typescript
// components/dashboard/WidgetLibrary.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { widgetRegistry } from "@/lib/widgets/registry";

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetId: string, config: any) => void;
}

export function WidgetLibrary({ isOpen, onClose, onAddWidget }: WidgetLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "metrics", "charts", "tables", "actions", "forms", "feeds"];
  
  const filteredWidgets = Object.values(widgetRegistry).filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddWidget = (widgetId: string) => {
    const widget = widgetRegistry[widgetId];
    onAddWidget(widgetId, widget.defaultConfig);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <Input
              placeholder="Search widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Widget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map((widget) => (
              <div
                key={widget.id}
                className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleAddWidget(widget.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <widget.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{widget.name}</h3>
                    <p className="text-sm text-gray-500">{widget.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{widget.description}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Phase 4: Custom Pages Implementation

#### 1. Custom Page Router
```typescript
// app/custom/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getCustomPage } from "@/lib/customPages";
import { CustomPageRenderer } from "@/components/custom/CustomPageRenderer";

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const page = await getCustomPage(params.slug);
  
  if (!page) {
    notFound();
  }

  return <CustomPageRenderer page={page} />;
}
```

#### 2. Custom Page Renderer
```typescript
// components/custom/CustomPageRenderer.tsx
import { CustomPage } from "@/types/schema";
import { DashboardBuilder } from "@/components/dashboard/DashboardBuilder";

interface CustomPageRendererProps {
  page: CustomPage;
}

export function CustomPageRenderer({ page }: CustomPageRendererProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{page.name}</h1>
          {page.description && (
            <p className="text-gray-600 mt-2">{page.description}</p>
          )}
        </div>

        {/* Page Content */}
        <DashboardBuilder dashboardId={page.id} />
      </div>
    </div>
  );
}
```

## Data Sources & Integration

### 1. Metrics Data Source
```typescript
// lib/dataSources/metrics.ts
export async function getMetricsData(orgId: string, config: any) {
  const { timeRange, metrics } = config;
  
  const data = {
    production: await getProductionMetrics(orgId, timeRange),
    quality: await getQualityMetrics(orgId, timeRange),
    efficiency: await getEfficiencyMetrics(orgId, timeRange),
    capacity: await getCapacityMetrics(orgId, timeRange),
  };

  return metrics.map(metric => data[metric]);
}
```

### 2. Analytics Data Source
```typescript
// lib/dataSources/analytics.ts
export async function getAnalyticsData(orgId: string, config: any) {
  const { dataSource, timeRange, groupBy } = config;
  
  switch (dataSource) {
    case "production":
      return await getProductionAnalytics(orgId, timeRange, groupBy);
    case "quality":
      return await getQualityAnalytics(orgId, timeRange, groupBy);
    case "efficiency":
      return await getEfficiencyAnalytics(orgId, timeRange, groupBy);
    default:
      return [];
  }
}
```

### 3. Items Data Source
```typescript
// lib/dataSources/items.ts
export async function getItemsData(orgId: string, config: any) {
  const { columns, filters, pageSize } = config;
  
  let items = await getItems(orgId);
  
  // Apply filters
  if (filters) {
    items = items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
  
  // Select columns
  if (columns) {
    items = items.map(item => {
      const filtered: any = {};
      columns.forEach(col => {
        filtered[col] = item[col];
      });
      return filtered;
    });
  }
  
  return items;
}
```

## Security & Access Control

### 1. Dashboard Access Control
```typescript
// lib/dashboardAccess.ts
export function canAccessDashboard(user: User, dashboard: Dashboard): boolean {
  // Org-wide dashboards
  if (dashboard.scope === "org") {
    return user.orgId === dashboard.orgId;
  }
  
  // Role-based dashboards
  if (dashboard.scope === "role") {
    return user.orgId === dashboard.orgId && user.role === dashboard.role;
  }
  
  // User-specific dashboards
  if (dashboard.scope === "user") {
    return user.id === dashboard.ownerId;
  }
  
  return false;
}
```

### 2. Widget Data Access
```typescript
// lib/widgetDataAccess.ts
export function canAccessWidgetData(user: User, widget: DashboardWidget): boolean {
  const widgetDef = widgetRegistry[widget.widgetId];
  
  // Check if user has access to required data sources
  for (const dataSource of widgetDef.dataSources) {
    if (!hasDataAccess(user, dataSource)) {
      return false;
    }
  }
  
  return true;
}
```

## Performance Considerations

### 1. Widget Caching
```typescript
// lib/widgetCache.ts
const widgetCache = new Map<string, { data: any; timestamp: number }>();

export async function getWidgetData(widgetId: string, config: any, orgId: string) {
  const cacheKey = `${widgetId}-${orgId}-${JSON.stringify(config)}`;
  const cached = widgetCache.get(cacheKey);
  
  // Cache for 5 minutes
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  
  const data = await fetchWidgetData(widgetId, config, orgId);
  widgetCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}
```

### 2. Lazy Loading
```typescript
// components/widgets/LazyWidget.tsx
import { Suspense, lazy } from "react";

const WidgetComponent = lazy(() => import(`./${widgetId}Widget`));

export function LazyWidget({ widget }: { widget: DashboardWidget }) {
  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <WidgetComponent widget={widget} />
    </Suspense>
  );
}
```

## Success Metrics
1. **Dashboard Creation Rate**: % of users who create custom dashboards
2. **Widget Usage**: Most popular widget types and configurations
3. **Custom Page Usage**: Number of custom pages created per organization
4. **User Engagement**: Time spent on custom dashboards vs default
5. **Feature Adoption**: % of organizations using advanced features

## Future Enhancements
1. **Widget Marketplace**: Third-party widget development
2. **Advanced Layouts**: More flexible layout options
3. **Widget Templates**: Pre-configured widget combinations
4. **Real-time Updates**: WebSocket-based live data updates
5. **Mobile Optimization**: Responsive widget layouts
6. **Export/Import**: Dashboard configuration sharing
7. **Version Control**: Dashboard change history
8. **A/B Testing**: Dashboard performance optimization
