# Reports & Analytics Data Model

## Overview

The Reports & Analytics system provides comprehensive data analysis, performance metrics, and business intelligence capabilities. It aggregates data from all platform entities to generate insights, track performance, and support decision-making through automated reporting and real-time analytics.

## Core Entities

### 1. Report (Report Definition)

```typescript
reports: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  name: string,                   // Report name
  description?: string,           // Report description
  
  // Report Configuration
  type: "dashboard" | "scheduled" | "on_demand" | "automated",
  category: "production" | "quality" | "financial" | "operational" | "custom",
  template?: string,              // Report template ID
  
  // Report Content
  metrics: string[],              // Array of metric IDs to include
  filters: Array<{
    field: string,                // Field to filter on
    operator: "equals" | "contains" | "greater_than" | "less_than" | "between",
    value: any,                   // Filter value
  }>,
  dateRange?: {
    type: "relative" | "absolute" | "custom",
    startDate?: number,           // Start date timestamp
    endDate?: number,             // End date timestamp
    relativeDays?: number,        // Days relative to now
  },
  
  // Scheduling & Delivery
  schedule?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly",
    dayOfWeek?: number,           // For weekly reports (0-6)
    dayOfMonth?: number,          // For monthly reports (1-31)
    timeOfDay?: string,           // HH:MM format
    timezone: string,             // Timezone for scheduling
    recipients: string[],         // User IDs to receive report
    deliveryMethod: "email" | "in_app" | "both",
  },
  
  // Access & Permissions
  isPublic: boolean,              // Whether report is publicly accessible
  allowedRoles: string[],         // Roles that can access this report
  allowedUsers: string[],         // Specific users that can access
  
  // Status
  isActive: boolean,              // Whether report is active
  lastGenerated?: number,         // When report was last generated
  nextGeneration?: number,        // When report will be generated next
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
  createdBy: string,              // User who created the report
})
```

### 2. Metric (Metric Definition)

```typescript
metrics: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  name: string,                   // Metric name
  description?: string,           // Metric description
  
  // Metric Configuration
  category: "production" | "quality" | "financial" | "operational" | "custom",
  type: "count" | "sum" | "average" | "percentage" | "ratio" | "custom",
  unit?: string,                  // Unit of measurement
  
  // Calculation Definition
  formula: string,                // Calculation formula or query
  dataSource: string,             // Data source (table/entity)
  aggregation: "sum" | "count" | "average" | "min" | "max" | "custom",
  
  // Display Configuration
  displayFormat: "number" | "currency" | "percentage" | "duration" | "custom",
  decimalPlaces?: number,         // Number of decimal places
  colorScheme?: "green_red" | "blue_red" | "custom",
  
  // Thresholds & Alerts
  thresholds?: {
    warning: number,              // Warning threshold
    critical: number,             // Critical threshold
    target: number,               // Target value
  },
  
  // Status
  isActive: boolean,              // Whether metric is active
  isCalculated: boolean,          // Whether metric is calculated in real-time
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
  createdBy: string,
})
```

### 3. ReportExecution (Report Instance)

```typescript
reportExecutions: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  reportId: string,               // Reference to report definition
  
  // Execution Details
  executionType: "scheduled" | "manual" | "automated",
  status: "pending" | "running" | "completed" | "failed",
  startedAt: number,              // When execution started
  completedAt?: number,           // When execution completed
  
  // Results
  data?: any,                     // Report data/results
  summary?: {
    totalRecords: number,         // Total records processed
    executionTime: number,        // Execution time in milliseconds
    dataSize: number,             // Size of generated data
  },
  
  // Delivery
  deliveredTo: string[],          // Users who received the report
  deliveryStatus: "pending" | "delivered" | "failed",
  deliveredAt?: number,           // When report was delivered
  
  // Error Handling
  errorMessage?: string,          // Error message if failed
  retryCount: number,             // Number of retry attempts
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
})
```

### 4. Dashboard (Dashboard Definition)

