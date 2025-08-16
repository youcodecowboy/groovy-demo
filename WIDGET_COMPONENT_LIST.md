# Widget Component List

## Overview

This document lists all the widget components that will be available in the configurable dashboard system, organized by category.

## Widget Categories

### 1. Metrics Widgets

#### Metric Card
- **ID**: `metric-card`
- **Purpose**: Display a single metric with optional trend indicator
- **Configurable**: Title, value, subtitle, trend, color, icon
- **Data Sources**: Metrics, calculations, custom
- **Size Options**: sm, md, lg

#### KPI Grid
- **ID**: `kpi-grid`
- **Purpose**: Display multiple KPIs in a grid layout
- **Configurable**: Metrics selection, time range, layout (2x2, 3x2, 4x2)
- **Data Sources**: Metrics, analytics
- **Size Options**: md, lg, full

#### Progress Ring
- **ID**: `progress-ring`
- **Purpose**: Circular progress indicator
- **Configurable**: Title, value, max value, color, show percentage
- **Data Sources**: Metrics, calculations
- **Size Options**: sm, md

### 2. Chart Widgets

#### Line Chart
- **ID**: `line-chart`
- **Purpose**: Time series data visualization
- **Configurable**: Title, data source, time range, show legend, show grid
- **Data Sources**: Time-series, analytics
- **Size Options**: md, lg, full

#### Bar Chart
- **ID**: `bar-chart`
- **Purpose**: Categorical data visualization
- **Configurable**: Title, data source, group by, orientation
- **Data Sources**: Aggregated, analytics
- **Size Options**: md, lg, full

#### Pie Chart
- **ID**: `pie-chart`
- **Purpose**: Proportional data visualization
- **Configurable**: Title, data source, show values, show percentages
- **Data Sources**: Categorical, analytics
- **Size Options**: sm, md, lg

#### Area Chart
- **ID**: `area-chart`
- **Purpose**: Stacked area visualization
- **Configurable**: Title, data source, time range, stack mode
- **Data Sources**: Time-series, analytics
- **Size Options**: md, lg, full

### 3. Table Widgets

#### Data Table
- **ID**: `data-table`
- **Purpose**: Tabular data with filtering and pagination
- **Configurable**: Title, data source, columns, page size, show search, show filters
- **Data Sources**: Items, orders, workflows, users, custom
- **Size Options**: md, lg, full, xl

#### Status Table
- **ID**: `status-table`
- **Purpose**: Status-based data display
- **Configurable**: Title, statuses, group by, show actions
- **Data Sources**: Items, workflows
- **Size Options**: md, lg, full

#### Summary Table
- **ID**: `summary-table`
- **Purpose**: Aggregated data summary
- **Configurable**: Title, data source, group by, aggregations
- **Data Sources**: Analytics, aggregated
- **Size Options**: md, lg, full

### 4. Action Widgets

#### Quick Actions
- **ID**: `quick-actions`
- **Purpose**: Action buttons for common tasks
- **Configurable**: Title, actions, layout (grid, list, buttons)
- **Data Sources**: Actions, permissions
- **Size Options**: sm, md, lg

#### Workflow Actions
- **ID**: `workflow-actions`
- **Purpose**: Workflow-specific actions
- **Configurable**: Title, workflow, show stages, show progress
- **Data Sources**: Workflows, items
- **Size Options**: md, lg

#### Form Actions
- **ID**: `form-actions`
- **Purpose**: Form submission actions
- **Configurable**: Title, form type, redirect after, show validation
- **Data Sources**: Forms, validation
- **Size Options**: sm, md

### 5. Form Widgets

#### Item Creator
- **ID**: `item-creator`
- **Purpose**: Create new items
- **Configurable**: Title, template, show advanced, redirect after
- **Data Sources**: Templates, attributes
- **Size Options**: md, lg, full

#### Order Creator
- **ID**: `order-creator`
- **Purpose**: Create new orders
- **Configurable**: Title, client, show items, show schedule
- **Data Sources**: Clients, items, schedules
- **Size Options**: md, lg, full

