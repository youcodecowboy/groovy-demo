import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all locations
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("locations").order("desc").collect();
  },
});

// Get active locations
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

// Get location by ID
export const getById = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get location by QR code
export const getByQrCode = query({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("qrCode"), args.qrCode))
      .first();
  },
});

// Get locations by type
export const getByType = query({
  args: { type: v.union(v.literal("bin"), v.literal("shelf"), v.literal("rack"), v.literal("area"), v.literal("zone")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();
  },
});

// Get locations by stage assignment
export const getByStage = query({
  args: { stageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("assignedStageId"), args.stageId))
      .order("desc")
      .collect();
  },
});

// Get available locations for a stage (not at capacity)
export const getAvailableForStage = query({
  args: { stageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .filter((q) => 
        q.and(
          q.eq(q.field("assignedStageId"), args.stageId),
          q.eq(q.field("isActive"), true),
          q.or(
            q.eq(q.field("capacity"), undefined),
            q.lt(q.field("currentOccupancy"), q.field("capacity"))
          )
        )
      )
      .order("asc")
      .collect();
  },
});

// Assign location to stage
export const assignToStage = mutation({
  args: {
    locationId: v.id("locations"),
    stageId: v.string(),
    assignedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.locationId, {
      assignedStageId: args.stageId,
      updatedAt: Date.now(),
    });

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.assignedBy,
      action: "location_stage_assigned",
      entityType: "item",
      entityId: args.locationId,
      description: `Location assigned to stage ${args.stageId}`,
      metadata: { stageId: args.stageId },
      timestamp: Date.now(),
    });

    return args.locationId;
  },
});

// Unassign location from stage
export const unassignFromStage = mutation({
  args: {
    locationId: v.id("locations"),
    unassignedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.locationId, {
      assignedStageId: undefined,
      updatedAt: Date.now(),
    });

    // Log this activity
    await ctx.db.insert("activityLog", {
      userId: args.unassignedBy,
      action: "location_stage_unassigned",
      entityType: "item",
      entityId: args.locationId,
      description: `Location unassigned from stage`,
      metadata: { previousStageId: "unknown" },
      timestamp: Date.now(),
    });

    return args.locationId;
  },
});

// Get child locations (locations within a parent location)
export const getChildren = query({
  args: { parentId: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("parentLocationId"), args.parentId))
      .order("desc")
      .collect();
  },
});

// Create a new location
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("bin"), v.literal("shelf"), v.literal("rack"), v.literal("area"), v.literal("zone")),
    qrCode: v.string(),
    parentLocationId: v.optional(v.id("locations")),
    assignedStageId: v.optional(v.string()),
    assignedDeviceId: v.optional(v.string()),
    capacity: v.optional(v.number()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const locationId = await ctx.db.insert("locations", {
      name: args.name,
      description: args.description,
      type: args.type,
      qrCode: args.qrCode,
      parentLocationId: args.parentLocationId,
      assignedStageId: args.assignedStageId,
      assignedDeviceId: args.assignedDeviceId,
      capacity: args.capacity,
      currentOccupancy: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });

    return locationId;
  },
});

// Update a location
export const update = mutation({
  args: {
    id: v.id("locations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("bin"), v.literal("shelf"), v.literal("rack"), v.literal("area"), v.literal("zone"))),
    parentLocationId: v.optional(v.id("locations")),
    assignedStageId: v.optional(v.string()),
    assignedDeviceId: v.optional(v.string()),
    capacity: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a location (soft delete by setting isActive to false)
export const remove = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Generate a unique QR code for a location
export const generateQrCode = mutation({
  args: {
    locationId: v.id("locations"),
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if QR code already exists
    const existingLocation = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("qrCode"), args.qrCode))
      .first();

    if (existingLocation && existingLocation._id !== args.locationId) {
      throw new Error("QR code already exists for another location");
    }

    await ctx.db.patch(args.locationId, {
      qrCode: args.qrCode,
      updatedAt: Date.now(),
    });

    return args.locationId;
  },
});

// Update location occupancy
export const updateOccupancy = mutation({
  args: {
    locationId: v.id("locations"),
    occupancy: v.number(),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) throw new Error("Location not found");

    // Check capacity limits
    if (location.capacity && args.occupancy > location.capacity) {
      throw new Error(`Location ${location.name} is at capacity (${location.capacity} items)`);
    }

    await ctx.db.patch(args.locationId, {
      currentOccupancy: args.occupancy,
      updatedAt: Date.now(),
    });

    return args.locationId;
  },
});

// Check if location has available capacity
export const hasAvailableCapacity = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) return false;

    if (!location.capacity) return true; // No capacity limit
    return (location.currentOccupancy || 0) < location.capacity;
  },
});

// Get locations that are at capacity
export const getAtCapacity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("locations")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.neq(q.field("capacity"), undefined),
          q.gte(q.field("currentOccupancy"), q.field("capacity"))
        )
      )
      .collect();
  },
});

// Get items in a specific location
export const getItemsInLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("currentLocationId"), args.locationId))
      .order("desc")
      .collect();
  },
});

// Get location hierarchy (parent and children)
export const getHierarchy = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) return null;

    const parent = location.parentLocationId ? await ctx.db.get(location.parentLocationId) : null;
    const children = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("parentLocationId"), args.locationId))
      .collect();

    return {
      location,
      parent,
      children,
    };
  },
}); 