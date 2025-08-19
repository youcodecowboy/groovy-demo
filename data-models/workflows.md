# Workflows Data Model

## Overview

Workflows are the production rule engines that define how items move through manufacturing processes. They consist of stages, actions, and business logic that govern the production lifecycle. Workflows are assigned to orders and determine the production path that items follow.

## Core Entity: Workflow

### Primary Table Structure

```typescript
workflows: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  name: string,                   // Human-readable workflow name
  description?: string,           // Detailed description
  
  // Workflow Configuration
  stages: Array<{
    id: string,                   // Unique stage identifier
    name: string,                 // Stage name (e.g., "Cut", "Sew", "QC")
    description?: string,         // Stage description
    order: number,                // Sequential order in workflow
    isActive: boolean,            // Whether stage is active
    
    // Stage Actions
    actions?: Array<{
      id: string,                 // Unique action identifier
      type: "scan" | "photo" | "note" | "approval" | "measurement" | "inspection",
      label: string,              // Human-readable action label
      description?: string,       // Action description
      required: boolean,          // Whether action is mandatory
      config?: any,               // Action-specific configuration
    }>,
    
    // Stage Properties
    estimatedDuration?: number,   // Estimated time in minutes
    allowedNextStageIds?: string[], // Valid next stages
    assignedLocationIds?: string[], // Locations where stage can be performed
    color?: string,               // UI color for stage
    position?: {                  // Canvas position for workflow builder
      x: number,
      y: number,
    },
  }>,
  
  // Workflow Status
  isActive: boolean,              // Whether workflow is active
  isTemplate: boolean,            // Whether this is a reusable template
  
  // Metadata
  category?: string,              // Workflow category (e.g., "garment", "accessory")
  version?: string,               // Workflow version
  tags?: string[],                // Searchable tags
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
  createdBy: string,              // User who created the workflow
})
```

## Key Relationships

### 1. Orders Relationship
- **One-to-Many**: One workflow can govern multiple orders
- **Required**: Every order must have an associated workflow
- **Purpose**: Defines production rules and stages for order items
- **Business Logic**: Items created from orders inherit the order's workflow

### 2. Items Relationship
- **One-to-Many**: One workflow can have multiple items in production
- **Implementation**: Items table has workflowId field
- **Purpose**: Items follow workflow stages and actions
- **Business Logic**: Items progress through workflow stages sequentially

### 3. Locations Relationship
- **Many-to-Many**: Workflow stages can be performed at multiple locations
- **Implementation**: Through assignedLocationIds array in stages
- **Purpose**: Defines where each stage can be performed
- **Business Logic**: Items can only advance to stages available at their current location

### 4. Users Relationship
- **Many-to-Many**: Users can work on items in different workflow stages
- **Implementation**: Through item assignment and stage permissions
- **Purpose**: Controls who can perform actions at each stage
- **Business Logic**: Users can only work on stages they have permission for

## Stage Configuration

### Stage Types

#### 1. Linear Stages
```typescript
{
  order: 0,
  allowedNextStageIds: ["stage-1"],
  // Items must complete this stage before moving to next
}
```

#### 2. Parallel Stages
```typescript
{
  order: 1,
  allowedNextStageIds: ["stage-2a", "stage-2b"],
  // Items can move to either stage after completion
}
```

#### 3. Conditional Stages
```typescript
{
  order: 2,
  allowedNextStageIds: ["stage-3a", "stage-3b"],
  // Next stage depends on action results or item properties
}
```

### Action Types

#### 1. Scan Actions
```typescript
{
  type: "scan",
  label: "Scan QR Code",
  required: true,
  config: {
    scanType: "qr",
    expectedValue: "item:",
    validation: "exact_match"
  }
}
```

#### 2. Photo Actions
```typescript
{
  type: "photo",
  label: "Take Quality Photo",
  required: false,
  config: {
    photoCount: 2,
    minResolution: "1920x1080",
    requiredAngles: ["front", "back"]
  }
}
```

#### 3. Note Actions
```typescript
{
  type: "note",
  label: "Add Assembly Notes",
  required: false,
  config: {
    notePrompt: "Enter assembly notes...",
    maxLength: 200,
    allowAttachments: true
  }
}
```

#### 4. Approval Actions
```typescript
{
  type: "approval",
  label: "Quality Approval",
  required: true,
  config: {
    approverRole: "supervisor",
    autoApprove: false,
    requireComments: true
  }
}
```

#### 5. Measurement Actions
```typescript
{
  type: "measurement",
  label: "Measure Dimensions",
  required: true,
  config: {
    measurements: ["length", "width", "height"],
    unit: "mm",
    tolerance: 2
  }
}
```

#### 6. Inspection Actions
```typescript
{
  type: "inspection",
  label: "Quality Inspection",
  required: true,
  config: {
    checklist: ["stitching", "fabric", "finishing"],
    passCriteria: "all_required",
    allowPartialPass: false
  }
}
```

