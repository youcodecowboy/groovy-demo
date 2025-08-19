# Customers Data Model

## Overview

Customers represent the clients and prospects that interact with the organization. The customer system provides comprehensive customer relationship management (CRM) functionality, including contact management, interaction tracking, lead management, and customer lifecycle management.

## Core Entities

### 1. Customer (Core Definition)

```typescript
customers: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  name: string,                   // Customer name
  companyName?: string,           // Company name (for business customers)
  
  // Customer Classification
  status: "active" | "inactive" | "prospect" | "lead",
  type: "individual" | "business" | "enterprise",
  industry?: string,              // Industry classification
  source?: string,                // How they found us (referral, website, etc.)
  
  // Contact Information
  website?: string,               // Company website
  phone?: string,                 // Primary phone number
  email?: string,                 // Primary email address
  
  // Address Information
  address?: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
  },
  
  // Business Information
  value?: number,                 // Customer lifetime value
  assignedTo?: string,            // User ID assigned to this customer
  tags?: string[],                // Customer tags for categorization
  
  // Communication & Follow-up
  notes?: string,                 // General notes about the customer
  lastContact?: number,           // Last contact timestamp
  nextFollowUp?: number,          // Next follow-up date
  
  // Status & Lifecycle
  isActive: boolean,              // Whether customer is active
  createdAt: number,              // Customer creation timestamp
  updatedAt: number,              // Last update timestamp
  createdBy: string,              // User who created the customer
})
```

### 2. CustomerContact (Individual Contacts)

```typescript
customerContacts: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  customerId: string,             // Reference to customer
  
  // Contact Information
  firstName: string,              // First name
  lastName: string,               // Last name
  title?: string,                 // Job title
  email?: string,                 // Email address
  phone?: string,                 // Phone number
  mobile?: string,                // Mobile number
  
  // Contact Details
  department?: string,            // Department within company
  isPrimary: boolean,             // Whether this is the primary contact
  notes?: string,                 // Contact-specific notes
  
  // Status
  isActive: boolean,              // Whether contact is active
  createdAt: number,              // Contact creation timestamp
  updatedAt: number,              // Last update timestamp
})
```

### 3. CustomerInteraction (Interaction History)

```typescript
customerInteractions: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  customerId: string,             // Reference to customer
  contactId?: string,             // Reference to specific contact
  
  // Interaction Details
  type: "call" | "email" | "meeting" | "visit" | "quote" | "order" | "support",
  subject: string,                // Interaction subject
  description: string,            // Detailed description
  outcome?: string,               // Interaction outcome
  
  // Timing & Assignment
  interactionDate: number,        // When interaction occurred
  duration?: number,              // Duration in minutes
  assignedTo: string,             // User who handled interaction
  
  // Follow-up
  requiresFollowUp: boolean,      // Whether follow-up is needed
  followUpDate?: number,          // When to follow up
  followUpNotes?: string,         // Follow-up instructions
  
  // Related Entities
  relatedOrderId?: string,        // Related order
  relatedQuoteId?: string,        // Related quote
  relatedItemId?: string,         // Related item
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
})
```

### 4. CustomerQuote (Quotes & Proposals)

```typescript
customerQuotes: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  customerId: string,             // Reference to customer
  quoteNumber: string,            // Human-readable quote number
  
  // Quote Details
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired",
  subject: string,                // Quote subject
  description: string,            // Quote description
  
  // Items & Pricing
  items: Array<{
    sku: string,                  // Product SKU
    description: string,          // Product description
    quantity: number,             // Quantity
    unitPrice: number,            // Unit price
    totalPrice: number,           // Total price for this item
  }>,
  
  // Financial Information
  subtotal: number,               // Subtotal before taxes
  taxAmount: number,              // Tax amount
  totalAmount: number,            // Total amount
  currency: string,               // Currency code
  
  // Terms & Conditions
  validUntil: number,             // Quote expiration date
  paymentTerms?: string,          // Payment terms
  deliveryTerms?: string,         // Delivery terms
  notes?: string,                 // Additional notes
  
  // Status Tracking
  sentAt?: number,                // When quote was sent
  viewedAt?: number,              // When quote was viewed
  respondedAt?: number,           // When customer responded
  acceptedAt?: number,            // When quote was accepted
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
  createdBy: string,              // User who created the quote
})
```

## Key Relationships

### 1. Customer to CustomerContact
- **One-to-Many**: One customer can have multiple contacts
- **Purpose**: Manage multiple contacts within a customer organization
- **Business Logic**: Primary contact is used for main communications

### 2. Customer to CustomerInteraction
- **One-to-Many**: One customer can have multiple interactions
- **Purpose**: Track all customer touchpoints and communication history
- **Business Logic**: Interactions drive follow-up scheduling and customer insights

### 3. Customer to CustomerQuote
- **One-to-Many**: One customer can have multiple quotes
- **Purpose**: Track sales opportunities and proposals
- **Business Logic**: Quotes can convert to orders

### 4. Customer to Orders
- **One-to-Many**: One customer can have multiple orders
- **Purpose**: Track customer purchasing history
- **Business Logic**: Order history affects customer value and relationship

### 5. Customer to User (Assignment)
- **Many-to-One**: Multiple customers can be assigned to one user
- **Purpose**: Sales territory and account management
- **Business Logic**: Assigned users are responsible for customer relationships

