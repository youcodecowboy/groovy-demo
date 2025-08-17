"use client"

import { useEffect, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export function useOrg() {
  const ensure = useMutation(api.tenancy.ensureOrgForCurrentUser)
  const upsertOrg = useMutation(api.tenancy.upsertOrganization)
  const [org, setOrg] = useState<{ name: string; slug: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeOrg = async () => {
      try {
        // First try to ensure org exists
        const result = await ensure()
        if (result?.name) {
          setOrg({ name: result.name, slug: result.slug })
        } else {
          // If no org exists, create a default one
          const defaultResult = await upsertOrg({ name: "Development Company" })
          if (defaultResult?.name) {
            setOrg({ name: defaultResult.name, slug: defaultResult.slug })
          }
        }
      } catch (error) {
        console.warn("Failed to initialize organization:", error)
        // Try to create a default organization as fallback
        try {
          const defaultResult = await upsertOrg({ name: "Development Company" })
          if (defaultResult?.name) {
            setOrg({ name: defaultResult.name, slug: defaultResult.slug })
          }
        } catch (fallbackError) {
          console.error("Failed to create default organization:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void initializeOrg()
  }, [ensure, upsertOrg])

  return { org, setOrg, isLoading }
}


