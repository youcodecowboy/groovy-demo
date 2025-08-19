# Items Data Model

## Overview

Items are the individual units being produced in the manufacturing process. Each item represents a single product (e.g., one garment, one accessory) that moves through production stages according to its assigned workflow. Items are created from orders and track their progress through the production lifecycle.

## Core Entity: Item

### Primary Table Structure

```typescript
items: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  itemId: string,                 // Human-readable item ID (e.g., "ITEM-2024-001")
  
  // Relationships
  workflowId: string,             // Workflow governing this item's production
  purchaseOrderId?: string,       // Order this item belongs to
  brandId?: string,               // Brand that owns this item
  factoryId?: string,             // Factory producing this item
  
  // Current State
  currentStageId: string,         // Current stage in workflow
  status: "active" | "paused" | "error" | "completed",
  
  // Item Specifications
  itemTypeId?: string,            // Type definition for this item
  attributes?: Array<{            // Custom attributes
    attributeId: string,
    value: any,
    lastUpdated: number,
    updatedBy: string,
  }>,
  metadata?: any,                 // Flexible metadata object
  
  // QR Code & Tracking
  qrCode?: string,                // QR code data for scanning
  qrPrinted?: boolean,            // Whether QR has been printed
  qrPrintedAt?: number,           // When QR was printed
  qrPrintedBy?: string,           // Who printed the QR
  
  // Location & Assignment
  currentLocationId?: string,     // Current physical location
  assignedTo?: string,            // User assigned to this item
  
  // Quality & Issues
  isDefective?: boolean,          // Quality flag
  defectNotes?: string,           // Defect description
  flaggedBy?: string,             // User who flagged the item
  flaggedAt?: number,             // When item was flagged
  
  // Timestamps
  startedAt: number,              // When production started
  updatedAt: number,              // Last update timestamp
  completedAt?: number,           // When production completed
  
  // Production History
  history?: Array<{               // Stage progression history
    fromStageId: string,
    toStageId: string,
    timestamp: number,
    userId: string,
    completedActions?: Array<{    // Actions completed at this stage
      actionId: string,
      type: string,
      data: any,
      timestamp: number,
    }>,
    notes?: string,
  }>,
})
```

## Key Relationships

### 1. Order Relationship
- **Many-to-One**: Multiple items can belong to one order
- **Optional**: Items can exist without orders (manual creation)
- **Purpose**: Groups items for batch processing and reporting
- **Business Logic**: Items inherit order specifications and workflow

### 2. Workflow Relationship
- **Many-to-One**: Multiple items can follow the same workflow
- **Required**: Every item must have an assigned workflow
- **Purpose**: Defines production stages and actions for the item
- **Business Logic**: Items progress through workflow stages sequentially

### 3. Brand Relationship
- **Many-to-One**: Multiple items can belong to one brand
- **Optional**: Items can exist without brand association
- **Purpose**: Enables brand-specific data isolation
- **Business Logic**: Brand users can only see their own items

### 4. Factory Relationship
- **Many-to-One**: Multiple items can be produced at one factory
- **Optional**: Items can exist without factory assignment
- **Purpose**: Determines production location and team
- **Business Logic**: Factory users can only see items at their factory

### 5. Location Relationship
- **Many-to-One**: Multiple items can be at one location
- **Optional**: Items can exist without location assignment
- **Purpose**: Tracks physical location during production
- **Business Logic**: Location determines available workflow stages

### 6. User Relationship
- **Many-to-One**: Multiple items can be assigned to one user
- **Optional**: Items can exist without user assignment
- **Purpose**: Tracks responsibility and workload
- **Business Logic**: Users can only work on assigned items

## Item Lifecycle

### 1. Item Creation
```
Order Accepted → Items Created → QR Codes Generated → Production Starts
```

### 2. Production Flow
```
Stage 1 → Actions Completed → Stage 2 → Actions Completed → ... → Final Stage
```

### 3. Completion States
```
Completed → Quality Check → Defective (if issues) → Rework or Scrap
```

## Status Management

### Status Transitions
```
active → paused (manual pause)
active → error (system error)
active → completed (all stages done)
paused → active (resume)
error → active (error resolved)
```

### Status Definitions
- **active**: Item is currently in production
- **paused**: Production temporarily halted
- **error**: System error or validation failure
- **completed**: All workflow stages completed

## Stage Progression

### Stage Advancement Rules
1. All required actions must be completed
2. Stage must be in allowed next stages list
3. Location constraints must be satisfied
4. User permissions must be verified

