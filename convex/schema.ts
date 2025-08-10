import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Multi-tenant core
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerUserId: v.string(),
    createdAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_slug", ["slug"]).index("by_owner", ["ownerUserId"]),

  memberships: defineTable({
    orgId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member"), v.literal("viewer")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_org", ["orgId"]),

  // Tenant settings and dashboards (MVP: dashboards store JSON layout)
  organizationSettings: defineTable({
    orgId: v.id("organizations"),
    enabledFeatures: v.optional(v.array(v.string())),
    theme: v.optional(v.any()),
    defaultDashboardId: v.optional(v.id("dashboards")),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }).index("by_org", ["orgId"]),

  dashboards: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    scope: v.union(v.literal("org"), v.literal("role"), v.literal("user")),
    ownerId: v.optional(v.string()),
    role: v.optional(v.string()),
    layoutJson: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["orgId"]),
  // Workflows table - stores workflow definitions
  workflows: defineTable({
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    description: v.optional(v.string()),
    stages: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      order: v.number(),
      actions: v.optional(v.array(v.object({
        id: v.string(),
        type: v.union(v.literal("scan"), v.literal("photo"), v.literal("note"), v.literal("approval"), v.literal("measurement"), v.literal("inspection")),
        label: v.string(),
        description: v.optional(v.string()),
        required: v.boolean(),
        config: v.optional(v.any()),
      }))),
      estimatedDuration: v.optional(v.number()), // in minutes
      isActive: v.boolean(),
      allowedNextStageIds: v.optional(v.array(v.string())), // IDs of stages that can be advanced to
      assignedLocationIds: v.optional(v.array(v.id("locations"))),
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  }),

  // Items table - stores individual items being processed
  items: defineTable({
    orgId: v.optional(v.id("organizations")),
    itemId: v.string(), // Unique identifier for the item
    workflowId: v.id("workflows"),
    currentStageId: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("error"), v.literal("completed")), // Allow completed status for backward compatibility
    metadata: v.optional(v.any()), // Flexible metadata object
    startedAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()), // Completion timestamp for backward compatibility
    assignedTo: v.optional(v.string()),
    qrCode: v.optional(v.string()), // QR code data for scanning
    currentLocationId: v.optional(v.id("locations")), // Current location of the item
    isDefective: v.optional(v.boolean()), // Flag for defective items
    defectNotes: v.optional(v.string()), // Notes about the defect
    flaggedBy: v.optional(v.string()), // User who flagged the item
    flaggedAt: v.optional(v.number()), // When the item was flagged
    // Brand interface additions
    brandId: v.optional(v.id("brands")), // Link items to brands
    factoryId: v.optional(v.id("factories")), // Link items to factories
    purchaseOrderId: v.optional(v.id("purchaseOrders")), // Link items to POs
  }).index("by_user", ["assignedTo"]).index("by_location", ["currentLocationId"]).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]).index("by_po", ["purchaseOrderId"]),

  // Completed items table - stores items that have finished processing
  completedItems: defineTable({
    orgId: v.optional(v.id("organizations")),
    itemId: v.string(), // Unique identifier for the item
    workflowId: v.id("workflows"),
    finalStageId: v.string(), // The last stage the item completed
    finalStageName: v.string(),
    metadata: v.optional(v.any()), // Flexible metadata object
    startedAt: v.number(),
    completedAt: v.number(),
    assignedTo: v.optional(v.string()),
    qrCode: v.optional(v.string()), // QR code data for scanning
    finalLocationId: v.optional(v.id("locations")), // Final location of the completed item
    completionNotes: v.optional(v.string()), // Optional notes about completion
    completedBy: v.optional(v.string()), // User who completed the item
  }),

  // Item history table - tracks all stage transitions
  itemHistory: defineTable({
    orgId: v.optional(v.id("organizations")),
    itemId: v.id("items"),
    stageId: v.string(),
    stageName: v.string(),
    action: v.string(), // "started", "completed", "paused", "resumed"
    timestamp: v.number(),
    userId: v.optional(v.string()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }),

  // Completed item history table - tracks history for completed items
  completedItemHistory: defineTable({
    orgId: v.optional(v.id("organizations")),
    itemId: v.string(), // Using string since completed items don't have a Convex ID
    stageId: v.string(),
    stageName: v.string(),
    action: v.string(), // "started", "completed", "paused", "resumed"
    timestamp: v.number(),
    userId: v.optional(v.string()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }),

  // Scans table - tracks all QR code scans
  scans: defineTable({
    orgId: v.optional(v.id("organizations")),
    itemId: v.optional(v.string()), // The item that was scanned (if found)
    qrData: v.string(), // The raw QR code data
    scanType: v.union(v.literal("item_lookup"), v.literal("stage_completion"), v.literal("error")),
    success: v.boolean(), // Whether the scan was successful
    errorMessage: v.optional(v.string()), // Error message if scan failed
    userId: v.optional(v.string()), // User who performed the scan
    stageId: v.optional(v.string()), // Stage where scan occurred (for stage completion)
    workflowId: v.optional(v.id("workflows")), // Workflow context
    metadata: v.optional(v.any()), // Additional scan metadata
    timestamp: v.number(),
    deviceInfo: v.optional(v.object({
      userAgent: v.string(),
      platform: v.string(),
      cameraType: v.optional(v.string()),
    })),
  }),

  // Users table - for authentication and permissions
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("operator"), v.literal("viewer"), v.literal("manager")),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastLogin: v.optional(v.number()),
    team: v.optional(v.string()), // Team assignment
    avatar: v.optional(v.string()), // Avatar URL
    phone: v.optional(v.string()), // Phone number
    // Brand interface additions
    brandId: v.optional(v.id("brands")), // For brand users
    factoryId: v.optional(v.id("factories")), // For factory users
    userType: v.optional(v.union(v.literal("brand"), v.literal("factory"), v.literal("system"))), // User type for brand interface
  }).index("by_team", ["team"]).index("by_role", ["role"]).index("by_active", ["isActive"]).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]).index("by_type", ["userType"]),

  // Teams table - for team management
  teams: defineTable({
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    description: v.optional(v.string()),
    managerId: v.optional(v.string()), // User ID of team manager
    members: v.array(v.string()), // Array of user IDs
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"]),

  // Notifications table - for system notifications
  notifications: defineTable({
    orgId: v.optional(v.id("organizations")),
    userId: v.string(), // User who should receive the notification
    type: v.union(
      v.literal("item_assigned"),
      v.literal("item_completed"),
      v.literal("item_defective"),
      v.literal("item_flagged"),
      v.literal("stage_completed"),
      v.literal("message_received"),
      v.literal("task_assigned"),
      v.literal("system_alert"),
      // Brand interface additions
      v.literal("po_submitted"),
      v.literal("po_accepted"),
      v.literal("po_rejected"),
      v.literal("po_completed")
    ),
    title: v.string(),
    message: v.string(),
    itemId: v.optional(v.string()), // Related item ID
    workflowId: v.optional(v.id("workflows")), // Related workflow ID
    stageId: v.optional(v.string()), // Related stage ID
    senderId: v.optional(v.string()), // User who triggered the notification
    isRead: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    metadata: v.optional(v.any()), // Additional notification data
    // Brand interface additions
    brandId: v.optional(v.id("brands")), // For brand notifications
    factoryId: v.optional(v.id("factories")), // For factory notifications
    orderId: v.optional(v.id("purchaseOrders")), // Related purchase order
  }).index("by_user", ["userId"]).index("by_user_read", ["userId", "isRead"]).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]),

  // Messages table - for direct messaging between users
  messages: defineTable({
    orgId: v.optional(v.id("organizations")),
    senderId: v.string(), // User who sent the message
    recipientId: v.string(), // User who should receive the message
    content: v.string(),
    messageType: v.union(v.literal("text"), v.literal("image"), v.literal("file"), v.literal("system")),
    isRead: v.boolean(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    replyToId: v.optional(v.id("messages")), // For reply messages
    metadata: v.optional(v.any()), // Additional message data
    // Brand interface additions
    brandId: v.optional(v.id("brands")), // For brand-factory messages
    factoryId: v.optional(v.id("factories")), // For brand-factory messages
    orderId: v.optional(v.id("purchaseOrders")), // Related purchase order
  }).index("by_sender", ["senderId"]).index("by_recipient", ["recipientId"]).index("by_recipient_read", ["recipientId", "isRead"]).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]),

  // Tasks table - for task assignments
  tasks: defineTable({
    orgId: v.optional(v.id("organizations")),
    title: v.string(),
    description: v.string(),
    assignedTo: v.string(), // User ID
    assignedBy: v.string(), // User ID who assigned the task
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    dueDate: v.optional(v.number()), // Unix timestamp
    itemId: v.optional(v.string()), // Related item ID
    workflowId: v.optional(v.id("workflows")), // Related workflow ID
    stageId: v.optional(v.string()), // Related stage ID
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_assigned_to", ["assignedTo"]).index("by_status", ["status"]),

  // Activity log table - for tracking all system activities
  activityLog: defineTable({
    orgId: v.optional(v.id("organizations")),
    userId: v.optional(v.string()), // User who performed the action
    action: v.string(), // Action performed
    entityType: v.union(v.literal("item"), v.literal("workflow"), v.literal("user"), v.literal("task"), v.literal("message"), v.literal("notification"), v.literal("team"), v.literal("location"), v.literal("brand"), v.literal("factory"), v.literal("purchase_order")),
    entityId: v.optional(v.string()), // ID of the affected entity
    description: v.string(),
    metadata: v.optional(v.any()), // Additional activity data
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    // Brand interface additions
    brandId: v.optional(v.id("brands")), // For brand activities
    factoryId: v.optional(v.id("factories")), // For factory activities
    orderId: v.optional(v.id("purchaseOrders")), // Related purchase order
  }).index("by_user", ["userId"]).index("by_entity", ["entityType", "entityId"]).index("by_timestamp", ["timestamp"]).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]),

  // Location history table - for tracking item movements between locations
  locationHistory: defineTable({
    orgId: v.optional(v.id("organizations")),
    itemId: v.string(), // Item that was moved
    fromLocationId: v.optional(v.id("locations")), // Previous location
    toLocationId: v.id("locations"), // New location
    movedBy: v.string(), // User who moved the item
    movedAt: v.number(), // When the move occurred
    stageId: v.optional(v.string()), // Stage context when moved
    notes: v.optional(v.string()), // Optional notes about the move
    metadata: v.optional(v.any()), // Additional move data
  }).index("by_item", ["itemId"]).index("by_location", ["toLocationId"]).index("by_timestamp", ["movedAt"]),

  // Locations table - for inventory location management
  locations: defineTable({
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("bin"), v.literal("shelf"), v.literal("rack"), v.literal("area"), v.literal("zone")),
    qrCode: v.string(), // QR code data for scanning
    parentLocationId: v.optional(v.id("locations")), // For hierarchical locations (e.g., shelf within rack)
    assignedStageId: v.optional(v.string()), // Stage that uses this location
    assignedDeviceId: v.optional(v.string()), // Device that uses this location
    capacity: v.optional(v.number()), // Maximum number of items this location can hold
    currentOccupancy: v.optional(v.number()), // Current number of items in this location
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  }).index("by_qr", ["qrCode"]).index("by_type", ["type"]).index("by_active", ["isActive"]).index("by_stage", ["assignedStageId"]),

  // System settings table
  settings: defineTable({
    orgId: v.optional(v.id("organizations")),
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }),

  // Brands table - for brand management
  brands: defineTable({
    orgId: v.optional(v.id("organizations")),
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
  }).index("by_active", ["isActive"]),

  // Factories table - for factory management
  factories: defineTable({
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    location: v.string(),
    adminUserId: v.string(), // Primary admin user
    isActive: v.boolean(),
    capacity: v.optional(v.number()),
    specialties: v.optional(v.array(v.string())), // Production capabilities
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_admin", ["adminUserId"]).index("by_active", ["isActive"]),

  // Brand-Factory relationships table
  brandFactoryRelations: defineTable({
    orgId: v.optional(v.id("organizations")),
    brandId: v.id("brands"),
    factoryId: v.id("factories"),
    isActive: v.boolean(),
    partnershipStartDate: v.number(),
    notes: v.optional(v.string()),
  }).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]),

  // Purchase Orders table - for brand orders
  purchaseOrders: defineTable({
    orgId: v.optional(v.id("organizations")),
    brandId: v.id("brands"),
    factoryId: v.id("factories"),
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
  }).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]).index("by_status", ["status"]),
}); 