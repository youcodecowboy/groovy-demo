"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Only create the client if the URL is available (not during static generation)
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// Mock auth hook for development
const useMockAuth = () => ({
  isSignedIn: true,
  isLoaded: true,
  user: {
    id: "mock-user-123",
    emailAddresses: [{ emailAddress: "dev@example.com" }],
    firstName: "Developer",
    lastName: "User",
    fullName: "Developer User",
    imageUrl: "/placeholder-user.jpg",
  },
  signOut: async () => {
    console.log("Mock sign out")
  },
  getToken: async () => "mock-token",
});

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  if (!convex) {
    // Return a fallback during static generation
    return <div>Loading...</div>;
  }
  
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
} 