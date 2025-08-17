// import { clerkMiddleware } from '@clerk/nextjs/server'

// Disabled auth middleware for faster development
export default function middleware() {
  // Pass through all requests without auth checks
  return
}

// Simpler, Clerk-recommended matcher for Next.js App Router
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
}


