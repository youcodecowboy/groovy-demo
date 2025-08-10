import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)'
  ]
})

// Simpler, Clerk-recommended matcher for Next.js App Router
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
}


