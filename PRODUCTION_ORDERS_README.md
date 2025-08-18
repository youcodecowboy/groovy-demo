# Production Orders Module

## Overview

The Production Orders module is a comprehensive order management system that transforms the Orders area into a first-class production management interface. It provides complete workflow management from order submission to completion, with real-time progress tracking, financial management, and quality control.

## Features

### 🎯 Core Functionality

#### **Order Lifecycle Management**
- **Inbox**: Accept/decline brand-submitted purchase orders
- **Active Orders**: Track orders currently in production
- **Progress Tracking**: Real-time progress with completion percentages
- **Status Management**: Complete status workflow (pending → accepted → in_production → completed)

#### **Advanced Filtering & Views**
- **Tab Navigation**: Inbox, Active, All Orders, Import
- **Search**: Full-text search across PO numbers and notes
- **Status Filtering**: Filter by any order status
- **Brand/Factory Filtering**: Filter by specific brands or factories
- **Date Range**: Filter by submission date range
- **View Modes**: Table, Cards, and Kanban views

#### **Financial Tracking**
- **Payment Status**: Track payments with x/y paid format
- **Cost Management**: Labor costs, materials, overheads
- **Profitability**: Real-time gross margin calculations
- **Payment Recording**: Track payment methods and references

#### **Quality Management**
- **Defect Tracking**: Flag and track defective items
- **Rework Management**: Monitor rework items and time
- **Quality Metrics**: Defect rates and quality gates

### 🏗️ Technical Architecture

#### **Backend Enhancements**

##### **Enhanced Schema**
```typescript
purchaseOrders: {
  // Core fields
  poNumber: string
  status: "pending" | "accepted" | "in_production" | "paused" | "completed" | "cancelled"
  
  // Progress tracking
  progress: {
    totalItems: number
    completedItems: number
    defectiveItems: number
    reworkItems: number
    lastUpdated: number
  }
  
  // Financial tracking
  financials: {
    orderValue: number
    estimatedLaborCost?: number
    actualLaborCost?: number
    actualMaterialsCost?: number
    overheads?: number
    grossMargin?: number
    paymentsReceived: Payment[]
    totalPaid: number
  }
  
  // Lead time tracking
  leadTime: {
    promisedDays: number
    actualDays?: number
    status?: "ahead" | "on_track" | "behind"
  }
  
  // Audit trail
  auditLog: AuditEntry[]
}
```

##### **New Functions**
- `listPurchaseOrders()` - Enhanced filtering and search
- `listPurchaseOrdersByStatus()` - Status-based queries
- `updateOrderProgress()` - Real-time progress updates
- `updateOrderFinancials()` - Financial calculations
- `recordPayment()` - Payment tracking
- `pausePurchaseOrder()` / `resumePurchaseOrder()` - Workflow control

#### **Frontend Components**

##### **Core Components**
- `OrdersHeader` - Main navigation and filtering
- `OrdersTable` - Enhanced table with progress indicators
- `OrdersInbox` - Accept/decline interface
- `OrderDetailsHeader` - Sticky header for order details
- `OrderOverview` - Mission control overview

##### **Shared Components**
- `PaymentBadge` - Payment status with overdue indicators
- `LeadTimeBadge` - Lead time status (ahead/on track/behind)
- `ProgressBar` - Visual progress tracking
- `RYGStatus` - Red/Yellow/Green status indicators

##### **Detail Components**
- `OrderVariantsTable` - Variant grouping with expandable items
- `OrderMaterials` - Materials tracking and consumption
- `OrderFinancials` - Financial tracking and profitability
- `OrderQA` - Quality assurance and defects
- `OrderMessaging` - Order-specific messaging
- `OrderTimelineAudit` - Timeline and audit trail

### 📱 User Interface

#### **Orders List Page**
```
┌─────────────────────────────────────────────────────────┐
│ Production Orders                    [Import] [New Order]│
├─────────────────────────────────────────────────────────┤
│ [Inbox] [Active] [All Orders] [Import]                  │
├─────────────────────────────────────────────────────────┤
│ Search: [________________] Status: [All ▼] Brand: [All ▼]│
│ View: [Table] [Cards] [Kanban]              [Export]    │
├─────────────────────────────────────────────────────────┤
│ Order | Status | Progress | Lead Time | Payment | Value │
│ PO-001 | Active | ████████░░ 80% | 2 days ahead | $5k/$10k │
│ PO-002 | Pending | ░░░░░░░░░░ 0% | - | - | $15k │
└─────────────────────────────────────────────────────────┘
```

#### **Order Details Page**
```
┌─────────────────────────────────────────────────────────┐
│ PO-001 • Brand Name • Factory Name • [Active]           │
│ ████████░░ 80% • 2 days ahead • [Edit] [Message] [Export]│
├─────────────────────────────────────────────────────────┤
│ [Overview] [Items] [Materials] [Financials] [QA] [Msg] │
├─────────────────────────────────────────────────────────┤
│ Milestones: [✓] [✓] [●] [○]                             │
│ Throughput: 80/100 items • 5 completed today            │
│ Bottlenecks: Cutting (2.5 days avg)                     │
│                                                         │
│ People: Owner • Team • Brand • Factory                  │
│ Dates: Submitted • Accepted • Due                       │
│ Notes & Attachments                                     │
└─────────────────────────────────────────────────────────┘
```

