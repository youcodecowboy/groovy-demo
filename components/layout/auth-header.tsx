"use client"

import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"

export function AuthHeader() {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16">
      <Link href="/" className="text-sm font-medium">Home</Link>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
    </header>
  )
}


