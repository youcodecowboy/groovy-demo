# Orders Data Model

## Overview

Orders (Purchase Orders) are the central entity that governs production workflows in the Groovy platform. They represent the contractual agreement between brands and factories, define production rules through workflow associations, and manage both individual items and batch operations.

## Core Entity: PurchaseOrder

### Primary Table Structure

```typescript
purchaseOrders: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  poNumber: string,               // Human-readable PO number (e.g., "PO-2024-001")
  
  // Ownership & Relationships
  brandId: string,                // Brand that placed the order
  factoryId: string,              // Factory fulfilling the order
  workflowId: string,             // Workflow that governs this order's production
  
  // Order Status & Lifecycle
  status: "pending" | "accepted" | "rejected" | "in_production" | "paused" | "completed" | "cancelled",
  submittedAt: number,            // Timestamp when order was submitted
  acceptedAt?: number,            // Timestamp when factory accepted
  acceptedBy?: string,            // User ID who accepted the order
  productionStartDate?: number,   // When production actually began
  completedAt?: number,           // When order was completed
  completedBy?: string,           // User who marked as completed
  
  // Order Items & Specifications
  items: Array<{
    sku: string,                  // Stock keeping unit
    quantity: number,             // Number of items to produce
    description: string,          // Human-readable description
    specifications?: any,         // Technical specifications (JSON)
    unitPrice?: number,           // Price per unit
    variant?: string,             // Product variant (size, color, etc.)
    size?: string,                // Specific size
    color?: string,               // Specific color
  }>,
  
  // Financial Information
  totalValue: number,             // Total order value
  paymentTerms?: string,          // Payment terms (e.g., "Net 30")
  
  // Delivery & Timeline
  requestedDeliveryDate: number,  // Brand's requested delivery date
  promisedDeliveryDate?: number,  // Factory's promised delivery date
  
  // Progress Tracking
  progress?: {
    totalItems: number,           // Total items in order
    completedItems: number,       // Items completed
    defectiveItems: number,       // Items marked as defective
    reworkItems: number,          // Items sent for rework
    lastUpdated: number,          // Last progress update timestamp
  },
  
  // Financial Tracking
  financials?: {
    orderValue: number,           // Original order value
    estimatedLaborCost?: number,  // Estimated labor costs
    actualLaborCost?: number,     // Actual labor costs incurred
    actualMaterialsCost?: number, // Actual materials cost
    overheads?: number,           // Overhead costs
    grossMargin?: number,         // Calculated gross margin
    paymentsReceived: Array<{     // Payment history
      amount: number,
      date: number,
      method: string,
      reference: string,
    }>,
    totalPaid: number,            // Total payments received
  },
  
  // Lead Time Tracking
  leadTime?: {
    promisedDays: number,         // Promised lead time in days
    actualDays?: number,          // Actual lead time in days
    status?: "ahead" | "on_track" | "behind",
  },
  
  // Assignment & Ownership
  assignedTeam?: string,          // Team assigned to this order
  orderOwner?: string,            // Primary owner/manager
  
  // Communication & Documentation
  notes?: string,                 // General notes
  attachments?: Array<{           // File attachments
    name: string,
    url: string,
    type: string,
    uploadedAt: number,
    uploadedBy: string,
  }>,
  
  // Metadata & Extensibility
  metadata?: any,                 // Flexible metadata object
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
})
```

## Key Relationships

### 1. Brand Relationship
- **One-to-Many**: One brand can have multiple orders
- **Required**: Every order must belong to a brand
- **Purpose**: Enables brand-specific data isolation and reporting
- **Access Control**: Brands can only see their own orders

### 2. Factory Relationship
- **One-to-Many**: One factory can fulfill multiple orders
- **Required**: Every order must be assigned to a factory
- **Purpose**: Determines production location and team assignment
- **Access Control**: Factory users can see all orders assigned to their factory

### 3. Workflow Relationship
- **One-to-Many**: One workflow can govern multiple orders
- **Required**: Every order must have an associated workflow
- **Purpose**: Defines the production stages, actions, and rules for items in this order
- **Business Logic**: When items are created from an order, they inherit the order's workflow

### 4. Materials Relationship
- **Many-to-Many**: Orders can consume multiple materials, materials can be used in multiple orders
- **Implementation**: Through MaterialMovements table with orderId reference
- **Purpose**: Track material consumption, costs, and inventory allocation
- **Business Logic**: Materials are issued to orders as items progress through production

### 5. Items Relationship
- **One-to-Many**: One order can contain multiple individual items
- **Implementation**: Items table has purchaseOrderId field
- **Purpose**: Track individual item progress through production stages
- **Business Logic**: Items are created when order is accepted, follow order's workflow

## Status Lifecycle

### Order Status Flow
```
pending → accepted → in_production → completed
    ↓         ↓           ↓
  rejected  paused    cancelled
```

