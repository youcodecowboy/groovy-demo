import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Create a new brand
export const createBrand = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    contactPerson: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    logo: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const brandId = await ctx.db.insert("brands", {
      name: args.name,
      email: args.email,
      contactPerson: args.contactPerson,
      phone: args.phone,
      address: args.address,
      logo: args.logo,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: args.metadata,
    })
    return brandId
  },
})

// Get a brand by ID
export const getBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.brandId)
  },
})

// Get all active brands
export const listBrands = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect()
  },
})

// Update a brand
export const updateBrand = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    logo: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { brandId, ...updates } = args
    return await ctx.db.patch(brandId, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

// Get brands by factory (for factory admins)
export const getBrandsByFactory = query({
  args: { factoryId: v.id("factories") },
  handler: async (ctx, args) => {
    const relations = await ctx.db
      .query("brandFactoryRelations")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    const brandIds = relations.map((rel) => rel.brandId)
    const brands = await Promise.all(
      brandIds.map((id) => ctx.db.get(id))
    )
    
    return brands.filter(Boolean)
  },
})

// Get all brands
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("brands")
      .order("desc")
      .collect()
  },
})

// ===== DASHBOARD FUNCTIONS =====

// Get comprehensive dashboard data for a brand
export const getBrandDashboardData = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    // Get all purchase orders for this brand
    const purchaseOrders = await ctx.db
      .query("purchaseOrders")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect()

    // Get all factories this brand works with
    const brandFactoryRelations = await ctx.db
      .query("brandFactoryRelations")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    const factoryIds = brandFactoryRelations.map(rel => rel.factoryId)
    const factories = await Promise.all(
      factoryIds.map(id => ctx.db.get(id))
    )

    // Calculate dashboard metrics
    const pendingPOs = purchaseOrders.filter(po => po.status === "pending").length
    const acceptedPOs = purchaseOrders.filter(po => po.status === "accepted" || po.status === "in_production").length
    const totalOpenValue = purchaseOrders
      .filter(po => ["pending", "accepted", "in_production", "paused"].includes(po.status))
      .reduce((sum, po) => sum + po.totalValue, 0)

    // Calculate schedule adherence
    const now = Date.now()
    const aheadOfSchedule = purchaseOrders.filter(po => {
      if (!po.promisedDeliveryDate || po.status === "completed") return false
      const daysUntilDue = (po.promisedDeliveryDate - now) / (1000 * 60 * 60 * 24)
      const progress = po.progress ? (po.progress.completedItems / po.progress.totalItems) * 100 : 0
      const expectedProgress = Math.min(100, ((now - po.submittedAt) / (po.promisedDeliveryDate - po.submittedAt)) * 100)
      return progress > expectedProgress + 10
    }).length

    const behindSchedule = purchaseOrders.filter(po => {
      if (!po.promisedDeliveryDate || po.status === "completed") return false
      const daysUntilDue = (po.promisedDeliveryDate - now) / (1000 * 60 * 60 * 24)
      const progress = po.progress ? (po.progress.completedItems / po.progress.totalItems) * 100 : 0
      const expectedProgress = Math.min(100, ((now - po.submittedAt) / (po.promisedDeliveryDate - po.submittedAt)) * 100)
      return progress < expectedProgress - 10
    }).length

    const onTrack = purchaseOrders.filter(po => {
      if (!po.promisedDeliveryDate || po.status === "completed") return false
      const progress = po.progress ? (po.progress.completedItems / po.progress.totalItems) * 100 : 0
      const expectedProgress = Math.min(100, ((now - po.submittedAt) / (po.promisedDeliveryDate - po.submittedAt)) * 100)
      return Math.abs(progress - expectedProgress) <= 10
    }).length

    const onTimePercentage = purchaseOrders.length > 0 
      ? Math.round(((onTrack + aheadOfSchedule) / purchaseOrders.length) * 100)
      : 0

    return {
      overview: {
        pendingPOs,
        acceptedPOs,
        totalOpenValue,
        onTimePercentage,
        aheadOfSchedule,
        onTrack,
        behindSchedule
      },
      purchaseOrders,
      factories: factories.filter(Boolean),
      brandFactoryRelations
    }
  },
})

