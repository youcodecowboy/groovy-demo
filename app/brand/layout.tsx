'use client'

import type React from "react"
import { BrandSidebar } from "@/components/brand/brand-sidebar"

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dev banner for brand instance
  const showDevBanner = process.env.NEXT_PUBLIC_BRAND_DEV === 'true'

  return (
    <div data-scope="brand" className="min-h-screen">
      {showDevBanner && (
        <div className="bg-orange-500 text-white text-center py-2 text-sm font-medium">
          🚧 Brand Dev Instance - Development Mode
        </div>
      )}
      <BrandSidebar>
        {children}
      </BrandSidebar>
    </div>
  )
}