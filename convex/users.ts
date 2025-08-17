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

// Create team users for Disco application
export const createTeamUsers = mutation({
  args: {
    teamName: v.string(),
    teamMembers: v.array(v.object({
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("admin"), v.literal("operator"), v.literal("viewer"), v.literal("manager")),
    })),
  },
  handler: async (ctx, args) => {
    const { teamName, teamMembers } = args;
    const userIds = [];

    for (const member of teamMembers) {
      const userId = await ctx.db.insert("users", {
        name: member.name,
        email: member.email,
        role: member.role,
        isActive: true,
        team: teamName,
        createdAt: Date.now(),
        lastLogin: Date.now(),
      });

      userIds.push(userId);
    }

    return userIds;
  },
});

// Get users by team
export const getUsersByTeam = query({
  args: {
    teamName: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("team", args.teamName))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return users;
  },
});

// Get all teams
export const getTeams = query({
  args: {},
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return teams;
  },
}); 

// Create demo team users for Disco application
export const createDemoTeamUsers = mutation({
  args: {},
  handler: async (ctx, args) => {
    const teams = [
      {
        name: "production",
        members: [
          { name: "John Smith", email: "john.production@gvy.ai", role: "operator" },
          { name: "Sarah Johnson", email: "sarah.production@gvy.ai", role: "operator" },
          { name: "Mike Chen", email: "mike.production@gvy.ai", role: "manager" },
        ]
      },
      {
        name: "cutting",
        members: [
          { name: "Lisa Wilson", email: "lisa.cutting@gvy.ai", role: "operator" },
          { name: "David Brown", email: "david.cutting@gvy.ai", role: "operator" },
          { name: "Emma Davis", email: "emma.cutting@gvy.ai", role: "manager" },
        ]
      },
      {
        name: "sewing",
        members: [
          { name: "Alex Rodriguez", email: "alex.sewing@gvy.ai", role: "operator" },
          { name: "Maria Garcia", email: "maria.sewing@gvy.ai", role: "operator" },
          { name: "Carlos Lopez", email: "carlos.sewing@gvy.ai", role: "manager" },
        ]
      },
      {
        name: "quality",
        members: [
          { name: "Jennifer Lee", email: "jennifer.quality@gvy.ai", role: "operator" },
          { name: "Robert Taylor", email: "robert.quality@gvy.ai", role: "operator" },
          { name: "Amanda White", email: "amanda.quality@gvy.ai", role: "manager" },
        ]
      },
      {
        name: "packaging",
        members: [
          { name: "Kevin Martinez", email: "kevin.packaging@gvy.ai", role: "operator" },
          { name: "Rachel Green", email: "rachel.packaging@gvy.ai", role: "operator" },
          { name: "Tom Anderson", email: "tom.packaging@gvy.ai", role: "manager" },
        ]
      }
    ];

    const createdUsers = [];

    for (const team of teams) {
      for (const member of team.members) {
        // Check if user already exists
        const existingUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), member.email))
          .first();

        if (!existingUser) {
          const userId = await ctx.db.insert("users", {
            name: member.name,
            email: member.email,
            role: member.role as any,
            isActive: true,
            team: team.name,
            createdAt: Date.now(),
            lastLogin: Date.now() - Math.random() * 1000 * 60 * 60 * 24, // Random login time in last 24h
          });

          createdUsers.push({ userId, ...member, team: team.name });
        }
      }
    }

    return createdUsers;
  },
}); 