```typescript
dashboards: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  name: string,                   // Dashboard name
  description?: string,           // Dashboard description
  
  // Dashboard Configuration
  layout: Array<{
    widgetId: string,             // Widget identifier
    type: "chart" | "metric" | "table" | "list" | "custom",
    position: {
      x: number,                  // X position
      y: number,                  // Y position
      width: number,              // Width in grid units
      height: number,             // Height in grid units
    },
    config: any,                  // Widget-specific configuration
  }>,
  
  // Access & Permissions
  isPublic: boolean,              // Whether dashboard is publicly accessible
  allowedRoles: string[],         // Roles that can access this dashboard
  allowedUsers: string[],         // Specific users that can access
  
  // Status
  isActive: boolean,              // Whether dashboard is active
  isDefault: boolean,             // Whether this is the default dashboard
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
  createdBy: string,
})
```

## Key Relationships

### 1. Report to Metrics
- **Many-to-Many**: Reports can include multiple metrics, metrics can be in multiple reports
- **Purpose**: Define what data is included in reports
- **Business Logic**: Metrics are calculated and aggregated for report generation

### 2. Report to ReportExecution
- **One-to-Many**: One report can have multiple executions
- **Purpose**: Track report generation history and results
- **Business Logic**: Each execution represents a specific report generation

### 3. Dashboard to Widgets
- **One-to-Many**: One dashboard can have multiple widgets
- **Purpose**: Organize metrics and charts in visual layouts
- **Business Logic**: Widgets display specific metrics or data visualizations

### 4. User to Reports/Dashboards
- **Many-to-Many**: Users can access multiple reports/dashboards
- **Purpose**: Control access to reporting data
- **Business Logic**: User permissions determine what reports they can view

## Metric Categories & Types

### Production Metrics
```typescript
interface ProductionMetrics {
  // Throughput Metrics
  itemsPerHour: number,           // Items completed per hour
  itemsPerDay: number,            // Items completed per day
  completionRate: number,         // Percentage of items completed
  
  // Efficiency Metrics
  cycleTime: number,              // Average time per item
  utilization: number,            // Resource utilization percentage
  efficiency: number,             // Overall efficiency rating
  
  // Capacity Metrics
  capacityUtilization: number,    // How much capacity is being used
  availableCapacity: number,      // Available production capacity
  bottleneckAnalysis: string[],   // Identified bottlenecks
}
```

### Quality Metrics
```typescript
interface QualityMetrics {
  // Defect Metrics
  defectRate: number,             // Percentage of defective items
  defectCount: number,            // Total number of defects
  defectTypes: Record<string, number>, // Defects by type
  
  // Quality Scores
  qualityScore: number,           // Overall quality score (0-100)
  firstPassYield: number,         // Items passing first inspection
  reworkRate: number,             // Percentage requiring rework
  
  // Inspection Metrics
  inspectionCount: number,        // Number of inspections performed
  inspectionPassRate: number,     // Inspection pass rate
  qualityTrends: Array<{          // Quality trends over time
    date: number,
    score: number,
  }>,
}
```

### Financial Metrics
```typescript
interface FinancialMetrics {
  // Revenue Metrics
  totalRevenue: number,           // Total revenue
  revenuePerItem: number,         // Average revenue per item
  revenueGrowth: number,          // Revenue growth percentage
  
  // Cost Metrics
  totalCost: number,              // Total production cost
  costPerItem: number,            // Average cost per item
  materialCost: number,           // Material costs
  laborCost: number,              // Labor costs
  
  // Profitability Metrics
  grossMargin: number,            // Gross margin percentage
  netProfit: number,              // Net profit
  profitMargin: number,           // Profit margin percentage
}
```

### Operational Metrics
```typescript
interface OperationalMetrics {
  // Order Metrics
  orderCount: number,             // Total number of orders
  orderValue: number,             // Total order value
  averageOrderValue: number,      // Average order value
  orderCompletionTime: number,    // Average order completion time
  
  // Workflow Metrics
  workflowEfficiency: number,     // Workflow efficiency rating
  stageCompletionTimes: Record<string, number>, // Time per stage
  workflowBottlenecks: string[],  // Identified bottlenecks
  
  // Team Metrics
  teamProductivity: Record<string, number>, // Productivity by team
  userActivity: Record<string, number>, // Activity by user
  workloadDistribution: Record<string, number>, // Workload distribution
}
```

## Report Templates

