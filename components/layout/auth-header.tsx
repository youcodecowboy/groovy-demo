"use client"

import { SignedOut, SignInButton, SignUpButton } from "@/components/ui/mock-auth-components"
import Link from "next/link"

export function AuthHeader() {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16">
      <Link href="/" className="text-sm font-medium">Home</Link>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton>Sign In</SignInButton>
          <SignUpButton>Sign Up</SignUpButton>
        </SignedOut>
      </div>
    </header>
  )
}