## Customer Lifecycle Management

### Customer Status Flow
```
prospect → lead → active → inactive
    ↓         ↓        ↓
  converted  qualified  churned
```

### Status Definitions
- **prospect**: Potential customer, not yet qualified
- **lead**: Qualified prospect with interest
- **active**: Current customer with ongoing relationship
- **inactive**: Former customer, no recent activity

### Customer Type Classifications
- **individual**: Individual consumer
- **business**: Small to medium business
- **enterprise**: Large enterprise customer

## Lead Management

### Lead Scoring
```typescript
interface LeadScore {
  customerId: string,
  score: number,                  // 0-100 lead score
  factors: Array<{
    factor: string,               // Scoring factor
    weight: number,               // Factor weight
    value: number,                // Factor value
  }>,
  lastCalculated: number,         // When score was last calculated
}
```

### Lead Qualification
- **Budget**: Customer has budget for solution
- **Authority**: Contact has decision-making authority
- **Need**: Customer has clear need for solution
- **Timeline**: Customer has timeline for purchase

## Customer Value Management

### Customer Lifetime Value (CLV)
```typescript
interface CustomerValue {
  customerId: string,
  totalRevenue: number,           // Total revenue from customer
  totalOrders: number,            // Total number of orders
  averageOrderValue: number,      // Average order value
  lastOrderDate: number,          // Date of last order
  predictedValue: number,         // Predicted future value
  churnRisk: "low" | "medium" | "high",
  lastCalculated: number,         // When value was last calculated
}
```

### Value Calculation
- **Historical Value**: Sum of all past orders
- **Predicted Value**: Based on purchase patterns and behavior
- **Churn Risk**: Based on activity patterns and engagement

## Data Access Patterns

### Customer Management
- **Admin Users**: Full customer management access
- **Sales Users**: Access to assigned customers and prospects
- **Support Users**: Access to customer information for support
- **Brand Users**: Limited access to their own customer data

### Interaction Management
- **Assigned Users**: Full access to assigned customer interactions
- **Team Members**: Access to team customer interactions
- **Admin Users**: Access to all customer interactions

## API Endpoints (Backend Implementation)

### Core CRUD Operations
- `POST /api/customers` - Create new customer
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Contact Management
- `POST /api/customers/:id/contacts` - Add contact to customer
- `PUT /api/customers/:id/contacts/:contactId` - Update contact
- `DELETE /api/customers/:id/contacts/:contactId` - Remove contact
- `GET /api/customers/:id/contacts` - List customer contacts

### Interaction Management
- `POST /api/customers/:id/interactions` - Record interaction
- `GET /api/customers/:id/interactions` - List customer interactions
- `PUT /api/customers/:id/interactions/:interactionId` - Update interaction
- `GET /api/customers/interactions/follow-up` - Get follow-up required

### Quote Management
- `POST /api/customers/:id/quotes` - Create quote for customer
- `GET /api/customers/:id/quotes` - List customer quotes
- `PUT /api/customers/:id/quotes/:quoteId` - Update quote
- `POST /api/customers/:id/quotes/:quoteId/send` - Send quote

### Analytics & Reporting
- `GET /api/customers/analytics/value` - Customer value analytics
- `GET /api/customers/analytics/leads` - Lead analytics
- `GET /api/customers/analytics/interactions` - Interaction analytics
- `GET /api/customers/reports/activity` - Customer activity reports

## Integration Points

### 1. Order Integration
- Customer information linked to orders
- Order history affects customer value
- Customer preferences influence order processing
- Order status updates trigger customer notifications

### 2. User Integration
- Customer assignment to sales users
- User performance affects customer relationships
- Customer interactions tracked by users
- User changes trigger customer reassignment

### 3. Messaging Integration
- Customer communications tracked
- Automated follow-up messages
- Customer preference management
- Communication history preservation

### 4. Analytics Integration
- Customer behavior analysis
- Sales pipeline tracking
- Customer value calculations
- Churn prediction models

## Validation Rules

### Required Fields
- Customer: name, status, type, isActive, createdBy
- Contact: customerId, firstName, lastName, isPrimary
- Interaction: customerId, type, subject, description, assignedTo
- Quote: customerId, quoteNumber, status, subject, items, totalAmount

### Business Validations
- Customer name must be unique within organization
- Primary contact must be set for business customers
- Quote numbers must be unique
- Interaction dates must be valid
- Customer value must be positive

### Data Integrity
- Customer ID must be unique
- Contact references must be valid customers
- Interaction references must be valid customers
- Quote references must be valid customers
- User assignments must be valid users

## Error Handling

### Common Error Scenarios
- Customer name already exists
- Invalid customer assignment
- Quote number conflict
- Invalid interaction data
- Customer value calculation errors

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Customer not found
- 409 Conflict: Customer name conflict
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Query Optimization
- Index customers by organization and status
- Cache frequently accessed customer data
- Optimize customer contact queries
- Use pagination for large customer lists

### Data Consistency
- Use transactions for customer updates
- Validate customer relationships
- Maintain customer value integrity
- Ensure customer assignment constraints

### Scalability
- Partition customers by organization
- Archive inactive customers after retention period
- Use read replicas for analytics queries
- Implement background value calculations
