import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { resolveOrgId } from "./util"

// Item Attributes
export const createAttribute = mutation({
  args: {
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
    options: v.optional(v.array(v.string())),
    group: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const attributeId = await ctx.db.insert("itemAttributes", {
      orgId,
      name: args.name,
      type: args.type,
      description: args.description,
      required: args.required,
      defaultValue: args.defaultValue,
      validation: args.validation,
      options: args.options,
      group: args.group,
      order: args.order,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: identity.subject,
    })

    return attributeId
  }
})

export const updateAttribute = mutation({
  args: {
    id: v.id("itemAttributes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    required: v.optional(v.boolean()),
    defaultValue: v.optional(v.any()),
    validation: v.optional(v.object({
      minLength: v.optional(v.number()),
      maxLength: v.optional(v.number()),
      minValue: v.optional(v.number()),
      maxValue: v.optional(v.number()),
      pattern: v.optional(v.string()),
      customValidation: v.optional(v.string()),
    })),
    options: v.optional(v.array(v.string())),
    group: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
    return id
  }
})

export const deleteAttribute = mutation({
  args: { id: v.id("itemAttributes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return true
  }
})

export const getAttributes = query({
  args: {
    group: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    let query = ctx.db
      .query("itemAttributes")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .filter((q) => q.eq(q.field("isActive"), true))

    if (args.group) {
      query = query.filter((q) => q.eq(q.field("group"), args.group))
    }

    return await query.collect()
  }
})

// Item Types
export const createItemType = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    attributes: v.array(v.string()), // Array of attribute IDs
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const itemTypeId = await ctx.db.insert("itemTypes", {
      orgId,
      name: args.name,
      description: args.description,
      attributes: args.attributes,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: identity.subject,
    })

    return itemTypeId
  }
})

export const updateItemType = mutation({
  args: {
    id: v.id("itemTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    attributes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
    return id
  }
})

export const deleteItemType = mutation({
  args: { id: v.id("itemTypes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return true
  }
})

export const getItemTypes = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx)
    
    return await ctx.db
      .query("itemTypes")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()
  }
})

export const getItemTypeWithAttributes = query({
  args: { id: v.id("itemTypes") },
  handler: async (ctx, args) => {
    const itemType = await ctx.db.get(args.id)
    if (!itemType) return null

    // Get all attributes for this item type
    const attributes = await Promise.all(
      itemType.attributes.map(async (attrId) => {
        return await ctx.db.get(attrId as any)
      })
    )

    return {
      ...itemType,
      attributes: attributes.filter(Boolean),
    }
  }
})

// Attribute Templates
export const createAttributeTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    attributes: v.array(v.string()), // Array of attribute IDs
    category: v.union(v.literal("production"), v.literal("quality"), v.literal("logistics"), v.literal("custom")),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const templateId = await ctx.db.insert("attributeTemplates", {
      orgId,
      name: args.name,
      description: args.description,
      attributes: args.attributes,
      category: args.category,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: identity.subject,
    })

    return templateId
  }
})

export const updateAttributeTemplate = mutation({
  args: {
    id: v.id("attributeTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    attributes: v.optional(v.array(v.string())),
    category: v.optional(v.union(v.literal("production"), v.literal("quality"), v.literal("logistics"), v.literal("custom"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
    return id
  }
})

export const deleteAttributeTemplate = mutation({
  args: { id: v.id("attributeTemplates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return true
  }
})

export const getAttributeTemplates = query({
  args: {
    category: v.optional(v.union(v.literal("production"), v.literal("quality"), v.literal("logistics"), v.literal("custom"))),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    let query = ctx.db
      .query("attributeTemplates")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .filter((q) => q.eq(q.field("isActive"), true))

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category))
    }

    return await query.collect()
  }
})

export const getAttributeTemplateWithAttributes = query({
  args: { id: v.id("attributeTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id)
    if (!template) return null

    // Get all attributes for this template
    const attributes = await Promise.all(
      template.attributes.map(async (attrId) => {
        return await ctx.db.get(attrId as any)
      })
    )

    return {
      ...template,
      attributes: attributes.filter(Boolean),
    }
  }
})

// Bulk Operations
export const createBulkOperation = mutation({
  args: {
    type: v.union(v.literal("create"), v.literal("update"), v.literal("delete"), v.literal("export")),
    items: v.array(v.string()),
    template: v.optional(v.id("attributeTemplates")),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const operationId = await ctx.db.insert("bulkOperations", {
      orgId,
      type: args.type,
      status: "pending",
      items: args.items,
      template: args.template,
      filters: args.filters,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: identity.subject,
    })

    return operationId
  }
})

export const updateBulkOperation = mutation({
  args: {
    id: v.id("bulkOperations"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    const updateData: any = {
      ...updates,
      updatedAt: Date.now(),
    }

    if (args.status === "completed" || args.status === "failed") {
      updateData.completedAt = Date.now()
    }

    await ctx.db.patch(id, updateData)
    return id
  }
})

export const getBulkOperations = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx)
    
    let query = ctx.db
      .query("bulkOperations")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status))
    }

    return await query.order("desc").collect()
  }
})
