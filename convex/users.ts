import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all users
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .order("asc")
      .collect();
  },
});

// Get user by ID
export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.id))
      .first();
  },
});

// Create a new user
export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("operator"), v.literal("viewer"), v.literal("manager")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role,
      isActive: args.isActive,
      createdAt: now,
    });
  },
});

// Update user
export const update = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("operator"), v.literal("viewer"), v.literal("manager"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, updates);
  },
});

// Delete user
export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get active users
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

// Get users by role
export const getByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), args.role))
      .order("asc")
      .collect();
  },
}); 