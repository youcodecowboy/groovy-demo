import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Create a new factory
export const createFactory = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    adminUserId: v.string(),
    capacity: v.optional(v.number()),
    specialties: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const factoryId = await ctx.db.insert("factories", {
      name: args.name,
      location: args.location,
      adminUserId: args.adminUserId,
      isActive: true,
      capacity: args.capacity,
      specialties: args.specialties,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return factoryId
  },
})

// Get a factory by ID
export const getFactory = query({
  args: { factoryId: v.id("factories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.factoryId)
  },
})

// Get all active factories
export const listFactories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("factories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect()
  },
})

// Update a factory
export const updateFactory = mutation({
  args: {
    factoryId: v.id("factories"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    adminUserId: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    capacity: v.optional(v.number()),
    specialties: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { factoryId, ...updates } = args
    return await ctx.db.patch(factoryId, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

// Get factories by brand (for brand users)
export const getFactoriesByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const relations = await ctx.db
      .query("brandFactoryRelations")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    const factoryIds = relations.map((rel) => rel.factoryId)
    const factories = await Promise.all(
      factoryIds.map((id) => ctx.db.get(id))
    )
    
    return factories.filter(Boolean)
  },
}) 