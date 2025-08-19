# Messaging Data Model

## Overview

The messaging system provides real-time communication capabilities between users, teams, and entities within the platform. It supports direct messaging, team messaging, system notifications, and integration with production workflows for seamless collaboration and information sharing.

## Core Entity: Message

### Primary Table Structure

```typescript
messages: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  
  // Message Details
  senderId: string,               // User who sent the message
  recipientId: string,            // User who should receive the message
  content: string,                // Message content
  messageType: "text" | "image" | "file" | "system" | "alert" | "notification",
  
  // Message Status
  isRead: boolean,                // Whether message has been read
  createdAt: number,              // Message creation timestamp
  readAt?: number,                // When message was read
  
  // Message Threading
  replyToId?: string,             // Reference to message being replied to
  threadId?: string,              // Thread identifier for grouped messages
  
  // Message Metadata
  metadata?: {
    priority?: "low" | "medium" | "high" | "urgent",
    attachedItems?: string[],     // Related item IDs
    attachedTasks?: string[],     // Related task IDs
    attachedOrders?: string[],    // Related order IDs
    isTeamMessage?: boolean,      // Whether this is a team message
    teamName?: string,            // Team name for team messages
    location?: string,            // Location context
    stage?: string,               // Workflow stage context
  },
  
  // Brand Interface Extensions
  brandId?: string,               // For brand-factory messages
  factoryId?: string,             // For brand-factory messages
  orderId?: string,               // Related purchase order
  
  // Audit Fields
  updatedAt: number,              // Last update timestamp
})
```

## Key Relationships

### 1. User Relationships
- **Many-to-Many**: Users can send/receive multiple messages
- **Purpose**: Enable direct communication between users
- **Business Logic**: Messages are delivered to specific recipients

### 2. Team Relationships
- **Many-to-Many**: Teams can send/receive messages
- **Implementation**: Through team message routing
- **Purpose**: Enable team-wide communications
- **Business Logic**: Team messages are delivered to all team members

### 3. Entity Relationships
- **Many-to-Many**: Messages can reference multiple entities
- **Implementation**: Through metadata.attachedItems, attachedTasks, etc.
- **Purpose**: Link messages to relevant production entities
- **Business Logic**: Messages provide context for production activities

### 4. Brand-Factory Relationships
- **Cross-Entity**: Messages between brands and factories
- **Purpose**: Enable brand-factory communication
- **Business Logic**: Messages are scoped to specific orders and relationships

## Message Types & Use Cases

### 1. Direct Messages
```typescript
{
  messageType: "text",
  senderId: "user-123",
  recipientId: "user-456",
  content: "Can you check the quality of item ITEM-001?",
  metadata: {
    priority: "medium",
    attachedItems: ["item-001"],
  }
}
```

### 2. Team Messages
```typescript
{
  messageType: "text",
  senderId: "user-123",
  recipientId: "team-cutting",    // Team identifier
  content: "New cutting instructions for batch B-2024-001",
  metadata: {
    isTeamMessage: true,
    teamName: "Cutting Team A",
    attachedOrders: ["order-001"],
    priority: "high",
  }
}
```

### 3. System Notifications
```typescript
{
  messageType: "system",
  senderId: "system",
  recipientId: "user-123",
  content: "Item ITEM-001 has completed stage 'Cutting'",
  metadata: {
    attachedItems: ["item-001"],
    stage: "cutting",
    priority: "low",
  }
}
```

### 4. Alert Messages
```typescript
{
  messageType: "alert",
  senderId: "system",
  recipientId: "user-123",
  content: "Quality issue detected on item ITEM-001",
  metadata: {
    priority: "urgent",
    attachedItems: ["item-001"],
    location: "QC Station 1",
  }
}
```

### 5. File Messages
```typescript
{
  messageType: "file",
  senderId: "user-123",
  recipientId: "user-456",
  content: "Quality inspection photos for item ITEM-001",
  metadata: {
    attachedItems: ["item-001"],
    fileUrls: ["https://example.com/photo1.jpg"],
    fileType: "image",
  }
}
```

## Message Threading & Conversations

### Conversation Management
```typescript
interface Conversation {
  id: string,
  participants: string[],         // User IDs in conversation
  lastMessageId: string,          // ID of last message
  lastMessageAt: number,          // Timestamp of last message
  unreadCount: number,            // Unread messages count
  isActive: boolean,              // Whether conversation is active
}
```

### Thread Management
- Messages can be grouped into threads
- Threads can span multiple participants
- Thread context is preserved across messages
- Thread status affects notification behavior

## Message Routing & Delivery

### Routing Rules
```typescript
interface MessageRoute {
  messageId: string,
  recipientId: string,
  routeType: "direct" | "team" | "broadcast" | "system",
  deliveryStatus: "pending" | "delivered" | "read" | "failed",
  deliveryAttempts: number,
  deliveredAt?: number,
  readAt?: number,
}
```

