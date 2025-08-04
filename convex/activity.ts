import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Log an activity
export const logActivity = mutation({
  args: {
    userId: v.optional(v.string()),
    action: v.string(),
    entityType: v.union(v.literal("item"), v.literal("workflow"), v.literal("user"), v.literal("task"), v.literal("message"), v.literal("notification"), v.literal("team")),
    entityId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      description: args.description,
      metadata: args.metadata,
      timestamp: Date.now(),
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });

    return activityId;
  },
});

// Get activity log
export const getActivityLog = query({
  args: {
    userId: v.optional(v.string()),
    entityType: v.optional(v.union(v.literal("item"), v.literal("workflow"), v.literal("user"), v.literal("task"), v.literal("message"), v.literal("notification"), v.literal("team"))),
    entityId: v.optional(v.string()),
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("activityLog")
      .order("desc")
      .collect();

    // Apply filters
    if (args.userId) {
      activities = activities.filter(activity => activity.userId === args.userId);
    }

    if (args.entityType) {
      activities = activities.filter(activity => activity.entityType === args.entityType);
    }

    if (args.entityId) {
      activities = activities.filter(activity => activity.entityId === args.entityId);
    }

    if (args.action) {
      activities = activities.filter(activity => activity.action === args.action);
    }

    if (args.startDate) {
      activities = activities.filter(activity => activity.timestamp >= args.startDate!);
    }

    if (args.endDate) {
      activities = activities.filter(activity => activity.timestamp <= args.endDate!);
    }

    if (args.limit) {
      activities = activities.slice(0, args.limit);
    }

    return activities;
  },
});

// Get activity statistics
export const getActivityStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("activityLog")
      .collect();

    // Apply date filters
    if (args.startDate) {
      activities = activities.filter(activity => activity.timestamp >= args.startDate!);
    }

    if (args.endDate) {
      activities = activities.filter(activity => activity.timestamp <= args.endDate!);
    }

    // Group by action
    const actionStats = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by entity type
    const entityStats = activities.reduce((acc, activity) => {
      acc[activity.entityType] = (acc[activity.entityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by user
    const userStats = activities.reduce((acc, activity) => {
      const userId = activity.userId || "system";
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get recent activities (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(activity => activity.timestamp >= oneDayAgo);

    return {
      totalActivities: activities.length,
      recentActivities: recentActivities.length,
      actionStats,
      entityStats,
      userStats,
      topActions: Object.entries(actionStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => ({ action, count })),
      topUsers: Object.entries(userStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({ userId, count })),
    };
  },
});

// Get activity feed for a user
export const getUserActivityFeed = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("activityLog")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    if (args.limit) {
      activities = activities.slice(0, args.limit);
    }

    return activities;
  },
});

// Get activity feed for an entity
export const getEntityActivityFeed = query({
  args: {
    entityType: v.union(v.literal("item"), v.literal("workflow"), v.literal("user"), v.literal("task"), v.literal("message"), v.literal("notification"), v.literal("team")),
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("activityLog")
      .withIndex("by_entity", (q) => 
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .order("desc")
      .collect();

    if (args.limit) {
      activities = activities.slice(0, args.limit);
    }

    return activities;
  },
});

// Get all activity (for testing and analytics)
export const getAllActivity = query({
  args: { 
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    return await ctx.db
      .query("activityLog")
      .order("desc")
      .take(limit);
  },
});

// Get system-wide activity feed
export const getSystemActivityFeed = query({
  args: {
    limit: v.optional(v.number()),
    excludeSystem: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("activityLog")
      .order("desc")
      .collect();

    if (args.excludeSystem) {
      activities = activities.filter(activity => activity.userId !== "system");
    }

    if (args.limit) {
      activities = activities.slice(0, args.limit);
    }

    return activities;
  },
}); 