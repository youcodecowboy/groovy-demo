import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { resolveOrgId } from "./util"

export const getDefault = query({
  args: {},
  handler: async (ctx) => {
    try {
      const orgId = await resolveOrgId(ctx)
      const settings = await ctx.db
        .query("organizationSettings")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first()
      if (!settings?.defaultDashboardId) return null
      const dashboard = await ctx.db.get(settings.defaultDashboardId)
      return dashboard || null
    } catch (error) {
      // If user is not authenticated or has no org, return null
      return null
    }
  }
})

export const getLayout = query({
  args: {},
  handler: async (ctx) => {
    try {
      const orgId = await resolveOrgId(ctx)
      const settings = await ctx.db
        .query("organizationSettings")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first()
      if (!settings?.defaultDashboardId) return []
      const dashboard = await ctx.db.get(settings.defaultDashboardId)
      if (!dashboard) return []
      try {
        return JSON.parse(dashboard.layoutJson || "[]")
      } catch {
        return []
      }
    } catch (error) {
      // If user is not authenticated or has no org, return empty layout
      return []
    }
  }
})

export const setLayout = mutation({
  args: { layoutJson: v.string() },
  handler: async (ctx, { layoutJson }) => {
    try {
      const orgId = await resolveOrgId(ctx)
      const settings = await ctx.db
        .query("organizationSettings")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .first()
      if (!settings?.defaultDashboardId) return false
      await ctx.db.patch(settings.defaultDashboardId, {
        layoutJson,
        updatedAt: Date.now()
      })
      return true
    } catch (error) {
      // If user is not authenticated or has no org, return false
      return false
    }
  }
})


