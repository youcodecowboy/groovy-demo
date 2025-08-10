"use client"

import { useEffect, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export function useOrg() {
  const ensure = useMutation(api.tenancy.ensureOrgForCurrentUser)
  const [org, setOrg] = useState<{ name: string; slug: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void ensure().then((res) => {
      setIsLoading(false)
      if (res?.name) {
        setOrg({ name: res.name, slug: res.slug })
      } else {
        // User has no organization - they need to create one
        setOrg(null)
      }
    }).catch((error) => {
      console.warn("Failed to check organization:", error)
      setIsLoading(false)
      setOrg(null)
    })
  }, [ensure])

  return { org, setOrg, isLoading }
}


