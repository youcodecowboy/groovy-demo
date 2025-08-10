"use client"

import { SignUp } from "@clerk/nextjs"

export default function Page() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <SignUp routing="path" path="/sign-up" fallbackRedirectUrl="/onboard" />
    </div>
  )
}


