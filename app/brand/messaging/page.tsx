'use client'

import { Suspense } from "react"
import { BrandMessaging } from "@/components/brand/brand-messaging"

function BrandMessagingPageContent() {
  return <BrandMessaging />
}

export default function BrandMessagingPage() {
  return (
    <Suspense fallback={<div>Loading messaging...</div>}>
      <BrandMessagingPageContent />
    </Suspense>
  )
}
