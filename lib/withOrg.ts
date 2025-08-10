import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"

export function useOrgId(): string | undefined {
  // For now, pick the first membership; later, support org switcher
  const memberships = useQuery(api.tenancy.getMemberships)
  return memberships && memberships[0]?.orgId
}


