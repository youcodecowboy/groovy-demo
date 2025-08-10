"use client"

import { ClerkProvider } from "@clerk/nextjs"

export function ClerkAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/app"
      afterSignUpUrl="/app"
      afterSignOutUrl="/"
      fallbackRedirectUrl="/"
    >
      {children}
    </ClerkProvider>
  )
}


