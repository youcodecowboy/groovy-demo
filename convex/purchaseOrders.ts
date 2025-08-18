import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Create a new purchase order
export const createPurchaseOrder = mutation({
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
    return poId
  },
})

// Get a purchase order by ID
export const getPurchaseOrder = query({
  args: { poId: v.id("purchaseOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.poId)
  },
})

// Get purchase orders by brand
export const listPurchaseOrdersByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("purchaseOrders")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect()
  },
})

// Get purchase orders by factory
export const listPurchaseOrdersByFactory = query({
  args: { factoryId: v.id("factories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("purchaseOrders")
      .withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
      .order("desc")
      .collect()
  },
})

// Get purchase orders by status (for inbox, active, etc.)
export const listPurchaseOrdersByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("purchaseOrders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect()
  },
})

// Get all purchase orders with enhanced filtering
export const listPurchaseOrders = query({
  args: {
    status: v.optional(v.string()),
    brandId: v.optional(v.id("brands")),
    factoryId: v.optional(v.id("factories")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("purchaseOrders")
    
    if (args.status && args.status !== "all") {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status))
    } else if (args.brandId) {
      query = query.withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
    } else if (args.factoryId) {
      query = query.withIndex("by_factory", (q) => q.eq("factoryId", args.factoryId))
    }
    
    const orders = await query.order("desc").collect()
    
    // Apply search filter if provided
    if (args.search) {
      return orders.filter(order => 
        order.poNumber.toLowerCase().includes(args.search!.toLowerCase()) ||
        order.notes?.toLowerCase().includes(args.search!.toLowerCase())
      )
    }
    
    return orders
  },
})

// Accept a purchase order (creates items)
export const acceptPurchaseOrder = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    acceptedBy: v.string(),
    workflowId: v.id("workflows"),
    startDate: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the purchase order
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")
    if (po.status !== "pending") throw new Error("Purchase order is not pending")

    // Get the selected workflow
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) throw new Error("Workflow not found")
    if (!workflow.isActive) throw new Error("Workflow is not active")

    const firstStage = workflow.stages.find((stage: any) => stage.order === 0) || workflow.stages[0]

    // Update the PO status
    await ctx.db.patch(args.poId, {
      status: "accepted",
      acceptedAt: Date.now(),
      acceptedBy: args.acceptedBy,
      productionStartDate: args.startDate,
      notes: args.notes,
      auditLog: [
        ...(po.auditLog || []),
        {
          action: "accepted",
          timestamp: Date.now(),
          userId: args.acceptedBy,
          details: { workflowId: args.workflowId, startDate: args.startDate },
        }
      ],
    })

    // Create items for each PO item
    const createdItems = []
    for (const poItem of po.items) {
      for (let i = 0; i < poItem.quantity; i++) {
        const itemId = await ctx.db.insert("items", {
          itemId: `${poItem.sku}-${i + 1}`, // Generate unique SKU
          workflowId: workflow._id,
          currentStageId: firstStage.id,
          status: "active",
          metadata: {
            brand: poItem.description,
            sku: poItem.sku,
            specifications: poItem.specifications,
            productionStartDate: args.startDate,
            purchaseOrderId: po.poNumber,
            variant: poItem.variant,
            size: poItem.size,
            color: poItem.color,
          },
          startedAt: args.startDate, // Use the selected start date
          updatedAt: Date.now(),
          brandId: po.brandId,
          factoryId: po.factoryId,
          purchaseOrderId: args.poId,
        })
        createdItems.push(itemId)
      }
    }

    return { poId: args.poId, createdItems, workflowId: workflow._id, startDate: args.startDate }
  },
})

// Reject a purchase order
export const rejectPurchaseOrder = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    rejectedBy: v.string(),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")
    if (po.status !== "pending") throw new Error("Purchase order is not pending")

    return await ctx.db.patch(args.poId, {
      status: "rejected",
      notes: args.notes,
      auditLog: [
        ...(po.auditLog || []),
        {
          action: "rejected",
          timestamp: Date.now(),
          userId: args.rejectedBy,
          details: { reason: args.reason },
        }
      ],
    })
  },
})

