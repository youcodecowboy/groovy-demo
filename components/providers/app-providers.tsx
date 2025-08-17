"use client"

import { usePathname } from "next/navigation"
import { ConvexClientProvider } from "@/lib/convex"

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuthRoute = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")
  const isHome = pathname === "/" || pathname === undefined

  // Always provide Convex so auth-bound calls can succeed anywhere

  return (
    <ConvexClientProvider>
      {children}
    </ConvexClientProvider>
  )
}


