# Materials Data Model

## Overview

Materials represent the raw materials, components, and supplies used in the manufacturing process. The materials system provides comprehensive inventory management, including lot tracking, location management, cost tracking, and consumption monitoring. Materials are consumed by items during production and linked to orders for cost allocation.

## Core Entities

### 1. Material (Core Definition)

```typescript
materials: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  code: string,                   // Internal material code (e.g., "FAB-001")
  name: string,                   // Human-readable name
  
  // Classification
  category: "fabric" | "trim" | "accessory" | "packaging" | "other",
  defaultUnit: "m" | "yd" | "pc" | "kg" | "g" | "roll" | "cone" | "box",
  
  // Specifications
  attributes: Record<string, any>, // Flexible attributes (e.g., composition, GSM, color)
  supplierId?: string,            // Primary supplier
  supplierSku?: string,           // Supplier's SKU
  
  // Inventory Management
  reorderPoint?: number,          // Reorder threshold in defaultUnit
  minOrderQuantity?: number,      // Minimum order quantity
  leadTime?: number,              // Supplier lead time in days
  
  // Status
  isActive: boolean,              // Whether material is active
  isObsolete: boolean,            // Whether material is obsolete
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
  createdBy: string,
})
```

### 2. MaterialLot (Batch Tracking)

```typescript
materialLots: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  materialId: string,             // Reference to material
  
  // Lot Information
  lotCode?: string,               // Lot/batch code (e.g., dye lot)
  color?: string,                 // Color variant
  widthMm?: number,               // Width for fabrics (mm)
  
  // Inventory & Cost
  quantity: number,               // On-hand quantity in defaultUnit
  unitCost: number,               // Cost per defaultUnit at receipt
  totalValue: number,             // Total lot value
  
  // Location & Status
  locationId?: string,            // Current location
  isActive: boolean,              // Whether lot is active
  isReserved: boolean,            // Whether lot is reserved for orders
  
  // Receipt Information
  receivedAt: number,             // Receipt timestamp
  receivedBy: string,             // User who received
  poId?: string,                  // Linked purchase order
  supplierId?: string,            // Supplier for this lot
  
  // Expiry & Quality
  expiryAt?: number,              // Expiry date
  qualityNotes?: string,          // Quality observations
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
})
```

### 3. MaterialMovement (Transaction History)

```typescript
materialMovements: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  
  // Movement Details
  type: "RECEIPT" | "ISSUE" | "TRANSFER" | "ADJUST",
  materialId: string,             // Material being moved
  lotId?: string,                 // Specific lot (if applicable)
  
  // Quantities & Costs
  quantity: number,               // Quantity in defaultUnit
  unitCost?: number,              // Cost per unit at time of movement
  totalValue?: number,            // Total movement value
  
  // Location Changes
  fromLocationId?: string,        // Source location
  toLocationId?: string,          // Destination location
  
  // Production Links
  orderId?: string,               // Related production order
  itemId?: string,                // Specific item consuming material
  
  // Movement Details
  reason?: string,                // Reason for movement
  reference?: string,             // External reference (PO, invoice, etc.)
  actor: string,                  // User performing movement
  
  // Timestamps
  at: number,                     // Movement timestamp
  
  // Audit Fields
  createdAt: number,
})
```

### 4. Location (Storage Locations)

```typescript
locations: defineTable({
  // Core Identification
  _id: string,                    // Unique identifier
  orgId: string,                  // Multi-tenant organization ID
  name: string,                   // Location name (e.g., "WH-A1-BIN01")
  
  // Location Hierarchy
  kind: "warehouse" | "room" | "rack" | "bin" | "area",
  parentId?: string,              // Parent location
  
  // Capacity & Constraints
  capacity?: number,              // Maximum capacity
  currentUtilization?: number,    // Current utilization
  temperature?: number,           // Temperature requirements
  humidity?: number,              // Humidity requirements
  
  // Status
  isActive: boolean,              // Whether location is active
  isReserved: boolean,            // Whether location is reserved
  
  // Audit Fields
  createdAt: number,
  updatedAt: number,
})
```

## Key Relationships

