export interface DashboardWidget {
  id: string
  type: string
  title: string
  position: number
  size: 'sm' | 'md' | 'lg' | 'xl'
  config: WidgetConfig
  dataSource?: DataSource
}

export interface WidgetConfig {
  [key: string]: any
  refreshInterval?: number // in seconds
  showTrend?: boolean
  showPercentage?: boolean
  colorScheme?: string
  displayMode?: 'card' | 'chart' | 'table' | 'list'
}

export interface DataSource {
  type: 'items' | 'workflows' | 'metrics' | 'activity' | 'custom'
  filters?: DataFilter[]
  aggregation?: AggregationConfig
  timeRange?: TimeRange
}

export interface DataFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'notIn'
  value: any
}

export interface AggregationConfig {
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'groupBy'
  field?: string
  groupBy?: string[]
}

export interface TimeRange {
  type: 'last24h' | 'last7d' | 'last30d' | 'last90d' | 'custom'
  start?: Date
  end?: Date
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: DashboardWidget[]
  createdAt: Date
  updatedAt: Date
  isDefault?: boolean
}

export interface WidgetTemplate {
  type: string
  name: string
  description: string
  icon: string
  defaultConfig: WidgetConfig
  defaultDataSource?: DataSource
  category: 'metrics' | 'visualization' | 'activity' | 'management'
}

export interface DataSourceTemplate {
  type: string
  name: string
  description: string
  availableFields: string[]
  defaultFilters?: DataFilter[]
  supportedAggregations: AggregationConfig['type'][]
}
