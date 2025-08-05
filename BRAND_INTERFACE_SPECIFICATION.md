# Brand Interface Specification

## Overview

The Brand Interface is a new application layer that provides brands (clients) with a looking glass view into their production processes. This interface allows brands to monitor their orders, communicate with factory administrators, and submit purchase orders while maintaining data isolation and security.

## Core Objectives

1. **Data Isolation**: Brands can only see data related to their orders
2. **Real-time Monitoring**: Live tracking of item movement through production stages
3. **Communication Hub**: Direct messaging with factory administrators
4. **Purchase Order Management**: Submit and track purchase orders
5. **Professional Interface**: Premium experience for high-value clients

## User Roles & Permissions

### Brand User
- **View**: Only items associated with their brand/orders
- **Actions**: Send messages, submit purchase orders, view production status
- **Data Access**: Limited to their own order data and factory network

### Factory Admin (Existing)
- **View**: All items and brand purchase orders
- **Actions**: Accept/reject purchase orders, create items from POs, respond to brand messages
- **Data Access**: Full system access

## Database Schema Extensions

### New Tables Required

#### 1. Brands Table
```typescript
brands: defineTable({
  name: v.string(),
  email: v.string(),
  contactPerson: v.string(),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  logo: v.optional(v.string()), // URL to brand logo
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
  metadata: v.optional(v.any()), // Additional brand-specific data
})
```

#### 2. Purchase Orders Table
```typescript
purchaseOrders: defineTable({
  brandId: v.id("brands"),
  factoryId: v.id("factories"), // New factories table
  poNumber: v.string(),
  status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("completed")),
  items: v.array(v.object({
    sku: v.string(),
    quantity: v.number(),
    description: v.string(),
    specifications: v.optional(v.any()),
  })),
  totalValue: v.number(),
  requestedDeliveryDate: v.number(),
  submittedAt: v.number(),
  acceptedAt: v.optional(v.number()),
  acceptedBy: v.optional(v.string()), // User ID
  notes: v.optional(v.string()),
  metadata: v.optional(v.any()),
})
```

#### 3. Factories Table
```typescript
factories: defineTable({
  name: v.string(),
  location: v.string(),
  adminUserId: v.string(), // Primary admin user
  isActive: v.boolean(),
  capacity: v.optional(v.number()),
  specialties: v.optional(v.array(v.string())), // Production capabilities
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

#### 4. Brand-Factory Relationships
```typescript
brandFactoryRelations: defineTable({
  brandId: v.id("brands"),
  factoryId: v.id("factories"),
  isActive: v.boolean(),
  partnershipStartDate: v.number(),
  notes: v.optional(v.string()),
})
```

### Schema Modifications

#### Items Table Extension
```typescript
// Add to existing items table
brandId: v.optional(v.id("brands")), // Link items to brands
purchaseOrderId: v.optional(v.id("purchaseOrders")), // Link items to POs
```

#### Users Table Extension
```typescript
// Add to existing users table
brandId: v.optional(v.id("brands")), // For brand users
factoryId: v.optional(v.id("factories")), // For factory users
userType: v.union(v.literal("brand"), v.literal("factory"), v.literal("system")),
```

## Application Architecture

### New Routes Structure
```
/brand/
├── dashboard/          # Main brand dashboard
├── orders/            # Purchase order management
│   ├── new/          # Create new PO
│   ├── [poId]/       # View specific PO
│   └── history/      # PO history
├── items/             # Brand's items view
│   └── [itemId]/     # Item details
├── factories/         # Connected factories
│   └── [factoryId]/  # Factory details
├── messaging/         # Communication hub
└── settings/         # Brand settings
```

### Component Structure
```
components/brand/
├── dashboard/
│   ├── brand-dashboard.tsx
│   ├── order-overview.tsx
│   └── factory-network.tsx
├── orders/
│   ├── po-form.tsx
│   ├── po-list.tsx
│   └── po-detail.tsx
├── items/
│   ├── brand-items-table.tsx
│   └── item-tracking.tsx
├── messaging/
│   ├── brand-messaging.tsx
│   └── message-composer.tsx
└── layout/
    ├── brand-header.tsx
    └── brand-sidebar.tsx