### 1. Material to MaterialLot
- **One-to-Many**: One material can have multiple lots
- **Purpose**: Track different batches, colors, or suppliers
- **Business Logic**: FIFO (First In, First Out) lot selection for issues

### 2. Material to MaterialMovement
- **One-to-Many**: One material can have multiple movements
- **Purpose**: Complete audit trail of all inventory transactions
- **Business Logic**: Movements affect lot quantities and locations

### 3. MaterialLot to Location
- **Many-to-One**: Multiple lots can be at one location
- **Purpose**: Track physical storage location
- **Business Logic**: Location constraints affect material availability

### 4. Material to Orders
- **Many-to-Many**: Materials are consumed by orders
- **Implementation**: Through MaterialMovements with orderId
- **Purpose**: Track material consumption and cost allocation
- **Business Logic**: Material reservations for orders

### 5. Material to Items
- **Many-to-Many**: Materials are consumed by items
- **Implementation**: Through MaterialMovements with itemId
- **Purpose**: Track material usage per item
- **Business Logic**: Material consumption during production

## Material Categories & Attributes

### Fabric Materials
```typescript
{
  category: "fabric",
  defaultUnit: "m",
  attributes: {
    composition: "100% Cotton",
    gsm: 280,                    // Grams per square meter
    weave: "Plain",
    stretch: false,
    washable: true,
    color: "Natural",
    width: 150,                  // Width in cm
  }
}
```

### Trim Materials
```typescript
{
  category: "trim",
  defaultUnit: "pc",
  attributes: {
    size: "15mm",
    material: "Brass",
    finish: "Brushed",
    colorfast: true,
    type: "Button",
  }
}
```

### Accessory Materials
```typescript
{
  category: "accessory",
  defaultUnit: "pc",
  attributes: {
    type: "Zipper",
    size: "12\"",
    material: "Nylon",
    color: "Black",
    teeth: "Metal",
  }
}
```

## Movement Types & Business Logic

### 1. RECEIPT Movements
- **Purpose**: Record material received from suppliers
- **Effect**: Increases lot quantity, creates new lot if needed
- **Required Fields**: materialId, quantity, unitCost, receivedAt, actor
- **Business Rules**: Validates PO, updates lot inventory

### 2. ISSUE Movements
- **Purpose**: Record material consumed in production
- **Effect**: Decreases lot quantity, links to order/item
- **Required Fields**: materialId, quantity, orderId, itemId, actor
- **Business Rules**: Validates availability, FIFO lot selection

### 3. TRANSFER Movements
- **Purpose**: Move material between locations
- **Effect**: Updates lot location, no quantity change
- **Required Fields**: materialId, lotId, fromLocationId, toLocationId, actor
- **Business Rules**: Validates source location, updates destination

### 4. ADJUST Movements
- **Purpose**: Correct inventory discrepancies
- **Effect**: Adjusts lot quantity up or down
- **Required Fields**: materialId, quantity, reason, actor
- **Business Rules**: Requires approval, audit trail

## Inventory Management

### Stock Level Tracking
```typescript
interface InventorySnapshot {
  materialId: string,
  onHand: number,                // Total on-hand quantity
  onOrder: number,               // Quantity on order
  allocated: number,             // Quantity reserved for orders
  available: number,             // Available quantity (onHand - allocated)
  value: number,                 // Total inventory value
  currency: string,              // Currency for value
  lastUpdated: number,           // Last snapshot timestamp
}
```

### Reorder Management
- **Reorder Point**: Automatic reorder when stock falls below threshold
- **Economic Order Quantity**: Optimal order size calculation
- **Lead Time Planning**: Account for supplier lead times
- **Safety Stock**: Buffer for demand variability

### Lot Management
- **FIFO System**: Automatic lot selection for issues
- **Lot Splitting**: Partial lot transfers
- **Expiry Tracking**: Monitor lot expiration dates
- **Quality Control**: Track lot quality issues

## Cost Management

### Cost Tracking
- **Unit Cost**: Cost per unit at receipt
- **Average Cost**: Weighted average across lots
- **FIFO Cost**: First-in-first-out cost method
- **Standard Cost**: Predefined standard costs

