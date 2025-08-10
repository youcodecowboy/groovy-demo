import { api } from "@/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { useOrgId } from "@/lib/withOrg"

// Example adapter shape (expand as we wire pages)
export function useLiveWorkflows() {
  const orgId = useOrgId()
  const workflows = useQuery(api.workflows.getAll, orgId ? { orgId } : undefined as any)
  return { workflows, isLoading: workflows === undefined }
}

export function useLiveCreateOrg() {
  const createOrg = useMutation(api.tenancy.createOrganization)
  return createOrg
}


