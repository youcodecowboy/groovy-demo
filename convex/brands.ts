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