### Cost Allocation
- **Order Costs**: Allocate material costs to orders
- **Item Costs**: Track material cost per item
- **Overhead Allocation**: Distribute overhead costs
- **Variance Analysis**: Compare actual vs. standard costs

## Data Access Patterns

### Material Management
- **Admin Users**: Full material management access
- **Factory Users**: View and issue materials
- **Brand Users**: No direct material access (through orders)

### Inventory Operations
- **Receiving**: Record material receipts
- **Issuing**: Consume materials for production
- **Transferring**: Move materials between locations
- **Adjusting**: Correct inventory discrepancies

### Reporting Access
- **Inventory Reports**: Stock levels and values
- **Usage Reports**: Material consumption patterns
- **Cost Reports**: Material cost analysis
- **Supplier Reports**: Supplier performance metrics

## API Endpoints (Backend Implementation)

### Material Management
- `POST /api/materials` - Create new material
- `GET /api/materials` - List materials
- `GET /api/materials/:id` - Get material details
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

### Lot Management
- `POST /api/materials/:id/lots` - Create new lot
- `GET /api/materials/:id/lots` - List material lots
- `PUT /api/materials/:id/lots/:lotId` - Update lot
- `DELETE /api/materials/:id/lots/:lotId` - Delete lot

### Movement Operations
- `POST /api/materials/movements/receipt` - Record receipt
- `POST /api/materials/movements/issue` - Record issue
- `POST /api/materials/movements/transfer` - Record transfer
- `POST /api/materials/movements/adjust` - Record adjustment

### Inventory Operations
- `GET /api/materials/inventory` - Get inventory snapshot
- `GET /api/materials/inventory/low-stock` - Get low stock alerts
- `POST /api/materials/inventory/reserve` - Reserve material
- `POST /api/materials/inventory/release` - Release reservation

### Location Management
- `POST /api/locations` - Create location
- `GET /api/locations` - List locations
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Reporting
- `GET /api/materials/reports/inventory` - Inventory reports
- `GET /api/materials/reports/usage` - Usage reports
- `GET /api/materials/reports/costs` - Cost reports
- `GET /api/materials/reports/suppliers` - Supplier reports

## Integration Points

### 1. Order Integration
- Materials are reserved when orders are accepted
- Material consumption is tracked per order
- Order costs include material costs
- Material shortages can delay orders

### 2. Item Integration
- Items consume materials during production
- Material movements are linked to specific items
- Item costs include material consumption
- Material quality affects item quality

### 3. Supplier Integration
- Material receipts link to supplier POs
- Supplier performance affects material availability
- Cost tracking includes supplier costs
- Supplier quality affects material quality

### 4. Location Integration
- Materials are stored at specific locations
- Location capacity affects material storage
- Location constraints affect material movement
- Location changes trigger inventory updates

## Validation Rules

### Required Fields
- Material: code, name, category, defaultUnit
- Lot: materialId, quantity, unitCost, receivedAt
- Movement: materialId, type, quantity, actor, at
- Location: name, kind

### Business Validations
- Material codes must be unique within organization
- Lot quantities must be positive
- Movement quantities must be valid for type
- Location hierarchy must be valid

### Data Integrity
- Lot quantities must match movement history
- Location assignments must exist
- Material references must be valid
- Movement timestamps must be logical

## Error Handling

### Common Error Scenarios
- Insufficient inventory for issue
- Invalid lot selection
- Location capacity exceeded
- Negative inventory quantities
- Invalid movement types
- Missing required fields

### Error Responses
- 400 Bad Request: Validation errors
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Material/lot/location not found
- 409 Conflict: Insufficient inventory
- 422 Unprocessable Entity: Business rule violations

## Performance Considerations

### Query Optimization
- Index materials by organization and category
- Index lots by material and location
- Index movements by material and date
- Cache frequently accessed inventory data

### Data Consistency
- Use transactions for movement operations
- Validate inventory constraints
- Maintain lot quantity integrity
- Ensure location capacity limits

### Scalability
- Partition materials by organization
- Archive old movement history
- Use read replicas for reporting
- Implement background inventory calculations
