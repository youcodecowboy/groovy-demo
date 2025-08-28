"use client"

import Image from "next/image"
import { ReactNode } from "react"

interface OnboardingLayoutProps {
  children: ReactNode
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F8FB] flex flex-col">
      {/* Header with Groovy logo */}
      <header className="flex items-center justify-between p-6 border-b border-black/10 bg-white">
        <div className="flex items-center gap-3">
          <Image 
            src="/groovy-logo.png" 
            alt="Groovy" 
            width={120} 
            height={40} 
            className="h-8 w-auto"
          />
          <span className="text-sm text-gray-600 italic">Factory Setup</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
