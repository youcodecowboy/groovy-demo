# Configurable Dashboard Implementation Summary

## Overview

This document summarizes the key implementation steps needed to build the configurable dashboard system with draggable components and custom pages.

## Key Changes Required

### 1. Database Schema Changes (Convex)

#### New Tables to Add:
- `dashboards` - Store dashboard configurations
- `dashboardWidgets` - Store widget instances on dashboards
- `widgetRegistry` - Store available widget definitions
- `customPages` - Store custom page configurations

#### Schema Updates:
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
    widgetId: v.string(),
    title: v.string(),
    position: v.number(),
    size: v.union(v.literal("sm"), v.literal("md"), v.literal("lg"), v.literal("full"), v.literal("xl")),
    config: v.any(),
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
    configSchema: v.array(v.any()),
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
    layout: v.any(),
    widgets: v.array(v.any()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_slug", ["slug"])
    .index("by_org_scope", ["orgId", "scope"]),
})
```

### 2. New Convex Functions

#### Files to Create:
- `convex/dashboards.ts` - Dashboard CRUD operations
- `convex/dashboardWidgets.ts` - Widget management
- `convex/widgetRegistry.ts` - Widget registry management
- `convex/customPages.ts` - Custom page management

#### Key Functions:
```typescript
// Dashboard management
export const create = mutation({...})
export const getByScope = query({...})
export const getDefault = query({...})

// Widget management
export const addWidget = mutation({...})
export const updateWidget = mutation({...})
export const getByDashboard = query({...})

// Widget registry
export const getAll = query({...})
export const getByCategory = query({...})
export const getById = query({...})
```

### 3. Component Library Structure

#### New Directories:
```
components/
├── widgets/           # Individual widget components
│   ├── MetricCardWidget.tsx
│   ├── LineChartWidget.tsx
│   ├── DataTableWidget.tsx
│   ├── QuickActionsWidget.tsx
│   ├── ActivityFeedWidget.tsx
│   └── ItemCreatorWidget.tsx
├── dashboard/         # Dashboard builder components
│   ├── DashboardBuilder.tsx
│   ├── WidgetLibrary.tsx
│   ├── WidgetConfigurator.tsx
│   └── DashboardWidget.tsx
└── custom/           # Custom page components
    ├── CustomPageRenderer.tsx
    ├── CustomPageBuilder.tsx
    └── CustomPageList.tsx
```

#### Widget Registry:
```typescript
// lib/widgets/registry.ts
export const widgetRegistry: Record<string, WidgetDefinition> = {
  "metric-card": {
    id: "metric-card",
    name: "Metric Card",
    category: "metrics",
    icon: "TrendingUp",
    component: MetricCardWidget,
    defaultConfig: {...},
    configSchema: [...],
    dataSources: ["metrics", "calculations", "custom"]
  },
  // ... more widgets
};
```

### 4. New Page Routes

#### Files to Create:
- `app/dashboard/page.tsx` - Main dashboard page
- `app/dashboard/[id]/page.tsx` - Specific dashboard view
- `app/dashboard/builder/page.tsx` - Dashboard builder
- `app/custom/[slug]/page.tsx` - Custom page router
- `app/custom/builder/page.tsx` - Custom page builder

#### Route Structure:
```
/dashboard                    # Default dashboard
/dashboard/builder           # Dashboard builder
/dashboard/[id]              # Specific dashboard
/custom/[slug]               # Custom pages
/custom/builder              # Custom page builder
```

### 5. Data Source Integration

#### New Files:
- `lib/dataSources/metrics.ts` - Metrics data
- `lib/dataSources/analytics.ts` - Analytics data
- `lib/dataSources/items.ts` - Items data
- `lib/dataSources/workflows.ts` - Workflow data
- `lib/dataSources/activity.ts` - Activity data

#### Data Source Pattern:
```typescript
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

### 6. UI Components to Create

#### Core Widgets (7 types):
1. **Metric Card** - Display single metric with trend
2. **Line Chart** - Time series data visualization
3. **Bar Chart** - Categorical data visualization
4. **Pie Chart** - Proportional data visualization
5. **Data Table** - Tabular data with filtering
6. **Quick Actions** - Action buttons for common tasks
7. **Activity Feed** - Real-time activity stream

#### Dashboard Components:
1. **DashboardBuilder** - Main dashboard canvas
2. **WidgetLibrary** - Widget selection modal
3. **WidgetConfigurator** - Widget configuration panel
4. **DashboardWidget** - Individual widget wrapper

#### Custom Page Components:
1. **CustomPageRenderer** - Render custom pages
2. **CustomPageBuilder** - Build custom pages
3. **CustomPageList** - List available custom pages

### 7. Navigation Updates