#### User Form
- **ID**: `user-form`
- **Purpose**: User management forms
- **Configurable**: Title, form type, fields, validation
- **Data Sources**: Users, roles, permissions
- **Size Options**: md, lg

### 6. Feed Widgets

#### Activity Feed
- **ID**: `activity-feed`
- **Purpose**: Real-time activity stream
- **Configurable**: Title, activity types, limit, show timestamps, auto refresh
- **Data Sources**: Activity, events
- **Size Options**: md, lg, full

#### Live Production Feed
- **ID**: `live-production-feed`
- **Purpose**: Live production updates
- **Configurable**: Title, workflows, show details, refresh interval
- **Data Sources**: Production, workflows
- **Size Options**: md, lg, full

#### Notification Feed
- **ID**: `notification-feed`
- **Purpose**: System notifications
- **Configurable**: Title, notification types, limit, show read status
- **Data Sources**: Notifications, alerts
- **Size Options**: sm, md, lg

### 7. Custom Widgets

#### HTML Widget
- **ID**: `html-widget`
- **Purpose**: Custom HTML content
- **Configurable**: Title, HTML content, CSS styles, scripts
- **Data Sources**: Custom
- **Size Options**: sm, md, lg, full, xl

#### Embed Widget
- **ID**: `embed-widget`
- **Purpose**: Embed external content
- **Configurable**: Title, URL, height, allow scripts
- **Data Sources**: External
- **Size Options**: md, lg, full, xl

#### Custom Component
- **ID**: `custom-component`
- **Purpose**: Custom React component
- **Configurable**: Title, component props, data binding
- **Data Sources**: Custom
- **Size Options**: sm, md, lg, full, xl

## Widget Configuration Schema

### Common Configuration Fields

All widgets support these common configuration fields:

```typescript
interface CommonConfig {
  title: string;           // Widget title
  description?: string;    // Widget description
  isVisible: boolean;      // Show/hide widget
  refreshInterval?: number; // Auto-refresh interval (seconds)
  showHeader: boolean;     // Show widget header
  showBorder: boolean;     // Show widget border
  backgroundColor?: string; // Widget background color
  textColor?: string;      // Widget text color
}
```

### Widget-Specific Configuration

Each widget type has its own configuration schema:

```typescript
// Example: Metric Card Configuration
interface MetricCardConfig extends CommonConfig {
  value: string;           // Metric value
  subtitle?: string;       // Subtitle text
  trend?: "up" | "down" | "neutral"; // Trend direction
  trendValue?: string;     // Trend value
  color?: string;          // Accent color
  icon?: string;           // Icon name
  format?: "number" | "currency" | "percentage" | "text"; // Value format
}

// Example: Line Chart Configuration
interface LineChartConfig extends CommonConfig {
  dataSource: string;      // Data source name
  timeRange: string;       // Time range (7d, 30d, 90d, 1y)
  showLegend: boolean;     // Show chart legend
  showGrid: boolean;       // Show chart grid
  showPoints: boolean;     // Show data points
  lineColor?: string;      // Line color
  fillColor?: string;      // Fill color
  yAxisLabel?: string;     // Y-axis label
  xAxisLabel?: string;     // X-axis label
}
```

## Widget Size Options

### Size Definitions

```typescript
type WidgetSize = "sm" | "md" | "lg" | "full" | "xl";

interface SizeConfig {
  sm: { cols: 1; rows: 1; };    // Small widget
  md: { cols: 2; rows: 1; };    // Medium widget
  lg: { cols: 2; rows: 2; };    // Large widget
  full: { cols: 3; rows: 2; };  // Full width widget
  xl: { cols: 3; rows: 3; };    // Extra large widget
}
```

### Size Recommendations

- **sm**: Simple metrics, small charts, quick actions
- **md**: Standard charts, tables, forms
- **lg**: Complex charts, detailed tables, forms with many fields
- **full**: Wide charts, full-width tables, comprehensive forms
- **xl**: Large dashboards, complex visualizations, full-page content

## Data Source Integration

### Available Data Sources

