# Disco System Data Model

## Overview

The Disco system is a mobile-first, QR-scanning focused interface designed for floor operations. It provides a streamlined, touch-friendly interface for workers to scan items, complete workflow actions, and track production progress in real-time. The system emphasizes speed, simplicity, and efficiency for field operations.

## Core Entities

### 1. DiscoSession (Active Work Session)

```typescript
discoSessions: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  
  // Session Management
  userId: string,                 // User running the session
  deviceId?: string,              // Device identifier
  locationId?: string,            // Current location
  teamId?: string,                // Current team assignment
  
  // Session State
  isActive: boolean,              // Whether session is active
  startedAt: number,              // When session started
  lastActivityAt: number,         // Last activity timestamp
  endedAt?: number,               // When session ended
  
  // Current Context
  currentItemId?: string,         // Currently scanned item
  currentStageId?: string,        // Current workflow stage
  currentWorkflowId?: string,     // Current workflow
  
  // Session Metrics
  itemsProcessed: number,         // Items processed this session
  actionsCompleted: number,       // Actions completed this session
  sessionDuration: number,        // Session duration in minutes
  
  // Device & Environment
  deviceInfo?: {
    platform: "ios" | "android" | "web",
    version: string,
    screenSize: string,
    orientation: "portrait" | "landscape",
  },
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
})
```

### 2. DiscoScan (QR Code Scans)

```typescript
discoScans: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  
  // Scan Details
  sessionId: string,              // Reference to disco session
  userId: string,                 // User who performed scan
  scanType: "item" | "location" | "user" | "action",
  
  // Scanned Data
  qrCode: string,                 // Raw QR code data
  scannedValue: string,           // Parsed/validated value
  scanResult: "success" | "error" | "invalid",
  
  // Context Information
  itemId?: string,                // Related item (if item scan)
  locationId?: string,            // Related location (if location scan)
  actionId?: string,              // Related action (if action scan)
  
  // Scan Metadata
  scanTime: number,               // When scan occurred
  processingTime: number,         // Time to process scan (ms)
  errorMessage?: string,          // Error message if failed
  
  // Device Information
  deviceInfo?: {
    platform: string,
    camera: string,
    gps?: { lat: number, lng: number },
    accuracy?: number,
  },
  
  // Audit Fields
  createdAt: number,
})
```

### 3. DiscoAction (Workflow Actions)

```typescript
discoActions: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  
  // Action Details
  sessionId: string,              // Reference to disco session
  userId: string,                 // User performing action
  itemId: string,                 // Item being acted upon
  workflowId: string,             // Workflow context
  stageId: string,                // Stage context
  
  // Action Configuration
  actionType: "scan" | "photo" | "note" | "approval" | "measurement" | "inspection",
  actionId: string,               // Specific action identifier
  label: string,                  // Human-readable action label
  required: boolean,              // Whether action is required
  
  // Action Data
  data?: any,                     // Action-specific data
  photos?: Array<{                // Photos taken
    url: string,
    timestamp: number,
    metadata?: any,
  }>,
  notes?: string,                 // Notes entered
  measurements?: Array<{          // Measurements taken
    type: string,
    value: number,
    unit: string,
  }>,
  
  // Action Status
  status: "pending" | "completed" | "skipped" | "failed",
  completedAt?: number,           // When action was completed
  duration?: number,              // Time to complete action (ms)
  
  // Validation
  validationResult?: {
    passed: boolean,
    errors?: string[],
    warnings?: string[],
  },
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
})
```

### 4. DiscoQueue (Item Queue Management)

```typescript
discoQueues: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  
  // Queue Configuration
  name: string,                   // Queue name
  locationId?: string,            // Location for queue
  teamId?: string,                // Team assigned to queue
  workflowId?: string,            // Workflow for queue items
  
  // Queue State
  items: Array<{
    itemId: string,               // Item in queue
    priority: "low" | "normal" | "high" | "urgent",
    addedAt: number,              // When item was added
    assignedTo?: string,          // User assigned to item
    estimatedDuration?: number,   // Estimated processing time
  }>,
  
  // Queue Metrics
  totalItems: number,             // Total items in queue
  completedItems: number,         // Items completed today
  averageWaitTime: number,        // Average wait time in minutes
  averageProcessingTime: number,  // Average processing time
  
  // Queue Settings
  maxItems?: number,              // Maximum items in queue
  autoAssign: boolean,            // Whether to auto-assign items
  priorityRules?: Array<{         // Priority assignment rules
    condition: string,
    priority: "low" | "normal" | "high" | "urgent",
  }>,
  
  // Status
  isActive: boolean,              // Whether queue is active
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
  createdBy: string,
})
```

## Key Relationships

### 1. DiscoSession to User
- **One-to-One**: Each session belongs to one user
- **Purpose**: Track user activity and performance
- **Business Logic**: Users can have one active session at a time

### 2. DiscoSession to DiscoScan
- **One-to-Many**: One session can have multiple scans
- **Purpose**: Track all scans performed in a session
- **Business Logic**: Scans are grouped by session for analysis

### 3. DiscoSession to DiscoAction
- **One-to-Many**: One session can have multiple actions
- **Purpose**: Track all actions completed in a session
- **Business Logic**: Actions are grouped by session for performance tracking

### 4. DiscoQueue to Items
- **Many-to-Many**: Queues can contain multiple items, items can be in multiple queues
- **Purpose**: Manage item workflow and prioritization
- **Business Logic**: Items move through queues based on workflow stages