## Workflow Lifecycle

### 1. Workflow Creation
- Define stages and their order
- Configure actions for each stage
- Set stage locations and permissions
- Test workflow with sample items

### 2. Workflow Assignment
- Assign workflow to orders
- Items inherit workflow configuration
- Stage progression rules are enforced
- Action requirements are validated

### 3. Workflow Execution
- Items progress through stages sequentially
- Actions must be completed before stage advancement
- Stage transitions are validated
- Progress is tracked and reported

### 4. Workflow Maintenance
- Update stage configurations
- Add/remove stages as needed
- Modify action requirements
- Version control for workflow changes

## Business Rules & Constraints

### 1. Stage Progression
- Items must complete all required actions before advancing
- Stage order must be respected
- Only allowed next stages can be accessed
- Location constraints must be satisfied

### 2. Action Completion
- Required actions must be completed
- Action data must meet validation criteria
- User permissions must be verified
- Action timestamps are recorded

### 3. Workflow Validation
- Workflow must have at least one stage
- Stage order must be sequential
- Action configurations must be valid
- Location assignments must exist

### 4. Template Management
- Templates can be copied to create new workflows
- Template changes don't affect active workflows
- Workflow versions maintain backward compatibility
- Deprecated workflows are marked inactive

## Data Access Patterns

### Workflow Management
- Admin users can create/modify workflows
- Factory users can view assigned workflows
- Brand users see workflow progress through items
- System enforces workflow rules automatically

### Stage Operations
- Users can only access assigned stages
- Stage actions are role-based
- Location constraints limit stage access
- Progress tracking is automatic

### Template Usage
- Templates are shared across organization
- Custom workflows can be created from templates
- Template library supports reuse
- Version control maintains history

## API Endpoints (Backend Implementation)

### Core CRUD Operations
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow details
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Stage Management
- `POST /api/workflows/:id/stages` - Add stage
- `PUT /api/workflows/:id/stages/:stageId` - Update stage
- `DELETE /api/workflows/:id/stages/:stageId` - Remove stage
- `PUT /api/workflows/:id/stages/reorder` - Reorder stages

### Action Management
- `POST /api/workflows/:id/stages/:stageId/actions` - Add action
- `PUT /api/workflows/:id/stages/:stageId/actions/:actionId` - Update action
- `DELETE /api/workflows/:id/stages/:stageId/actions/:actionId` - Remove action

### Template Operations
- `POST /api/workflows/templates` - Create template
- `GET /api/workflows/templates` - List templates
- `POST /api/workflows/:id/clone` - Clone workflow
- `POST /api/workflows/:id/version` - Create new version

### Execution Tracking
- `GET /api/workflows/:id/progress` - Get workflow progress
- `GET /api/workflows/:id/items` - Get items in workflow
- `GET /api/workflows/:id/analytics` - Get workflow analytics

## Integration Points

### 1. Order Integration
- Orders specify which workflow to use
- Workflow assignment happens at order acceptance
- Workflow changes don't affect active orders
- Order completion depends on workflow completion

### 2. Item Integration
- Items follow assigned workflow stages
- Stage progression updates item status
- Action completion is recorded on items
- Workflow completion marks item as done

### 3. Location Integration
- Stages are assigned to specific locations
- Location constraints control stage access
- Item location determines available stages
- Location changes may affect workflow progression

### 4. User Integration
- User roles determine stage access
- Action permissions are role-based
- User actions are tracked and audited
- Workflow assignments consider user capabilities

## Validation Rules

### Required Fields
- name (non-empty string)
- stages array (non-empty)
- isActive (boolean)
- createdBy (valid user ID)

### Stage Validations
- Each stage must have unique ID
- Stage order must be sequential
- Stage names must be non-empty
- Action configurations must be valid

### Action Validations
- Action types must be supported
- Required actions must have valid configs
- Action IDs must be unique within stage
- Action labels must be descriptive

### Business Validations
- Workflow must have entry and exit stages
- Stage transitions must be valid
- Location assignments must exist
- User permissions must be verified

## Error Handling

### Common Error Scenarios
- Invalid stage order
- Missing required actions
- Invalid action configurations
- Location not found
- User permission denied
- Circular stage dependencies

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Workflow/stage not found
- 409 Conflict: Invalid state transitions
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Query Optimization
- Index workflow lookups by organization
- Cache frequently accessed workflows
- Optimize stage progression queries
- Use pagination for large workflow lists

### Data Consistency
- Use transactions for workflow updates
- Validate stage dependencies
- Maintain workflow version history
- Ensure action data integrity

### Scalability
- Partition workflows by organization
- Archive inactive workflows
- Use read replicas for analytics
- Implement background validation jobs
