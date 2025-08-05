import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get location history for an item
export const getByItem = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    // URL decode the itemId to handle spaces and special characters
    const decodedItemId = decodeURIComponent(args.itemId);
    
    return await ctx.db
      .query("locationHistory")
      .filter((q) => q.eq(q.field("itemId"), decodedItemId))
      .order("desc")
      .collect();
  },
});

// Get location history for a location
export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locationHistory")
      .filter((q) => q.eq(q.field("toLocationId"), args.locationId))
      .order("desc")
      .collect();
  },
});

// Get recent location history (last N entries)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("locationHistory")
      .order("desc")
      .take(limit);
  },
});

// Get location history by date range
export const getByDateRange = query({
  args: { 
    startDate: v.number(), 
    endDate: v.number() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locationHistory")
      .filter((q) => 
        q.and(
          q.gte(q.field("movedAt"), args.startDate),
          q.lte(q.field("movedAt"), args.endDate)
        )
      )
      .order("desc")
      .collect();
  },
});

// Get location history by user
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locationHistory")
      .filter((q) => q.eq(q.field("movedBy"), args.userId))
      .order("desc")
      .collect();
  },
});

// Add location history entry
export const addEntry = mutation({
  args: {
    itemId: v.string(),
    fromLocationId: v.optional(v.id("locations")),
    toLocationId: v.id("locations"),
    movedBy: v.string(),
    stageId: v.optional(v.string()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const historyId = await ctx.db.insert("locationHistory", {
      itemId: args.itemId,
      fromLocationId: args.fromLocationId,
      toLocationId: args.toLocationId,
      movedBy: args.movedBy,
      movedAt: now,
      stageId: args.stageId,
      notes: args.notes,
      metadata: args.metadata,
    });

    return historyId;
  },
});

// Get location statistics
export const getLocationStats = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("locationHistory")
      .filter((q) => q.eq(q.field("toLocationId"), args.locationId))
      .collect();

    const totalMoves = history.length;
    const uniqueItems = new Set(history.map(h => h.itemId)).size;
    const recentMoves = history.filter(h => {
      const hoursAgo = (Date.now() - h.movedAt) / (1000 * 60 * 60);
      return hoursAgo <= 24;
    }).length;

    return {
      totalMoves,
      uniqueItems,
      recentMoves,
      lastMove: history.length > 0 ? history[0].movedAt : null,
    };
  },
});

// Get item location timeline
export const getItemTimeline = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("locationHistory")
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .order("asc")
      .collect();

    return history.map(entry => ({
      ...entry,
      date: new Date(entry.movedAt).toISOString(),
    }));
  },
}); 