// Get active orders with detailed progress for dashboard
export const getBrandActiveOrders = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const purchaseOrders = await ctx.db
      .query("purchaseOrders")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect()

    // Get factory details for each PO
    const factoryIds = [...new Set(purchaseOrders.map(po => po.factoryId))]
    const factories = await Promise.all(
      factoryIds.map(id => ctx.db.get(id))
    )
    const factoryMap = new Map(factories.filter((f): f is NonNullable<typeof f> => f !== null).map(f => [f._id, f]))

    // Get items for each PO to calculate progress
    const items = await ctx.db
      .query("items")
      .collect()

    const itemsByPO = new Map()
    items.forEach((item: any) => {
      if (item.purchaseOrderId) {
        if (!itemsByPO.has(item.purchaseOrderId)) {
          itemsByPO.set(item.purchaseOrderId, [])
        }
        itemsByPO.get(item.purchaseOrderId).push(item)
      }
    })

    return purchaseOrders.map(po => {
      const factory = factoryMap.get(po.factoryId)
      const poItems = itemsByPO.get(po._id) || []
      const completedItems = poItems.filter((item: any) => item.status === "completed").length
      const totalItems = poItems.length || po.progress?.totalItems || 0
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      // Calculate schedule status
      const now = Date.now()
      let scheduleStatus = "on_track"
      if (po.promisedDeliveryDate) {
        const daysUntilDue = (po.promisedDeliveryDate - now) / (1000 * 60 * 60 * 24)
        const expectedProgress = Math.min(100, ((now - po.submittedAt) / (po.promisedDeliveryDate - po.submittedAt)) * 100)
        if (progress > expectedProgress + 10) {
          scheduleStatus = "ahead"
        } else if (progress < expectedProgress - 10) {
          scheduleStatus = "behind"
        }
      }

      return {
        id: po.poNumber,
        factory: factory?.name || "Unknown Factory",
        factoryId: po.factoryId,
        location: factory?.location || "Unknown Location",
        status: po.status,
        items: totalItems,
        value: po.totalValue,
        dueDate: po.promisedDeliveryDate || po.requestedDeliveryDate,
        progress,
        stage: po.status === "pending" ? "Pending Review" : "In Production",
        priority: po.metadata?.priority || "medium",
        scheduleStatus,
        itemsCompleted: completedItems,
        itemsInStage: totalItems - completedItems,
        defects: po.progress?.defectiveItems || 0,
        reworks: po.progress?.reworkItems || 0
      }
    })
  },
})

// Get recent activity for brand dashboard
export const getBrandRecentActivity = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const now = Date.now()
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)

    // Get recent activity logs
    const activities = await ctx.db
      .query("activityLog")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.gte(q.field("timestamp"), oneWeekAgo))
      .order("desc")
      .take(20)

    // Get recent notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.gte(q.field("createdAt"), oneWeekAgo))
      .order("desc")
      .take(10)

    // Combine and format activities
    const combinedActivities = [
      ...activities.map(activity => ({
        id: activity._id,
        type: activity.action,
        message: activity.description,
        timestamp: activity.timestamp,
        factory: "System", // Could be enhanced to get factory name
        color: "blue",
        impact: "neutral"
      })),
      ...notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        message: notification.message,
        timestamp: notification.createdAt,
        factory: "System",
        color: notification.priority === "high" ? "red" : "blue",
        impact: notification.priority === "high" ? "negative" : "neutral"
      }))
    ].sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)

    return combinedActivities
  },
})