### Delivery Mechanisms
- **Real-time**: WebSocket connections for instant delivery
- **Push Notifications**: Mobile and web push notifications
- **Email**: Email notifications for important messages
- **In-app**: In-app notification center

## Message Priority & Urgency

### Priority Levels
- **low**: General information, no immediate action required
- **medium**: Important information, action may be required
- **high**: Urgent information, immediate attention needed
- **urgent**: Critical information, immediate action required

### Urgency Handling
- Urgent messages trigger immediate notifications
- High priority messages are highlighted in UI
- Priority affects delivery mechanisms
- Priority influences notification frequency

## Data Access Patterns

### Message Access
- **Sender**: Can view and manage their sent messages
- **Recipient**: Can view and manage received messages
- **Team Members**: Can view team messages
- **Admin Users**: Can view all messages for moderation

### Conversation Access
- **Participants**: Can view conversation history
- **Team Members**: Can view team conversations
- **Admin Users**: Can view all conversations

## API Endpoints (Backend Implementation)

### Core CRUD Operations
- `POST /api/messages` - Send new message
- `GET /api/messages` - List messages
- `GET /api/messages/:id` - Get message details
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

### Conversation Management
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation details
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/conversations/:id/messages` - Send message to conversation

### Message Operations
- `POST /api/messages/:id/read` - Mark message as read
- `POST /api/messages/:id/reply` - Reply to message
- `POST /api/messages/:id/forward` - Forward message
- `GET /api/messages/unread` - Get unread messages

### Team Messaging
- `POST /api/teams/:id/messages` - Send team message
- `GET /api/teams/:id/messages` - Get team messages
- `POST /api/teams/:id/messages/broadcast` - Broadcast to team

### System Notifications
- `POST /api/notifications/system` - Send system notification
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## Integration Points

### 1. User Integration
- User status affects message delivery
- User preferences control notification settings
- User activity triggers system messages
- User permissions affect message access

### 2. Team Integration
- Team membership affects message routing
- Team changes trigger notification updates
- Team performance generates system messages
- Team assignments affect message context

### 3. Item Integration
- Item status changes trigger notifications
- Item quality issues generate alerts
- Item progress updates create system messages
- Item assignments affect message routing

### 4. Order Integration
- Order status changes trigger notifications
- Order assignments affect message routing
- Order issues generate alerts
- Order progress creates system updates

### 5. Workflow Integration
- Stage completions trigger notifications
- Workflow issues generate alerts
- Workflow assignments affect message routing
- Workflow progress creates system updates

## Real-time Communication

### WebSocket Events
```typescript
interface WebSocketEvent {
  type: "message" | "notification" | "status_change" | "alert",
  data: {
    messageId?: string,
    senderId?: string,
    recipientId?: string,
    content?: string,
    metadata?: any,
  },
  timestamp: number,
}
```

### Event Types
- **message**: New message received
- **notification**: System notification
- **status_change**: Entity status change
- **alert**: Urgent alert or warning

## Message Templates

### System Message Templates
```typescript
interface MessageTemplate {
  id: string,
  name: string,
  type: "system" | "alert" | "notification",
  template: string,               // Message template with variables
  variables: string[],            // Available variables
  triggers: string[],             // What triggers this template
  isActive: boolean,
}
```

### Template Variables
- `{userName}`: Recipient's name
- `{itemId}`: Related item ID
- `{orderId}`: Related order ID
- `{stageName}`: Workflow stage name
- `{locationName}`: Location name

## Validation Rules

### Required Fields
- senderId (valid user ID)
- recipientId (valid user/team ID)
- content (non-empty string)
- messageType (valid message type)
- isRead (boolean)

### Business Validations
- Sender must have permission to message recipient
- Message content must meet length requirements
- Attached entities must exist and be accessible
- Priority must be valid for message type

### Data Integrity
- Message ID must be unique
- Sender and recipient references must be valid
- Thread references must be valid
- Entity references must be valid

## Error Handling

### Common Error Scenarios
- Invalid sender or recipient
- Message content too long
- Attached entity not found
- Insufficient permissions
- Delivery failure

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Recipient or entity not found
- 409 Conflict: Message conflict
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Query Optimization
- Index messages by recipient and timestamp
- Cache frequently accessed conversations
- Optimize unread message queries
- Use pagination for large message lists

### Data Consistency
- Use transactions for message operations
- Validate message routing rules
- Maintain conversation integrity
- Ensure delivery status accuracy

### Scalability
- Partition messages by organization
- Archive old messages after retention period
- Use read replicas for message queries
- Implement background message processing

### Real-time Performance
- Optimize WebSocket connections
- Implement message queuing for high volume
- Use connection pooling for scalability
- Monitor real-time delivery performance
