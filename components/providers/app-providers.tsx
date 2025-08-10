"use client"

import { usePathname } from "next/navigation"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/nextjs"
import { convex } from "@/lib/convex"

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuthRoute = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")
  const isHome = pathname === "/" || pathname === undefined

  // Always provide Convex so auth-bound calls can succeed anywhere

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}


