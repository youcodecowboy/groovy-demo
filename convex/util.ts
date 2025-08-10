import type { QueryCtx, MutationCtx } from "./_generated/server"

export async function resolveOrgId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Unauthorized")
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
    .first()
  if (!membership) throw new Error("No organization found for user")
  return membership.orgId
}


