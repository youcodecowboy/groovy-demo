import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveOrgId, ensureOrgId } from "./util";

// Team interface for type safety
export interface Team {
  _id: string;
  orgId?: string;
  name: string;
  description?: string;
  managerId?: string;
  members: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Team member interface
export interface TeamMember {
  userId: string;
  role: "manager" | "member" | "lead";
  responsibilities: string[];
  permissions: string[];
  joinedAt: number;
}

// Get all teams for the current organization
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await resolveOrgId(ctx);

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .collect();

    return teams;
  },
});

// Get a specific team by ID
export const getById = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);

    const team = await ctx.db.get(args.id);
    if (!team || team.orgId !== orgId) return null;

    return team;
  },
});

// Get teams by manager
export const getByManager = query({
  args: { managerId: v.string() },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => 
        q.and(
          q.eq(q.field("orgId"), orgId),
          q.eq(q.field("managerId"), args.managerId)
        )
      )
      .collect();

    return teams;
  },
});

// Get teams that a user is a member of
export const getByMember = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const orgId = await resolveOrgId(ctx);

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => 
        q.and(
          q.eq(q.field("orgId"), orgId)
        )
      )
      .collect();

    // Filter teams where the user is a member (client-side filtering for array membership)
    return teams.filter(team => team.members.includes(args.userId));
  },
});

// Create a new team
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    managerId: v.optional(v.string()),
    members: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const orgId = await ensureOrgId(ctx);

    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      orgId,
      name: args.name,
      description: args.description || "",
      managerId: args.managerId || undefined,
      members: args.members || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return teamId;
  },
});

// Update a team
export const update = mutation({
  args: {
    id: v.id("teams"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    managerId: v.optional(v.string()),
    members: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgId = await ensureOrgId(ctx);

    const team = await ctx.db.get(args.id);
    if (!team || team.orgId !== orgId) {
      throw new Error("Team not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.managerId !== undefined) updates.managerId = args.managerId;
    if (args.members !== undefined) updates.members = args.members;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Add member to team
export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await ensureOrgId(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== orgId) {
      throw new Error("Team not found");
    }

    if (team.members.includes(args.userId)) {
      throw new Error("User is already a member of this team");
    }

    const updatedMembers = [...team.members, args.userId];
    await ctx.db.patch(args.teamId, {
      members: updatedMembers,
      updatedAt: Date.now(),
    });

    return args.teamId;
  },
});

// Remove member from team
export const removeMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await ensureOrgId(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== orgId) {
      throw new Error("Team not found");
    }

    if (!team.members.includes(args.userId)) {
      throw new Error("User is not a member of this team");
    }

    // If removing the manager, clear the managerId
    let managerId = team.managerId;
    if (team.managerId === args.userId) {
      managerId = undefined;
    }

    const updatedMembers = team.members.filter(id => id !== args.userId);
    await ctx.db.patch(args.teamId, {
      members: updatedMembers,
      managerId,
      updatedAt: Date.now(),
    });

    return args.teamId;
  },
});

// Set team manager
export const setManager = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await ensureOrgId(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== orgId) {
      throw new Error("Team not found");
    }

    if (!team.members.includes(args.userId)) {
      throw new Error("User must be a member of the team to be set as manager");
    }

    await ctx.db.patch(args.teamId, {
      managerId: args.userId,
      updatedAt: Date.now(),
    });

    return args.teamId;
  },
});

// Delete a team (soft delete by setting isActive to false)
export const deleteTeam = mutation({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const orgId = await ensureOrgId(ctx);

    const team = await ctx.db.get(args.id);
    if (!team || team.orgId !== orgId) {
      throw new Error("Team not found");
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Get team statistics
export const getStats = query({
  args: { teamId: v.optional(v.id("teams")) },
  handler: async (ctx, args) => {
    if (!args.teamId) return null;
    const orgId = await resolveOrgId(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== orgId) return null;

    // Get active items assigned to team members
    const activeItems = await ctx.db
      .query("items")
      .filter((q) => 
        q.and(
          q.eq(q.field("orgId"), orgId),
          q.eq(q.field("status"), "active"),
          q.or(...team.members.map(memberId => q.eq(q.field("assignedTo"), memberId)))
        )
      )
      .collect();

    // Get completed items in the last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const completedItems = await ctx.db
      .query("completedItems")
      .filter((q) => 
        q.and(
          q.eq(q.field("orgId"), orgId),
          q.gte(q.field("completedAt"), thirtyDaysAgo),
          q.or(...team.members.map(memberId => q.eq(q.field("completedBy"), memberId)))
        )
      )
      .collect();

    return {
      teamId: args.teamId,
      memberCount: team.members.length,
      activeItemsCount: activeItems.length,
      completedItemsCount: completedItems.length,
      managerId: team.managerId,
    };
  },
});

// Get team performance metrics
export const getPerformance = query({
  args: { 
    teamId: v.optional(v.id("teams")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.teamId) return null;
    const orgId = await resolveOrgId(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== orgId) return null;

    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    // Get completed items in the specified time period
    const completedItems = await ctx.db
      .query("completedItems")
      .filter((q) => 
        q.and(
          q.eq(q.field("orgId"), orgId),
          q.gte(q.field("completedAt"), startDate),
          q.or(...team.members.map(memberId => q.eq(q.field("completedBy"), memberId)))
        )
      )
      .collect();

    // Calculate average completion time
    const completionTimes = completedItems.map(item => 
      item.completedAt - item.startedAt
    );
    const avgCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length 
      : 0;

    return {
      teamId: args.teamId,
      period: `${days} days`,
      totalCompleted: completedItems.length,
      averageCompletionTime: avgCompletionTime,
      itemsPerDay: completedItems.length / days,
    };
  },
});
