"use client"

import React, { createContext, useContext, ReactNode } from "react"

// Mock user data
const mockUser = {
  id: "mock-user-123",
  emailAddresses: [{ emailAddress: "dev@example.com" }],
  firstName: "Developer",
  lastName: "User",
  fullName: "Developer User",
  imageUrl: "/placeholder-user.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock auth context
interface MockAuthContextType {
  isSignedIn: boolean
  isLoaded: boolean
  user: typeof mockUser | null
  signOut: () => Promise<void>
}

const MockAuthContext = createContext<MockAuthContextType>({
  isSignedIn: true,
  isLoaded: true,
  user: mockUser,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(MockAuthContext)
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const value: MockAuthContextType = {
    isSignedIn: true,
    isLoaded: true,
    user: mockUser,
    signOut: async () => {
      console.log("Mock sign out")
    },
  }

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  )
} 