### Status Definitions
- **pending**: Order submitted by brand, awaiting factory acceptance
- **accepted**: Factory has accepted the order, items can be created
- **in_production**: Production has started, items are being processed
- **paused**: Production temporarily halted (can resume)
- **completed**: All items in order have been completed
- **rejected**: Factory declined the order
- **cancelled**: Order cancelled after acceptance (cannot resume)

## Business Rules & Constraints

### 1. Order Creation
- Only brands can create orders
- Order must specify brand, factory, and workflow
- All required item specifications must be provided
- Total value must be calculated from items

### 2. Order Acceptance
- Only factory admins can accept orders
- Acceptance triggers item creation
- Items inherit order's workflow and specifications
- Production timeline begins

### 3. Progress Tracking
- Progress updates automatically as items move through stages
- Defective items are tracked separately
- Rework items are tracked for quality metrics
- Progress affects order status

### 4. Financial Tracking
- Material costs are tracked through MaterialMovements
- Labor costs are estimated and actualized
- Payment tracking maintains cash flow visibility
- Gross margin calculations inform profitability

### 5. Lead Time Management
- Promised lead time is set during acceptance
- Actual lead time calculated from acceptance to completion
- Status indicators help identify delays
- Affects brand satisfaction metrics

## Data Access Patterns

### Brand Users
- Can view only their own orders
- Can create new orders to connected factories
- Can track progress and communicate with factory
- Cannot see internal factory operations

### Factory Users
- Can view all orders assigned to their factory
- Can accept/reject pending orders
- Can update order progress and status
- Can communicate with brand about order

### Admin Users
- Can view all orders across all factories
- Can manage order assignments and workflows
- Can access financial and performance reports
- Can override order status if needed

## Indexes for Performance

```typescript
// Primary indexes for common queries
.index("by_brand", ["brandId"])
.index("by_factory", ["factoryId"])
.index("by_status", ["status"])
.index("by_workflow", ["workflowId"])
.index("by_date_range", ["submittedAt", "requestedDeliveryDate"])

// Composite indexes for complex queries
.index("by_brand_status", ["brandId", "status"])
.index("by_factory_status", ["factoryId", "status"])
.index("by_date_status", ["submittedAt", "status"])
```

## API Endpoints (Backend Implementation)

### Core CRUD Operations
- `POST /api/orders` - Create new order
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Business Operations
- `POST /api/orders/:id/accept` - Accept order
- `POST /api/orders/:id/reject` - Reject order
- `POST /api/orders/:id/pause` - Pause production
- `POST /api/orders/:id/resume` - Resume production
- `POST /api/orders/:id/complete` - Mark as completed

### Progress & Financial
- `PUT /api/orders/:id/progress` - Update progress
- `POST /api/orders/:id/payments` - Record payment
- `GET /api/orders/:id/financials` - Get financial summary
- `GET /api/orders/:id/items` - Get order items

### Reporting
- `GET /api/orders/reports/performance` - Performance metrics
- `GET /api/orders/reports/financial` - Financial reports
- `GET /api/orders/reports/lead-time` - Lead time analysis

## Integration Points

### 1. Item Creation
When an order is accepted, the system should:
- Create individual items for each item in the order
- Assign the order's workflow to each item
- Set initial stage to workflow's entry stage
- Link items to the order via purchaseOrderId

### 2. Material Management
Order processing should:
- Reserve materials based on item specifications
- Track material consumption through MaterialMovements
- Update inventory levels automatically
- Calculate material costs for financial tracking

### 3. Workflow Execution
Items from orders should:
- Follow the order's assigned workflow
- Track progress through workflow stages
- Update order progress as items complete stages
- Trigger notifications for stage completions

### 4. Communication System
Orders should integrate with:
- Brand-factory messaging system
- Status change notifications
- Progress update alerts
- File attachment handling

## Validation Rules

### Required Fields
- brandId, factoryId, workflowId
- poNumber (unique within organization)
- items array (non-empty)
- totalValue (positive number)
- requestedDeliveryDate (future date)

### Business Validations
- Brand must have active relationship with factory
- Workflow must be active and valid
- Item quantities must be positive integers
- Total value must match sum of item values
- Requested delivery date must be reasonable

### Status Transitions
- Only pending orders can be accepted/rejected
- Only accepted/in_production orders can be paused
- Only paused orders can be resumed
- Only in_production orders can be completed
- Cancelled orders cannot be modified

## Error Handling

### Common Error Scenarios
- Invalid brand-factory relationship
- Workflow not found or inactive
- Insufficient material inventory
- Invalid status transitions
- Duplicate PO numbers
- Past delivery dates

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Order not found
- 409 Conflict: Status transition not allowed
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Query Optimization
- Use indexes for common filter combinations
- Paginate large result sets
- Cache frequently accessed order data
- Optimize progress calculation queries

### Data Consistency
- Use transactions for status changes
- Implement optimistic locking for concurrent updates
- Maintain audit trails for all changes
- Validate data integrity constraints

### Scalability
- Partition orders by organization
- Archive completed orders after retention period
- Use read replicas for reporting queries
- Implement background job processing for heavy operations
