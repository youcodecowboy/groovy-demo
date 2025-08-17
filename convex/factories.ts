import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveOrgId } from "./util";

// Get all factories for current org
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);
    return await ctx.db
      .query("factories")
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .collect();
  },
});

// Get factory by ID
export const getById = query({
  args: { id: v.id("factories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new factory
export const create = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    adminUserId: v.string(),
    capacity: v.optional(v.number()),
    specialties: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);
    const now = Date.now();
    
    return await ctx.db.insert("factories", {
      orgId,
      name: args.name,
      location: args.location,
      adminUserId: args.adminUserId,
      isActive: true,
      capacity: args.capacity,
      specialties: args.specialties || [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update factory
export const update = mutation({
  args: {
    id: v.id("factories"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    capacity: v.optional(v.number()),
    specialties: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});