# Metric Card Configuration System Specification

## Overview

The Metric Card Configuration System provides a highly malleable, configurable metric card component that can display single or multiple metrics with easy data source selection and reconfiguration. This system serves as the foundation for the configurable dashboard widgets and will be reusable across the entire application.

## Core Concepts

### 1. Configurable Metric Cards
- **Single Metric Mode**: Display one metric with title, value, subtitle, and icon
- **Multi-Metric Mode**: Display 1-3 metrics in a single card (Small: 1 metric, Medium: 2 metrics, Large: 3 metrics)
- **Responsive Sizing**: 1/3 width (small), 1/2 width (medium), full width (large)
- **Dynamic Data Sources**: Easy selection and configuration of data sources

### 2. Data Source Selection
- **Visual Data Source Picker**: Modal with categorized data sources
- **Smart Defaults**: Pre-configured data sources for common metrics
- **Real-time Preview**: Live preview of data while configuring
- **Validation**: Ensure data source compatibility and access

### 3. Configuration Panel
- **Inline Configuration**: Quick edit mode for basic settings
- **Advanced Configuration**: Full modal for detailed customization
- **Template System**: Pre-configured metric templates
- **Save/Load Configurations**: Reusable metric configurations

## Current Implementation Analysis

### Existing MetricCard Component
```typescript
// components/ui/metric-card.tsx
interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  color?: string
  className?: string
}
```

### Current Usage Patterns
```typescript
// Factory Dashboard Example
<MetricCard
  title="Need Attention"
  value={itemsRequiringAttention.length}
  subtitle="Items stuck in stages"
  icon={AlertTriangle}
  color="#f59e0b"
/>
```

## Enhanced Metric Card System

### 1. Enhanced MetricCard Component

#### Single Metric Mode
```typescript
interface SingleMetricConfig {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  color?: string
  format?: "number" | "currency" | "percentage" | "text"
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  showTrend?: boolean
  dataSource: DataSourceConfig
}
```

#### Multi-Metric Mode
```typescript
interface MultiMetricConfig {
  layout: "small" | "medium" | "large" // 1, 2, or 3 metrics
  metrics: SingleMetricConfig[]
  layoutStyle: "grid" | "list" | "compact"
  showTitles: boolean
  showSubtitles: boolean
  showIcons: boolean
  colorScheme: "individual" | "unified" | "gradient"
}
```

#### Enhanced Props
```typescript
interface EnhancedMetricCardProps {
  // Configuration
  config: SingleMetricConfig | MultiMetricConfig
  mode: "single" | "multi"
  
  // Display
  size: "sm" | "md" | "lg" | "full"
  variant: "default" | "minimal" | "detailed"
  
  // Interaction
  isConfigurable: boolean
  isEditMode: boolean
  onConfigure?: () => void
  onUpdate?: (config: any) => void
  
  // Data
  dataSource: DataSourceConfig
  refreshInterval?: number
  showLoading?: boolean
  showError?: boolean
}
```

### 2. Data Source Configuration

#### Data Source Types
```typescript
type DataSourceType = 
  | "items"              // Item counts and status
  | "workflows"          // Workflow metrics
  | "stages"             // Stage-specific metrics
  | "users"              // User activity metrics
  | "orders"             // Order metrics
  | "quality"            // Quality metrics
  | "efficiency"         // Efficiency metrics
  | "capacity"           // Capacity metrics
  | "custom"             // Custom calculations
  | "external"           // External API data
```

#### Data Source Configuration
```typescript
interface DataSourceConfig {
  type: DataSourceType
  filters?: Record<string, any>
  parameters?: Record<string, any>
  calculation?: string
  timeRange?: string
  groupBy?: string
  aggregation?: "count" | "sum" | "average" | "min" | "max"
  refreshInterval?: number
}
```

#### Pre-configured Data Sources
```typescript
const PREDEFINED_DATA_SOURCES = {
  "active-items": {
    type: "items",
    filters: { status: "active" },
    aggregation: "count",
    title: "Active Items",
    subtitle: "Items in production",
    icon: "Package",
    color: "#3b82f6"
  },
  "items-needing-attention": {
    type: "items",
    filters: { needsAttention: true },
    aggregation: "count",
    title: "Need Attention",
    subtitle: "Items stuck in stages",
    icon: "AlertTriangle",
    color: "#f59e0b"
  },
  "completed-today": {
    type: "items",
    filters: { 
      status: "completed",
      completedAt: { $gte: "today" }
    },
    aggregation: "count",
    title: "Completed Today",
    subtitle: "Last 24 hours",
    icon: "CheckCircle",
    color: "#10b981"
  },
  "stage-distribution": {
    type: "stages",
    groupBy: "stageId",
    aggregation: "count",
    title: "Stage Distribution",
    subtitle: "Items by stage",
    icon: "BarChart3",
    color: "#8b5cf6"
  }
}
```