```

## UI/UX Design

### Brand Header
- **Background**: Black (#000000)
- **Logo**: White Groovy logo
- **Navigation**: Clean, minimal design
- **User Menu**: Brand user profile and settings

### Brand Sidebar
- **Design**: Identical to factory sidebar but with brand-specific navigation
- **Sections**:
  - Dashboard
  - My Orders
  - Production Tracking
  - Factory Network
  - Messaging
  - Settings

### Dashboard Layout
- **Overview Cards**: Active orders, items in production, connected factories
- **Real-time Feed**: Live updates of item movements
- **Quick Actions**: New PO, message factory, view reports
- **Performance Metrics**: Production efficiency, delivery timelines

## Data Flow

### Purchase Order Flow
1. Brand creates PO → Stored in `purchaseOrders` table
2. Factory admin receives notification
3. Admin reviews and accepts/rejects PO
4. If accepted, items are created with `brandId` and `purchaseOrderId`
5. Items flow through normal production process
6. Brand can track their items in real-time

### Item Tracking Flow
1. Items created from accepted POs are tagged with `brandId`
2. All item movements are visible to brand users
3. Real-time updates via Convex subscriptions
4. Brand users see only their items in all views

### Messaging Flow
1. Brand users can message factory admins
2. Messages are filtered by brand-factory relationships
3. Real-time notifications for new messages
4. Message history preserved for audit trail

## Security Considerations

### Data Isolation
- All queries must filter by `brandId` for brand users
- Factory users see all data but with brand context
- API endpoints validate user permissions

### Authentication
- Brand users have separate authentication flow
- Session management for brand vs factory users
- Role-based access control (RBAC)

### Audit Trail
- All brand actions logged in activity log
- PO submissions, message sends, item views tracked
- Compliance with data protection regulations

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema extensions
- [ ] Brand authentication system
- [ ] Basic brand dashboard structure
- [ ] Brand header and sidebar components

### Phase 2: Core Features (Week 3-4)
- [ ] Purchase order management
- [ ] Brand-specific item views
- [ ] Basic messaging system
- [ ] Factory network display

### Phase 3: Advanced Features (Week 5-6)
- [ ] Real-time item tracking
- [ ] Advanced messaging with file attachments
- [ ] Performance analytics
- [ ] Brand settings and preferences

### Phase 4: Polish & Testing (Week 7-8)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Security audit
- [ ] User acceptance testing

## Technical Requirements

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Convex for real-time data
- React Hook Form for forms

### Backend
- Convex functions for data operations
- Real-time subscriptions for live updates
- File upload handling for attachments
- Email notifications for critical events

### Performance
- Optimistic updates for better UX
- Pagination for large datasets
- Caching for frequently accessed data
- Lazy loading for better performance

## Success Metrics

### User Engagement
- Time spent on brand dashboard
- Frequency of PO submissions
- Message response times
- Feature adoption rates

### Business Impact
- Increased brand satisfaction
- Faster PO processing
- Reduced communication overhead
- Improved production transparency

### Technical Performance
- Page load times < 2 seconds
- Real-time updates < 500ms latency
- 99.9% uptime
- Zero data breaches

## Risk Mitigation

### Data Security
- Regular security audits
- Data encryption at rest and in transit
- Regular backup procedures
- GDPR compliance measures

### Performance
- Load testing for concurrent users
- Database optimization
- CDN for static assets
- Monitoring and alerting

### User Experience
- Extensive user testing
- Feedback collection system
- Iterative design improvements
- Accessibility compliance

## Future Enhancements

### Advanced Analytics
- Predictive delivery dates
- Production efficiency metrics
- Cost analysis tools
- Quality control dashboards

### Integration Capabilities
- ERP system integration
- Accounting software connections
- Shipping provider APIs
- Payment processing

### Mobile Experience
- Native mobile apps
- Push notifications
- Offline capability
- QR code scanning

## Conclusion

The Brand Interface represents a significant expansion of the Groovy platform, transforming it from a factory-focused system to a comprehensive supply chain management platform. This implementation will provide brands with unprecedented visibility into their production processes while maintaining the security and efficiency of the existing factory operations.

The phased approach ensures minimal disruption to existing users while delivering value incrementally. The modular architecture allows for future enhancements and integrations as the platform evolves. 