// Get factory locations for map view
export const getBrandFactoryLocations = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const brandFactoryRelations = await ctx.db
      .query("brandFactoryRelations")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    const factoryIds = brandFactoryRelations.map(rel => rel.factoryId)
    const factories = await Promise.all(
      factoryIds.map(id => ctx.db.get(id))
    )

    // Get active orders count for each factory
    const purchaseOrders = await ctx.db
      .query("purchaseOrders")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect()

    const ordersByFactory = new Map()
    purchaseOrders.forEach(po => {
      const count = ordersByFactory.get(po.factoryId) || 0
      ordersByFactory.set(po.factoryId, count + 1)
    })

    return factories.filter(Boolean).map(factory => ({
      id: factory._id,
      name: factory.name,
      location: factory.location,
      lat: 0, // Placeholder - would need coordinates in factory schema
      lng: 0, // Placeholder - would need coordinates in factory schema
      activeOrders: ordersByFactory.get(factory._id) || 0,
      status: factory.isActive ? "active" : "inactive"
    }))
  },
})

// ===== ORDERS MANAGEMENT FUNCTIONS =====

// Get all purchase orders for a brand with filtering
export const getBrandPurchaseOrders = query({
  args: { 
    brandId: v.id("brands"),
    status: v.optional(v.string()),
    factoryId: v.optional(v.id("factories")),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("purchaseOrders")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))

    // Apply status filter
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status))
    }

    // Apply factory filter
    if (args.factoryId) {
      query = query.filter((q) => q.eq(q.field("factoryId"), args.factoryId))
    }

    const purchaseOrders = await query.order("desc").collect()

    // Get factory details for each PO
    const factoryIds = [...new Set(purchaseOrders.map(po => po.factoryId))]
    const factories = await Promise.all(
      factoryIds.map(id => ctx.db.get(id))
    )
    const factoryMap = new Map(factories.filter((f): f is NonNullable<typeof f> => f !== null).map(f => [f._id, f]))

    // Get items for each PO to calculate progress
    const items = await ctx.db
      .query("items")
      .collect()

    const itemsByPO = new Map()
    items.forEach((item: any) => {
      if (item.purchaseOrderId) {
        if (!itemsByPO.has(item.purchaseOrderId)) {
          itemsByPO.set(item.purchaseOrderId, [])
        }
        itemsByPO.get(item.purchaseOrderId).push(item)
      }
    })

    const result = purchaseOrders.map(po => {
      const factory = factoryMap.get(po.factoryId)
      const poItems = itemsByPO.get(po._id) || []
      const completedItems = poItems.filter((item: any) => item.status === "completed").length
      const totalItems = poItems.length || po.progress?.totalItems || 0
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      // Calculate schedule status
      const now = Date.now()
      let scheduleStatus = "on_track"
      if (po.promisedDeliveryDate) {
        const daysUntilDue = (po.promisedDeliveryDate - now) / (1000 * 60 * 60 * 24)
        const expectedProgress = Math.min(100, ((now - po.submittedAt) / (po.promisedDeliveryDate - po.submittedAt)) * 100)
        if (progress > expectedProgress + 10) {
          scheduleStatus = "ahead"
        } else if (progress < expectedProgress - 10) {
          scheduleStatus = "behind"
        }
      }

      return {
        id: po._id,
        poNumber: po.poNumber,
        factory: factory?.name || "Unknown Factory",
        factoryId: po.factoryId,
        location: factory?.location || "Unknown Location",
        status: po.status,
        items: totalItems,
        value: po.totalValue,
        dueDate: po.promisedDeliveryDate || po.requestedDeliveryDate,
        progress,
        priority: po.metadata?.priority || "medium",
        scheduleStatus,
        itemsCompleted: completedItems,
        defects: po.progress?.defectiveItems || 0,
        reworks: po.progress?.reworkItems || 0,
        submittedAt: po.submittedAt,
        acceptedAt: po.acceptedAt,
        completedAt: po.completedAt
      }
    })

    // Apply limit if specified
    if (args.limit) {
      return result.slice(0, args.limit)
    }

    return result
  },
})