## Configuration Panel System

### 1. Data Source Selection Modal

#### Modal Structure
```typescript
interface DataSourceSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (dataSource: DataSourceConfig) => void
  currentConfig?: DataSourceConfig
  availableSources?: DataSourceType[]
}
```

#### Modal Content
```typescript
// Data Source Categories
const DATA_SOURCE_CATEGORIES = [
  {
    id: "production",
    title: "Production Metrics",
    icon: "Package",
    sources: ["active-items", "items-needing-attention", "completed-today", "stage-distribution"]
  },
  {
    id: "workflows",
    title: "Workflow Metrics",
    icon: "Workflow",
    sources: ["workflow-efficiency", "stage-completion", "bottleneck-analysis"]
  },
  {
    id: "quality",
    title: "Quality Metrics",
    icon: "CheckSquare",
    sources: ["defect-rate", "quality-score", "inspection-results"]
  },
  {
    id: "efficiency",
    title: "Efficiency Metrics",
    icon: "TrendingUp",
    sources: ["cycle-time", "throughput", "utilization"]
  },
  {
    id: "custom",
    title: "Custom Metrics",
    icon: "Settings",
    sources: ["custom-calculation", "external-api", "formula"]
  }
]
```

#### Selection Interface
```typescript
// Visual Data Source Picker
interface DataSourcePickerProps {
  categories: DataSourceCategory[]
  onSelect: (source: DataSourceConfig) => void
  currentSource?: DataSourceConfig
  showPreview?: boolean
}

// Data Source Card
interface DataSourceCardProps {
  source: DataSourceConfig
  isSelected: boolean
  onSelect: () => void
  showPreview?: boolean
}
```

### 2. Configuration Panel

#### Basic Configuration
```typescript
interface BasicConfigPanelProps {
  config: SingleMetricConfig
  onUpdate: (updates: Partial<SingleMetricConfig>) => void
  dataSource: DataSourceConfig
}
```

#### Configuration Fields
```typescript
const CONFIGURATION_FIELDS = [
  {
    key: "title",
    label: "Title",
    type: "string",
    required: true,
    placeholder: "e.g., Active Items"
  },
  {
    key: "subtitle",
    label: "Subtitle",
    type: "string",
    placeholder: "e.g., Items in production"
  },
  {
    key: "icon",
    label: "Icon",
    type: "icon-select",
    options: ["Package", "AlertTriangle", "CheckCircle", "Clock", "TrendingUp", "Users"]
  },
  {
    key: "color",
    label: "Color",
    type: "color-picker",
    defaultColors: ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#6b7280"]
  },
  {
    key: "format",
    label: "Value Format",
    type: "select",
    options: ["number", "currency", "percentage", "text"]
  },
  {
    key: "showTrend",
    label: "Show Trend",
    type: "boolean",
    defaultValue: false
  }
]
```

#### Advanced Configuration
```typescript
interface AdvancedConfigPanelProps {
  config: SingleMetricConfig
  onUpdate: (updates: Partial<SingleMetricConfig>) => void
  dataSource: DataSourceConfig
  onDataSourceChange: (dataSource: DataSourceConfig) => void
}
```

### 3. Multi-Metric Configuration

#### Layout Selection
```typescript
interface LayoutConfigPanelProps {
  config: MultiMetricConfig
  onUpdate: (updates: Partial<MultiMetricConfig>) => void
}

const LAYOUT_OPTIONS = [
  {
    id: "small",
    name: "Small (1 metric)",
    description: "Single metric display",
    width: "1/3",
    metrics: 1,
    preview: "SingleMetricPreview"
  },
  {
    id: "medium", 
    name: "Medium (2 metrics)",
    description: "Two metrics side by side",
    width: "1/2",
    metrics: 2,
    preview: "TwoMetricPreview"
  },
  {
    id: "large",
    name: "Large (3 metrics)", 
    description: "Three metrics in grid",
    width: "full",
    metrics: 3,
    preview: "ThreeMetricPreview"
  }
]
```

#### Metric Management
```typescript
interface MetricManagerProps {
  metrics: SingleMetricConfig[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, config: SingleMetricConfig) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  maxMetrics: number
}
```

## User Experience Flow

### 1. Initial Configuration

#### Step 1: Data Source Selection
1. **Open Configuration Modal**
   - Click "Configure" button on metric card
   - Modal opens with data source categories

2. **Browse Data Sources**
   - Visual cards for each data source
   - Live preview of data
   - Search and filter options

3. **Select Data Source**
   - Click on desired data source
   - Automatic configuration of title, icon, color
   - Option to customize

#### Step 2: Basic Configuration
1. **Edit Basic Settings**
   - Title and subtitle
   - Icon selection
   - Color customization
   - Value format