### 5. DiscoSession to Location/Team
- **Many-to-One**: Sessions are associated with specific locations and teams
- **Purpose**: Track where and with whom work is being performed
- **Business Logic**: Location and team context affects available actions

## Disco Interface Features

### QR Code Scanning
```typescript
interface QRScanResult {
  success: boolean,
  type: "item" | "location" | "user" | "action",
  value: string,
  item?: {
    id: string,
    currentStage: string,
    status: string,
    assignedTo?: string,
  },
  location?: {
    id: string,
    name: string,
    type: string,
  },
  action?: {
    id: string,
    type: string,
    label: string,
    required: boolean,
  },
}
```

### Action Completion
```typescript
interface ActionCompletion {
  actionId: string,
  itemId: string,
  userId: string,
  sessionId: string,
  data: {
    photos?: string[],
    notes?: string,
    measurements?: Array<{
      type: string,
      value: number,
      unit: string,
    }>,
    checklist?: Array<{
      item: string,
      completed: boolean,
    }>,
  },
  validation: {
    passed: boolean,
    errors?: string[],
  },
}
```

### Queue Management
```typescript
interface QueueItem {
  itemId: string,
  priority: "low" | "normal" | "high" | "urgent",
  status: "waiting" | "in_progress" | "completed",
  addedAt: number,
  startedAt?: number,
  completedAt?: number,
  assignedTo?: string,
  estimatedDuration?: number,
  actualDuration?: number,
}
```

## Mobile-First Design Patterns

### Touch Interface
- Large touch targets for easy interaction
- Swipe gestures for navigation
- Voice input for hands-free operation
- Haptic feedback for confirmation

### Offline Capability
- Local data caching for offline operation
- Sync when connection is restored
- Conflict resolution for concurrent changes
- Data integrity validation

### Performance Optimization
- Minimal data transfer
- Efficient image compression
- Background sync
- Progressive loading

## Data Access Patterns

### Session Management
- **Active Users**: Can only have one active session
- **Session Context**: Determines available actions and items
- **Session History**: Track performance and activity patterns
- **Session Recovery**: Resume interrupted sessions

### Queue Access
- **Team Members**: Access to team-specific queues
- **Location-Based**: Access to location-specific queues
- **Priority-Based**: High priority items appear first
- **Workload Distribution**: Auto-assignment based on capacity

## API Endpoints (Backend Implementation)

### Session Management
- `POST /api/disco/sessions` - Start new session
- `GET /api/disco/sessions/active` - Get active session
- `PUT /api/disco/sessions/:id` - Update session
- `POST /api/disco/sessions/:id/end` - End session

### QR Scanning
- `POST /api/disco/scan` - Process QR scan
- `GET /api/disco/scan/history` - Get scan history
- `POST /api/disco/scan/validate` - Validate QR code
- `GET /api/disco/scan/statistics` - Get scan statistics

### Action Management
- `POST /api/disco/actions` - Complete action
- `GET /api/disco/actions/pending` - Get pending actions
- `PUT /api/disco/actions/:id` - Update action
- `GET /api/disco/actions/history` - Get action history

### Queue Management
- `GET /api/disco/queues` - List available queues
- `GET /api/disco/queues/:id/items` - Get queue items
- `POST /api/disco/queues/:id/items` - Add item to queue
- `PUT /api/disco/queues/:id/items/:itemId` - Update queue item

### Mobile-Specific
- `POST /api/disco/sync` - Sync offline data
- `GET /api/disco/offline-data` - Get offline data
- `POST /api/disco/upload-photo` - Upload action photos
- `GET /api/disco/device-info` - Get device information

## Integration Points

### 1. Item Integration
- Real-time item status updates
- Item progress tracking
- Quality issue reporting
- Item assignment management

### 2. Workflow Integration
- Stage progression tracking
- Action requirement validation
- Workflow completion monitoring
- Performance metrics collection

### 3. Location Integration
- Location-based queue management
- Location capacity monitoring
- Location-specific actions
- Location performance tracking

### 4. Team Integration
- Team workload distribution
- Team performance tracking
- Team-specific queues
- Team communication

### 5. User Integration
- User activity tracking
- User performance metrics
- User preferences and settings
- User authentication and permissions

## Validation Rules

### Required Fields
- DiscoSession: userId, isActive, startedAt, lastActivityAt
- DiscoScan: sessionId, userId, scanType, qrCode, scanResult, scanTime
- DiscoAction: sessionId, userId, itemId, actionType, actionId, status
- DiscoQueue: name, items, totalItems, isActive

### Business Validations
- Users can only have one active session
- QR codes must be valid for scan type
- Actions must be valid for current workflow stage
- Queue items must be valid and accessible

### Data Integrity
- Session ID must be unique
- Scan references must be valid
- Action references must be valid
- Queue item references must be valid

## Error Handling

### Common Error Scenarios
- Invalid QR code format
- Item not found or inaccessible
- Action not available for current stage
- Network connectivity issues
- Device compatibility problems

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Item/action not found
- 408 Request Timeout: Network timeout
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Mobile Optimization
- Minimize data transfer
- Optimize image handling
- Implement efficient caching
- Use background processing

### Real-time Performance
- Optimize QR code processing
- Minimize scan-to-action latency
- Implement efficient queue management
- Monitor session performance

### Offline Capability
- Robust offline data storage
- Efficient sync mechanisms
- Conflict resolution strategies
- Data integrity validation

### Scalability
- Partition sessions by organization
- Archive old session data
- Use read replicas for analytics
- Implement background processing