### Standard Report Templates
```typescript
const reportTemplates = [
  {
    id: "production-summary",
    name: "Production Summary",
    category: "production",
    metrics: ["itemsPerDay", "completionRate", "cycleTime", "utilization"],
    defaultSchedule: "daily",
  },
  {
    id: "quality-report",
    name: "Quality Report",
    category: "quality",
    metrics: ["defectRate", "qualityScore", "firstPassYield", "reworkRate"],
    defaultSchedule: "daily",
  },
  {
    id: "financial-summary",
    name: "Financial Summary",
    category: "financial",
    metrics: ["totalRevenue", "grossMargin", "costPerItem", "profitMargin"],
    defaultSchedule: "weekly",
  },
  {
    id: "operational-dashboard",
    name: "Operational Dashboard",
    category: "operational",
    metrics: ["orderCount", "workflowEfficiency", "teamProductivity"],
    defaultSchedule: "daily",
  },
]
```

## Data Access Patterns

### Report Access
- **Admin Users**: Full access to all reports and analytics
- **Manager Users**: Access to team and department reports
- **Operator Users**: Access to production and quality reports
- **Brand Users**: Access to order and progress reports

### Dashboard Access
- **Admin Users**: Full dashboard management and access
- **Manager Users**: Access to management dashboards
- **Operator Users**: Access to operational dashboards
- **Brand Users**: Access to brand-specific dashboards

## API Endpoints (Backend Implementation)

### Report Management
- `POST /api/reports` - Create new report
- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report details
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Report Execution
- `POST /api/reports/:id/execute` - Execute report manually
- `GET /api/reports/:id/executions` - Get report execution history
- `GET /api/reports/:id/executions/:executionId` - Get execution details
- `POST /api/reports/:id/schedule` - Schedule report execution

### Metric Management
- `POST /api/metrics` - Create new metric
- `GET /api/metrics` - List metrics
- `GET /api/metrics/:id` - Get metric details
- `PUT /api/metrics/:id` - Update metric
- `DELETE /api/metrics/:id` - Delete metric

### Dashboard Management
- `POST /api/dashboards` - Create new dashboard
- `GET /api/dashboards` - List dashboards
- `GET /api/dashboards/:id` - Get dashboard details
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard

### Analytics & Insights
- `GET /api/analytics/overview` - Get overview analytics
- `GET /api/analytics/production` - Get production analytics
- `GET /api/analytics/quality` - Get quality analytics
- `GET /api/analytics/financial` - Get financial analytics
- `GET /api/analytics/trends` - Get trend analysis

## Integration Points

### 1. Data Source Integration
- Real-time data aggregation from all entities
- Historical data analysis and trending
- Cross-entity data correlation
- Performance impact analysis

### 2. Notification Integration
- Automated alert generation based on thresholds
- Scheduled report delivery
- Real-time metric monitoring
- Exception reporting

### 3. User Integration
- User-specific dashboard customization
- Role-based report access
- User activity tracking
- Performance metrics by user

### 4. Workflow Integration
- Workflow performance analysis
- Bottleneck identification
- Efficiency optimization insights
- Process improvement recommendations

## Validation Rules

### Required Fields
- Report: name, type, category, metrics, isActive, createdBy
- Metric: name, category, type, formula, dataSource, isActive, createdBy
- Dashboard: name, layout, isActive, createdBy
- ReportExecution: reportId, executionType, status, startedAt

### Business Validations
- Report names must be unique within organization
- Metric formulas must be valid
- Dashboard layouts must be valid
- Report schedules must be valid

### Data Integrity
- Report ID must be unique
- Metric references must be valid
- Dashboard widget references must be valid
- Execution references must be valid

## Error Handling

### Common Error Scenarios
- Invalid metric formula
- Data source not found
- Report generation timeout
- Insufficient permissions
- Invalid dashboard layout

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Report/metric not found
- 408 Request Timeout: Report generation timeout
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Query Optimization
- Index reports by organization and category
- Cache frequently accessed metrics
- Optimize report generation queries
- Use materialized views for complex calculations

### Data Consistency
- Use transactions for report generation
- Validate metric calculations
- Maintain report execution integrity
- Ensure data freshness

### Scalability
- Partition reports by organization
- Archive old report executions
- Use read replicas for analytics queries
- Implement background report processing

### Real-time Analytics
- Optimize real-time metric calculations
- Implement metric caching strategies
- Use streaming data processing
- Monitor analytics performance
