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
    })),
    totalValue: v.number(),
    requestedDeliveryDate: v.number(),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const poId = await ctx.db.insert("purchaseOrders", {
      brandId: args.brandId,
      factoryId: args.factoryId,
      poNumber: args.poNumber,
      status: "pending",
      items: args.items,
      totalValue: args.totalValue,
      requestedDeliveryDate: args.requestedDeliveryDate,
      submittedAt: Date.now(),
      notes: args.notes,
      metadata: args.metadata,
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
      notes: args.notes,
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const po = await ctx.db.get(args.poId)
    if (!po) throw new Error("Purchase order not found")
    if (po.status !== "pending") throw new Error("Purchase order is not pending")

    return await ctx.db.patch(args.poId, {
      status: "rejected",
      notes: args.notes,
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
    if (po.status !== "accepted") throw new Error("Purchase order is not accepted")

    return await ctx.db.patch(args.poId, {
      status: "completed",
      notes: args.notes,
    })
  },
}) 