### 🔄 Workflow

#### **Order Acceptance Process**
1. **Brand submits PO** → Status: `pending`
2. **Review in Inbox** → View order details, attachments
3. **Accept Order** → Select workflow, set start date, add notes
4. **Create Items** → Automatically creates items for each PO line
5. **Begin Production** → Status: `accepted` → `in_production`

#### **Production Tracking**
1. **Real-time Progress** → Items completed, defective, rework
2. **Status Updates** → Automatic status transitions based on progress
3. **Financial Updates** → Labor costs, materials, payments
4. **Quality Control** → Defect tracking, rework management

#### **Completion Process**
1. **All Items Complete** → Status: `in_production` → `completed`
2. **Final Review** → QA checks, financial reconciliation
3. **Delivery** → Mark as shipped, update delivery dates

### 🎨 Design Principles

#### **Neo Industrial Aesthetic**
- **Minimalistic Design**: Clean, modular interface
- **Rectangular Corners**: No 3D effects, sharp edges
- **Consistent Spacing**: Uniform box sizes and spacing
- **Icon Usage**: Extensive use of Lucide React icons
- **Typography**: Primary fonts with italic subheadings

#### **Production-Focused UX**
- **Mission Control Layout**: Dashboard-style interface
- **Quick Actions**: One-click access to common operations
- **Visual Indicators**: Clear status and progress visualization
- **Responsive Design**: Works across all device sizes

### 🚀 Getting Started

#### **Accessing the Module**
1. Navigate to `/app/orders` in the application
2. Use the tab navigation to switch between views
3. Use filters to find specific orders
4. Click on any order to view details

#### **Creating Orders**
1. Click "New Order" button
2. Fill in order details (brand, factory, items, etc.)
3. Set delivery dates and payment terms
4. Submit order for processing

#### **Managing Orders**
1. **Inbox**: Review and accept/decline pending orders
2. **Active**: Monitor orders currently in production
3. **All Orders**: Complete order management with advanced filtering

### 🔧 Configuration

#### **Status Configuration**
```typescript
const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800" },
  in_production: { label: "In Production", color: "bg-green-100 text-green-800" },
  paused: { label: "Paused", color: "bg-orange-100 text-orange-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" }
}
```

#### **Progress Calculation**
```typescript
const progress = {
  percentage: (completedItems / totalItems) * 100,
  status: completedItems === totalItems ? "completed" : "in_production"
}
```

### 🔮 Future Enhancements

#### **Planned Features**
- **Kanban Board**: Drag-and-drop order management
- **Advanced Analytics**: Production metrics and forecasting
- **Automated Workflows**: Rule-based order processing
- **Integration**: ERP and accounting system integration
- **Mobile App**: Native mobile order management
- **Real-time Notifications**: Live updates and alerts

#### **Advanced Features**
- **Bulk Operations**: Multi-select and bulk updates
- **Custom Workflows**: User-defined production workflows
- **Advanced Reporting**: Custom reports and dashboards
- **API Integration**: Third-party system integration
- **Machine Learning**: Predictive analytics and optimization

### 📊 Performance Considerations

#### **Optimization Strategies**
- **Lazy Loading**: Load tab content on demand
- **Virtualization**: Handle large item lists efficiently
- **Caching**: Cache frequently accessed data
- **Real-time Updates**: Efficient subscription management

#### **Scalability**
- **Database Indexing**: Optimized queries for large datasets
- **Component Optimization**: Efficient rendering and updates
- **State Management**: Proper state handling for complex workflows

### 🛠️ Development

#### **Component Structure**
```
components/orders/
├── index.ts                    # Component exports
├── OrdersHeader.tsx           # Main navigation
├── OrdersTable.tsx            # Enhanced table
├── OrdersInbox.tsx            # Accept/decline interface
├── OrderDetailsHeader.tsx     # Sticky header
├── OrderOverview.tsx          # Mission control overview
├── shared/                    # Shared components
│   ├── PaymentBadge.tsx
│   ├── LeadTimeBadge.tsx
│   ├── ProgressBar.tsx
│   └── RYGStatus.tsx
└── [detail components]        # Tab-specific components
```

#### **Backend Structure**
```
convex/
├── purchaseOrders.ts          # Enhanced PO functions
├── schema.ts                  # Updated schema
└── items.ts                   # Item management
```

### 📝 API Reference

#### **Key Functions**
- `api.purchaseOrders.listPurchaseOrders()` - Get filtered orders
- `api.purchaseOrders.acceptPurchaseOrder()` - Accept an order
- `api.purchaseOrders.updateOrderProgress()` - Update progress
- `api.purchaseOrders.recordPayment()` - Record payment
- `api.items.listItemsByPO()` - Get items for an order

#### **Data Types**
- `PurchaseOrder` - Complete order object
- `OrderProgress` - Progress tracking data
- `OrderFinancials` - Financial data
- `AuditEntry` - Audit trail entries

---

This module represents a significant enhancement to the production management capabilities, providing a comprehensive solution for order lifecycle management with real-time tracking, financial management, and quality control.
