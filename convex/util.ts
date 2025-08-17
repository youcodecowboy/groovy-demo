import type { QueryCtx, MutationCtx } from "./_generated/server"

// Mock user identity for development (no auth)
const MOCK_USER_ID = "mock-user-123"

export async function resolveOrgId(ctx: QueryCtx | MutationCtx) {
  // Use mock identity instead of auth
  const identity = { tokenIdentifier: MOCK_USER_ID }
  
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
    .first()
  
  if (!membership) {
    throw new Error("No organization found for user")
  }
  
  return membership.orgId
}

// Helper function to ensure organization exists (for mutations only)
export async function ensureOrgId(ctx: MutationCtx) {
  // Use mock identity instead of auth
  const identity = { tokenIdentifier: MOCK_USER_ID }
  
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
    .first()
  
  if (!membership) {
    // Auto-create organization for development
    const now = Date.now()
    const defaultName = "Development Company"
    const defaultSlug = `dev-company-${Math.random().toString(36).slice(2, 7)}`
    
    const orgId = await ctx.db.insert("organizations", {
      name: defaultName,
      slug: defaultSlug,
      ownerUserId: identity.tokenIdentifier,
      createdAt: now,
    })
    
    await ctx.db.insert("memberships", { 
      orgId, 
      userId: identity.tokenIdentifier, 
      role: "owner", 
      createdAt: now 
    })
    
    // Create default dashboard
    const dashboardId = await ctx.db.insert("dashboards", {
      orgId,
      name: "Main",
      scope: "org",
      layoutJson: JSON.stringify([]),
      createdAt: now,
      updatedAt: now,
    })
    
    // Create organization settings
    await ctx.db.insert("organizationSettings", {
      orgId,
      enabledFeatures: ["workflows", "dashboard"],
      defaultDashboardId: dashboardId,
      updatedAt: now,
      updatedBy: identity.tokenIdentifier,
    })
    
    return orgId
  }
  
  return membership.orgId
}


