"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"

export default function OnboardPage() {
  const router = useRouter()
  const memberships = useQuery(api.tenancy.getMemberships)
  const createOrg = useMutation(api.tenancy.createOrganization)

  const hasOrg = useMemo(() => (memberships && memberships.length > 0) || false, [memberships])

  useEffect(() => {
    if (hasOrg) {
      router.replace("/app")
    }
  }, [hasOrg, router])

  const handleCreate = async () => {
    // Simple slug from timestamp; a real flow would ask for org name
    const slug = `org-${Date.now()}`
    await createOrg({ name: "My Organization", slug })
    router.replace("/app")
  }

  if (memberships === undefined) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (hasOrg) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting…</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Let’s set up your workspace</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          We’ll create your organization and a starter dashboard. You can customize everything later.
        </p>
        <Button onClick={handleCreate} className="px-6 h-11 text-base">Create my workspace</Button>
      </div>
    </div>
  )
}