2. **Preview Changes**
   - Live preview of metric card
   - Real-time data display
   - Responsive sizing preview

#### Step 3: Save Configuration
1. **Save Settings**
   - Save to dashboard
   - Option to save as template
   - Share with team members

### 2. Reconfiguration

#### Quick Edit Mode
1. **Inline Editing**
   - Hover over metric card
   - Click edit icon
   - Quick title/subtitle edit

#### Full Configuration Mode
1. **Advanced Settings**
   - Change data source
   - Modify filters
   - Update calculations
   - Adjust styling

### 3. Multi-Metric Expansion

#### Expand to Multi-Metric
1. **Layout Selection**
   - Choose small (1), medium (2), or large (3) metrics
   - Preview layout options
   - Select desired width

2. **Add Additional Metrics**
   - Select data sources for new metrics
   - Configure each metric individually
   - Arrange metric order

3. **Layout Customization**
   - Choose grid or list layout
   - Adjust spacing and alignment
   - Set unified or individual colors

## Implementation Components

### 1. Enhanced MetricCard Component

```typescript
// components/widgets/MetricCardWidget.tsx
export function MetricCardWidget({ 
  config, 
  mode, 
  size, 
  isConfigurable, 
  isEditMode, 
  onConfigure, 
  onUpdate 
}: EnhancedMetricCardProps) {
  const { data, isLoading, error } = useMetricData(config.dataSource)
  
  if (mode === "single") {
    return <SingleMetricCard config={config} data={data} />
  } else {
    return <MultiMetricCard config={config} data={data} />
  }
}
```

### 2. Data Source Selection Modal

```typescript
// components/widgets/DataSourceSelectionModal.tsx
export function DataSourceSelectionModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentConfig 
}: DataSourceSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Data Source</DialogTitle>
          <DialogDescription>
            Choose what data this metric should display
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DATA_SOURCE_CATEGORIES.map(category => (
            <DataSourceCategory 
              key={category.id}
              category={category}
              onSelect={onSelect}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### 3. Configuration Panel

```typescript
// components/widgets/MetricConfigurationPanel.tsx
export function MetricConfigurationPanel({ 
  config, 
  onUpdate, 
  dataSource, 
  onDataSourceChange 
}: MetricConfigurationPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONFIGURATION_FIELDS.map(field => (
          <ConfigurationField
            key={field.key}
            field={field}
            value={config[field.key]}
            onChange={(value) => onUpdate({ [field.key]: value })}
          />
        ))}
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Data Source</h3>
        <DataSourceConfigurator
          dataSource={dataSource}
          onChange={onDataSourceChange}
        />
      </div>
    </div>
  )
}
```

## Data Integration

### 1. Data Source Hooks

```typescript
// hooks/useMetricData.ts
export function useMetricData(dataSource: DataSourceConfig) {
  const { orgId } = useOrg()
  
  return useQuery(api.metrics.getMetricData, {
    orgId,
    dataSource
  })
}
```

### 2. Convex Functions

```typescript
// convex/metrics.ts
export const getMetricData = query({
  args: { 
    orgId: v.string(),
    dataSource: v.any() // DataSourceConfig
  },
  handler: withOrg(async (ctx, args) => {
    const { dataSource } = args
    
    switch (dataSource.type) {
      case "items":
        return await getItemsMetric(ctx, dataSource)
      case "workflows":
        return await getWorkflowsMetric(ctx, dataSource)
      case "stages":
        return await getStagesMetric(ctx, dataSource)
      default:
        throw new Error(`Unknown data source type: ${dataSource.type}`)
    }
  })
})

