"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Only create the client if the URL is available (not during static generation)
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  if (!convex) {
    // Return a fallback during static generation
    return <div>Loading...</div>;
  }
  
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
} 