### Stage History Tracking
- Record stage transitions with timestamps
- Track completed actions at each stage
- Maintain user attribution for changes
- Store stage-specific notes and data

## QR Code Management

### QR Code Generation
- Unique QR codes for each item
- Contains item identifier and metadata
- Enables mobile scanning and tracking
- Supports offline operation

### QR Code Usage
- Scan to identify item
- Scan to advance stages
- Scan to record actions
- Scan for location updates

## Quality Management

### Defect Tracking
- Flag items as defective
- Record defect descriptions
- Track defect resolution
- Generate quality reports

### Quality Actions
- Rework defective items
- Scrap unusable items
- Update order progress
- Notify relevant parties

## Data Access Patterns

### Brand Users
- Can view only their own items
- Can track item progress through stages
- Cannot modify item data
- Can communicate about items

### Factory Users
- Can view items at their factory
- Can advance items through stages
- Can record actions and notes
- Can flag quality issues

### Admin Users
- Can view all items
- Can modify item assignments
- Can override item status
- Can access item analytics

## API Endpoints (Backend Implementation)

### Core CRUD Operations
- `POST /api/items` - Create new item
- `GET /api/items` - List items (with filters)
- `GET /api/items/:id` - Get item details
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Production Operations
- `POST /api/items/:id/advance` - Advance to next stage
- `POST /api/items/:id/actions` - Record action completion
- `PUT /api/items/:id/assign` - Assign to user
- `PUT /api/items/:id/location` - Update location

### Quality Operations
- `POST /api/items/:id/flag` - Flag as defective
- `POST /api/items/:id/rework` - Send for rework
- `POST /api/items/:id/scrap` - Mark as scrap
- `PUT /api/items/:id/quality` - Update quality status

### QR Code Operations
- `POST /api/items/:id/qr` - Generate QR code
- `POST /api/items/:id/qr/print` - Mark QR as printed
- `GET /api/items/qr/:qrCode` - Get item by QR code
- `POST /api/items/scan` - Process QR scan

### Batch Operations
- `POST /api/items/batch/create` - Create multiple items
- `POST /api/items/batch/advance` - Advance multiple items
- `POST /api/items/batch/assign` - Assign multiple items
- `GET /api/items/batch/progress` - Get batch progress

## Integration Points

### 1. Order Integration
- Items created from orders inherit order data
- Item progress updates order progress
- Order completion depends on item completion
- Item defects affect order quality metrics

### 2. Workflow Integration
- Items follow assigned workflow stages
- Stage actions are validated against workflow
- Workflow changes don't affect active items
- Item completion validates workflow completion

### 3. Material Integration
- Items consume materials during production
- Material movements are linked to items
- Item costs include material consumption
- Material shortages can pause item production

### 4. Location Integration
- Items move between locations during production
- Location determines available stages
- Location capacity affects item assignment
- Location changes trigger notifications

### 5. User Integration
- Users are assigned to specific items
- User actions are tracked and audited
- User workload affects item assignment
- User performance affects item metrics

## Validation Rules

### Required Fields
- itemId (unique within organization)
- workflowId (valid workflow)
- currentStageId (valid stage in workflow)
- status (valid status value)
- startedAt (timestamp)

### Business Validations
- Stage must exist in assigned workflow
- Status transitions must be valid
- Location must support current stage
- User must have permission for stage

### Data Integrity
- Item ID must be unique
- Workflow must be active
- Stage must be active in workflow
- Location must exist and be active

## Error Handling

### Common Error Scenarios
- Invalid stage advancement
- Missing required actions
- Location not found
- User permission denied
- Workflow validation failed
- QR code generation failed

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Item/stage not found
- 409 Conflict: Invalid state transitions
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Query Optimization
- Index items by organization, status, and stage
- Cache frequently accessed item data
- Optimize stage progression queries
- Use pagination for large item lists

### Data Consistency
- Use transactions for stage changes
- Validate workflow constraints
- Maintain item history integrity
- Ensure QR code uniqueness

### Scalability
- Partition items by organization
- Archive completed items after retention period
- Use read replicas for reporting
- Implement background processing for heavy operations

## Analytics & Reporting

### Item Metrics
- Production time per item
- Stage completion times
- Quality defect rates
- User productivity metrics

### Batch Analytics
- Order completion rates
- Batch processing efficiency
- Material consumption patterns
- Location utilization rates

### Performance Tracking
- Workflow efficiency analysis
- Bottleneck identification
- Resource optimization
- Capacity planning data
