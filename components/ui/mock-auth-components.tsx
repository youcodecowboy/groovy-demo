"use client"

import React from "react"
import { useAuth } from "@/components/providers/mock-auth-provider"
import { LogOut, User, Settings } from "lucide-react"

// Mock SignedIn component
export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()
  return isSignedIn ? <>{children}</> : null
}

// Mock SignedOut component
export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()
  return !isSignedIn ? <>{children}</> : null
}

// Mock UserButton component
export function UserButton() {
  const { user, signOut } = useAuth()
  
  return (
    <div className="flex items-center gap-3">
      {/* Development User Card */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200 group w-full">
        {/* Avatar */}
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {user?.firstName?.[0] || "D"}
          </div>
          {/* Development badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
        
        {/* User info */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {user?.fullName || "Developer User"}
          </span>
          <span className="text-xs text-gray-500 leading-tight">
            Development Mode
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Settings icon */}
          <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors opacity-0 group-hover:opacity-100">
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Logout button */}
          <button
            onClick={() => signOut()}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-white/50 transition-all duration-200 group"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Mock SignInButton component
export function SignInButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
      {children}
    </button>
  )
}

// Mock SignUpButton component
export function SignUpButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
      {children}
    </button>
  )
}

// Mock useUser hook
export function useUser() {
  const { user, isSignedIn, isLoaded } = useAuth()
  return {
    user,
    isSignedIn,
    isLoaded,
  }
} 