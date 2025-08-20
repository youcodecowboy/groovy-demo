import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveOrgId } from "./util";

// Get all workflows
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx)
    return await ctx.db
      .query("workflows")
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .order("desc")
      .collect();
  },
});

// Get active workflows only
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx)
    return await ctx.db
      .query("workflows")
      .filter((q) => q.and(
        q.eq(q.field("orgId"), orgId),
        q.eq(q.field("isActive"), true)
      ))
      .order("desc")
      .collect();
  },
});

// Get workflow by ID
export const getById = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new workflow
export const create = mutation({
  args: {
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
      estimatedDuration: v.optional(v.number()),
      isActive: v.boolean(),
      allowedNextStageIds: v.optional(v.array(v.string())),
      assignedLocationIds: v.optional(v.array(v.id("locations"))),
      color: v.optional(v.string()),
      position: v.optional(v.object({ x: v.number(), y: v.number() })),
      responsibleTeam: v.optional(v.string()),
      notifications: v.optional(v.array(v.string())),
      conditionalRules: v.optional(v.array(v.any())),
      canCompleteOutOfOrder: v.optional(v.boolean()),
    })),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const orgId = await resolveOrgId(ctx)
    return await ctx.db.insert("workflows", {
      orgId,
      name: args.name,
      description: args.description,
      stages: args.stages,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });
  },
});

// Update workflow
export const update = mutation({
  args: {
    id: v.id("workflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    stages: v.optional(v.array(v.object({
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
      estimatedDuration: v.optional(v.number()),
      isActive: v.boolean(),
      allowedNextStageIds: v.optional(v.array(v.string())),
      assignedLocationIds: v.optional(v.array(v.id("locations"))),
      color: v.optional(v.string()),
      position: v.optional(v.object({ x: v.number(), y: v.number() })),
      responsibleTeam: v.optional(v.string()),
      notifications: v.optional(v.array(v.string())),
      conditionalRules: v.optional(v.array(v.any())),
      canCompleteOutOfOrder: v.optional(v.boolean()),
    }))),
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

// Get detailed workflow usage information
export const getWorkflowUsageDetails = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    const activeItems = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("workflowId"), args.id))
      .collect();
    
    const completedItems = await ctx.db
      .query("completedItems")
      .filter((q) => q.eq(q.field("workflowId"), args.id))
      .collect();
    
    return {
      activeItems: activeItems.map(item => ({
        itemId: item.itemId,
        status: item.status,
        currentStageId: item.currentStageId,
        startedAt: item.startedAt,
      })),
      completedItems: completedItems.map(item => ({
        itemId: item.itemId,
        completedAt: item.completedAt,
        finalStageName: item.finalStageName,
      })),
      canDelete: activeItems.length === 0,
      activeItemCount: activeItems.length,
      completedItemCount: completedItems.length,
    };
  },
});

// Get workflow usage statistics
export const getWorkflowStats = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    const activeItems = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("workflowId"), args.id))
      .collect();
    
    const completedItems = await ctx.db
      .query("completedItems")
      .filter((q) => q.eq(q.field("workflowId"), args.id))
      .collect();
    
    return {
      activeItems: activeItems.length,
      completedItems: completedItems.length,
      totalItems: activeItems.length + completedItems.length,
    };
  },
});

// Delete workflow
export const remove = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    // Check if there are any active items using this workflow
    const activeItems = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("workflowId"), args.id))
      .collect();
    
    if (activeItems.length > 0) {
      const itemDetails = activeItems.map(item => item.itemId).join(", ");
      throw new Error(`Cannot delete workflow: ${activeItems.length} active item${activeItems.length > 1 ? 's' : ''} are using this workflow.\n\nActive items: ${itemDetails}\n\nPlease complete or pause these items first.`);
    }
    
    // Check if there are any completed items using this workflow
    const completedItems = await ctx.db
      .query("completedItems")
      .filter((q) => q.eq(q.field("workflowId"), args.id))
      .collect();
    
    if (completedItems.length > 0) {
      // For completed items, we can still delete the workflow but log it
      console.log(`Deleting workflow with ${completedItems.length} completed items`);
    }
    
    await ctx.db.delete(args.id);
  },
});

// Toggle workflow active status
export const toggleActive = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.id);
    if (!workflow) throw new Error("Workflow not found");
    
    return await ctx.db.patch(args.id, {
      isActive: !workflow.isActive,
      updatedAt: Date.now(),
    });
  },
}); 

 