async function getItemsMetric(ctx: any, dataSource: DataSourceConfig) {
  let query = ctx.db.query("items")
    .withIndex("by_org", (q) => q.eq("orgId", ctx.orgId))
  
  // Apply filters
  if (dataSource.filters) {
    for (const [key, value] of Object.entries(dataSource.filters)) {
      query = query.filter((q) => q.eq(q.field(key), value))
    }
  }
  
  const items = await query.collect()
  
  // Apply aggregation
  switch (dataSource.aggregation) {
    case "count":
      return { value: items.length }
    case "sum":
      return { value: items.reduce((sum, item) => sum + (item[dataSource.field] || 0), 0) }
    default:
      return { value: items.length }
  }
}
```

## UI/UX Design Guidelines

### 1. Neo-Industrial Aesthetic

#### Visual Design
- **Rectangular Components**: Clean, modular design
- **Consistent Spacing**: Uniform grid system
- **Icon Integration**: Extensive use of Lucide icons
- **Typography**: Clear hierarchy with italic subheadings
- **Color Scheme**: Blue accent colors with gray backgrounds

#### Interaction Design
- **Hover States**: Subtle shadows and color changes
- **Focus States**: Clear visual feedback
- **Loading States**: Skeleton loaders for data fetching
- **Error States**: Graceful error handling with retry options

### 2. Configuration Flow

#### Modal Design
- **Large Modals**: Ample space for configuration
- **Progressive Disclosure**: Show basic options first, advanced later
- **Live Preview**: Real-time preview of changes
- **Keyboard Navigation**: Full keyboard support

#### Data Source Selection
- **Visual Cards**: Large, clickable cards for each data source
- **Category Organization**: Logical grouping of data sources
- **Search and Filter**: Easy discovery of data sources
- **Smart Defaults**: Pre-configured options for common use cases

### 3. Responsive Design

#### Mobile Considerations
- **Touch-Friendly**: Large touch targets
- **Simplified Layout**: Stacked layout on mobile
- **Gesture Support**: Swipe to navigate between options
- **Offline Support**: Cache configurations locally

#### Desktop Enhancements
- **Keyboard Shortcuts**: Quick access to common actions
- **Drag and Drop**: Reorder metrics in multi-metric mode
- **Context Menus**: Right-click for additional options
- **Multi-Select**: Select multiple data sources at once

## Performance Considerations

### 1. Data Loading

#### Caching Strategy
- **Widget-Level Caching**: Cache data per widget configuration
- **Time-Based Invalidation**: Refresh data based on importance
- **Background Updates**: Update data without blocking UI
- **Optimistic Updates**: Show cached data while fetching fresh

#### Query Optimization
- **Indexed Queries**: Use proper database indexes
- **Pagination**: Load large datasets in chunks
- **Debounced Updates**: Prevent excessive API calls
- **Request Deduplication**: Combine identical requests

### 2. Rendering Performance

#### Component Optimization
- **Memoization**: Memoize expensive calculations
- **Virtual Scrolling**: For large metric lists
- **Lazy Loading**: Load components on demand
- **Code Splitting**: Split large components

#### State Management
- **Local State**: Keep configuration state local
- **Optimistic Updates**: Update UI immediately
- **Error Boundaries**: Graceful error handling
- **Loading States**: Show progress indicators

## Testing Strategy

### 1. Unit Tests

#### Component Testing
- **MetricCard Rendering**: Test different configurations
- **Data Source Selection**: Test selection flow
- **Configuration Panel**: Test form interactions
- **Multi-Metric Mode**: Test layout changes

#### Data Integration
- **Data Source Hooks**: Test data fetching
- **Query Functions**: Test Convex functions
- **Error Handling**: Test error scenarios
- **Caching**: Test cache behavior

### 2. Integration Tests

#### User Flows
- **Complete Configuration**: End-to-end configuration flow
- **Data Source Changes**: Test reconfiguration
- **Multi-Metric Expansion**: Test layout changes
- **Save and Load**: Test persistence

#### Cross-Component
- **Modal Integration**: Test modal interactions
- **Data Flow**: Test data passing between components
- **State Management**: Test state updates
- **Error Propagation**: Test error handling

### 3. E2E Tests

#### Real User Scenarios
- **Dashboard Configuration**: Complete dashboard setup
- **Metric Customization**: Customize existing metrics
- **Data Source Switching**: Change data sources
- **Multi-Metric Setup**: Create multi-metric cards

## Success Metrics

### 1. User Engagement
- **Configuration Completion Rate**: % of users who complete configuration
- **Time to Configure**: Average time to configure a metric
- **Reconfiguration Rate**: How often users change configurations
- **Template Usage**: Usage of saved templates

### 2. Performance Metrics
- **Load Time**: Time to display metric data
- **Configuration Speed**: Time to complete configuration
- **Error Rate**: % of failed configurations
- **Cache Hit Rate**: % of cached data usage

### 3. User Satisfaction
- **Ease of Use**: User feedback on configuration process
- **Data Accuracy**: User confidence in displayed data
- **Customization Satisfaction**: User satisfaction with customization options
- **Feature Adoption**: Usage of advanced features

## Future Enhancements

### 1. Advanced Features
- **Formula Builder**: Visual formula creation
- **Custom Calculations**: User-defined calculations
- **Data Blending**: Combine multiple data sources
- **Predictive Metrics**: AI-powered metric suggestions

### 2. Integration Features
- **External APIs**: Connect to external data sources
- **Webhook Support**: Real-time data updates
- **Export Options**: Export metric configurations
- **Sharing**: Share metric configurations

### 3. Analytics Features
- **Usage Analytics**: Track metric usage patterns
- **Performance Insights**: Identify slow metrics
- **Optimization Suggestions**: Suggest improvements
- **A/B Testing**: Test different configurations

This specification provides a comprehensive foundation for building a highly configurable, user-friendly metric card system that follows the established neo-industrial design patterns and integrates seamlessly with the existing application architecture.
