import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Resolve orgs for the current user
export const getMemberships = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db.query("memberships").withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier)).collect()
  }
})

// Get the current organization profile (name, slug)
export const getOrganization = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const now = Date.now()
    // Try to find membership
    let membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .first()

    // Auto-provision a minimal org if none exists for this user
    if (!membership) {
      const defaultName = "Your Company"
      const defaultSlug = `your-company-${Math.random().toString(36).slice(2, 7)}`
      const orgId = await ctx.db.insert("organizations", {
        name: defaultName,
        slug: defaultSlug,
        ownerUserId: identity.tokenIdentifier,
        createdAt: now,
      })
      await ctx.db.insert("memberships", { orgId, userId: identity.tokenIdentifier, role: "owner", createdAt: now })
      const dashboardId = await ctx.db.insert("dashboards", {
        orgId,
        name: "Main",
        scope: "org",
        layoutJson: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
      })
      await ctx.db.insert("organizationSettings", {
        orgId,
        enabledFeatures: ["workflows", "dashboard"],
        defaultDashboardId: dashboardId,
        updatedAt: now,
        updatedBy: identity.tokenIdentifier,
      })
      return { name: defaultName, slug: defaultSlug }
    }

    const org = await ctx.db.get(membership.orgId)
    if (!org) return null
    return { name: org.name, slug: org.slug }
  }
})

// Safe profile read without side effects
export const getOrgProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .first()
    if (!membership) return null
    const org = await ctx.db.get(membership.orgId)
    if (!org) return null
    return { name: org.name, slug: org.slug }
  }
})

// Check if user has an organization (doesn't create one)
export const ensureOrgForCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .first()
    
    if (!membership) {
      // User has no organization - return null to indicate they need to create one
      return null
    }
    
    const org = await ctx.db.get(membership.orgId)
    if (!org) {
      return null
    }
    
    return { name: org.name, slug: org.slug }
  }
})

// Update organization display name (and keep slug in sync)
export const updateOrganizationName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) throw new Error("Unauthorized")
      const now = Date.now()
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")

      let membership = await ctx.db
        .query("memberships")
        .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
        .first()

      if (!membership) {
        const orgId = await ctx.db.insert("organizations", { name, slug, ownerUserId: identity.tokenIdentifier, createdAt: now })
        await ctx.db.insert("memberships", { orgId, userId: identity.tokenIdentifier, role: "owner", createdAt: now })
        const dashboardId = await ctx.db.insert("dashboards", {
          orgId,
          name: "Main",
          scope: "org",
          layoutJson: JSON.stringify([]),
          createdAt: now,
          updatedAt: now,
        })
        await ctx.db.insert("organizationSettings", {
          orgId,
          enabledFeatures: ["workflows", "dashboard"],
          defaultDashboardId: dashboardId,
          updatedAt: now,
          updatedBy: identity.tokenIdentifier,
        })
        return true
      }

      const org = await ctx.db.get(membership.orgId)
      if (!org) return false
      await ctx.db.patch(org._id, { name, slug })
      return true
    } catch (e) {
      return false
    }
  }
})

// Single entry point to ensure an organization exists and its name is set
export const upsertOrganization = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const now = Date.now()
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .first()

    if (membership) {
      const org = await ctx.db.get(membership.orgId)
      if (org) {
        await ctx.db.patch(org._id, { name, slug })
        return { created: false, name, slug }
      }
    }

    // Create new org + membership + default dashboard + settings
    const orgId = await ctx.db.insert("organizations", { name, slug, ownerUserId: identity.tokenIdentifier, createdAt: now })
    await ctx.db.insert("memberships", { orgId, userId: identity.tokenIdentifier, role: "owner", createdAt: now })
    const dashboardId = await ctx.db.insert("dashboards", {
      orgId,
      name: "Main",
      scope: "org",
      layoutJson: JSON.stringify([]),
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert("organizationSettings", {
      orgId,
      enabledFeatures: ["workflows", "dashboard"],
      defaultDashboardId: dashboardId,
      updatedAt: now,
      updatedBy: identity.tokenIdentifier,
    })
    return { created: true, name, slug }
  }
})

