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
      color: v.optional(v.string()), // Color for UI display
      position: v.optional(v.object({ x: v.number(), y: v.number() })), // Position for canvas layout
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
    qrPrinted: v.optional(v.boolean()), // Whether QR code has been printed
    qrPrintedAt: v.optional(v.number()), // When QR code was printed
    qrPrintedBy: v.optional(v.string()), // Who printed the QR code
    currentLocationId: v.optional(v.id("locations")), // Current location of the item
    isDefective: v.optional(v.boolean()), // Flag for defective items
    defectNotes: v.optional(v.string()), // Notes about the defect
    flaggedBy: v.optional(v.string()), // User who flagged the item
    flaggedAt: v.optional(v.number()), // When the item was flagged
    // Brand interface additions
    brandId: v.optional(v.id("brands")), // Link items to brands
    factoryId: v.optional(v.id("factories")), // Link items to factories
    purchaseOrderId: v.optional(v.id("purchaseOrders")), // Link items to POs
    // Enhanced item management
    itemTypeId: v.optional(v.id("itemTypes")), // Link to item type
    attributes: v.optional(v.array(v.object({
      attributeId: v.string(),
      value: v.any(),
      lastUpdated: v.number(),
      updatedBy: v.string(),
    }))),
  }).index("by_user", ["assignedTo"]).index("by_location", ["currentLocationId"]).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]).index("by_po", ["purchaseOrderId"]).index("by_type", ["itemTypeId"]),

  // Item attributes table - defines custom attributes for items
  itemAttributes: defineTable({
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    type: v.union(v.literal("text"), v.literal("number"), v.literal("select"), v.literal("date"), v.literal("boolean"), v.literal("url"), v.literal("email")),
    description: v.optional(v.string()),
    required: v.boolean(),
    defaultValue: v.optional(v.any()),
    validation: v.optional(v.object({
      minLength: v.optional(v.number()),
      maxLength: v.optional(v.number()),
      minValue: v.optional(v.number()),
      maxValue: v.optional(v.number()),
      pattern: v.optional(v.string()),
      customValidation: v.optional(v.string()),
    })),
    options: v.optional(v.array(v.string())), // For select type
    group: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  }).index("by_org", ["orgId"]).index("by_group", ["group"]),

  // Item types table - defines item types with their attributes
  itemTypes: defineTable({
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    description: v.optional(v.string()),
    attributes: v.array(v.string()), // Array of attribute IDs
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  }).index("by_org", ["orgId"]),

  // Attribute templates table - pre-defined attribute sets
  attributeTemplates: defineTable({
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    description: v.optional(v.string()),
    attributes: v.array(v.string()), // Array of attribute IDs
    category: v.union(v.literal("production"), v.literal("quality"), v.literal("logistics"), v.literal("custom")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  }).index("by_org", ["orgId"]).index("by_category", ["category"]),

  // Bulk operations table - tracks bulk item operations
  bulkOperations: defineTable({
    orgId: v.optional(v.id("organizations")),
    type: v.union(v.literal("create"), v.literal("update"), v.literal("delete"), v.literal("export")),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    items: v.array(v.string()), // Array of item IDs
    template: v.optional(v.id("attributeTemplates")),
    filters: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    createdBy: v.string(),
  }).index("by_org", ["orgId"]).index("by_status", ["status"]),

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
    // Public profile fields
    publicProfile: v.optional(v.object({
      isEnabled: v.boolean(),
      qrCode: v.optional(v.string()), // QR code data for scanning
      slug: v.optional(v.string()), // URL slug for public profile
      description: v.optional(v.string()),
      leadTime: v.optional(v.number()), // Average lead time in days
      responseTime: v.optional(v.number()), // Average response time in hours
      certifications: v.optional(v.array(v.string())),
      photoGallery: v.optional(v.array(v.string())), // Array of image URLs
      whatWeMake: v.optional(v.string()), // Description of products/services
      minimumOrderQuantity: v.optional(v.number()),
      paymentTerms: v.optional(v.string()),
      shippingInfo: v.optional(v.string()),
      contactInfo: v.optional(v.object({
        email: v.string(),
        phone: v.string(),
        website: v.string(),
      })),
      socialLinks: v.optional(v.object({
        linkedin: v.optional(v.string()),
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
      })),
      verifiedMetrics: v.optional(v.object({
        totalOrders: v.number(),
        averageRating: v.number(),
        onTimeDelivery: v.number(), // Percentage
        customerSatisfaction: v.number(), // Percentage
      })),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_admin", ["adminUserId"]).index("by_active", ["isActive"]).index("by_slug", ["publicProfile.slug"]),

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
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("in_production"), v.literal("paused"), v.literal("completed"), v.literal("cancelled")),
    items: v.array(v.object({
      sku: v.string(),
      quantity: v.number(),
      description: v.string(),
      specifications: v.optional(v.any()),
      unitPrice: v.optional(v.number()),
      variant: v.optional(v.string()),
      size: v.optional(v.string()),
      color: v.optional(v.string()),
    })),
    totalValue: v.number(),
    requestedDeliveryDate: v.number(),
    promisedDeliveryDate: v.optional(v.number()),
    submittedAt: v.number(),
    acceptedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.string()), // User ID
    productionStartDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
    // Enhanced fields for production tracking
    progress: v.optional(v.object({
      totalItems: v.number(),
      completedItems: v.number(),
      defectiveItems: v.number(),
      reworkItems: v.number(),
      lastUpdated: v.number(),
    })),
    // Financial tracking
    financials: v.optional(v.object({
      orderValue: v.number(),
      estimatedLaborCost: v.optional(v.number()),
      estimatedMaterialsCost: v.optional(v.number()),
      actualLaborCost: v.optional(v.number()),
      actualMaterialsCost: v.optional(v.number()),
      overheads: v.optional(v.number()),
      grossMargin: v.optional(v.number()),
      paymentTerms: v.optional(v.string()),
      paymentsReceived: v.optional(v.array(v.object({
        amount: v.number(),
        date: v.number(),
        method: v.string(),
        reference: v.optional(v.string()),
      }))),
      totalPaid: v.optional(v.number()),
    })),
    // Lead time tracking
    leadTime: v.optional(v.object({
      promisedDays: v.number(),
      actualDays: v.optional(v.number()),
      status: v.optional(v.union(v.literal("ahead"), v.literal("on_track"), v.literal("behind"))),
    })),
    // Team assignment
    assignedTeam: v.optional(v.string()),
    orderOwner: v.optional(v.string()),
    // Attachments and documents
    attachments: v.optional(v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
      uploadedAt: v.number(),
      uploadedBy: v.string(),
    }))),
    // Audit trail
    auditLog: v.optional(v.array(v.object({
      action: v.string(),
      timestamp: v.number(),
      userId: v.string(),
      details: v.optional(v.any()),
    }))),
  }).index("by_brand", ["brandId"]).index("by_factory", ["factoryId"]).index("by_status", ["status"]).index("by_org", ["orgId"]),

  // Customers table - for customer management
  customers: defineTable({
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    companyName: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("prospect"), v.literal("lead")),
    type: v.union(v.literal("individual"), v.literal("business"), v.literal("enterprise")),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    })),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.string()), // User ID assigned to this customer
    source: v.optional(v.string()), // How they found us
    value: v.optional(v.number()), // Customer lifetime value
    lastContact: v.optional(v.number()), // Last contact timestamp
    nextFollowUp: v.optional(v.number()), // Next follow-up date
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  }).index("by_status", ["status"]).index("by_type", ["type"]).index("by_assigned", ["assignedTo"]).index("by_active", ["isActive"]),

  // Customer contacts table - for individual contacts within customers
  customerContacts: defineTable({
    orgId: v.optional(v.id("organizations")),
    customerId: v.id("customers"),
    firstName: v.string(),
    lastName: v.string(),
    title: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    mobile: v.optional(v.string()),
    isPrimary: v.boolean(), // Primary contact for the customer
    department: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_customer", ["customerId"]).index("by_primary", ["customerId", "isPrimary"]).index("by_active", ["isActive"]),

  // Customer interactions table - for tracking all customer touchpoints
  customerInteractions: defineTable({
    orgId: v.optional(v.id("organizations")),
    customerId: v.id("customers"),
    contactId: v.optional(v.id("customerContacts")),
    type: v.union(v.literal("call"), v.literal("email"), v.literal("meeting"), v.literal("note"), v.literal("quote"), v.literal("order"), v.literal("support")),
    subject: v.string(),
    description: v.string(),
    outcome: v.optional(v.string()),
    followUpRequired: v.boolean(),
    followUpDate: v.optional(v.number()),
    assignedTo: v.string(), // User ID
    createdAt: v.number(),
    createdBy: v.string(),
  }).index("by_customer", ["customerId"]).index("by_contact", ["contactId"]).index("by_type", ["type"]).index("by_assigned", ["assignedTo"]),

  // Factory profile views and QR scans tracking
  factoryProfileViews: defineTable({
    orgId: v.optional(v.id("organizations")),
    factoryId: v.id("factories"),
    visitorType: v.union(v.literal("qr_scan"), v.literal("direct_visit"), v.literal("search")),
    visitorInfo: v.optional(v.object({
      ipAddress: v.string(),
      userAgent: v.string(),
      location: v.optional(v.string()),
      referrer: v.optional(v.string()),
    })),
    actionTaken: v.optional(v.union(v.literal("viewed_profile"), v.literal("contacted"), v.literal("added_to_crm"), v.literal("requested_quote"))),
    brandId: v.optional(v.id("brands")), // If visitor is a known brand
    createdAt: v.number(),
  }).index("by_factory", ["factoryId"]).index("by_visitor_type", ["visitorType"]).index("by_action", ["actionTaken"]),
}); 