#### Admin Sidebar Updates:
```typescript
// components/layout/admin-sidebar.tsx
const navigationItems = [
  // ... existing items ...
  {
    title: "Dashboards",
    href: "/dashboard",
    icon: LayoutDashboard,
    children: [
      { title: "Overview", href: "/dashboard" },
      { title: "Builder", href: "/dashboard/builder" },
      { title: "Custom Pages", href: "/custom" },
    ]
  },
];
```

### 8. Type Definitions

#### New Type Files:
- `types/dashboard.ts` - Dashboard-related types
- `types/widgets.ts` - Widget-related types
- `types/customPages.ts` - Custom page types

#### Key Types:
```typescript
interface Dashboard {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  scope: "org" | "role" | "user";
  ownerId?: string;
  role?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface DashboardWidget {
  id: string;
  dashboardId: string;
  widgetId: string;
  title: string;
  position: number;
  size: "sm" | "md" | "lg" | "full" | "xl";
  config: Record<string, any>;
  isVisible: boolean;
  createdAt: number;
  updatedAt: number;
}

interface WidgetDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  component: React.ComponentType<any>;
  defaultConfig: Record<string, any>;
  configSchema: WidgetConfigSchema[];
  dataSources: string[];
}
```

### 9. Hooks and Utilities

#### New Hooks:
- `hooks/useDashboard.ts` - Dashboard state management
- `hooks/useWidgetData.ts` - Widget data fetching
- `hooks/useWidgetConfig.ts` - Widget configuration

#### Utilities:
- `lib/dashboardAccess.ts` - Access control logic
- `lib/widgetCache.ts` - Widget data caching
- `lib/widgetValidation.ts` - Widget configuration validation

### 10. Migration Strategy

#### Phase 1: Core Infrastructure (Week 1)
1. Add database schema
2. Create Convex functions
3. Set up widget registry
4. Create basic widget components

#### Phase 2: Dashboard Builder (Week 2)
1. Build dashboard builder UI
2. Implement drag and drop
3. Add widget configuration
4. Create widget library modal

#### Phase 3: Custom Pages (Week 3)
1. Build custom page system
2. Add page routing
3. Create page builder
4. Implement page management

#### Phase 4: Integration & Polish (Week 4)
1. Integrate with existing admin interface
2. Add navigation updates
3. Implement data sources
4. Add caching and performance optimizations

### 11. Testing Strategy

#### Unit Tests:
- Widget components
- Dashboard builder logic
- Data source functions
- Access control logic

#### Integration Tests:
- Dashboard creation flow
- Widget configuration
- Custom page creation
- Data source integration

#### E2E Tests:
- Complete dashboard creation
- Widget drag and drop
- Custom page building
- Data visualization

### 12. Performance Considerations

#### Caching:
- Widget data caching (5-minute TTL)
- Dashboard layout caching
- Widget registry caching

#### Lazy Loading:
- Widget components
- Data source functions
- Chart libraries

#### Optimization:
- Virtual scrolling for large datasets
- Debounced widget updates
- Efficient re-rendering

### 13. Security Considerations

#### Access Control:
- Dashboard ownership verification
- Widget data access control
- Custom page permissions

#### Data Validation:
- Widget configuration validation
- Dashboard layout validation
- Custom page slug validation

#### Input Sanitization:
- Widget configuration inputs
- Dashboard names and descriptions
- Custom page content

### 14. Monitoring & Analytics

#### Metrics to Track:
- Dashboard creation rate
- Widget usage patterns
- Custom page usage
- Performance metrics

#### Error Tracking:
- Widget rendering errors
- Data source failures
- Configuration validation errors

### 15. Documentation

#### User Documentation:
- Dashboard creation guide
- Widget configuration guide
- Custom page building guide

#### Developer Documentation:
- Widget development guide
- Data source integration guide
- API documentation

## Implementation Priority

### High Priority (MVP):
1. Basic dashboard schema
2. Core widget types (metrics, charts, tables)
3. Dashboard builder UI
4. Widget configuration
5. Basic custom pages

### Medium Priority:
1. Advanced widget types
2. Custom page builder
3. Data source integration
4. Performance optimizations

### Low Priority:
1. Widget marketplace
2. Advanced layouts
3. Real-time updates
4. Export/import functionality

## Success Criteria

1. **Functionality**: Users can create custom dashboards with draggable widgets
2. **Performance**: Dashboard loads in <2 seconds with 10+ widgets
3. **Usability**: New users can create a dashboard in <5 minutes
4. **Reliability**: 99.9% uptime for dashboard functionality
5. **Adoption**: 50% of users create at least one custom dashboard within 30 days

## Risk Mitigation

1. **Complexity**: Start with simple widgets, add complexity gradually
2. **Performance**: Implement caching and lazy loading from day one
3. **Data Access**: Ensure proper access control for all data sources
4. **User Experience**: Extensive testing with real users
5. **Technical Debt**: Regular refactoring and code reviews