// Create organization and owner membership
export const createOrganization = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, { name, slug }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const now = Date.now()
    
    // Check if user already has an organization
    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .first()
    
    if (existingMembership) {
      throw new Error("User already has an organization")
    }
    
    const orgId = await ctx.db.insert("organizations", { name, slug, ownerUserId: identity.tokenIdentifier, createdAt: now })
    await ctx.db.insert("memberships", { orgId, userId: identity.tokenIdentifier, role: "owner", createdAt: now })
    // Initialize settings and a blank dashboard
    const dashboardId = await ctx.db.insert("dashboards", {
      orgId,
      name: "Main",
      scope: "org",
      layoutJson: JSON.stringify([]),
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert("organizationSettings", {
      orgId,
      enabledFeatures: ["workflows", "dashboard"],
      defaultDashboardId: dashboardId,
      updatedAt: now,
      updatedBy: identity.tokenIdentifier,
    })
    return { name, slug }
  }
})

// Cleanup function to remove default organizations (for testing)
export const cleanupDefaultOrgs = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    
    // Find organizations with default names
    const defaultOrgs = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("name"), "Your Company"))
      .collect()
    
    for (const org of defaultOrgs) {
      // Delete related records
      await ctx.db.delete(org._id)
      
      // Delete memberships
      const memberships = await ctx.db
        .query("memberships")
        .withIndex("by_org", (q) => q.eq("orgId", org._id))
        .collect()
      
      for (const membership of memberships) {
        await ctx.db.delete(membership._id)
      }
      
      // Delete dashboards
      const dashboards = await ctx.db
        .query("dashboards")
        .withIndex("by_org", (q) => q.eq("orgId", org._id))
        .collect()
      
      for (const dashboard of dashboards) {
        await ctx.db.delete(dashboard._id)
      }
      
      // Delete organization settings
      const settings = await ctx.db
        .query("organizationSettings")
        .withIndex("by_org", (q) => q.eq("orgId", org._id))
        .collect()
      
      for (const setting of settings) {
        await ctx.db.delete(setting._id)
      }
    }
    
    return { deleted: defaultOrgs.length }
  }
})

// Debug function to see current user's organization
export const debugUserOrg = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { error: "Not authenticated" }
    
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .first()
    
    if (!membership) {
      return { error: "No membership found" }
    }
    
    const org = await ctx.db.get(membership.orgId)
    if (!org) {
      return { error: "Organization not found" }
    }
    
    return {
      userId: identity.tokenIdentifier,
      orgId: org._id,
      orgName: org.name,
      orgSlug: org.slug,
      membershipRole: membership.role,
      createdAt: org.createdAt
    }
  }
})

// Delete current user's organization (for testing)
export const deleteCurrentUserOrg = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .first()
    
    if (!membership) {
      return { error: "No organization found for user" }
    }
    
    const org = await ctx.db.get(membership.orgId)
    if (!org) {
      return { error: "Organization not found" }
    }
    
    // Delete related records
    await ctx.db.delete(org._id)
    
    // Delete memberships
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect()
    
    for (const mem of memberships) {
      await ctx.db.delete(mem._id)
    }
    
    // Delete dashboards
    const dashboards = await ctx.db
      .query("dashboards")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect()
    
    for (const dashboard of dashboards) {
      await ctx.db.delete(dashboard._id)
    }
    
    // Delete organization settings
    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect()
    
    for (const setting of settings) {
      await ctx.db.delete(setting._id)
    }
    
    return { 
      success: true, 
      deletedOrg: org.name,
      deletedMemberships: memberships.length,
      deletedDashboards: dashboards.length,
      deletedSettings: settings.length
    }
  }
})