```typescript
type DataSource = 
  | "metrics"           // Key performance indicators
  | "analytics"         // Analytics data
  | "time-series"       // Time-based data
  | "aggregated"        // Aggregated data
  | "categorical"       // Categorical data
  | "items"            // Item data
  | "orders"           // Order data
  | "workflows"        // Workflow data
  | "users"            // User data
  | "activity"         // Activity data
  | "events"           // Event data
  | "production"       // Production data
  | "notifications"    // Notification data
  | "actions"          // Action data
  | "permissions"      // Permission data
  | "templates"        // Template data
  | "attributes"       // Attribute data
  | "clients"          // Client data
  | "schedules"        // Schedule data
  | "calculations"     // Calculated data
  | "custom"           // Custom data
  | "external";        // External data
```

### Data Source Configuration

```typescript
interface DataSourceConfig {
  source: DataSource;
  filters?: Record<string, any>;
  parameters?: Record<string, any>;
  refreshInterval?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}
```

## Widget Development Guidelines

### Component Structure

```typescript
interface WidgetProps<T = any> {
  config: T;                    // Widget configuration
  dataSource: DataSourceConfig; // Data source configuration
  size: WidgetSize;             // Widget size
  isEditMode: boolean;          // Edit mode flag
  onUpdate?: (updates: Partial<T>) => void; // Update callback
  onRemove?: () => void;        // Remove callback
}

// Example widget component
export function MetricCardWidget({ config, dataSource, size, isEditMode, onUpdate, onRemove }: WidgetProps<MetricCardConfig>) {
  // Widget implementation
}
```

### Required Features

1. **Responsive Design**: Widgets must work at all supported sizes
2. **Loading States**: Show loading indicators while fetching data
3. **Error Handling**: Gracefully handle data source errors
4. **Edit Mode**: Support configuration in edit mode
5. **Accessibility**: Follow accessibility guidelines
6. **Performance**: Optimize for fast rendering and updates

### Optional Features

1. **Real-time Updates**: Support live data updates
2. **Export**: Allow data export (CSV, PDF, etc.)
3. **Drill-down**: Support data exploration
4. **Customization**: Allow user customization
5. **Templates**: Provide configuration templates

## Widget Registry

### Registry Structure

```typescript
interface WidgetDefinition {
  id: string;                    // Unique widget ID
  name: string;                  // Display name
  description: string;           // Widget description
  category: WidgetCategory;      // Widget category
  icon: string;                  // Icon name
  component: React.ComponentType<WidgetProps>; // Widget component
  defaultConfig: Record<string, any>; // Default configuration
  configSchema: WidgetConfigSchema[]; // Configuration schema
  dataSources: DataSource[];     // Supported data sources
  sizes: WidgetSize[];           // Supported sizes
  isActive: boolean;             // Is widget available
  version: string;               // Widget version
  author?: string;               // Widget author
  tags?: string[];               // Search tags
}
```

### Registry Management

```typescript
// lib/widgets/registry.ts
export const widgetRegistry: Record<string, WidgetDefinition> = {
  "metric-card": {
    id: "metric-card",
    name: "Metric Card",
    description: "Display a single metric with optional trend indicator",
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
    dataSources: ["metrics", "calculations", "custom"],
    sizes: ["sm", "md", "lg"],
    isActive: true,
    version: "1.0.0",
    tags: ["metric", "kpi", "trend", "card"]
  },
  // ... more widgets
};
```

## Implementation Priority

### Phase 1 (MVP - Week 1)
1. Metric Card
2. Line Chart
3. Data Table
4. Quick Actions
5. Activity Feed

### Phase 2 (Week 2)
1. Bar Chart
2. Pie Chart
3. Status Table
4. Workflow Actions
5. Item Creator

### Phase 3 (Week 3)
1. Area Chart
2. Summary Table
3. Order Creator
4. Live Production Feed
5. Notification Feed

### Phase 4 (Week 4)
1. Progress Ring
2. KPI Grid
3. Form Actions
4. User Form
5. Custom Widgets (HTML, Embed, Custom Component)