// Update order progress
export const updateOrderProgress = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    progress: v.object({
      totalItems: v.number(),
      completedItems: v.number(),
      defectiveItems: v.number(),
      reworkItems: v.number(),
    }),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")

    const newProgress = {
      ...args.progress,
      lastUpdated: Date.now(),
    }

    // Determine if order should be marked as in_production or completed
    let newStatus = po.status
    if (newProgress.completedItems > 0 && po.status === "accepted") {
      newStatus = "in_production"
    }
    if (newProgress.completedItems === newProgress.totalItems && newProgress.totalItems > 0) {
      newStatus = "completed"
    }

    return await ctx.db.patch(args.poId, {
      progress: newProgress,
      status: newStatus,
      completedAt: newStatus === "completed" ? Date.now() : po.completedAt,
      completedBy: newStatus === "completed" ? args.updatedBy : po.completedBy,
      auditLog: [
        ...(po.auditLog || []),
        {
          action: "progress_updated",
          timestamp: Date.now(),
          userId: args.updatedBy,
          details: { progress: newProgress },
        }
      ],
    })
  },
})

// Update order financials
export const updateOrderFinancials = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    financials: v.object({
      estimatedLaborCost: v.optional(v.number()),
      estimatedMaterialsCost: v.optional(v.number()),
      actualLaborCost: v.optional(v.number()),
      actualMaterialsCost: v.optional(v.number()),
      overheads: v.optional(v.number()),
    }),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")

    const currentFinancials = po.financials || { orderValue: po.totalValue, paymentsReceived: [], totalPaid: 0 }
    const newFinancials = {
      ...currentFinancials,
      ...args.financials,
      grossMargin: (currentFinancials.orderValue || po.totalValue) - 
        ((args.financials.actualLaborCost || 0) + 
         (args.financials.actualMaterialsCost || 0) + 
         (args.financials.overheads || 0)),
    }

    return await ctx.db.patch(args.poId, {
      financials: newFinancials,
      auditLog: [
        ...(po.auditLog || []),
        {
          action: "financials_updated",
          timestamp: Date.now(),
          userId: args.updatedBy,
          details: { financials: newFinancials },
        }
      ],
    })
  },
})

// Record payment
export const recordPayment = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    payment: v.object({
      amount: v.number(),
      method: v.string(),
      reference: v.optional(v.string()),
    }),
    recordedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")

    const currentFinancials = po.financials || { orderValue: po.totalValue, paymentsReceived: [], totalPaid: 0 }
    const newPayment = {
      ...args.payment,
      date: Date.now(),
    }
    
    const newPayments = [...(currentFinancials.paymentsReceived || []), newPayment]
    const totalPaid = newPayments.reduce((sum, payment) => sum + payment.amount, 0)

    const newFinancials = {
      ...currentFinancials,
      paymentsReceived: newPayments,
      totalPaid,
    }

    return await ctx.db.patch(args.poId, {
      financials: newFinancials,
      auditLog: [
        ...(po.auditLog || []),
        {
          action: "payment_recorded",
          timestamp: Date.now(),
          userId: args.recordedBy,
          details: { payment: newPayment },
        }
      ],
    })
  },
})

// Complete a purchase order
export const completePurchaseOrder = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    completedBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")
    if (po.status !== "in_production") throw new Error("Purchase order is not in production")

    return await ctx.db.patch(args.poId, {
      status: "completed",
      completedAt: Date.now(),
      completedBy: args.completedBy,
      notes: args.notes,
      auditLog: [
        ...(po.auditLog || []),
        {
          action: "completed",
          timestamp: Date.now(),
          userId: args.completedBy,
          details: { notes: args.notes },
        }
      ],
    })
  },
})

// Pause a purchase order
export const pausePurchaseOrder = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    pausedBy: v.string(),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")
    if (!["accepted", "in_production"].includes(po.status)) {
      throw new Error("Purchase order cannot be paused in current status")
    }

    return await ctx.db.patch(args.poId, {
      status: "paused",
      notes: args.notes,
      auditLog: [
        ...(po.auditLog || []),
        {
          action: "paused",
          timestamp: Date.now(),
          userId: args.pausedBy,
          details: { reason: args.reason },
        }
      ],
    })
  },
})

// Resume a purchase order
export const resumePurchaseOrder = mutation({
  args: {
    poId: v.id("purchaseOrders"),
    resumedBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")
    if (po.status !== "paused") throw new Error("Purchase order is not paused")

    const newStatus = po.progress?.completedItems > 0 ? "in_production" : "accepted"

    return await ctx.db.patch(args.poId, {
      status: newStatus,
      notes: args.notes,
      auditLog: [
        ...(po.auditLog || []),
        {
          action: "resumed",
          timestamp: Date.now(),
          userId: args.resumedBy,
          details: { newStatus },
        }
      ],
    })
  },
})

// Get all purchase orders
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("purchaseOrders")
      .order("desc")
      .collect()
  },
})