// Get detailed purchase order information
export const getBrandPurchaseOrderDetails = query({
  args: { 
    brandId: v.id("brands"),
    poId: v.id("purchaseOrders")
  },
  handler: async (ctx, args) => {
    const purchaseOrder = await ctx.db.get(args.poId)
    
    if (!purchaseOrder || purchaseOrder.brandId !== args.brandId) {
      return null
    }

    // Get factory details
    const factory = await ctx.db.get(purchaseOrder.factoryId)

    // Get items for this PO
    const items = await ctx.db
      .query("items")
      .withIndex("by_po", (q) => q.eq("purchaseOrderId", args.poId))
      .collect()

    // Get activity log for this PO
    const activities = await ctx.db
      .query("activityLog")
      .withIndex("by_entity", (q) => 
        q.eq("entityType", "purchase_order")
        .eq("entityId", args.poId)
      )
      .order("desc")
      .collect()

    // Get messages related to this PO
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", "system"))
      .filter((q) => q.eq(q.field("orderId"), args.poId))
      .order("desc")
      .collect()

    return {
      purchaseOrder,
      factory,
      items,
      activities,
      messages
    }
  },
})

// Get factories available for a brand
export const getBrandFactories = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const brandFactoryRelations = await ctx.db
      .query("brandFactoryRelations")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    const factoryIds = brandFactoryRelations.map(rel => rel.factoryId)
    const factories = await Promise.all(
      factoryIds.map(id => ctx.db.get(id))
    )

    return factories.filter(Boolean).map(factory => ({
      id: factory._id,
      name: factory.name,
      location: factory.location,
      country: factory.location.split(', ').pop() || factory.location,
      capabilities: factory.specialties || [],
      leadTime: factory.publicProfile?.leadTime || 0,
      responseTime: factory.publicProfile?.responseTime || 0,
      certifications: factory.publicProfile?.certifications || [],
      isActive: factory.isActive
    }))
  },
})

// Create a new purchase order for a brand
export const createBrandPurchaseOrder = mutation({
  args: {
    brandId: v.id("brands"),
    factoryId: v.id("factories"),
    poNumber: v.string(),
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
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
    paymentTerms: v.optional(v.string()),
    assignedTeam: v.optional(v.string()),
    orderOwner: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const totalItems = args.items.reduce((sum, item) => sum + item.quantity, 0)
    
    const poId = await ctx.db.insert("purchaseOrders", {
      brandId: args.brandId,
      factoryId: args.factoryId,
      poNumber: args.poNumber,
      status: "pending",
      items: args.items,
      totalValue: args.totalValue,
      requestedDeliveryDate: args.requestedDeliveryDate,
      promisedDeliveryDate: args.promisedDeliveryDate,
      submittedAt: Date.now(),
      notes: args.notes,
      metadata: args.metadata,
      progress: {
        totalItems,
        completedItems: 0,
        defectiveItems: 0,
        reworkItems: 0,
        lastUpdated: Date.now(),
      },
      financials: {
        orderValue: args.totalValue,
        paymentTerms: args.paymentTerms,
        paymentsReceived: [],
        totalPaid: 0,
      },
      leadTime: args.promisedDeliveryDate ? {
        promisedDays: Math.ceil((args.promisedDeliveryDate - Date.now()) / (1000 * 60 * 60 * 24)),
        status: "on_track",
      } : undefined,
      assignedTeam: args.assignedTeam,
      orderOwner: args.orderOwner,
      auditLog: [{
        action: "created",
        timestamp: Date.now(),
        userId: "system",
        details: { poNumber: args.poNumber },
      }],
    })

    // Log activity
    await ctx.db.insert("activityLog", {
      brandId: args.brandId,
      factoryId: args.factoryId,
      action: "purchase_order_created",
      entityType: "purchase_order",
      entityId: poId,
      description: `Purchase order ${args.poNumber} created`,
      timestamp: Date.now(),
      metadata: {
        poNumber: args.poNumber,
        totalValue: args.totalValue,
        itemCount: args.items.length
      }
    })

    return poId
  },
})